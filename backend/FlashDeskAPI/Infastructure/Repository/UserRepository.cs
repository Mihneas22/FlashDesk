using Application.DTOs.User.GetUserData;
using Application.DTOs.User.Heatmap;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.DTOs.User.UserStats;
using Application.Repository;
using Domain.Models;
using Domain.Models.UserStats;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
                new Claim(ClaimTypes.Email, user.Email!)
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
    }
}
