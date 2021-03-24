using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace OMSWeb.Models
{
  public class OrderState
  {
    public int Id { get; set; }
    public string Origin { get; set; }
    public string VehicleId { get; set; }
    public string state { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
    public string AssignmentDetails { get; set; }
    public string AssignmentType { get; set; }
    public string CarrierLabel { get; set; }
    public int Priority { get; set; }
    public DateTime? TimeCreated { get; set; }
    public DateTime? TimeAssigned { get; set; }
    public DateTime? TimeCompleted { get; set; }
    public DateTime? TimeAborted { get; set; }
    public DateTime? TimeFailed { get; set; }
    public float? DistancePickup { get; set; }
    public float? DistanceDropoff { get; set; }
    public float? DistanceMove { get; set; }
    public bool? Checked { get; set; }
    public int? DurationTotal { get; set; }
    public int? DurationDropoff { get; set; }
    public int? DurationPickup { get; set; }
    public int? DurationUnassigned { get; set; }
    public int? DurationLoad { get; set; }
    public int? DurationUnload { get; set; }
    public int? DurationMove { get; set; }
  }

  public class VehicleState
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public string MovingState { get; set; }
    public int DistanceTotal { get; set; }
    public int RuntimeTotal { get; set; }
    public string Type { get; set; }
    public string MapDb { get; set; }

    public int? CurPoint { get; set; }
    public string CargoState { get; set; }
    public string Mode { get; set; }
    public string OrderOrigin { get; set; }
    public bool CanBePushed { get; set; }
    public bool IsSensorStopped { get; set; }
    public bool IsBlocked { get; set; }
    public string ErrorList { get; set; }
    public int? OrderId { get; set; }
    public string CommandPoint { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
  }
}