using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetPublicDecks
{
    public record GetPublicDecksResponse(bool Flag, string message = null!, List<Domain.Models.Deck> decks = null!);
}
