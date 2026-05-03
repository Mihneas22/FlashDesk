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
using Domain.Models.UserStats;
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

        public async Task<AddDeckSumbissionResponse> AddDeckSumbissionRepository(AddDeckSubmissionDTO dto)
        {
            var todayDateOnly = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = await dbContext.UserEntity
                .Include(u => u.Streak)
                .Include(u => u.UserDailyStats.Where(ds => ds.Date == todayDateOnly))
                .FirstOrDefaultAsync(u => u.UserId == dto.UserId);

            if (user == null) return new AddDeckSumbissionResponse(false, "User not found");

            int cardsInSession = dto.SessionResults.Count;
            int easyCards = 0;
            int totalTimeSpentSeconds = 0;

            var cardReviewsToInsert = new List<CardReview>();

            var cardIds = dto.SessionResults.Select(r => r.CardId).ToList();

            var existingStates = await dbContext.UserCardStateEntity
                .Where(ucs => ucs.UserId == user.UserId && cardIds.Contains(ucs.CardId))
                .ToDictionaryAsync(ucs => ucs.CardId);

            var newStatesToInsert = new List<UserCardState>();

            foreach (var review in dto.SessionResults)
            {
                if (review.Difficulty.ToLower() == "easy") easyCards++;

                totalTimeSpentSeconds += review.TimeSpent;
                cardReviewsToInsert.Add(new CardReview
                {
                    CardReviewId = Guid.NewGuid(),
                    UserId = user.UserId,
                    CardId = review.CardId,
                    ReviewAt = DateTime.UtcNow,
                    Rating = review.Difficulty,
                    TimeSpent = review.TimeSpent
                });

                if (existingStates.TryGetValue(review.CardId, out var cardState))
                {
                    UpdateCardState(cardState, review.Difficulty);
                }
                else
                {
                    var newState = new UserCardState
                    {
                        UserCardStateId = Guid.NewGuid(),
                        UserId = user.UserId,
                        CardId = review.CardId,
                        ReviewCount = 0,
                        EaseFactor = 2.5f,
                        IntervalDays = 0
                    };
                    UpdateCardState(newState, review.Difficulty);
                    newStatesToInsert.Add(newState);
                }
            }

            await dbContext.CardReviewEntity.AddRangeAsync(cardReviewsToInsert);
            if (newStatesToInsert.Any())
            {
                await dbContext.UserCardStateEntity.AddRangeAsync(newStatesToInsert);
            }

            var todayStats = user.UserDailyStats?.FirstOrDefault();
            if (todayStats == null)
            {
                todayStats = new DailyStats
                {
                    DailyStatsId = Guid.NewGuid(),
                    UserId = user.UserId,
                    Date = todayDateOnly,
                    CardsReview = cardsInSession,
                    CardsMastered = easyCards,
                    MinSpent = totalTimeSpentSeconds / 60
                };
                dbContext.DailyStatsEntity.Add(todayStats);
            }
            else
            {
                todayStats.CardsReview = (todayStats.CardsReview ?? 0) + cardsInSession;
                todayStats.CardsMastered = (todayStats.CardsMastered ?? 0) + easyCards;
                todayStats.MinSpent = (todayStats.MinSpent ?? 0) + (totalTimeSpentSeconds / 60);
            }

            UpdateUserStreak(user);

            try
            {
                await dbContext.SaveChangesAsync();
                return new AddDeckSumbissionResponse(true, "Session saved and stats updated successfully");
            }
            catch (Exception ex)
            {
                return new AddDeckSumbissionResponse(false, "Database error: " + ex.Message);
            }
        }

        private void UpdateCardState(UserCardState state, string difficulty)
        {
            int grade = difficulty.ToLower() switch
            {
                "easy" => 5,
                "good" => 4,
                "medium" => 3,
                "hard" => 2,
                "again" => 1,
                _ => 3
            };

            state.ReviewCount++;
            float currentEase = state.EaseFactor ?? 2.5f;
            float currentInterval = state.IntervalDays ?? 0f;

            if (grade >= 3)
            {
                if (state.ReviewCount == 1)
                    currentInterval = 1;
                else if (state.ReviewCount == 2)
                    currentInterval = 6;
                else
                    currentInterval = (float)Math.Round(currentInterval * currentEase);
            }
            else
            {
                state.ReviewCount = 0;
                currentInterval = 1;
            }

            currentEase = currentEase + (0.1f - (5 - grade) * (0.08f + (5 - grade) * 0.02f));

            if (currentEase < 1.3f) currentEase = 1.3f;

            state.IntervalDays = currentInterval;
            state.EaseFactor = currentEase;
            state.NextReview = DateOnly.FromDateTime(DateTime.UtcNow.AddDays((int)currentInterval));

            if (currentInterval >= 21) state.MasteryLevel = "Mastered";
            else if (currentInterval > 3) state.MasteryLevel = "Familiar";
            else state.MasteryLevel = "Learning";
        }

        private void UpdateUserStreak(User user)
        {
            var today = DateTime.UtcNow.Date;

            if (user.Streak == null)
            {
                user.Streak = new Streak
                {
                    CurrentStreak = 1,
                    MaxStreak = 1,
                    LastActivityDate = today,
                    UserId = user.UserId
                };
            }
            else
            {
                var lastActive = user.Streak.LastActivityDate?.Date;

                if (lastActive == today.AddDays(-1))
                {
                    user.Streak.CurrentStreak++;
                    if (user.Streak.CurrentStreak > (user.Streak.MaxStreak ?? 0))
                        user.Streak.MaxStreak = user.Streak.CurrentStreak;
                }
                else if (lastActive != today)
                    user.Streak.CurrentStreak = 1;
                user.Streak.LastActivityDate = today;
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
                    ViewConfig = cardDto.GraphConfig,
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
                2. CRITIC PENTRU JSON: Toate backslash-urile din formulele matematice LaTeX trebuie să fie dublate (escaped) pentru a genera un JSON valid. De exemplu, folosește \\int în loc de \int.
                3. Fiecare card trebuie să includă o listă de ""tips"" (2-3 indicii explicative).
                4. Genereaza campul ""viewConfig"" doar daca este nevoie de acesta.
                5. DACA întrebarea implică funcții matematice, grafice, geometrie sau concepte vizuale, populează obiectul ""viewConfig"". Daca nu este nevoie de grafic, setează ""viewConfig"": null.
                6. In ""viewConfig"", proprietatea ""expr"" trebuie să fie o expresie matematică validă pentru librăria mathjs (ex: ""x^2"", ""sin(x)"", ""2*x""). Proprietatea ""latexLabel"" este pentru afișare și folosește sintaxa LaTeX (ex: ""x^2"", ""\\sin(x)"").
                7. Returnează DOAR un array JSON valid. FĂRĂ blocuri de cod markdown (fără ```json), FĂRĂ text explicativ înainte sau după.
                8. Folosește limba engleză când adaugi textele.

                Structura JSON obligatorie (exemplu complet, poți lăsa arrays goale pentru points/lines dacă nu sunt necesare):
                [
                    {
                        ""question"": ""What is the graph of a standard parabola?"",
                        ""answer"": ""Example formula: $f(x) = x^2$"",
                        ""tips"": [""It opens upwards"", ""Vertex is at the origin (0,0)""],
                        ""viewConfig"": {
                            ""mode"": ""2d"",
                            ""viewBox"": {
                                ""x"": [-10, 10],
                                ""y"": [-10, 10]
                            },
                            ""functions"": [
                                {
                                    ""expr"": ""x^2"",
                                    ""color"": ""#8b5cf6"",
                                    ""latexLabel"": ""f(x)=x^2"",
                                    ""type"": ""line""
                                }
                            ],
                            ""lines"": [
                                {
                                    ""axis"": ""x"",
                                    ""value"": 0,
                                    ""color"": ""#ffffff40"",
                                    ""latexLabel"": ""y-axis""
                                }
                            ],
                            ""shadedRegion"": {
                                ""between"": {
                                    ""lowerExpr"": ""0"",
                                    ""upperExpr"": ""x^2""
                                },
                                ""bounds"": [0, 2],
                                ""color"": ""#ec489950""
                            },
                            ""points"": [
                                {
                                    ""coords"": [2, 4],
                                    ""latexLabel"": ""P(2,4)"",
                                    ""color"": ""#ec4899""
                                }
                            ]
                        }
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

            var decks = new List<Deck>();

            if(getDeckByNameDTO.Status == false)
            {
                decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Where(dc => dc.Title!.Contains(getDeckByNameDTO.Name))
                .ToListAsync();
            }
            else
            {
                decks = await dbContext.DeckEntity
                .AsNoTracking()
                .Where(dc => dc.Title!.Contains(getDeckByNameDTO.Name) && dc.Status == true)
                .ToListAsync();
            }

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
