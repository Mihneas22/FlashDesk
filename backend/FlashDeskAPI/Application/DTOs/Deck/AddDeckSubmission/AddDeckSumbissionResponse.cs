using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Deck.AddDeckSubmission
{
    public record AddDeckSumbissionResponse(bool Flag, string message = null!);
}
