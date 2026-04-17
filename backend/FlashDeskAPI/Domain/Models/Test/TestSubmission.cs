using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class TestSubmission
    {
        [Key]
        public Guid TestSubmissionId { get; set; }

        public int? CorrectAnswers { get; set; }

        public int? WrongAnswers { get; set; }

        public int? Points { get; set; } 

        public Guid Subm_UserId { get; set; }

        public User? Subm_User { get; set; }

        public Guid Subm_TestId { get; set; }

        public Test? Subm_Test { get; set; }
    }
}
