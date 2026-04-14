using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class Card
    {
        [Key]
        public Guid CardId { get; set; }

        public string? Question { get; set; }

        public string? Answer { get; set; }

        public Guid DeckId { get; set; }

        public Deck? CardDeck { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
