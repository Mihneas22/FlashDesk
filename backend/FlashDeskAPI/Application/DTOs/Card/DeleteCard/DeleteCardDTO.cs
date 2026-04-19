using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Card.DeleteCard
{
    public class DeleteCardDTO
    {
        [Required]
        public Guid CardId { get; set; } = Guid.Empty;

        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [Required]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
