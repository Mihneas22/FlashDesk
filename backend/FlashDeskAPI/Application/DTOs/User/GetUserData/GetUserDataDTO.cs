using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.User.GetUserData
{
    public class GetUserDataDTO
    {
        [Required]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
