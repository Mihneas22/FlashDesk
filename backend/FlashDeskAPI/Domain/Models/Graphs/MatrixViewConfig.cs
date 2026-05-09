using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Domain.Models.Graphs
{
    public class MatrixViewConfig
    {
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("matrix")]
        public List<List<double>>? Matrix { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }
}
