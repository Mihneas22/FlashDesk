using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Card.AddCard
{
    public class AddCardDTO
    {
        [Required]
        public string Question { get; set; } = string.Empty;

        [Required]
        public string Answer { get; set; } = string.Empty;

        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;
    }
}
