using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Questions.GetQuestionsByTest
{
    public class GetQuestionsByTestDTO
    {
        [Required]
        public Guid TestId { get; set; } = Guid.Empty;
    }
}
