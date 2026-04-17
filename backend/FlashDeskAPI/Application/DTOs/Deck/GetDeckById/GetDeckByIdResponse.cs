using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.GetDeckById
{
    public record GetDeckByIdResponse(bool Flag, string message = null!, Domain.Models.Deck deck = null!);
}
