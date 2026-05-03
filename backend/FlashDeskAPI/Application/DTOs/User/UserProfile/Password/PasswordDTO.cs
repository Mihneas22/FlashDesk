using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.UserProfile.Password
{
    public class PasswordDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        public string CurrPassword { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "Password must be at least 8 characters long, contain at least one uppercase letter and one number.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
