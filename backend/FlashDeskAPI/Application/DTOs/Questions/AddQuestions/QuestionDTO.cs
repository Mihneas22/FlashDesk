using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Questions.AddQuestions
{
    public class QuestionDTO
    {
        public string? QuestionText { get; set; }
        public ICollection<string>? PossibleAnswers { get; set; }
        public ICollection<string>? Explications { get; set; }
        public int? CorrectAnswerIndex { get; set; }
        public ICollection<string>? Hints { get; set; }
    }
}
