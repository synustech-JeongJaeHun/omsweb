namespace OMSWeb.Models.Tracks
{
    public class Zcu
    {
        public int Id { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int usingType { get; set; }
        public int ZcuType { get; set; }
        public ZcuCompletePoint[] CompletePoints { get; set; }
        public ZcuInputZone[] InputZones { get; set; }
        public bool error { get; set; }
    }

    public class ZcuCompletePoint
    {
        public int Id { get; set; }
        public int ZcuId { get; set; }
        public int CompletePointId { get; set; }
    }

    public class ZcuInputZone
    {
        public int Id { get; set; }
        public int ZcuId { get; set; }
        public int PriorityPoint { get; set; }
        public string ZonePoints { get; set; }
    }

    public class ZcuStatus : Entities.ZcuStatusEntity
    {
    }
}