using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
using Application.DTOs.Test.AddSubmission;
using Application.DTOs.Test.AddTest;
using Application.DTOs.Test.DeleteTest;
using Application.DTOs.Test.EditTest;
using Application.DTOs.Test.GetTestById;
using Application.DTOs.Test.GetTests;
using Application.Repository;
using Domain.Models;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infastructure.Repository
{
    public class TestRepository : ITest
    {
        private readonly ApplicationDbContext dbContext;

        public TestRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<AddTestResponse> AddTestRepository(AddTestDTO addTestDTO)
        {
            if (addTestDTO == null)
                return new AddTestResponse(false, "Invalid DTO");

            var test = await dbContext.TestEntity.AnyAsync(ts => ts.Title == addTestDTO.Title);
            if (test)
                return new AddTestResponse(false, "Test with name already exists");

            dbContext.TestEntity.Add(new Domain.Models.Test
            {
                Title = addTestDTO.Title,
                Description = addTestDTO.Description,
                Topic = addTestDTO.Topic,
                Time = addTestDTO.Time,
                Questions = new List<TestQuestion>(),
                Submissions = new List<TestSubmission>(),
                CreatedAt = DateTime.UtcNow
            });

            await dbContext.SaveChangesAsync();

            return new AddTestResponse(true, "Added test!");
        }

        public async Task<AddTestSubmissionResponse> AddTestSubmissionRepository(AddTestSubmissionDTO addTestSubmissionDTO)
        {
            try
            {
                var userExists = await dbContext.UserEntity.AnyAsync(u => u.UserId == addTestSubmissionDTO.Subm_UserId);
                if (!userExists)
                {
                    return new AddTestSubmissionResponse(false, "User not found.");
                }

                var testExists = await dbContext.TestEntity.AnyAsync(t => t.TestId == addTestSubmissionDTO.Subm_TestId);
                if (!testExists)
                {
                    return new AddTestSubmissionResponse(false, "Test not found.");
                }

                var submission = new TestSubmission
                {
                    TestSubmissionId = Guid.NewGuid(),
                    CorrectAnswers = addTestSubmissionDTO.CorrectAnswers,
                    WrongAnswers = addTestSubmissionDTO.WrongAnswers,
                    Points = addTestSubmissionDTO.Points,
                    StartedAt = addTestSubmissionDTO.StartedAt,
                    FinishedAt = addTestSubmissionDTO.FinishedAt,
                    Subm_UserId = addTestSubmissionDTO.Subm_UserId,
                    Subm_TestId = addTestSubmissionDTO.Subm_TestId
                };

                await dbContext.TestSubmissionEntity.AddAsync(submission);
                await dbContext.SaveChangesAsync();

                return new AddTestSubmissionResponse(true, "Test submission added successfully.");
            }
            catch (Exception ex)
            {
                return new AddTestSubmissionResponse(false, $"An error occurred while saving the submission: {ex.Message}");
            }
        }

        public async Task<DeleteTestResponse> DeleteTestRepository(DeleteTestDTO deleteTestDTO)
        {
            if (deleteTestDTO == null)
                return new DeleteTestResponse(false, "Invalid DTO");

            var user = await dbContext.UserEntity.FirstOrDefaultAsync(us => us.UserId == deleteTestDTO.UserId);
            if (user == null)
                return new DeleteTestResponse(false, "User not found");

            if (user.Roles!.Contains("admin") == false)
                return new DeleteTestResponse(false, "Does not have permission");

            var test = await dbContext.TestEntity.FirstOrDefaultAsync(dc => dc.TestId == deleteTestDTO.TestId);

            if (test == null)
                return new DeleteTestResponse(false, "Cannot delelte test.");

            dbContext.TestEntity.Remove(test);
            await dbContext.SaveChangesAsync();

            return new DeleteTestResponse(true, "Test deleted!");
        }

        public async Task<EditTestResponse> EditTestRepository(EditTestDTO editTestDTO)
        {
            if (editTestDTO == null)
                return new EditTestResponse(false, "Invalid DTO");

            var existingTest = await dbContext.TestEntity
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(ts => ts.TestId == editTestDTO.TestId);

            if (existingTest == null)
                return new EditTestResponse(false, "Test not found");

            existingTest.Title = editTestDTO.Title;
            existingTest.Description = editTestDTO.Description;
            existingTest.Topic = editTestDTO.Topic;
            existingTest.Time = editTestDTO.Time;

            dbContext.TestEntity.Update(existingTest);
            await dbContext.SaveChangesAsync();

            return new EditTestResponse(true, "Test updated");
        }

        public async Task<GetTestByIdResponse> GetTestByIdRepository(GetTestByIdDTO getTestByIdDTO)
        {
            if (getTestByIdDTO == null)
                return new GetTestByIdResponse(false, "Invalid DTO");

            var test = await dbContext.TestEntity.FirstOrDefaultAsync(ts => ts.TestId == getTestByIdDTO.TestId);
            if (test == null)
                return new GetTestByIdResponse(false, "Test not found!");
            else
                return new GetTestByIdResponse(true, "Test found", test);
        }

        public async Task<GetTestsResponse> GetTestsFilterRepository(GetTestsDTO getTestsDTO)
        {
            if (getTestsDTO == null)
                return new GetTestsResponse(false, "Invalid DTO");

            var query = dbContext.TestEntity.AsNoTracking();
            if (getTestsDTO.Filter != "all")
                query = query.Where(ts => ts.Topic == getTestsDTO.Filter);

            var tests = await query.ToListAsync();

            if (tests == null)
                return new GetTestsResponse(false, "Test not found!");
            else
                return new GetTestsResponse(true, "Test found", tests);
        }
    }
}
