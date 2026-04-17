using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class TestQuestion
    {
        [Key]
        public Guid TestQuestionId { get; set; }

        public string? QuestionText { get; set; }

        public ICollection<string>? PossibleAnswers { get; set; }

        public ICollection<string>? Explications { get; set; }

        public int? CorrectAnswerIndex { get; set; }

        public ICollection<string>? Hints { get; set; }

        public Guid Quest_TestId { get; set; }

        public Test? Quest_Test { get; set; }
    }
}
