using Application.DTOs.Questions.AddQuestions;
using Application.DTOs.Questions.GetQuestionsByTest;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface IQuestion
    {
        Task<AddQuestionsResponse> AddQuestionsRepository(AddQuestionsDTO addQuestionsDTO);

        Task<GetQuestionsByTestResponse> GetQuestionsByTestRepository(GetQuestionsByTestDTO getQuestionsByTestDTO);
    }
}
