namespace OMSWeb.Models.Tracks
{
  public class Station
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public int? PointId { get; set; }
    public string Direction { get; set; }
    public int? CarrierType { get; set; }
    public int? Offset { get; set; }
  }
}