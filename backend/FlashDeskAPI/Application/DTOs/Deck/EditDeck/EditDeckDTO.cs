using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.EditDeck
{
    public class EditDeckDTO
    {
        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
