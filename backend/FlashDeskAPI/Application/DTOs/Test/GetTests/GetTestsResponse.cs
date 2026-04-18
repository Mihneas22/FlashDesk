using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.GetTests
{
    public record GetTestsResponse(bool Flag, string message = null!, List<Domain.Models.Test> tests = null!);
}
