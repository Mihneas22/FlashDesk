using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.DTOs.User.TopicMastery
{
    public class GetTopicMasteryDTO
    {
        [JsonIgnore]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
