using Application.DTOs.User.Stripe.AddWebhook;
using Application.Repository;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using System.Collections.Generic;
using System.Security.Claims;

public class CreateCheckoutDto
{
    public string PlanName { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly IUser userRepository;

    public StripeController(IUser userRepository)
    {
        this.userRepository = userRepository;
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession([FromBody] CreateCheckoutDto req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        string stripePriceId = req.PlanName switch
        {
            "Core" => "price_1TTPgtRoqTgzpcMy1UOZwoXZ",
            "Pro" => "price_1TTPhSRoqTgzpcMyhpZXZDUK",
            _ => throw new Exception("Invalid plan selected.")
        };

        var options = new SessionCreateOptions()
        {
            PaymentMethodTypes = new List<string>() { "card" },
            LineItems = new List<SessionLineItemOptions>()
            {
                new SessionLineItemOptions()
                {
                    Price = stripePriceId,
                    Quantity = 1,
                }
            },
            Mode = "subscription",
            SuccessUrl = "http://localhost:8080/dashboard?success=true",
            CancelUrl = "http://localhost:8080/dashboard?canceled=true",

            ClientReferenceId = userId,
            Metadata = new Dictionary<string, string>
            {
                { "PlanName", req.PlanName }
            }
        };

        var service = new SessionService();
        var session = service.Create(options);

        return Ok(new { url = session.Url });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        var dto = new AddStripeWebhookDTO
        {
            JsonBody = json,
            StripeSignature = signature
        };
        var result = await userRepository.AddStripeWebhookRepository(dto);

        if (result.Flag)
            return Ok();

        Console.WriteLine($"[WEBHOOK EROARE]: {result.message}");

        return BadRequest(result.message);
    }
}