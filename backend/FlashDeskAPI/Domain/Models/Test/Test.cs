using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class Test
    {
        [Key]
        public Guid TestId { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Topic { get; set; }

        public int? Time { get; set; }

        public ICollection<TestQuestion>? Questions { get; set; }

        public ICollection<TestSubmission>? Submissions { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
