using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
using Application.DTOs.Deck.GetDeckById;
using Application.DTOs.Deck.GetDecks;
using Application.DTOs.Deck.GetPublicDecks;
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

        [HttpGet("getPublicDecks/{filter}")]
        public async Task<ActionResult<GetPublicDecksResponse>> GetPublicDecksAsync(string filter)
        {
            var result = await deckRepo.GetPublicDecksRepository(new GetPublicDecksDTO { Filter = filter });
            return Ok(result);
        }

        [HttpGet("getDeckById/{id}")]
        public async Task<ActionResult<GetDeckByIdResponse>> GetDeckByIdAsync(string id)
        {
            var result = await deckRepo.GetDeckByIdRepository(new GetDeckByIdDTO { DeckId = Guid.Parse(id) });
            return Ok(result);
        }

        [HttpDelete("deleteDeck")]
        public async Task<ActionResult<DeleteDeckResponse>> DeleteDeckAsync(DeleteDeckDTO deleteDeckDTO)
        {
            var result = await deckRepo.DeleteDeckRepository(deleteDeckDTO);
            return Ok(result);
        }

        [HttpPut("editDeck")]
        public async Task<ActionResult<EditDeckResponse>> EditDeckAsync(EditDeckDTO editDeckDTO)
        {
            var result = await deckRepo.EditDeckRepository(editDeckDTO);
            return Ok(result);
        }
    }
}
