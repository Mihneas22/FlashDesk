using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.UserProfile.Username
{
    public class UsernameDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        public string Username { get; set; } = string.Empty;
    }
}
