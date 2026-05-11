using Application.DTOs.Card.AddCard;
using Application.DTOs.Card.DeleteCard;
using Application.DTOs.Card.EditCard;
using Application.DTOs.Card.GetCardsForDeck;
using Application.Repository;
using Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "user,admin")]
    [ApiController]
    public class CardController : ControllerBase
    {
        private readonly ICard cardRepository;
        private readonly IOcr _ocrService;

        public CardController(ICard cardRepository, IOcr ocrService)
        {
            this.cardRepository = cardRepository;
            this._ocrService = ocrService;
        }

        [HttpPost("addCard")]
        public async Task<ActionResult<AddCardResponse>> AddCardAsync(AddCardDTO addCardDTO)
        {
            var result = await cardRepository.AddCardRepository(addCardDTO);
            return Ok(result);
        }

        [HttpGet("getDeckCards/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<GetCardsByDeckResponse>> GetCardsByDeckAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckId))
                return BadRequest("ID deck invalid.");

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? currentUserId = Guid.TryParse(userIdString, out var uid) ? uid : null;
            bool isAdmin = currentUserId.HasValue && User.IsInRole("admin");

            var dto = new GetCardsByDeckDTO
            {
                DeckId = Guid.Parse(id),
                UserId = currentUserId,
                IsAdmin = isAdmin
            };
            var result = await cardRepository.GetCardsByDeckRepository(dto);
            return Ok(result);
        }

        [HttpDelete("deleteCard")]
        public async Task<ActionResult<DeleteCardResponse>> DeleteCardAsync(DeleteCardDTO deleteCardDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            deleteCardDTO.UserId = Guid.Parse(userIdString);
            deleteCardDTO.IsAdmin = User.IsInRole("admin");

            var result = await cardRepository.DeleteCardRepository(deleteCardDTO);
            return Ok(result);
        }

        [HttpPut("editCard")]
        public async Task<ActionResult<EditCardResponse>> EditCardAsync(EditCardDTO editCardDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            editCardDTO.UserId = Guid.Parse(userIdString);
            editCardDTO.IsAdmin = User.IsInRole("admin");

            var result = await cardRepository.EditCardRepository(editCardDTO);
            return Ok(result);
        }

        private static readonly string[] AllowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;
        [HttpPost("extract-latex")]
        [Authorize]
        public async Task<IActionResult> ExtractLatex(IFormFile file)
        {
            
            if (file == null || file.Length == 0) return BadRequest("Image not found.");

            if (file.Length > MaxFileSizeBytes)
             return BadRequest("The file exceeds the maximum size of 5MB.");

            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return BadRequest("Unallowed file type. Supported: JPEG, PNG, WEBP.");
            try
            {
                using var ms = new MemoryStream((int)file.Length);
                await file.CopyToAsync(ms);
                
                string latexResult = await _ocrService.RecognizeLatexAsync(ms.ToArray());

                return Ok(new { formula = latexResult });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error when processing OCR", details = ex.Message });
            }
        }
    }
}
