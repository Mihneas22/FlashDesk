using Application.DTOs.Card.AddCard;
using Application.DTOs.Card.GetCardsForDeck;
using Application.Repository;
using Domain.Models;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infastructure.Repository
{
    public class CardRepository : ICard
    {
        private readonly ApplicationDbContext dbContext;

        public CardRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<AddCardResponse> AddCardRepository(AddCardDTO addCardDTO)
        {
            if (addCardDTO == null)
                return new AddCardResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity
                .Include(dc => dc.DeckCards)
                .FirstOrDefaultAsync(dc => dc.DeckId == addCardDTO.DeckId);

            if (deck == null)
                return new AddCardResponse(false, "Deck not found");

            var card = new Card
            {
                Question = addCardDTO.Question,
                Answer = addCardDTO.Answer,
                DeckId = addCardDTO.DeckId,
                Tips = addCardDTO.Tips,
                CardDeck = deck,
                CreatedAt = DateTime.UtcNow
            };

            if (deck.DeckCards == null)
                deck.DeckCards = new List<Card>();

            deck.DeckCards.Add(card);
            
            dbContext.CardEntity.Add(card);
            await dbContext.SaveChangesAsync();

            return new AddCardResponse(true, "Added succesfully!");
        }

        public async Task<GetCardsByDeckResponse> GetCardsByDeckRepository(GetCardsByDeckDTO getCardsByDeckDTO)
        {
            if (getCardsByDeckDTO == null)
                return new GetCardsByDeckResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity
                .Include(dc => dc.DeckCards)
                .FirstOrDefaultAsync(dc => dc.DeckId == getCardsByDeckDTO.DeckId);

            if (deck == null || deck.DeckCards == null)
                return new GetCardsByDeckResponse(false, "Deck not found or empty.");
            else
                return new GetCardsByDeckResponse(true, "Deck found!", deck.DeckCards.ToList());
        }
    }
}
