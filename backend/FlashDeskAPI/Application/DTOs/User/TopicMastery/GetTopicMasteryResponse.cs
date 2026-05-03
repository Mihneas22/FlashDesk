using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.TopicMastery
{
    public record GetTopicMasteryResponse(bool Flag, string message = null!, List<TopicMasteryData> data = null!);

    public class TopicMasteryData
    {
        public string Topic { get; set; } = string.Empty;
        public int TotalCards { get; set; } = 0;
        public int MasteredCards { get; set; } = 0;
        public float MasteryPct { get; set; } = 0f;
        public DateTime? LastStudiedAt { get; set; } = DateTime.UtcNow;
    }
}
