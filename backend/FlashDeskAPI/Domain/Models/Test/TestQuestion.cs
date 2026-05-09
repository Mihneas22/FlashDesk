using Domain.Models.Graphs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace Domain.Models
{
    public class TestQuestion
    {
        [Key]
        public Guid TestQuestionId { get; set; }

        public string? QuestionText { get; set; }

        public int? Points { get; set; }

        public ICollection<string>? PossibleAnswers { get; set; }

        public ICollection<string>? Explications { get; set; }

        public int? CorrectAnswerIndex { get; set; }

        public ICollection<string>? Hints { get; set; }

        [JsonPropertyName("viewConfig")]
        public ViewConfig? ViewConfig { get; set; }

        [JsonPropertyName("matrixConfig")]
        public MatrixViewConfig? MatrixConfig { get; set; }

        public Guid Quest_TestId { get; set; }

        public Test? Quest_Test { get; set; }
    }
}
