using System;

namespace OMSWeb.Models.Entities
{
  public class VehicleEntity: IIntId
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public string MovingState { get; set; }
    public int DistanceTotal { get; set; }
    public int RuntimeTotal { get; set; }
    public string Type { get; set; }
    public string MapDb { get; set; }


    public int? LastPoint { get; set; }
    public int? CurPoint { get; set; }
    public int? NextPoint { get; set; }
    public string CommandPoint { get; set; }
    public DateTime? LastContact { get; set; }
    public string Mode { get; set; }
    public bool CanBePushed { get; set; }
    public string OrderOrigin { get; set; }
    public string CargoState { get; set; }
    public bool IsSensorStopped { get; set; }
    public bool IsBlocked { get; set; }
    public string ErrorList { get; set; }
    public string CargoTransferResult { get; set; }
    public int? OrderId { get; set; }
    public bool RailIn { get; set; }
  }

  public class VehicleHistoryEntity : VehicleEntity
  {
    public int HistorySourceId { get; set; }
    public DateTime HistoryChangeTime { get; set; }
    public string HistoryChangeType { get; set; }
  }
}