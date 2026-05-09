using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.AddSubmission
{
    public record AddTestSubmissionResponse(bool Flag, string message = null!);
}
