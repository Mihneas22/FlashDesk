using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.GetDeckById;
using Application.DTOs.Deck.GetDecks;
using Application.DTOs.Deck.GetPublicDecks;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface IDeck
    {
        Task<CreateDeckResponse> CreateDeckRepository(CreateDeckDTO createDeckDTO);

        Task<GetDecksResponse> GetDecksRepository(GetDecksDTO getDecksDTO);

        Task<GetPublicDecksResponse> GetPublicDecksRepository(GetPublicDecksDTO getPublicDecksDTO);

        Task<GetDeckByIdResponse> GetDeckByIdRepository(GetDeckByIdDTO getDeckByIdDTO);
    }
}
