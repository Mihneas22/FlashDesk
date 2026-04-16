using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Card.AddCard
{
    public record AddCardResponse(bool Flag, string message = null!);
}
