using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.GetDecks
{
    public class GetDecksDTO
    {
        [Required]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
