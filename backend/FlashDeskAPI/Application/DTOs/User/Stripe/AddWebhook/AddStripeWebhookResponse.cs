using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.Stripe.AddWebhook
{
    public record AddStripeWebhookResponse(bool Flag, string message = null!);
}
