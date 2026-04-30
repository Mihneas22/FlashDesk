using Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetDeckByName
{
    public record GetDeckByNameResponse(bool Flag, string message = null!, List<Domain.Models.Deck> decks = null!);
}
