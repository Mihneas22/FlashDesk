using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Deck.GetDeckByName
{
    public class GetDeckByNameDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public bool Status { get; set; } = false;
    }
}
