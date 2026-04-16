using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.GetDecks;
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
                .Include(dc => dc.UserDecks)
                .FirstOrDefaultAsync(us => us.UserId == createDeckDTO.UserId);

            Guid userId = Guid.Empty;

            if (user != null)
                userId = user.UserId;

            var deck = new Deck
            {
                Title = createDeckDTO.Title,
                Description = createDeckDTO.Description,
                Topic = createDeckDTO.Topic,
                DeckUser = user,
                DeckUserId = userId,
                DeckCards = new List<Card>(),
                Status = createDeckDTO.Status=="Public" ? true : false,
                CreatedAt = DateTime.UtcNow,
            };

            dbContext.DeckEntity.Add(deck);

            if (user != null)
            {
                if(user.UserDecks == null)
                    user.UserDecks = new List<Deck>();

                user.UserDecks.Add(deck);
            }

            await dbContext.SaveChangesAsync();

            return new CreateDeckResponse(true, "Added deck!");
        }

        public async Task<GetDecksResponse> GetDecksRepository(GetDecksDTO getDecksDTO)
        {
            if (getDecksDTO == null)
                return new GetDecksResponse(false, "Invalid DTO");

            var user = await dbContext.UserEntity
                .Include(us => us.UserDecks)
                .FirstOrDefaultAsync(us => us.UserId == getDecksDTO.UserId);

            if (user == null)
                return new GetDecksResponse(false, "No user found");

            if (user.UserDecks == null || user.UserDecks.Count == 0)
                return new GetDecksResponse(true, "No decks found...");
            else
                return new GetDecksResponse(true, "Decks found!", user.UserDecks.ToList());
        }
    }
}
