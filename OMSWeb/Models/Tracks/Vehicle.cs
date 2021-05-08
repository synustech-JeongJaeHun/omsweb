using System;

namespace OMSWeb.Models.Tracks
{
  public class Vehicle { }

  public class VehiclePosition : Entities.VehicleEntity
  {
    public string OrderLogicalId { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
    public int? Priority { get; set; }
  }
}