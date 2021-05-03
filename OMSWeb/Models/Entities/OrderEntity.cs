using System;

namespace OMSWeb.Models.Entities
{
  public class OrderEntity : IIntId
  {
    public int Id { get; set; }
    public string LogicalId { get; set; }
    public string Origin { get; set; }
    public string VehicleId { get; set; }
    public string State { get; set; }
    public string LocationPickup { get; set; }
    public string LocationDropoff { get; set; }
    public string LocationMove { get; set; }
    public int Priority { get; set; }
    public string AssignmentDetails { get; set; }
    public string AssignmentType { get; set; }
    public string CarrierLabel { get; set; }
    public DateTime? TimeCreated { get; set; }
    public DateTime? TimeAssigned { get; set; }
    public DateTime? TimeCompleted { get; set; }
    public DateTime? TimeAborted { get; set; }
    public DateTime? TimeFailed { get; set; }
    public float? DistancePickup { get; set; }
    public float? DistanceDropoff { get; set; }
    public float? DistanceMove { get; set; }
  }
  public class OrderHistoryEntity: OrderEntity {}
}