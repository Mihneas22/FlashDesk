using Application.DTOs.Card.AddCard;
using Application.DTOs.Card.GetCardsForDeck;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface ICard
    {
        Task<AddCardResponse> AddCardRepository(AddCardDTO addCardDTO);

        Task<GetCardsByDeckResponse> GetCardsByDeckRepository(GetCardsByDeckDTO getCardsByDeckDTO);
    }
}
