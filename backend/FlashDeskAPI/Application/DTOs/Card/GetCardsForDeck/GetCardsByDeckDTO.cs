using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Card.GetCardsForDeck
{
    public class GetCardsByDeckDTO
    {
        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;
    }
}
