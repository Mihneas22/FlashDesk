using Application.DTOs.User.GetUserData;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.Repository;
using Domain.Models;
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

            dbContext.UserEntity!.Add(new User
            {
                Username = registerUserDTO.Username,
                Email = registerUserDTO.Email,
                Elo = 0,
                Password = BCrypt.Net.BCrypt.HashPassword(registerUserDTO.Password),
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
                .Where(us => us.Email == getUserDataDTO.Email)
                .Select(us => new
                {
                    us.UserId,
                    us.Username,
                    us.Email,
                    us.Elo,
                    us.Roles,
                    us.CreatedAt
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
    }
}
