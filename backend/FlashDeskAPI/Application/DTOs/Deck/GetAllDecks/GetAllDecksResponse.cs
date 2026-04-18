using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetAllDecks
{
    public record GetAllDecksResponse(bool Flag, string message = null!, List<Domain.Models.Deck> decks = null!);
}
