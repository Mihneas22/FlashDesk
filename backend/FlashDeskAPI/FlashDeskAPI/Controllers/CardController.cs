using Application.DTOs.Card.AddCard;
using Application.DTOs.Card.GetCardsForDeck;
using Application.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
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
        public async Task<ActionResult<GetCardsByDeckResponse>> GetCardsByDeckAsync(string id)
        {
            var result = await cardRepository.GetCardsByDeckRepository(new GetCardsByDeckDTO { DeckId = Guid.Parse(id) });
            return Ok(result);
        }
    }
}
