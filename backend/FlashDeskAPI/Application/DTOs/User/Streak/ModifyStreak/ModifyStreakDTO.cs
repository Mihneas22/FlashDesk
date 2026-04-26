using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.Streak.ModifyStreak
{
    public class ModifyStreakDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; }
    }
}
