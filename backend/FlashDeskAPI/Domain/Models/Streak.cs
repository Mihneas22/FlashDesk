using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class Streak
    {
        [Key]
        public Guid StreakId { get; set; }

        public int? CurrentStreak { get; set; }

        public int? MaxStreak { get; set; }

        public DateTime? LastActivityDate { get; set; }

        public Guid UserId { get; set; }
        
        public User? User { get; set; }
    }
}
