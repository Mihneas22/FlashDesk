using Application.DTOs.User.GetUserData;
using Application.DTOs.User.Heatmap;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.DTOs.User.Stripe.AddWebhook;
using Application.DTOs.User.TopicMastery;
using Application.DTOs.User.UserProfile;
using Application.DTOs.User.UserProfile.Email;
using Application.DTOs.User.UserProfile.Password;
using Application.DTOs.User.UserProfile.Username;
using Application.DTOs.User.UserStats;
using Application.Repository;
using Domain.Models;
using Domain.Models.UserStats;
using Humanizer;
using Infastructure.AppDbContext;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Stripe;
using Stripe.Checkout;
using Stripe.V2.Core;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using static System.Collections.Specialized.BitVector32;

namespace Infastructure.Repository
{
    public class UserRepository : IUser
    {
        private readonly ApplicationDbContext dbContext;
        public IConfiguration configuration;

        public UserRepository(ApplicationDbContext _dbContext, IConfiguration configuration)
        {
            this.dbContext = _dbContext;
            this.configuration = configuration;
        }

        private string GenerateJWTToken(User? user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username!),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim("SubscriptionPlan", user.Plan ?? "Free")
            };

            if (user.Roles != null && user.Roles.Any())
                foreach (var role in user.Roles)
                    userClaims.Add(new Claim(ClaimTypes.Role, role));
            else
                userClaims.Add(new Claim(ClaimTypes.Role, "user"));


            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: userClaims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<LoginUserResponse> LoginUserRepository(LoginUserDTO loginUserDTO)
        {
            if (loginUserDTO == null)
                return new LoginUserResponse(false, "Invalid data");

            var userF = await dbContext.UserEntity!.FirstOrDefaultAsync(user => user.Email == loginUserDTO.Email);

            if (userF == null)
                return new LoginUserResponse(false, "User not found");

            bool checkPass = BCrypt.Net.BCrypt.Verify(loginUserDTO.Password, userF.Password);
            if (checkPass)
            {
                string token = GenerateJWTToken(userF);
                return new LoginUserResponse(true, "Succesfull login!", token);
            }
            else
                return new LoginUserResponse(false, "Invalid email or password.");
        }

        public async Task<RegisterUserResponse> RegisterUserRepository(RegisterUserDTO registerUserDTO)
        {
            if (registerUserDTO == null)
                return new RegisterUserResponse(false, "Invalid data.");

            bool userExists = await dbContext.UserEntity!
                .AnyAsync(u => u.Email == registerUserDTO.Email || u.Username == registerUserDTO.Username);

            var emptyHeatmap = Enumerable.Range(0, 15)
                .Select(_ => Enumerable.Repeat(0, 7).ToList())
                .ToList();

            dbContext.UserEntity!.Add(new User
            {
                Username = registerUserDTO.Username,
                Email = registerUserDTO.Email,
                Elo = 0,
                Password = BCrypt.Net.BCrypt.HashPassword(registerUserDTO.Password),
                UserCardReviews = new List<CardReview>(),
                UserDailyStats = new List<DailyStats>(),
                UserCardStates = new List<UserCardState>(),
                UserDecks = new List<Deck>(),
                Roles = new List<string> { "user" },
                Plan = "Free",
                StripeUserId = string.Empty,
                CreatedAt = DateTime.UtcNow
            });

            await dbContext.SaveChangesAsync();

            return new RegisterUserResponse(true, "Success!"); ;
        }

        public async Task<GetUserDataResponse> GetUserDataRepository(GetUserDataDTO getUserDataDTO)
        {
            if (getUserDataDTO == null)
                return new GetUserDataResponse(false, "Invalid DTO");

            var user = await dbContext.UserEntity
                .AsNoTracking()
                .Where(us => us.UserId == getUserDataDTO.UserId)
                .Select(us => new User
                {
                    UserId = us.UserId,
                    Username = us.Username,
                    Email = us.Email,
                    Elo = us.Elo,
                    Roles = us.Roles,
                    UserCardReviews = us.UserCardReviews,
                    UserDailyStats = us.UserDailyStats,
                    UserCardStates = us.UserCardStates,
                    CreatedAt = us.CreatedAt,
                    Streak = us.Streak,
                    Plan = us.Plan,
                    StripeUserId = (us.StripeUserId != NULL)? us.StripeUserId : string.Empty,
                    UserDecks = us.UserDecks
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return new GetUserDataResponse(false, "No user found");
            else
                return new GetUserDataResponse(true, "User found!", user);
        }

        public async Task<ModifyStreakResponse> ModifyStreakRepository(ModifyStreakDTO modifyStreakDTO)
        {
            if (modifyStreakDTO == null)
                return new ModifyStreakResponse(false, 0, "Invalid DTO");

            var user = await dbContext.UserEntity
                .Include(us => us.Streak)
                .FirstOrDefaultAsync(us => us.UserId == modifyStreakDTO.UserId);

            if (user == null)
                return new ModifyStreakResponse(false, 0, "User not found");

            DateTime today = DateTime.UtcNow.Date;

            if (user.Streak == null)
            {
                user.Streak = new Streak
                {
                    UserId = user.UserId,
                    CurrentStreak = 1,
                    MaxStreak = 1,
                    LastActivityDate = today
                };
            }
            else
            {
                if (user.Streak.LastActivityDate.HasValue)
                {
                    DateTime lastActivity = user.Streak.LastActivityDate.Value.Date;
                    int daysDifference = (today - lastActivity).Days;

                    if (daysDifference == 1)
                    {
                        user.Streak.CurrentStreak = (user.Streak.CurrentStreak ?? 0) + 1;
                        user.Streak.LastActivityDate = today;

                        if (user.Streak.CurrentStreak > (user.Streak.MaxStreak ?? 0))
                        {
                            user.Streak.MaxStreak = user.Streak.CurrentStreak;
                        }
                    }
                    else if (daysDifference > 1)
                    {
                        user.Streak.CurrentStreak = 1;
                        user.Streak.LastActivityDate = today;
                    }
                }
                else
                {
                    user.Streak.CurrentStreak = 1;
                    user.Streak.LastActivityDate = today;
                }
            }

            try
            {
                await dbContext.SaveChangesAsync();
                return new ModifyStreakResponse(true, user.Streak.CurrentStreak ?? 1, "Streak updated successfully.");
            }
            catch (Exception ex)
            {
                return new ModifyStreakResponse(false, 0, $"Database error: {ex.Message}");
            }
        }

        public async Task<GetUserHeatmapResponse> GetUserHeatmapAsync(GetUserHeatmapDTO getUserHeatmapDTO)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-105));

            var stats = await dbContext.DailyStatsEntity
                .Where(ds => ds.UserId == getUserHeatmapDTO.UserId && ds.Date >= startDate)
                .OrderBy(ds => ds.Date)
                .Select(ds => new DailyHeatmapData
                {
                    Date = ds.Date.ToString("yyyy-MM-dd"),
                    CardsStudied = ds.CardsReview ?? 0
                })
                .ToListAsync();

            return new GetUserHeatmapResponse(true,"Sucessfull retrieval!", stats);
        }

        public async Task<GetUserStatsResponse> GetUserStatsAsync(GetUserStatsDTO getUserStatsDTO)
        {
            var totalCards = await dbContext.UserCardStateEntity
            .CountAsync(ucs => ucs.UserId == getUserStatsDTO.UserId);

            var cardsMastered = await dbContext.UserCardStateEntity
                .CountAsync(ucs => ucs.UserId == getUserStatsDTO.UserId && ucs.MasteryLevel == "Mastered");

            var totalDecks = await dbContext.DeckEntity
                .CountAsync(d => d.DeckUserId == getUserStatsDTO.UserId);

            var decksCompleted = await dbContext.DeckEntity
                .Where(d => d.DeckUserId == getUserStatsDTO.UserId && d.DeckCards != null && d.DeckCards.Any())
                .CountAsync(d => d.DeckCards!.All(c =>
                    dbContext.UserCardStateEntity.Any(ucs =>
                        ucs.UserId == getUserStatsDTO.UserId &&
                        ucs.CardId == c.CardId &&
                        ucs.MasteryLevel == "Mastered")));

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var sevenDaysAgo = today.AddDays(-7);

            var daysStudiedThisWeek = await dbContext.DailyStatsEntity
                .Where(ds => ds.UserId == getUserStatsDTO.UserId && ds.Date >= sevenDaysAgo && ds.CardsReview > 0)
                .Select(ds => ds.Date)
                .Distinct()
                .CountAsync();

            int overallMasteryPct = 0;
            if (totalCards > 0)
            {
                overallMasteryPct = (int)Math.Round(((double)cardsMastered / totalCards) * 100);
            }
            return new GetUserStatsResponse(true, "Success!", new UserStatsDto
            {
                CardsMastered = cardsMastered,
                TotalCards = totalCards,
                DecksCompleted = decksCompleted,
                TotalDecks = totalDecks,
                DaysStudiedThisWeek = daysStudiedThisWeek,
                OverallMasteryPct = overallMasteryPct
            });
        }

        public async Task<GetTopicMasteryResponse> GetUserTopicMasterAsync(GetTopicMasteryDTO getTopicMasteryDTO)
        {
            var statsPerTopic = await dbContext.UserCardStateEntity
            .Where(ucs => ucs.UserId == getTopicMasteryDTO.UserId && ucs.Card != null && ucs.Card.CardDeck != null && ucs.Card.CardDeck.Topic != null)
            .GroupBy(ucs => ucs.Card!.CardDeck!.Topic)
            .Select(g => new
            {
                Topic = g.Key,
                TotalCards = g.Count(),
                MasteredCards = g.Count(ucs => ucs.MasteryLevel == "Mastered")
            })
            .ToListAsync();

            var lastStudiedDates = await dbContext.CardReviewEntity
                .Where(cr => cr.UserId == getTopicMasteryDTO.UserId && cr.Card != null && cr.Card.CardDeck != null && cr.Card.CardDeck.Topic != null)
                .GroupBy(cr => cr.Card!.CardDeck!.Topic)
                .Select(g => new
                {
                    Topic = g.Key,
                    LastStudiedAt = g.Max(cr => cr.ReviewAt)
                })
                .ToDictionaryAsync(x => x.Topic!, x => x.LastStudiedAt);
            var result = statsPerTopic.Select(stat =>
            {
                float masteryPct = 0f;
                if (stat.TotalCards > 0)
                {
                    masteryPct = (float)Math.Round(((float)stat.MasteredCards / stat.TotalCards) * 100, 1);
                }

                return new TopicMasteryData
                {
                    Topic = stat.Topic!,
                    TotalCards = stat.TotalCards,
                    MasteredCards = stat.MasteredCards,
                    MasteryPct = masteryPct,
                    LastStudiedAt = lastStudiedDates.GetValueOrDefault(stat.Topic!)
                };
            }).ToList();

            return new GetTopicMasteryResponse(true,"Success", result);
        }

        public async Task<UpdateUserProfileResponse> UpdateUsernameRepository(UsernameDTO usernameDTO)
        {
            var user = await dbContext.UserEntity.FirstOrDefaultAsync(u => u.UserId == usernameDTO.UserId);

            if (user == null)
            {
                return new UpdateUserProfileResponse(false, "User not found.");
            }

            var usernameExists = await dbContext.UserEntity
                .AnyAsync(u => u.Username!.ToLower() == usernameDTO.Username.ToLower() && u.UserId != usernameDTO.UserId);

            if (usernameExists)
            {
                return new UpdateUserProfileResponse(false, "This username is already taken.");
            }

            user.Username = usernameDTO.Username;

            await dbContext.SaveChangesAsync();

            return new UpdateUserProfileResponse(true, "Username has been updated successfully.");
        }

        public async Task<UpdateUserProfileResponse> UpdateEmailRepository(EmailDTO emailDTO)
        {
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

            if (string.IsNullOrWhiteSpace(emailDTO.NewEmail) || !Regex.IsMatch(emailDTO.NewEmail, emailPattern))
            {
                return new UpdateUserProfileResponse(false, "The provided email format is invalid.");
            }

            var user = await dbContext.UserEntity.FirstOrDefaultAsync(u => u.UserId == emailDTO.UserId);
            if (user == null)
                return new UpdateUserProfileResponse(false, "User not found.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(emailDTO.Password, user.Password);
            if (!isPasswordValid)
            {
                return new UpdateUserProfileResponse(false, "The current password is incorrect.");
            }

            var emailExists = await dbContext.UserEntity
                .AnyAsync(u => u.Email!.ToLower() == emailDTO.NewEmail.ToLower() && u.UserId != emailDTO.UserId);

            if (emailExists)
                return new UpdateUserProfileResponse(false, "This email is already associated with another account.");

            user.Email = emailDTO.NewEmail;
            await dbContext.SaveChangesAsync();

            return new UpdateUserProfileResponse(true, "Email has been updated successfully.");
        }

        public async Task<UpdateUserProfileResponse> UpdatePasswordRepository(PasswordDTO passwordDTO)
        {
            if (string.IsNullOrWhiteSpace(passwordDTO.NewPassword) ||
                passwordDTO.NewPassword.Length < 8 ||
                !passwordDTO.NewPassword.Any(char.IsUpper) ||
                !passwordDTO.NewPassword.Any(char.IsDigit))
            {
                return new UpdateUserProfileResponse(false, "Password must be at least 8 characters long, contain at least one uppercase letter and one number.");
            }

            var user = await dbContext.UserEntity.FirstOrDefaultAsync(u => u.UserId == passwordDTO.UserId);

            if (user == null)
                return new UpdateUserProfileResponse(false, "User not found.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(passwordDTO.CurrPassword, user.Password);
            if (!isPasswordValid)
            {
                return new UpdateUserProfileResponse(false, "The current password is incorrect.");
            }
            user.Password = BCrypt.Net.BCrypt.HashPassword(passwordDTO.NewPassword);

            await dbContext.SaveChangesAsync();

            return new UpdateUserProfileResponse(true, "Password changed successfully.");
        }

        public async Task<AddStripeWebhookResponse> AddStripeWebhookRepository(AddStripeWebhookDTO addStripeWebhookDTO)
        {
            var endpointSecret = Environment.GetEnvironmentVariable("STRIPE_ENDPOINT_SECRET")
                ?? throw new InvalidOperationException("STRIPE_ENDPOINT_SECRET nu este configurată!");

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    addStripeWebhookDTO.JsonBody,
                    addStripeWebhookDTO.StripeSignature,
                    endpointSecret,
                    throwOnApiVersionMismatch: false
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;

                    if (session == null)
                        return new AddStripeWebhookResponse(false, "The Stripe session is invalid or null.");

                    var userId = session.ClientReferenceId;

                    if (string.IsNullOrEmpty(userId))
                        return new AddStripeWebhookResponse(false, "ClientReferenceId is missing from the session.");

                    var user = await dbContext.UserEntity.FindAsync(Guid.Parse(userId));

                    if (user != null)
                    {
                        string purchasedPlan = "Pro";
                        user.StripeUserId = session.CustomerId;

                        if (session.Metadata != null && session.Metadata.ContainsKey("PlanName"))
                        {
                            purchasedPlan = session.Metadata["PlanName"];
                        }

                        user.Plan = purchasedPlan;
                        await dbContext.SaveChangesAsync();

                        return new AddStripeWebhookResponse(true, $"User plan has been updated to {purchasedPlan}.");
                    }
                    else
                        return new AddStripeWebhookResponse(false, "The user was not found in the database.");
                }
                else if (stripeEvent.Type == "checkout.session.deleted")
                {
                    var subscription = stripeEvent.Data.Object as Subscription;
                    if (subscription == null) return new AddStripeWebhookResponse(false, "Subscription object is null.");

                    var stripeCustomerId = subscription.CustomerId;
                    var user = await dbContext.UserEntity.FirstOrDefaultAsync(u => u.StripeUserId == stripeCustomerId);

                    if (user != null)
                    {
                        user.Plan = "Free";
                        await dbContext.SaveChangesAsync();
                        return new AddStripeWebhookResponse(true, $"User {user.Email} reverted to Free plan.");
                    }
                    return new AddStripeWebhookResponse(false, "User with this StripeCustomerId not found.");
                }
                return new AddStripeWebhookResponse(true, "Stripe event intentionally ignored (not CheckoutSessionCompleted).");
            }
            catch (StripeException e)
            {
                return new AddStripeWebhookResponse(false, $"Stripe validation error: {e.Message}");
            }
            catch (Exception e)
            {
                return new AddStripeWebhookResponse(false, $"Internal error: {e.Message}");
            }
        }
    }
}
