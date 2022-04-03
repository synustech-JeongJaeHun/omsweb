using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Models.Tracks;
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
        public DateTime? GetLastTimelineEventTime()
          => this._repo.GetLastTimelineEventTime();

        public IList<DateTimeOffset> GetTrackTimes()
          => this._repo.GetTrackTimes();

        public TrackSnapshotEntity? GetRecentTrackBefore(DateTimeOffset before)
          => this._repo.GetRecentTrackBefore(before);

        public BeforeNextSnapshots GetBeforeNextSnapshots(DateTimeOffset from)
        => this._repo.GetBeforeNextSnapshots(from);

        public IList<VehicleHistoryWithTimeLine> GetVehicleTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
          => this._repo.GetVehicleTimelineEventsBetween(from, to);
        public IList<OrderHistoryWithTimeLine> GetOrderTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
          => this._repo.GetOrderTimelineEventsBetween(from, to);
        public IList<SegmentBlockingHistoryEntityWithTimeline> GetSegmentBlockingTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
          => this._repo.GetSegmentBlockingTimelineEventsBetween(from, to);
    }
}

#nullable disable