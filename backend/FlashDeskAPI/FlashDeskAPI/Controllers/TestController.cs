using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Test.AddSubmission;
using Application.DTOs.Test.AddTest;
using Application.DTOs.Test.DeleteTest;
using Application.DTOs.Test.EditTest;
using Application.DTOs.Test.GetTestById;
using Application.DTOs.Test.GetTests;
using Application.Repository;
using Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpPost("addTestSubmission")]
        public async Task<IActionResult> AddSubmission([FromBody] AddTestSubmissionDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

                if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid loggedInUserId))
                {
                    return Unauthorized(new { message = "Invalid token or user ID not found in token claims." });
                }
                dto.Subm_UserId = loggedInUserId;
                var result = await testRepo.AddTestSubmissionRepository(dto);
                if (result.Flag)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred.", details = ex.Message });
            }
        }
    }
}
