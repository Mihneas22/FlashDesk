using Application.DTOs.Questions.AddQuestions;
using Application.DTOs.Questions.GetQuestionsByTest;
using Application.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "user")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestion questionRepo;

        public QuestionController(IQuestion questionRepo)
        {
            this.questionRepo = questionRepo;
        }

        [HttpPost("addQuestion")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<AddQuestionsResponse>> AddQuestionAsync(AddQuestionsDTO addQuestionsDTO)
        {
            var result = await questionRepo.AddQuestionsRepository(addQuestionsDTO);
            return Ok(result);
        }

        [HttpGet("getQuestionsByTest/{id}")]
        public async Task<ActionResult<GetQuestionsByTestResponse>> GetQuestionsAsync(string id)
        {
            var result = await questionRepo.GetQuestionsByTestRepository(new GetQuestionsByTestDTO { TestId = Guid.Parse(id) });
            return Ok(result);
        }
    }
}
