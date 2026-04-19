using Application.DTOs.Questions.AddQuestions;
using Application.DTOs.Questions.GetQuestionsByTest;
using Application.Repository;
using Domain.Models;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infastructure.Repository
{
    public class QuestionRepository : IQuestion
    {
        private readonly ApplicationDbContext dbContext;

        public QuestionRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<AddQuestionsResponse> AddQuestionsRepository(AddQuestionsDTO addQuestionsDTO)
        {
            if (addQuestionsDTO == null || addQuestionsDTO.Questions == null || !addQuestionsDTO.Questions.Any())
                return new AddQuestionsResponse(false, "Invalid DTO or empty questions list");

            bool testExists = await dbContext.TestEntity.AnyAsync(ts => ts.TestId == addQuestionsDTO.TestId);
            if (!testExists)
                return new AddQuestionsResponse(false, "Test not found");

            var newQuestions = addQuestionsDTO.Questions.Select(dto => new TestQuestion
            {
                TestQuestionId = Guid.NewGuid(),
                Quest_TestId = addQuestionsDTO.TestId,
                QuestionText = dto.QuestionText,
                PossibleAnswers = dto.PossibleAnswers,
                Explications = dto.Explications,
                CorrectAnswerIndex = dto.CorrectAnswerIndex,
                Hints = dto.Hints
            }).ToList();

            dbContext.TestQuestionEntity.AddRange(newQuestions);

            await dbContext.SaveChangesAsync();

            return new AddQuestionsResponse(true, "Added questions successfully");
        }

        public async Task<GetQuestionsByTestResponse> GetQuestionsByTestRepository(GetQuestionsByTestDTO getQuestionsByTestDTO)
        {
            if (getQuestionsByTestDTO == null)
                return new GetQuestionsByTestResponse(false, "Invalid DTO");

            var test = await dbContext.TestEntity
                .Include(ts => ts.Questions)
                .FirstOrDefaultAsync(ts => ts.TestId == getQuestionsByTestDTO.TestId);
            if (test == null)
                return new GetQuestionsByTestResponse(false, "No test found");

            var questions = test.Questions;
            int time = (int)(test.Time != null ? test.Time : 0);

            if (questions == null)
                return new GetQuestionsByTestResponse(false, "No tests found");
            else
                return new GetQuestionsByTestResponse(true, "Tests retrived", questions.ToList(), time);
        }
    }
}
