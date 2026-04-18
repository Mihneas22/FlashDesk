using Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetDeckByName
{
    public record GetDeckByNameResponse(bool Flag, string message = null!, Domain.Models.Deck deck = null!);
}
