using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Questions.AddQuestions
{
    public record AddQuestionsResponse(bool Flag, string message = null!);
}
