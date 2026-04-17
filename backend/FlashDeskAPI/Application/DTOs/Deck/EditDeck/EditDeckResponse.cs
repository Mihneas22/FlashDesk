using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.EditDeck
{
    public record EditDeckResponse(bool Flag, string message = null!);
}
