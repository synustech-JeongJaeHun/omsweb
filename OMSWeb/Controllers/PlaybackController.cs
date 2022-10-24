using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
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

    public PlaybackController(PlaybackService playbackService, UserService userService)
    {
      this._svc = playbackService;
    }

    [HttpGet("info")]
    public ActionResult<object> GetPlaybackInfo()
    {
      return new
      {
        FirstSnapshotTime = _svc.GetFirstSnapshotTime(),
        LastHistoryTime = _svc.GetLastHistoryTime()
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

    [HttpGet("history-events")]
    public ActionResult<object> GetHistoriesBetween([FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to)
    {
      var vehicleEvents = _svc.GetVehicleHistoriesBetween(from, to).ToList<ITableName>();
      var orderEvents = _svc.GetOrderHistoriesBetween(from, to).ToList<ITableName>();
      var segmentBlockingEvents = _svc.GetSegmentBlockingHistoriesBetween(from, to).ToList<ITableName>();
      return vehicleEvents.Concat(orderEvents).Concat(segmentBlockingEvents).OrderBy(e => e.HistoryChangeTime).ToList();
    }
  }
}