using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Card.DeleteCard
{
    public record DeleteCardResponse(bool Flag, string message = null!);
}
