using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json.Serialization;

namespace Domain.Models.Graphs
{
    public class ViewConfig
    {
        [JsonPropertyName("mode")]
        public string Mode { get; set; }

        [JsonPropertyName("viewBox")]
        public ViewBoxConfig ViewBox { get; set; }

        [JsonPropertyName("functions")]
        public List<GraphFunction> Functions { get; set; }

        [JsonPropertyName("lines")]
        public List<GraphLine> Lines { get; set; }

        [JsonPropertyName("shadedRegion")]
        public ShadedRegion ShadedRegion { get; set; }

        [JsonPropertyName("points")]
        public List<GraphPoint> Points { get; set; }
    }

    public class ViewBoxConfig
    {
        [JsonPropertyName("x")]
        public List<double> X { get; set; }

        [JsonPropertyName("y")]
        public List<double> Y { get; set; }
    }

    public class GraphFunction
    {
        [JsonPropertyName("expr")]
        public string Expr { get; set; }

        [JsonPropertyName("color")]
        public string? Color { get; set; }

        [JsonPropertyName("latexLabel")]
        public string? LatexLabel { get; set; }
    }

    public class GraphLine
    {
        [JsonPropertyName("axis")]
        public string Axis { get; set; }

        [JsonPropertyName("value")]
        public double Value { get; set; }

        [JsonPropertyName("color")]
        public string? Color { get; set; }

        [JsonPropertyName("latexLabel")]
        public string? LatexLabel { get; set; }
    }

    public class ShadedRegion
    {
        [JsonPropertyName("between")]
        public RegionBetween Between { get; set; }

        [JsonPropertyName("bounds")]
        public List<double> Bounds { get; set; }

        [JsonPropertyName("color")]
        public string? Color { get; set; }
    }

    public class RegionBetween
    {
        [JsonPropertyName("lowerExpr")]
        public string LowerExpr { get; set; }

        [JsonPropertyName("upperExpr")]
        public string UpperExpr { get; set; }
    }

    public class GraphPoint
    {
        [JsonPropertyName("coords")]
        public List<double> Coords { get; set; }

        [JsonPropertyName("latexLabel")]
        public string? LatexLabel { get; set; }

        [JsonPropertyName("color")]
        public string? Color { get; set; }
    }
}
