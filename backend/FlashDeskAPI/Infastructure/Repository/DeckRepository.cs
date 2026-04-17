using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
using Application.DTOs.Deck.GetDeckById;
using Application.DTOs.Deck.GetDecks;
using Application.DTOs.Deck.GetPublicDecks;
using Application.Repository;
using Domain.Models;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infastructure.Repository
{
    public class DeckRepository : IDeck
    {
        private readonly ApplicationDbContext dbContext;

        public DeckRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<CreateDeckResponse> CreateDeckRepository(CreateDeckDTO createDeckDTO)
        {
            if (createDeckDTO == null)
                return new CreateDeckResponse(false, "Invalid DTO.");

            var user = await dbContext.UserEntity
                .FirstOrDefaultAsync(us => us.UserId == createDeckDTO.UserId);

            var deck = new Deck
            {
                Title = createDeckDTO.Title,
                Description = createDeckDTO.Description,
                Topic = createDeckDTO.Topic,
                DeckUserId = (user != null) ? user.UserId : (Guid?)null,
                DeckCards = new List<Card>(),
                Status = createDeckDTO.Status == "Public",
                CreatedAt = DateTime.UtcNow,
            };

            try
            {
                dbContext.DeckEntity.Add(deck);
                await dbContext.SaveChangesAsync();
                return new CreateDeckResponse(true, "Added deck!");
            }
            catch (Exception ex)
            {
                return new CreateDeckResponse(false, $"Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
        }

        public async Task<DeleteDeckResponse> DeleteDeckRepository(DeleteDeckDTO deleteDeckDTO)
        {
            if (deleteDeckDTO == null)
                return new DeleteDeckResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity.FirstOrDefaultAsync(dc => dc.DeckId == deleteDeckDTO.DeckId && dc.DeckUserId == deleteDeckDTO.UserId);
            if (deck == null)
                return new DeleteDeckResponse(false, "Cannot delelte deck.");

            dbContext.DeckEntity.Remove(deck);
            await dbContext.SaveChangesAsync();

            return new DeleteDeckResponse(true, "Deck deleted!");
        }

        public async Task<EditDeckResponse> EditDeckRepository(EditDeckDTO editDeckDTO)
        {
            if (editDeckDTO == null)
                return new EditDeckResponse(false, "Invalid DTO");

            try
            {
                var existingDeck = await dbContext.DeckEntity.FindAsync(editDeckDTO.DeckId);
                if (existingDeck == null)
                    return new EditDeckResponse(false, "Deck was not found!");

                bool isPublic = editDeckDTO.Status.Equals("public", StringComparison.OrdinalIgnoreCase) ||
                                editDeckDTO.Status == "1";

                existingDeck.Title = editDeckDTO.Title;
                existingDeck.Description = editDeckDTO.Description;
                existingDeck.Topic = editDeckDTO.Topic;
                existingDeck.Status = isPublic;

                dbContext.DeckEntity.Update(existingDeck);
                await dbContext.SaveChangesAsync();

                return new EditDeckResponse(true, "Deck has been updated");
            }
            catch (Exception ex)
            {
                // Aici este recomandat să folosești un ILogger pentru a înregistra excepția reală
                return new EditDeckResponse(false, $"Error: {ex.Message}");
            }
        }

        public async Task<GetDeckByIdResponse> GetDeckByIdRepository(GetDeckByIdDTO getDeckByIdDTO)
        {
            if (getDeckByIdDTO == null)
                return new GetDeckByIdResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity
                .Include(dc => dc.DeckCards)
                .FirstOrDefaultAsync(dc => dc.DeckId == getDeckByIdDTO.DeckId);

            if (deck == null)
                return new GetDeckByIdResponse(false, "Deck not found");
            else
                return new GetDeckByIdResponse(true, "Deck found", deck);
        }

        public async Task<GetDecksResponse> GetDecksRepository(GetDecksDTO getDecksDTO)
        {
            if (getDecksDTO == null)
                return new GetDecksResponse(false, "Invalid DTO");

            var decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Where(d => d.DeckUserId == getDecksDTO.UserId)
                .ToListAsync();

            if (!decks.Any())
                return new GetDecksResponse(true, "No decks found...", new List<Deck>());

            return new GetDecksResponse(true, "Decks found!", decks);
        }

        public async Task<GetPublicDecksResponse> GetPublicDecksRepository(GetPublicDecksDTO getPublicDecksDTO)
        {
            if (getPublicDecksDTO == null)
                return new GetPublicDecksResponse(false, "Invalid DTO");

            var query = dbContext.DeckEntity
                .AsNoTracking()
                .Include(dc => dc.DeckCards)
                .Where(dc => dc.Status == true);

            if (getPublicDecksDTO.Filter != "all")
            {
                query = query.Where(dc => dc.Topic == getPublicDecksDTO.Filter);
            }

            var decks = await query.Take(40).ToListAsync();

            return new GetPublicDecksResponse(true, "Decks retrieved", decks);
        }
    }
}
