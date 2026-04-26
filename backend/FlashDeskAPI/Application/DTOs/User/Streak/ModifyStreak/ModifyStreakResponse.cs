using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.Streak.ModifyStreak
{
    public record ModifyStreakResponse(bool Flag, int currentStreak = 0, string Message = null!);
}
