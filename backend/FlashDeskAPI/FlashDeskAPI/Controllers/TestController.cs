using Application.DTOs.Test.AddTest;
using Application.DTOs.Test.DeleteTest;
using Application.DTOs.Test.EditTest;
using Application.DTOs.Test.GetTestById;
using Application.DTOs.Test.GetTests;
using Application.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "user")]
    public class TestController : ControllerBase
    {
        private readonly ITest testRepo;

        public TestController(ITest testRepo)
        {
            this.testRepo = testRepo;
        }

        [HttpPost("addTest")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<AddTestResponse>> AddTestAsync(AddTestDTO addTestDTO)
        {
            var result = await testRepo.AddTestRepository(addTestDTO);
            return Ok(result);
        }

        [HttpPut("editTest")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<EditTestResponse>> EditTestAsync(EditTestDTO editTestDTO)
        {
            var result = await testRepo.EditTestRepository(editTestDTO);
            return Ok(result);
        }

        [HttpDelete("deleteTest")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<DeleteTestResponse>> DeleteTestAsync(DeleteTestDTO deleteTestDTO)
        {
            var result = await testRepo.DeleteTestRepository(deleteTestDTO);
            return Ok(result);
        }

        [HttpGet("getTestById/{id}")]
        public async Task<ActionResult<GetTestByIdResponse>> GetTestByIdAsync(string id)
        {
            var result = await testRepo.GetTestByIdRepository(new GetTestByIdDTO { TestId = Guid.Parse(id) });
            return Ok(result);
        }

        [HttpGet("getTestsFilter/{filter}")]
        public async Task<ActionResult<GetTestsResponse>> GetTestByFilterAsync(string filter)
        {
            var result = await testRepo.GetTestsFilterRepository(new GetTestsDTO { Filter = filter });
            return Ok(result);
        }
    }
}
