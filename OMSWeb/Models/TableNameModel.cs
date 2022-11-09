using System;
using OMSWeb.Models.Entities;

namespace OMSWeb.Models
{
  public interface ITableName
  {
    public string TableName { get; set; }
    public DateTime HistoryChangeTime { get; set; }
  }
  public class VehicleHistoryWithTableName : VehicleHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "vehicle_history";
  }
  public class OrderHistoryWithTableName : OrderHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "order_history";
  }
  public class SegmentBlockingHistoryWithTableName : SegmentBlockingHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "segment_blocking_history";
  }
  public class BufferHistoryWithTableName : BufferHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "buffer_history";
  }
  public class StationHistoryWithTableName : StationHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "station_history";
  }

  public class ModeStateHistoryWithTableName : ModeStateHistoryEntity, ITableName
  {
    public string TableName { get; set; } = "mode_state_history";
  }
}