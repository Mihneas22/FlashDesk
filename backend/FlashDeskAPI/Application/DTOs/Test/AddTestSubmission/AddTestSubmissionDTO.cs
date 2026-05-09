using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.AddSubmission
{
    public class AddTestSubmissionDTO
    {
        [Required]
        public List<int> CorrectAnswers { get; set; } = new List<int>();

        [Required]
        public List<int> WrongAnswers { get; set; } = new List<int>();

        [Required]
        public int Points { get; set; } = 0;

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
