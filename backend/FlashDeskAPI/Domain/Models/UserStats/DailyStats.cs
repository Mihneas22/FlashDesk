using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models.UserStats
{
    public class DailyStats
    {
        [Key]
        public Guid DailyStatsId { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }

        public int? CardsReview { get; set; }

        public int? CardsMastered { get; set; }

        public int? MinSpent { get; set; }

        public DateOnly Date { get; set; }
    }
}
