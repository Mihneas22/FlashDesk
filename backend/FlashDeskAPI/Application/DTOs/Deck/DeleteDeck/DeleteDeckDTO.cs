using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.Deck.DeleteDeck
{
    public class DeleteDeckDTO
    {
        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public bool IsAdmin { get; set; }
    }
}
