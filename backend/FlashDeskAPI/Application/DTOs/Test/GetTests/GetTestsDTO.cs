using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.GetTests
{
    public class GetTestsDTO
    {
        [Required]
        public string Filter { get; set; } = string.Empty;
    }
}
