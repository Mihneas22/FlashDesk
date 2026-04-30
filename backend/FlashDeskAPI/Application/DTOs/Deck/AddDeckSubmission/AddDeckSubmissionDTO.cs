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
        public Guid DeckId { get; set; } = Guid.Empty;

        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;

        [Required]
        public List<CardFeedbackDto> SessionResults { get; set; } = new();
    }

    public class CardFeedbackDto
    {
        public enum DifficultyLevel
        {
            Easy,
            Medium,
            Hard
        }

        [Required]
        public Guid CardId { get; set; } = Guid.Empty;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public DifficultyLevel Difficulty { get; set; }
    }
}
