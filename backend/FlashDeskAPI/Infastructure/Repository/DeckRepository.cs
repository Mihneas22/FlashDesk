using Application.DTOs.Deck.AddDeckSubmission;
using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.Deck.DeleteDeck;
using Application.DTOs.Deck.EditDeck;
using Application.DTOs.Deck.GetAllDecks;
using Application.DTOs.Deck.GetDeckById;
using Application.DTOs.Deck.GetDeckByName;
using Application.DTOs.Deck.GetDecks;
using Application.DTOs.Deck.GetPublicDecks;
using Application.Repository;
using Domain.Models;
using Humanizer;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infastructure.Repository
{
    public class DeckRepository : IDeck
    {
        private readonly ApplicationDbContext dbContext;

        public DeckRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<AddDeckSumbissionResponse> AddDeckSumbissionRepository(AddDeckSubmissionDTO addDeckSubmissionDTO)
        {
            var user = await dbContext.UserEntity
                .Include(u => u.Streak)
                .FirstOrDefaultAsync(u => u.UserId == addDeckSubmissionDTO.UserId);

            if (user == null) return new AddDeckSumbissionResponse(false, "User not found");

            int cardsInSession = addDeckSubmissionDTO.SessionResults.Count;
            int easyCards = addDeckSubmissionDTO.SessionResults.Count(r => r.Difficulty.ToString().ToLower() == "easy");

            user.TotalCards = (user.TotalCards ?? 0) + cardsInSession;
            user.MasteredCards = (user.MasteredCards ?? 0) + easyCards;
            user.CompletedDecks = (user.CompletedDecks ?? 0) + 1;

            UpdateUserHeatmap(user);
            UpdateUserStreak(user);

            try
            {
                await dbContext.SaveChangesAsync();
                return new AddDeckSumbissionResponse(true, "Session saved and stats updated");
            }
            catch (Exception ex)
            {
                return new AddDeckSumbissionResponse(false, ex.Message);
            }
        }

        private void UpdateUserHeatmap(User user)
        {
            if (user.HeatmapData == null) user.HeatmapData = new List<List<int>>();

            var today = DateTime.UtcNow;
            int dayOfWeek = (int)today.DayOfWeek;

            if (user.HeatmapData.Count == 0)
            {
                for (int i = 0; i < 53; i++) user.HeatmapData.Add(new List<int>(new int[7]));
            }

            int weekIndex = today.DayOfYear / 7;
            if (weekIndex >= 53) weekIndex = 52;

            user.HeatmapData[weekIndex][dayOfWeek]++;
        }

        private void UpdateUserStreak(User user)
        {
            if (user.Streak == null)
            {
                user.Streak = new Streak { CurrentStreak = 1, LastActivityDate = DateTime.UtcNow };
            }
            else
            {
                var lastActive = user.Streak.LastActivityDate?.Date;
                var today = DateTime.UtcNow.Date;

                if (lastActive == today.AddDays(-1))
                {
                    user.Streak.CurrentStreak++;
                }
                else if (lastActive != today)
                {
                    user.Streak.CurrentStreak = 1;
                }
                user.Streak.LastActivityDate = DateTime.UtcNow;
            }
        }

        public async Task<CreateDeckResponse> CreateDeckRepository(CreateDeckDTO createDeckDTO)
        {
            if (createDeckDTO == null)
                return new CreateDeckResponse(false, "Invalid DTO.");

            var deck = new Deck
            {
                Title = createDeckDTO.Title,
                Description = createDeckDTO.Description,
                Topic = createDeckDTO.Topic,
                DeckUserId = createDeckDTO.UserId,
                DeckCards = createDeckDTO.Cards?.Select(cardDto => new Card
                {
                    Question = cardDto.Question,
                    Answer = cardDto.Answer,
                    Tips = cardDto.Tips,
                    CreatedAt = DateTime.UtcNow
                }).ToList() ?? new List<Card>(),
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

            var deck = new Deck();

            if(deleteDeckDTO.IsAdmin)
                deck = await dbContext.DeckEntity.FirstOrDefaultAsync(dc => dc.DeckId == deleteDeckDTO.DeckId);
            else
                deck = await dbContext.DeckEntity.FirstOrDefaultAsync(dc => dc.DeckId == deleteDeckDTO.DeckId && dc.DeckUserId == deleteDeckDTO.UserId);
            
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
                var existingDeck = new Deck();

                if (editDeckDTO.IsAdmin)
                    existingDeck = await dbContext.DeckEntity.FirstOrDefaultAsync(dc => dc.DeckId == editDeckDTO.DeckId);
                else
                    existingDeck = await dbContext.DeckEntity.FirstOrDefaultAsync(dc => dc.DeckId == editDeckDTO.DeckId && dc.DeckUserId == editDeckDTO.UserId);

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
                return new EditDeckResponse(false, "An unexpected error occurred while updating the deck.");
            }
        }

        public async Task<string> GenerateFlashCardsPdf(byte[] pdfBytes)
        {
            string key = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
                ?? throw new InvalidOperationException("GEMINI_API_KEY nu este configurată!");

            var googleAI = new GoogleAI(key);

            var model = googleAI.GenerativeModel(Model.Gemini25Flash);

            string prompt = @"Ești un asistent academic expert. Extrage 15 carduri din textul oferit.                
                    REGULI:                
                    1. Folosește KaTeX pentru formule, încadrate între $ pentru inline și $$ pentru block.                
                    2. CRITIC PENTRU JSON: Toate backslash-urile din formulele matematice LaTeX trebuie să fie dublate (escaped) pentru a genera un JSON valid. De exemplu, folosește \\int în loc de \int, \\infty în loc de \infty, și \\frac în loc de \frac.            
                    3. Fiecare card trebuie să includă o listă de ""tips"" (2-3 indicii explicative, sfaturi sau context suplimentar).                
                    4. Returnează DOAR un array JSON valid. FĂRĂ blocuri de cod markdown (fără ```json), FĂRĂ text explicativ înainte sau după.                
                    5. Folosește limba engleză când adaugi textele.                
    
                    Structura JSON obligatorie:                
                    [                    
                        {                        
                            ""question"": ""Textul întrebării..."",                        
                            ""answer"": ""Example formula: $\\int_{-\\infty}^{\\infty} (e^{-x^2})dx$"",                        
                            ""tips"": [""Primul indiciu aici..."", ""Al doilea indiciu aici...""]                    
                        }                
                    ]";

            var request = new GenerateContentRequest(prompt);
            request.GenerationConfig = new GenerationConfig { ResponseMimeType = "application/json" };

            request.Contents[0].Parts.Add(new Part
            {
                InlineData = new InlineData
                {
                    MimeType = "application/pdf",
                    Data = Convert.ToBase64String(pdfBytes)
                }
            });

            var response = await model.GenerateContent(request);
            var result = response.Text ?? "[]";
            string cleanedJson = result.Replace("```json", "", StringComparison.OrdinalIgnoreCase)
                                       .Replace("```", "")
                                       .Trim();

            int startIndex = cleanedJson.IndexOf('[');
            int endIndex = cleanedJson.LastIndexOf(']');

            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
                cleanedJson = cleanedJson.Substring(startIndex, endIndex - startIndex + 1);
            else
                return "[]";

            return cleanedJson;
        }

        public async Task<GetAllDecksResponse> GetAllDeckRepository()
        {
            var decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Include(dc => dc.DeckCards)
                .Take(100).ToListAsync();
            if (decks == null)
                return new GetAllDecksResponse(false, "Decks were not found");
            else
                return new GetAllDecksResponse(true, "Decks found", decks);
        }

        public async Task<GetDeckByIdResponse> GetDeckByIdRepository(GetDeckByIdDTO getDeckByIdDTO)
        {
            if (getDeckByIdDTO == null)
                return new GetDeckByIdResponse(false, "Invalid DTO");

            var deck = await dbContext.DeckEntity
                .AsNoTracking()
                .Include(dc => dc.DeckCards)
                .FirstOrDefaultAsync(dc => dc.DeckId == getDeckByIdDTO.DeckId);

            if (deck == null)
                return new GetDeckByIdResponse(false, "Deck not found");
            else
                return new GetDeckByIdResponse(true, "Deck found", deck);
        }

        public async Task<GetDeckByNameResponse> GetDeckByNameRepository(GetDeckByNameDTO getDeckByNameDTO)
        {
            if (getDeckByNameDTO == null)
                return new GetDeckByNameResponse(false, "Invalid DTO");

            var decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Where(dc => dc.Title!.Contains(getDeckByNameDTO.Name))
                .ToListAsync();

            if (decks.Count == 0)
                return new GetDeckByNameResponse(false, "No decks found");

            return new GetDeckByNameResponse(true, $"Found {decks.Count} decks", decks);
        }

        public async Task<GetDecksResponse> GetDecksRepository(GetDecksDTO getDecksDTO)
        {
            if (getDecksDTO == null)
                return new GetDecksResponse(false, "Invalid DTO");

            var decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Include(d => d.DeckCards)
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
