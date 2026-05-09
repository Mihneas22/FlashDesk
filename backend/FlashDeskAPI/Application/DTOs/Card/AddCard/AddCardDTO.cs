using Domain.Models.Graphs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Card.AddCard
{
    public class AddCardDTO
    {
        [Required]
        public string Question { get; set; } = string.Empty;

        [Required]
        public string Answer { get; set; } = string.Empty;

        [Required]
        public Guid DeckId { get; set; } = Guid.Empty;

        [Required]
        public List<string> Tips { get; set; } = new List<string>();

        public ViewConfig? GraphConfig { get; set; }

        public MatrixViewConfig? MatrixConfig { get; set; }
    }
}
