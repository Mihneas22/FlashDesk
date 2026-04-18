using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Test.GetTestById
{
    public record GetTestByIdResponse(bool Flag, string message = null!, Domain.Models.Test test = null!);
}
