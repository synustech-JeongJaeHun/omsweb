namespace OMSWeb.Models.Tracks
{
  public class Buffer
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public int? PointId { get; set; }
    public string Direction { get; set; }
    public int? NextPoint { get; set; }
    public int? Offset { get; set; }
    public bool? Unuse { get; set; }
    public int? State { get; set; }
    public string CarrierId { get; set; }
    public string User { get; set; }
    public string Note { get; set; }
    public string CAlias { get; set; }
    public string Type { get; set; }
    public int? ZoneId { get; set; }
    public string ZoneName { get; set; }
    public string ZoneType { get; set; }
    public int? Capacity { get; set; }
    public int? Size { get; set; }
  }
}