using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.GetDeckById
{
    public class GetDeckByIdDTO
    {
        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;
    }
}
