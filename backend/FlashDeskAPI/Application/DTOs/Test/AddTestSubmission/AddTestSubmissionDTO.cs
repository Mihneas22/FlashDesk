using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.AddSubmission
{
    public class UserAnswerDTO
    {
        public Guid QuestionId { get; set; }
        public int SelectedAnswerIndex { get; set; }
        public bool HintUsed { get; set; }
    }
    public class AddTestSubmissionDTO
    {
        [Required]
        public List<UserAnswerDTO> Answers { get; set; } = new List<UserAnswerDTO>();

        [Required]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime FinishedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public Guid Subm_UserId { get; set; } = Guid.Empty;

        [Required]
        public Guid Subm_TestId { get; set; } = Guid.Empty;
    }
}
