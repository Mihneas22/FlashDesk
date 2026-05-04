using Application.DTOs.Deck.CreateDeck;
using Application.DTOs.User.GetUserData;
using Application.DTOs.User.Heatmap;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.DTOs.User.TopicMastery;
using Application.DTOs.User.UserProfile;
using Application.DTOs.User.UserProfile.Email;
using Application.DTOs.User.UserProfile.Password;
using Application.DTOs.User.UserProfile.Username;
using Application.DTOs.User.UserStats;
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

        [Authorize(Policy = "RequirePremium")]
        [HttpGet("heatmap")]
        public async Task<ActionResult<GetUserHeatmapResponse>> GetUserHeatmapAsync()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);
            var result = await userRepo.GetUserHeatmapAsync(new GetUserHeatmapDTO { UserId = userId });
            return Ok(result);
        }

        [Authorize(Policy = "RequirePremium")]
        [HttpGet("user-stats")]
        public async Task<ActionResult<GetUserStatsResponse>> GetUserStatsAsync()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);
            var result = await userRepo.GetUserStatsAsync(new GetUserStatsDTO { UserId = userId });
            return Ok(result);
        }

        [HttpGet("user-mastery")]
        public async Task<ActionResult<GetTopicMasteryResponse>> GetUserMasteryAsync()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);
            var result = await userRepo.GetUserTopicMasterAsync(new GetTopicMasteryDTO { UserId = userId });
            return Ok(result);
        }

        [HttpPut("update-username")]
        public async Task<ActionResult<UpdateUserProfileResponse>> UpdateUsernameAsync(UsernameDTO usernameDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            usernameDTO.UserId = Guid.Parse(userIdString);
            var result = await userRepo.UpdateUsernameRepository(usernameDTO);
            return Ok(result);
        }

        [HttpPut("update-email")]
        public async Task<ActionResult<UpdateUserProfileResponse>> UpdateEmailAsync(EmailDTO emailDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            emailDTO.UserId = Guid.Parse(userIdString);
            var result = await userRepo.UpdateEmailRepository(emailDTO);
            return Ok(result);
        }

        [HttpPut("update-password")]
        public async Task<ActionResult<UpdateUserProfileResponse>> UpdatePasswordAsync(PasswordDTO passwordDTO)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            passwordDTO.UserId = Guid.Parse(userIdString);
            var result = await userRepo.UpdatePasswordRepository(passwordDTO);
            return Ok(result);
        }
    }
}
