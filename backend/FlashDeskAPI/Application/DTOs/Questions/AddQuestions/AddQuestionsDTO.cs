using Domain.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Questions.AddQuestions
{
    public class AddQuestionsDTO
    {
        [Required]
        public Guid TestId { get; set; } = Guid.Empty;

        [Required]
        public List<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();
    }
}
