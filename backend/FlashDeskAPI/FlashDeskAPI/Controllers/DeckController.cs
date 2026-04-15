using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.GetDecks;
using Application.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
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
            var result = await deckRepo.CreateDeckRepository(createDeckDTO);
            return Ok(result);
        }

        [HttpGet("getDecksByUser/{id}")]
        public async Task<ActionResult<GetDecksResponse>> GetDecksByUserAsync(string id)
        {
            var result = await deckRepo.GetDecksRepository(new GetDecksDTO { UserId = Guid.Parse(id) });
            return Ok(result);
        }
    }
}
