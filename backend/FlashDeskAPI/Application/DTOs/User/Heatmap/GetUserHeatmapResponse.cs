using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.Heatmap
{
    public record GetUserHeatmapResponse(bool Flag, string message = null!, List<DailyHeatmapData> data = null!);

    public class DailyHeatmapData
    {
        public string Date { get; set; } = string.Empty;
        public int CardsStudied { get; set; }
    }
}
