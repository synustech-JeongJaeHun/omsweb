namespace OMSWeb.Models.Tracks
{
    public class Point
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int? HomeId { get; set; }
    }
}