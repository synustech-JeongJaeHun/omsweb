using System;
using System.Collections.Generic;
using OMSWeb.Models.Entities;

namespace OMSWeb.Models.Tracks
{
  public class SnapshotTimeInfo
  {
    public DateTime TrackSnapshot { get; set; }
    public IList<DateTime> DynamicSnapshotList { get; set; }
  }

  public class TimeRange
  {
    public DateTime? Start { get; set; }
    public DateTime? End { get; set; }
  }

  public class TimelineQueryOptions : TimeRange
  {
  }

  public class EventBoundary
  {
    public int Min { get; set; }
    public int Max { get; set; }
    public string TableName { get; set; }
  }

  public class PlaybackData : MapData
  {
    public IList<OrderState> Orders { get; set; }
    public IList<DateTime> DynamicSnapshotList { get; set; }
    public DateTime TrackSnapshot { get; set; }
    public IList<TimelineEntity> Timeline { get; set; }
    public IDictionary<string, IDictionary<int, dynamic>> EventTables { get; set; }
  }
}