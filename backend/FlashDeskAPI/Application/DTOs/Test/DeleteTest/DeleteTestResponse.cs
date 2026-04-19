using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.DeleteTest
{
    public record DeleteTestResponse(bool Flag, string message = null!);
}
