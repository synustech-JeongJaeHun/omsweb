using System.Threading.Tasks;
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


    /// <summary>
    /// playback 시작 및 종료 일시 반환
    /// </summary>
    /// <remarks>데이터가 존재하는 구간</remarks>
    /// <returns></returns>
    [HttpGet("info")]
    public ActionResult<object> GetPlaybackInfo()
    {
      return new
      {
        FirstSnapshotTime = _svc.GetFirstSnapshotTime(),
        LastHistoryTime = _svc.GetLastHistoryTime()
      };
    }


    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
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

    [HttpGet("vehicle-alarms")]
    public ActionResult<object> GetVehicleAlarms([FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to)
    {
      var remainedAlarms = _svc.GetRemainedAlarmsAt(at: from);
      var alarmChanges = _svc.GetAlarmChangesInTime(from, to);
      return new
      {
        remainedAlarms,
        alarmChanges
      };
    }

    [HttpGet("history-events")]
    public async Task<ActionResult<object>> GetHistoriesBetween([FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to)
    {

      var vehicleEventsTask = Task.Run(() => _svc.GetVehicleHistoriesBetween(from, to).ToList<ITableName>());
      var orderEventsTask = Task.Run(() => _svc.GetOrderHistoriesBetween(from, to).ToList<ITableName>());
      var segmentBlockingEventsTask = Task.Run(() => _svc.GetSegmentBlockingHistoriesBetween(from, to).ToList<ITableName>());
      var bufferEventsTask = Task.Run(() => _svc.GetBufferHistoriesBetween(from, to).ToList<ITableName>());
      var stationEventsTask = Task.Run(() => _svc.GetStationHistoriesBetween(from, to).ToList<ITableName>());
      var zcuEventsTask = Task.Run(() => _svc.GetZcuHistoriesBetween(from, to).ToList<ITableName>());
      var modeStateEventsTask = Task.Run(() => _svc.GetModeStateHistoriesBetween(from, to).ToList<ITableName>());

      await Task.WhenAll(new[] { vehicleEventsTask, orderEventsTask, segmentBlockingEventsTask, bufferEventsTask, stationEventsTask, zcuEventsTask, modeStateEventsTask });

      return vehicleEventsTask.Result
        .Concat(orderEventsTask.Result)
        .Concat(segmentBlockingEventsTask.Result)
        .Concat(bufferEventsTask.Result)
        .Concat(stationEventsTask.Result)
        .Concat(zcuEventsTask.Result)
        .Concat(modeStateEventsTask.Result)
        .OrderBy(e => e.HistoryChangeTime).ToList();
    }
  }
}