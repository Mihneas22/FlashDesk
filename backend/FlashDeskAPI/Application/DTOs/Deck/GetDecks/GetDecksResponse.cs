using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetDecks
{
    public record GetDecksResponse(bool Flag, string message = null!, List<Domain.Models.Deck> decks = null!);
}
