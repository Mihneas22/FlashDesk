using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.CreateDeck
{
    public record CreateDeckResponse(bool Flag, string message = null!);
}
