using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.GetPublicDecks
{
    public class GetPublicDecksDTO
    {
        [Required]
        public string Filter { get; set; } = string.Empty;

        [JsonIgnore]
        public string Role { get; set; } = string.Empty;
    }
}
