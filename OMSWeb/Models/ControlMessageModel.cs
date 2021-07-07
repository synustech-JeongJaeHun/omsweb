namespace OMSWeb.Models
{
  public class CommandMessageDto
  {
    public string Type { get; set; }
    public string Action { get; set; }

    public int[] VehicleIds { get; set; }
    public string VehicleId { get; set; }
    public int[] ZcuIds { get; set; }
    public string ZcuId { get; set; }
    public string ZcuUsingType { get; set; }
    public int? OrderId { get; set; }
    public int? SegmentId { get; set; }
    public string OrderOrigin { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
    public int? Priority { get; set; }
    public string CarrierLabel { get; set; }
    public bool? CanBePushed { get; set; }
    public string AcceptManualCommands { get; set; }
    public string State { get; set; }
    public string Mode { get; set; }
  }
}
