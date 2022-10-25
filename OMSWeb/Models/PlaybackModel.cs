using System;
using OMSWeb.Models.Entities;

#nullable enable

namespace OMSWeb.Models
{
  public class BeforeNextSnapshots
  {
    public SnapshotEntity? Before { get; set; }
    public SnapshotEntity? Next { get; set; }
  }

  public class RemainedAlarm
  {
    public int Id { get; set; }
    public DateTimeOffset Time { get; set; }
    public int ErrorCode { get; set; }
    public int VehicleId { get; set; }
    public DateTimeOffset? TimeResolved { get; set; }
    public string? Current { get; set; }
    public int Level { get; set; }
    public string? Description { get; set; }
    public string? Cause { get; set; }
    public string? Action { get; set; }
  }

  public class AlarmChange : RemainedAlarm
  {
    public DateTimeOffset HistoryChangeTime { get; set; }
    public string? HistoryChangeType { get; set; }
  }
}

#nullable disable