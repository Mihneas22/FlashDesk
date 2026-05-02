using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.UserStats
{
    public record GetUserStatsResponse(bool Flag, string message = null!, UserStatsDto data = null!);

    public class UserStatsDto
    {
        public int CardsMastered { get; set; } = 0;
        public int TotalCards { get; set; } = 0;
        public int DecksCompleted { get; set; } = 0;
        public int TotalDecks { get; set; } = 0;
        public int DaysStudiedThisWeek { get; set; } = 0;
        public int OverallMasteryPct { get; set; } = 0;
    }
}
