using Application.DTOs.User.GetUserData;
using Application.DTOs.User.Heatmap;
using Application.DTOs.User.LoginUser;
using Application.DTOs.User.RegisterUser;
using Application.DTOs.User.Streak.ModifyStreak;
using Application.DTOs.User.UserStats;
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

        Task<ModifyStreakResponse> ModifyStreakRepository(ModifyStreakDTO modifyStreakDTO);

        Task<GetUserHeatmapResponse> GetUserHeatmapAsync(GetUserHeatmapDTO getUserHeatmapDTO);

        Task<GetUserStatsResponse> GetUserStatsAsync(GetUserStatsDTO getUserStatsDTO);
    }
}
