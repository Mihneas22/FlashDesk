using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.DeleteDeck
{
    public class DeleteDeckDTO
    {
        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [Required]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
