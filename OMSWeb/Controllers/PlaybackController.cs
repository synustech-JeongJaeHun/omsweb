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

namespace OMSWeb.Controllers
{
  [Authorize]
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

    [HttpGet("snapshots/first")]
    public ActionResult<SimpleResponse<DateTime?>> GetFirstSnapshot()
    {
      var time = this._svc.GetFirstSnapshotTime();
      return new SimpleResponse<DateTime?>
      {
        Data = time
      };
    }

    [HttpGet("snapshots/times/{start}/{end}")]
    public ActionResult<PlaybackData> GetSnapshotOfTime([FromRoute] string start, [FromRoute] string end)
    {
      Console.WriteLine($"## Get Snapshot time >> {start} ~ {end}");
      return _svc.GetSnapshotDataByTime(_userSvc.UserId, DateTime.Parse(start), DateTime.Parse(end));
    }

    [HttpGet("snapshots/{track}/{snapshot}")]
    public ActionResult<PlaybackData> GetSnapshotOfTrack([FromRoute] string track, [FromRoute] string snapshot)
    {
      Console.WriteLine($"## Get Snapshot track >> {track} ~ {snapshot}");
      return _svc.GetSnapshotDataByTrack(_userSvc.UserId, DateTime.Parse(track), DateTime.Parse(snapshot));
    }
  }
}