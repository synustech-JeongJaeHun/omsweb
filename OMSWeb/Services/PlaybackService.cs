using System;
using System.Collections.Generic;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

#nullable enable
namespace OMSWeb.Services
{
  public class PlaybackService
  {
    private readonly PlaybackRepository _repo;

    public PlaybackService(PlaybackRepository playbackRepository)
    {
      this._repo = playbackRepository;
    }

    public DateTime? GetFirstSnapshotTime()
      => this._repo.GetFirstSnapshotTime();
    public DateTime? GetLastHistoryTime()
      => this._repo.GetLastHistoryTime();

    public IList<DateTimeOffset> GetTrackTimes()
      => this._repo.GetTrackTimes();

    public TrackSnapshotEntity? GetRecentTrackBefore(DateTimeOffset before)
      => this._repo.GetRecentTrackBefore(before);

    public BeforeNextSnapshots GetBeforeNextSnapshots(DateTimeOffset from)
      => this._repo.GetBeforeNextSnapshots(from);

    public IList<RemainedAlarm> GetRemainedAlarmsAt(DateTimeOffset at)
      => this._repo.GetRemainedAlarmsAt(at);
    public IList<AlarmChange> GetAlarmChangesInTime(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetAlarmChangesInTime(from, to);

    public IList<VehicleHistoryWithTableName> GetVehicleHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetVehicleHistoriesBetween(from, to);
    public IList<OrderHistoryWithTableName> GetOrderHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetOrderHistoriesBetween(from, to);
    public IList<SegmentBlockingHistoryWithTableName> GetSegmentBlockingHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetSegmentBlockingHistoriesBetween(from, to);
    public IList<BufferHistoryWithTableName> GetBufferHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetBufferHistoriesBetween(from, to);
    public IList<StationHistoryWithTableName> GetStationHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetStationHistoriesBetween(from, to);
    public IList<ZcuHistoryWithTableName> GetZcuHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetZcuHistoriesBetween(from, to);
    public IList<ModeStateHistoryWithTableName> GetModeStateHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetModeStateHistoriesBetween(from, to);
  }
}

#nullable disable