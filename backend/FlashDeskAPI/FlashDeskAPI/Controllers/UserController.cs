using Application.DTOs.User.GetUserData;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("getUser/{email}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<GetUserDataResponse>> GetUserDataAsync(string email)
        {
            var result = await userRepo.GetUserDataRepository(new GetUserDataDTO { Email = email });
            return Ok(result);
        }
    }
}
