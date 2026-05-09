using Domain.Models.Graphs;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.Questions.AddQuestions
{
    public class QuestionDTO
    {
        public string? QuestionText { get; set; }
        public ICollection<string>? PossibleAnswers { get; set; }
        public ICollection<string>? Explications { get; set; }
        public int? CorrectAnswerIndex { get; set; }
        public ICollection<string>? Hints { get; set; }

        [JsonPropertyName("viewConfig")]
        public ViewConfig? ViewConfig { get; set; }

        [JsonPropertyName("matrixConfig")]
        public MatrixViewConfig? MatrixConfig { get; set; }
    }
}
