using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.AddTest
{
    public record AddTestResponse(bool Flag, string message = null!);
}
