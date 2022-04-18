using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using OMSWeb.Models.Entities;

namespace OMSWeb.Controllers
{
    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PlaybackController : ControllerBase
    {
        private readonly PlaybackService _svc;
        private readonly UserService _userSvc;

        public PlaybackController(PlaybackService playbackService, UserService userService)
        {
            this._svc = playbackService;
            this._userSvc = userService;
        }

        [HttpGet("info")]
        public ActionResult<object> GetPlaybackInfo()
        {
            return new
            {
                FirstSnapshotTime = _svc.GetFirstSnapshotTime(),
                LastTimelineEventTime = _svc.GetLastTimelineEventTime()
            };
        }

        [HttpGet("track-times")]
        public IList<DateTimeOffset> GetTrackTimes()
        {
            return _svc.GetTrackTimes();
        }

        [HttpGet("recent-track/{before}")]
        public ActionResult<TrackSnapshotEntity> GetRecentTrackBefore(DateTimeOffset before)
        {
            return _svc.GetRecentTrackBefore(before);
        }

        [HttpGet("before-next-snapshots/{from}")]
        public ActionResult<BeforeNextSnapshots> GetRecentSnapshotsFrom(DateTimeOffset from)
        {
            return _svc.GetBeforeNextSnapshots(from);
        }

        [HttpGet("timeline-events")]
        public ActionResult<object> GetTimelineEventsBetween([FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to)
        {
            var vehicleEvents = _svc.GetVehicleTimelineEventsBetween(from, to).ToList<ITimeline>();
            var orderEvents = _svc.GetOrderTimelineEventsBetween(from, to).ToList<ITimeline>();
            var segmentBlockingEvents = _svc.GetSegmentBlockingTimelineEventsBetween(from, to).ToList<ITimeline>();
            return vehicleEvents.Concat(orderEvents).Concat(segmentBlockingEvents).OrderBy(e => e.EventTime).ToList();
        }
    }
}