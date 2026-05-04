using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.User.Stripe.AddWebhook
{
    public class AddStripeWebhookDTO
    {
        [Required]
        public string JsonBody { get; set; } = string.Empty;
        
        [Required]
        public string StripeSignature { get; set; } = string.Empty;
    }
}
