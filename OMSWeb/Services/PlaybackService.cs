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

    public PlaybackService(PlaybackRepository playbackRepository)
    {
      this._repo = playbackRepository;
    }

    public DateTime GetFirstSnapshotTime()
    {
      return this._repo.GetFirstSnapshotTime();
    }

    public PlaybackData GetSnapshotData(string userId, string start, string end)
    {
      // get_snapshot_time_info
      var lastTrackTime = this._repo.GetLastTrackSnapshotTime(start);
      if (lastTrackTime == null) throw new OmsException(ErrorCodes.TrackSnapshotNotExists);

      var times = this._repo.GetSnapshotTimes(start, end);
      if (times == null || times.Count == 0) throw new OmsException(ErrorCodes.DaySnapshotNotExists);

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

    private PlaybackData GetPlaybackData(string userId, DateTime trackSnapshotTime, DateTime dynamicSnapshotTime, IQueryable<EventBoundary> boundaries)
    {
      this._repo.CleanStaticTables();
      this._repo.CleanDynamicTables(userId);
      this._repo.RetrieveSnapshots(userId, trackSnapshotTime, dynamicSnapshotTime);
      return this.GetTrack(userId, boundaries);
    }

    private PlaybackData GetTrack(string userId, IQueryable<EventBoundary> boundaries) {
      var map = new PlaybackData {
        Size = this._repo.GetDimension(userId),
        Points = this._repo.GetPoints(userId),
        Segments = this._repo.GetSegments(userId),
        SegmentDisabled = this._repo.GetDisabledSegments(userId),
        Stations = this._repo.GetStations(userId),
        Buffers = this._repo.GetBuffers(userId),
        Mtls = this._repo.GetMtls(userId),
        Clusters = this._repo.GetClusters(userId),
        Vehicles = this._repo.GetVehiclePositions(userId),
        Orders = this._repo.GetOrderStates(userId, boundaries),
      };
      return map;
    }

    private IDictionary<string, IDictionary<int, dynamic>> GetEventTables(IQueryable<EventBoundary> boundaries)
    {
      var table = new Dictionary<string, IDictionary<int, dynamic>>();
      foreach (var boundary in boundaries)
      {
        dynamic events;
        switch (boundary.TableName)
        {
          case "order_history":
            events = this._repo.GetEvents<OrderHistoryEntity>(boundary);
            if (events != null && events.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<OrderHistoryEntity>(events));
            break;
          case "vehicle_history":
            events = this._repo.GetEvents<VehicleHistoryEntity>(boundary);
            if (events != null && events.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<VehicleHistoryEntity>(events));
            break;
          case "segment_blocking_history":
            events = this._repo.GetEvents<SegmentBlockingHistoryEntity>(boundary);
            if (events != null && events.Count() > 0)
              table.Add(boundary.TableName, this.ConvertRowMap<SegmentBlockingHistoryEntity>(events));
            break;
          default:
            break;
        }
      }

      return table;
    }

    private IDictionary<int, T> ConvertRowMap<T>(IQueryable<T> rows) where T : IIntId
    {
      var map = new Dictionary<int, T>();
      foreach (var row in rows)
      {
        map.Add(row.Id, row);
      }
      return map;
    }
  }
}