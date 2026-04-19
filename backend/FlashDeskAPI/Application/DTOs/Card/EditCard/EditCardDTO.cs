using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Card.EditCard
{
    public class EditCardDTO
    {
        [Required]
        public Guid CardId { get; set; } = Guid.Empty;

        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [Required]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        public string Question { get; set; } = string.Empty;

        [Required]
        public string Answer { get; set; } = string.Empty;

        [Required]
        public List<string> Tips { get; set; } = new List<string>();
    }
}
