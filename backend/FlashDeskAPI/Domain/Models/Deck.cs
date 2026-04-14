using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class Deck
    {
        [Key]
        public Guid FlashCardId { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Topic { get; set; }

        public ICollection<Card>? DeckCards { get; set; }

        public Guid DeckUserId { get; set; }

        public User? DeckUser { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
