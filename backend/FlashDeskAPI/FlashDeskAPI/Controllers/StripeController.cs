using Application.DTOs.User.Stripe.AddWebhook;
using Application.Repository;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using System.Collections.Generic;
using System.Security.Claims;

public class CreateCheckoutDto
{
    public string PlanName { get; set; } = string.Empty;

    public string BillingCycle { get; set; } = string.Empty;
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

        string stripePriceId = (req.PlanName, req.BillingCycle) switch
        {
            ("Core", "Monthly") => "price_1TVA3pRoqTgzpcMyXSBYbVni",
            ("Core", "Annually") => "price_1TVA7zRoqTgzpcMysQk5KmFu",
            ("Pro", "Monthly") => "price_1TVA5CRoqTgzpcMyZe53QttM",
            ("Pro", "Annually") => "price_1TVA74RoqTgzpcMy6B5xJxf2",
            _ => throw new Exception("Invalid plan or billing cycle selected.")
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
            SuccessUrl = "https://learnqhub.com/dashboard?success=true",
            CancelUrl = "ttps://learnqhub.com/dashboard?canceled=true",

            ClientReferenceId = userId,
            Metadata = new Dictionary<string, string>
            {
                { "PlanName", req.PlanName },
                { "BillingCycle", req.BillingCycle }
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