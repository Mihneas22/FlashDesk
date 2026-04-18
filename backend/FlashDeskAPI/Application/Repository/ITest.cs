using Application.DTOs.Test.AddTest;
using Application.DTOs.Test.GetTestById;
using Application.DTOs.Test.GetTests;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface ITest
    {
        Task<AddTestResponse> AddTestRepository(AddTestDTO addTestDTO);

        Task<GetTestByIdResponse> GetTestByIdRepository(GetTestByIdDTO getTestByIdDTO);

        Task<GetTestsResponse> GetTestsFilterRepository(GetTestsDTO getTestsDTO);
        /*
         * de implementatat
         * Add Test
         * Add Question
         * GetTestsByCategory(all si celelalte topics)
         * Add Submisions (de facut sistem final + ui connected)
         */
    }
}
