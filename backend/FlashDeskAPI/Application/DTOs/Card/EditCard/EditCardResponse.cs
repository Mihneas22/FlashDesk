using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Card.EditCard
{
    public record EditCardResponse(bool Flag, string message = null!);
}
