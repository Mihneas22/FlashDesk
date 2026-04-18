using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Models
{
    public class User
    {
        [Key]
        public Guid UserId { get; set; }

        public string? Username { get; set; }

        public string? Email { get; set; }

        public string? Password { get; set; }

        public int? Elo { get; set; }

        public ICollection<Deck>? UserDecks { get; set; }

        public ICollection<TestSubmission>? UserSubmissions { get; set; }

        public ICollection<string>? Roles { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}
