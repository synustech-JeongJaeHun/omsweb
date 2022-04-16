namespace OMSWeb.Models.Tracks
{
    public class Cluster
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public int MaxVehicles { get; set; }
        public string Color { get; set; }
        public string Segments { get; set; }
    }

    public class CluserStatus : Entities.ClusterStatusEntity
    {
    }
}