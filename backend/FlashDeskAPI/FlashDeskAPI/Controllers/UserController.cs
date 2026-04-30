using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.User.GetUserData;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlashDeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUser userRepo;

        public UserController(IUser userRepo)
        {
            this.userRepo = userRepo;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginUserResponse>> LoginUserAsync(LoginUserDTO loginUserDTO)
        {
            var result = await userRepo.LoginUserRepository(loginUserDTO);
            return Ok(result);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<RegisterUserResponse>> RegisterUserAsync(RegisterUserDTO registerUserDTO)
        {
            var result = await userRepo.RegisterUserRepository(registerUserDTO);
            return Ok(result);
        }

        [HttpGet("getuser")]
        public async Task<ActionResult<GetUserDataResponse>> GetUserDataAsync()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized(new GetUserDataResponse(false, "Invalid token claims"));

            var result = await userRepo.GetUserDataRepository(new GetUserDataDTO { UserId = userId });
            return Ok(result);
        }

        [HttpPost("updateStreak")]
        public async Task<IActionResult> UpdateStreak(ModifyStreakDTO modifyStreakDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            modifyStreakDTO.UserId = Guid.Parse(userIdString);
            var result = await userRepo.ModifyStreakRepository(modifyStreakDTO);
            return Ok(result);
        }
    }
}
