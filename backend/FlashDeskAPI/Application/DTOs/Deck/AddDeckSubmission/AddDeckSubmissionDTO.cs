using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.Deck.AddDeckSubmission
{
    public class AddDeckSubmissionDTO
    {
        [Required]
        [JsonPropertyName("deckId")]
        public Guid DeckId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        [JsonPropertyName("reviews")]
        public List<CardReviewItemDTO> SessionResults { get; set; } = new List<CardReviewItemDTO>();
    }

    public class CardReviewItemDTO
    {
        [JsonPropertyName("cardId")]
        public Guid CardId { get; set; }

        [JsonPropertyName("rating")]
        public string Difficulty { get; set; } = string.Empty;

        [JsonPropertyName("timeSpent")]
        public int TimeSpent { get; set; }

        [JsonPropertyName("reviewAt")]
        public DateTime ReviewAt { get; set; }
    }
}
