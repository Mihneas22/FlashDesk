using Application.DTOs.Card.AddCard;
using Application.DTOs.Card.DeleteCard;
using Application.DTOs.Card.EditCard;
using Application.DTOs.Card.GetCardsForDeck;
using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
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

        public async Task<DeleteCardResponse> DeleteCardRepository(DeleteCardDTO deleteCardDTO)
        {
            if (deleteCardDTO == null)
                return new DeleteCardResponse(false, "Invalid DTO");

            var card = await dbContext.CardEntity
                .FirstOrDefaultAsync(cd => cd.CardId == deleteCardDTO.CardId && cd.DeckId == deleteCardDTO.DeckId);

            if (card == null)
                return new DeleteCardResponse(false, "Cardul nu a fost găsit în acest pachet.");

            if (!deleteCardDTO.IsAdmin)
            {
                var isDeckOwner = await dbContext.DeckEntity
                    .AnyAsync(dc => dc.DeckId == deleteCardDTO.DeckId && dc.DeckUserId == deleteCardDTO.UserId);

                if (!isDeckOwner)
                    return new DeleteCardResponse(false, "Nu ai permisiunea să ștergi carduri din acest pachet.");
            }

            dbContext.CardEntity.Remove(card);
            await dbContext.SaveChangesAsync();

            return new DeleteCardResponse(true, "Card deleted!");
        }

        public async Task<EditCardResponse> EditCardRepository(EditCardDTO editCardDTO)
        {
            if (editCardDTO == null)
                return new EditCardResponse(false, "Invalid DTO");

            var card = await dbContext.CardEntity
                .FirstOrDefaultAsync(cd => cd.CardId == editCardDTO.CardId && cd.DeckId == editCardDTO.DeckId);

            if (card == null)
                return new EditCardResponse(false, "Cardul nu a fost găsit în acest pachet.");

            if (!editCardDTO.IsAdmin)
            {
                var isDeckOwner = await dbContext.DeckEntity
                    .AnyAsync(dc => dc.DeckId == editCardDTO.DeckId && dc.DeckUserId == editCardDTO.UserId);

                if (!isDeckOwner)
                    return new EditCardResponse(false, "Nu ai permisiunea să modifici carduri din acest pachet.");
            }

            card.Question = editCardDTO.Question;
            card.Answer = editCardDTO.Answer;
            card.Tips = editCardDTO.Tips;

            await dbContext.SaveChangesAsync();

            return new EditCardResponse(true, "Card has been updated");
        }

        public async Task<GetCardsByDeckResponse> GetCardsByDeckRepository(GetCardsByDeckDTO getCardsByDeckDTO)
        {
            if (getCardsByDeckDTO == null)
                return new GetCardsByDeckResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity
                .AsNoTracking()
                .Include(dc => dc.DeckCards)
                .FirstOrDefaultAsync(dc => dc.DeckId == getCardsByDeckDTO.DeckId);

            if (deck == null || deck.DeckCards == null)
                return new GetCardsByDeckResponse(false, "Deck not found or empty.");
            else
                return new GetCardsByDeckResponse(true, "Deck found!", deck.DeckCards.ToList());
        }
    }
}
