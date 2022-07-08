namespace OMSWeb.Models.Tracks
{
    public class FireShutter
    {
        public int Id { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string LogicalId { get; set; }
        public string Segments { get; set; }
        public int Status { get; set; }

    }


    public class FireShutterStatus : Entities.FireShutterStatusEntity
    {
    }
}