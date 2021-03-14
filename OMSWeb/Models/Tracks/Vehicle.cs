using System;

namespace OMSWeb.Models.Tracks
{
  public class Vehicle { }

  public class VehiclePosition
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public int? CurPoint { get; set; }
    public int? NextPoint { get; set; }
    public string CommandPoint { get; set; }
    public DateTime? LastContact { get; set; }
    public string Mode { get; set; }
    public bool CanBePushed { get; set; }
    public string OrderOrigin { get; set; }
    public string MovingState { get; set; }
    public string CargoState { get; set; }
    public bool IsSensorStopped { get; set; }
    public bool IsBlocked { get; set; }
    public string ErrorList { get; set; }
    public string Type { get; set; }
    public string CargoTransferResult { get; set; }
    public string MapDb { get; set; }

    
    public int? OrderId { get; set; }
    public string OrderLogicalId { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
    public int? Priority { get; set; }
  }
}