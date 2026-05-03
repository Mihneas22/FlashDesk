using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.UserProfile.Email
{
    public class EmailDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string NewEmail { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
