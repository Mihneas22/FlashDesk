using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.Card.DeleteCard
{
    public class DeleteCardDTO
    {
        [Required]
        public Guid CardId { get; set; } = Guid.Empty;

        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public bool IsAdmin { get; set; }
    }
}
