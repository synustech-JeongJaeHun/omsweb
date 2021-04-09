using System;

namespace OMSWeb.Models.Entities
{
  public class VehicleEntity
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public string MovingState { get; set; }
    public int DistanceTotal { get; set; }
    public int RuntimeTotal { get; set; }
    public string Type { get; set; }
    public string MapDb { get; set; }
  }

  public class VehicleHistory : VehicleEntity
  {
    public int HistorySourceId { get; set; }
    public DateTime HistoryChangeTime { get; set; }
  }
}