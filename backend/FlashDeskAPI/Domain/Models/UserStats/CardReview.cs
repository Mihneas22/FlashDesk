using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models.UserStats
{
    public class CardReview
    {
        [Key]
        public Guid CardReviewId { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }

        public Guid CardId { get; set; }

        public Card? Card { get; set; }

        public DateTime? ReviewAt { get; set; }

        public string? Rating { get; set; }

        public int? TimeSpent { get; set; }
    }
}
