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

    public IList<VehicleHistoryWithTableName> GetVehicleHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetVehicleHistoriesBetween(from, to);
    public IList<OrderHistoryWithTableName> GetOrderHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetOrderHistoriesBetween(from, to);
    public IList<SegmentBlockingHistoryWithTableName> GetSegmentBlockingHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
      => this._repo.GetSegmentBlockingHistoriesBetween(from, to);
  }
}

#nullable disable