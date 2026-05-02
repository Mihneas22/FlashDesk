using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models.UserStats
{
    public class UserCardState
    {
        [Key]
        public Guid UserCardStateId { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }

        public Guid CardId { get; set; }

        public Card? Card { get; set; }

        public DateOnly? NextReview { get; set; }

        public float? IntervalDays { get; set; }

        public float? EaseFactor { get; set; }

        public string? MasteryLevel { get; set; }

        public int ReviewCount { get; set; }
    }
}
