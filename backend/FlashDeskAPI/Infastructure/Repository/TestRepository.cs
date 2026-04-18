using Application.DTOs.Test.AddTest;
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

            var test = await dbContext.TestEntity.FirstOrDefaultAsync(ts => ts.Title == addTestDTO.Title);
            if (test != null)
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
