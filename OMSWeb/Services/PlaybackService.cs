using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class PlaybackService
  {
    private readonly PlaybackRepository _repo;

    // @NOTE LAB - DB에서 읽어오는 snapshot list의 간격을 조정하기위한 설정값
    private readonly int SnapshotSkipCount = 16 * 20 * 1;

    public PlaybackService(PlaybackRepository playbackRepository)
    {
      this._repo = playbackRepository;
    }

    public DateTime? GetFirstSnapshotTime()
    {
      return this._repo.GetFirstSnapshotTime();
    }

    public PlaybackData GetSnapshotDataByTime(string userId, DateTime start, DateTime end)
    {
      // get_snapshot_time_info
      var lastTrackTime = this._repo.GetLastTrackSnapshotTime(start);
      if (lastTrackTime == null) throw new OmsException(ErrorCodes.TrackSnapshotNotExists);

      // @NOTE LAB : 조회 구간내에서 처음 이벤트가 발생한 시각
      var firstEventTime = this._repo.GetFirstEventTime(start, end);
      if (!firstEventTime.HasValue) throw new OmsException(ErrorCodes.EventNotExists);

      Console.WriteLine($"first event time >> {firstEventTime:o}");

      var times = this._repo.GetSnapshotTimes(firstEventTime.Value, end);
      if (times.Count == 0) throw new OmsException(ErrorCodes.DaySnapshotNotExists);
      times = this.DiluteSnapshots(times);  // @NOTE LAB - snapshot 간격 조정

      var timeInfo = new SnapshotTimeInfo
      {
        TrackSnapshot = lastTrackTime,
        DynamicSnapshotList = times,
      };

      var options = new TimelineQueryOptions
      {
        Start = times[0],
      };
      if (times.Count > 1) options.End = times[1];

      var timelines = this._repo.GetTimeline("event_list", options);
      var boundaries = this._repo.GetEventBoundaries(options);

      // get_event_list
      var eventTables = this.GetEventTables(boundaries);

      // retrieve_and_get_track
      var result = this.GetPlaybackData(userId, lastTrackTime, options.Start.Value, boundaries);

      result.DynamicSnapshotList = times;
      result.TrackSnapshot = lastTrackTime;
      result.Timeline = timelines;
      result.EventTables = eventTables;

      return result;
    }

    public PlaybackData GetSnapshotDataByTrack(string userId, DateTime track, DateTime snapshot)
    {
      var options = new TimelineQueryOptions
      {
        Start = snapshot,
        End = _repo.GetNextSnapshotTime(snapshot, SnapshotSkipCount)
      };

      Console.WriteLine($"## Snapshot timeRange >> start: {options.Start.Value:o}, end {options.End.Value:o}");

      // timeline
      var timelines = this._repo.GetTimeline("event_list", options);
      var boundaries = this._repo.GetEventBoundaries(options);

      // get_event_list
      var eventTables = this.GetEventTables(boundaries);

      // retrieve_and_get_track
      var result = this.GetPlaybackData(userId, track, options.Start.Value, boundaries, true);

      result.Timeline = timelines;
      result.EventTables = eventTables;
      result.TrackSnapshot = null;

      return result;
    }

    /// @NOTE LAB - snapshot 간격 조정
    private IList<DateTime> DiluteSnapshots(IList<DateTime> times)
    {
      var count = times.Count;
      var result = new List<DateTime>();
      for (int i = 0; i < count; i += SnapshotSkipCount)
      {
        result.Add(times[i]);
      }
      return result;
    }

    private PlaybackData GetPlaybackData(string userId, DateTime trackSnapshotTime, DateTime dynamicSnapshotTime, IQueryable<EventBoundary> boundaries, bool excludeStatic = false)
    {
      this._repo.CleanStaticTables();
      this._repo.CleanDynamicTables(userId);
      this._repo.RetrieveSnapshots(userId, trackSnapshotTime, dynamicSnapshotTime, excludeStatic);
      return this.GetTrack(userId, boundaries, excludeStatic);
    }

    private PlaybackData GetTrack(string userId, IQueryable<EventBoundary> boundaries, bool excludeStatic)
    {
      var map = new PlaybackData
      {
        Segments = this._repo.GetSegments(userId),
        SegmentDisabled = this._repo.GetDisabledSegments(userId),
        Vehicles = this._repo.GetVehiclePositions(userId),
        Orders = this._repo.GetOrderStates(userId, boundaries),
      };
      if (!excludeStatic)
      {
        map.Size = this._repo.GetDimension(userId);
        map.Points = this._repo.GetPoints(userId);
        map.Stations = this._repo.GetStations(userId);
        map.Buffers = this._repo.GetBuffers(userId);
        map.Clusters = this._repo.GetClusters(userId);
        map.Mtls = this._repo.GetMtls(userId);
      }
      return map;
    }

    private IDictionary<string, IDictionary<int, object>> GetEventTables(IQueryable<EventBoundary> boundaries)
    {
      var table = new Dictionary<string, IDictionary<int, object>>();
      foreach (var boundary in boundaries)
      {
        // IList<dynamic> events;
        switch (boundary.TableName)
        {
          case "order_history":
            var orderEvents = this._repo.GetEvents<OrderHistoryEntity>(boundary);
            if (orderEvents != null && orderEvents.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<OrderHistoryEntity>(orderEvents));
            break;
          case "vehicle_history":
            var vehicleEvents = this._repo.GetEvents<VehicleHistoryEntity>(boundary);
            if (vehicleEvents != null && vehicleEvents.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<VehicleHistoryEntity>(vehicleEvents));
            break;
          case "segment_blocking_history":
            var sbEvents = this._repo.GetEvents<SegmentBlockingHistoryEntity>(boundary);
            if (sbEvents != null && sbEvents.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<SegmentBlockingHistoryEntity>(sbEvents));
            break;
          default:
            break;
        }
      }

      return table;
    }

    private IDictionary<int, dynamic> ConvertRowMap<T>(IList<T> rows) where T : IIntId
    {
      var map = new Dictionary<int, dynamic>();
      foreach (var row in rows)
      {
        map.Add(row.Id, row);
      }
      return map;
    }
  }
}