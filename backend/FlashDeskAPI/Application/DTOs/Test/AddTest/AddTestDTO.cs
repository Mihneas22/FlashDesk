using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.AddTest
{
    public class AddTestDTO
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Topic { get; set; } = string.Empty;

        [Required]
        public int Time { get; set; } = 0;
    }
}
