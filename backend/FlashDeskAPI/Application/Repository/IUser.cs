using Application.DTOs.User.GetUserData;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface IUser
    {
        Task<RegisterUserResponse> RegisterUserRepository(RegisterUserDTO registerUserDTO);

        Task<LoginUserResponse> LoginUserRepository(LoginUserDTO loginUserDTO);

        Task<GetUserDataResponse> GetUserDataRepository(GetUserDataDTO getUserDataDTO);
    }
}
