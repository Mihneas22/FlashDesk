using Domain.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.EditTest
{
    public class EditTestDTO
    {
        [Required]
        public Guid TestId { get; set; } = Guid.Empty;

        [Required]
        public Guid UserId { get; set; } = Guid.Empty;
        
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public int Time { get; set; } = 0;

        [Required]
        public ICollection<TestQuestion> Questions { get; set; } = new List<TestQuestion>();
    }
}
