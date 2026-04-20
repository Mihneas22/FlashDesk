using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Application.DTOs.Deck.CreateDeck
{
    public class CreateDeckDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;

        public List<AddCardDTONewDeck> Cards { get; set; } = new List<AddCardDTONewDeck>();
    }

    public class AddCardDTONewDeck
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public List<string> Tips { get; set; } = new List<string>();
    }
}
