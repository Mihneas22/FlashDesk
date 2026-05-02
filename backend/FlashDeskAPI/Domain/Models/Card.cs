using Domain.Models.Graphs;
using Domain.Models.UserStats;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Domain.Models
{
    public class Card
    {
        [Key]
        public Guid CardId { get; set; }

        public string? Question { get; set; }

        public string? Answer { get; set; }

        public ICollection<string>? Tips { get; set; }

        public Guid DeckId { get; set; }

        public Deck? CardDeck { get; set; }

        [JsonPropertyName("viewConfig")]
        public ViewConfig? ViewConfig { get; set; }

        public ICollection<CardReview>? CardReviews { get; set; }

        public ICollection<UserCardState>? UserCardStates { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
