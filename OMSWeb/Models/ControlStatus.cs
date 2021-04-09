using System;
using System.ComponentModel.DataAnnotations.Schema;
using OMSWeb.Models.Entities;

namespace OMSWeb.Models
{
  public class OrderState : OrderEntity
  {
    public int? DurationTotal { get; set; }
    public int? DurationDropoff { get; set; }
    public int? DurationPickup { get; set; }
    public int? DurationUnassigned { get; set; }
    public int? DurationLoad { get; set; }
    public int? DurationUnload { get; set; }
    public int? DurationMove { get; set; }
  }

  public class VehicleState : VehicleEntity
  {
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