using Application.DTOs.Deck.AddDeckSubmission;
using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
using Application.DTOs.Deck.GetAllDecks;
using Application.DTOs.Deck.GetDeckById;
using Application.DTOs.Deck.GetDeckByName;
using Application.DTOs.Deck.GetDecks;
using Application.DTOs.Deck.GetPublicDecks;
using Application.Repository;
using Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "user,admin")]
    [ApiController]
    public class DeckController : ControllerBase
    {
        private readonly IDeck deckRepo;

        public DeckController(IDeck deckRepo)
        {
            this.deckRepo = deckRepo;
        }

        [HttpPost("addDeck")]
        public async Task<ActionResult<CreateDeckResponse>> CreateDeckAsync(CreateDeckDTO createDeckDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            createDeckDTO.UserId = Guid.Parse(userIdString);
            var result = await deckRepo.CreateDeckRepository(createDeckDTO);
            return Ok(result);
        }

        [HttpGet("getDecksByUser")]
        public async Task<ActionResult<GetDecksResponse>> GetDecksByUserAsync()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var result = await deckRepo.GetDecksRepository(new GetDecksDTO { UserId = Guid.Parse(userIdString) });
            return Ok(result);
        }

        [HttpGet("getPublicDecks")]
        [AllowAnonymous]
        public async Task<ActionResult<GetPublicDecksResponse>> GetPublicDecksAsync([FromQuery] GetPublicDecksDTO dto)
        {
            var plan = User.Claims.FirstOrDefault(c => c.Type == "SubscriptionPlan")?.Value;
            dto.Role = plan;
            var result = await deckRepo.GetPublicDecksRepository(dto);
            return Ok(result);
        }

        [HttpGet("getDeckById/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<GetDeckByIdResponse>> GetDeckByIdAsync(string id)
        {
            var result = await deckRepo.GetDeckByIdRepository(new GetDeckByIdDTO { DeckId = Guid.Parse(id) });
            return Ok(result);
        }

        [HttpDelete("deleteDeck/{deckId}")]
        public async Task<ActionResult<DeleteDeckResponse>> DeleteDeckAsync(string deckId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var deleteDeckDTO = new DeleteDeckDTO
            {
                DeckId = Guid.Parse(deckId),
                UserId = Guid.Parse(userIdString),
                IsAdmin = User.IsInRole("admin")
            };

            var result = await deckRepo.DeleteDeckRepository(deleteDeckDTO);
            return Ok(result);
        }

        [HttpPut("editDeck")]
        public async Task<ActionResult<EditDeckResponse>> EditDeckAsync(EditDeckDTO editDeckDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            editDeckDTO.UserId = Guid.Parse(userIdString);
            editDeckDTO.IsAdmin = User.IsInRole("admin");

            var result = await deckRepo.EditDeckRepository(editDeckDTO);
            return Ok(result);
        }

        [HttpGet("getAllDecks")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<GetAllDecksResponse>> GetAllDecksAsync()
        {
            var result = await deckRepo.GetAllDeckRepository();
            return Ok(result);
        }

        [HttpGet("getDecksByName")]
        public async Task<ActionResult<GetDeckByNameResponse>> GetDeckByNameAsync([FromQuery] GetDeckByNameDTO dto)
        {
            var result = await deckRepo.GetDeckByNameRepository(dto);
            return Ok(result);
        }

        [HttpPost("generateFlashcards")]
        [EnableRateLimiting("CreateDeckAI_Access")]
        public async Task<ActionResult<string>> GenerateFlashcardsWithPdfAsync(IFormFile pdfFile)
        {
            if (pdfFile == null || pdfFile.Length == 0)
                return BadRequest("Please upload a valid PDF file.");

            if (pdfFile.ContentType != "application/pdf")
                return BadRequest("Only PDF files are accepted.");

            const long maxFileSize = 20 * 1024 * 1024;
            if (pdfFile.Length > maxFileSize)
                return BadRequest("The file is too large. The maximum allowed size is 10MB.");

            using var stream = new MemoryStream();
            await pdfFile.CopyToAsync(stream);
            byte[] fileBytes = stream.ToArray();

            var flashcardsJson = await deckRepo.GenerateFlashCardsPdf(fileBytes);

            return Ok(flashcardsJson);
        }

        [HttpPost("deck-submission")]
        public async Task<ActionResult<AddDeckSumbissionResponse>> AddDeckSumbissionAsync(AddDeckSubmissionDTO addDeckSubmissionDTO)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            addDeckSubmissionDTO.UserId = Guid.Parse(userIdString);

            var result = await deckRepo.AddDeckSumbissionRepository(addDeckSubmissionDTO);
            return Ok();
        }
    }
}