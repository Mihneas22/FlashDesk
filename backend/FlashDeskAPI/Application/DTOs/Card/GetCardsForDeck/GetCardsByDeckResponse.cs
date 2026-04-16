using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Card.GetCardsForDeck
{
    public record GetCardsByDeckResponse(bool Flag, string message = null!, List<Domain.Models.Card> cards = null!);
}
