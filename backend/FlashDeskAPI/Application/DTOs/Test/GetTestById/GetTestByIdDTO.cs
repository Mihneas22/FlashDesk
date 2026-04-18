using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Test.GetTestById
{
    public class GetTestByIdDTO
    {
        [Required]
        public Guid TestId { get; set; } = Guid.Empty;
    }
}
