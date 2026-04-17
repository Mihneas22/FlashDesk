using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.DeleteDeck
{
    public record DeleteDeckResponse(bool Flag, string message = null!);
}
