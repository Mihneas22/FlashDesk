using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.EditTest
{
    public record EditTestResponse(bool Flag, string message = null!);
}
