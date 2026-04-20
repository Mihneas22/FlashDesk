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

        public CardController(ICard cardRepository)
        {
            this.cardRepository = cardRepository;
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
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? currentUserId = string.IsNullOrEmpty(userIdString) ? null : Guid.Parse(userIdString);
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
    }
}
