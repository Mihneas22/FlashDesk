using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Questions.GetQuestionsByTest
{
    public record GetQuestionsByTestResponse(bool Flag, string message = null!, List<Domain.Models.TestQuestion> questions = null!, int time = 0);
}
