using System;

namespace OMSWeb.Models.Tracks
{
    public class Backdrop
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public int? X { get; set; }
        public int? Y { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string BackgroundColor { get; set; }
        public float? OutlineThickness { get; set; }
        public string OutlineColor { get; set; }
        public int? OutlineRadius { get; set; }
        public int? OutlineType { get; set; }
        public string Contents { get; set; }
        public int? Direction { get; set; }
        public int? VAlign { get; set; }
        public int? HAlign { get; set; }
        public int Bold { get; set; }
        public bool Italic { get; set; }
        public int FontSize { get; set; }
        public string TextColor { get; set; }
        
    }
}