using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class TracksController : ControllerBase
  {
    private readonly TrackService _svc;

    public TracksController(TrackService trackService)
    {
      this._svc = trackService;
    }

    [HttpGet("groups")]
    public IEnumerable<LocationGroup> GetGroups()
    {
      return this._svc.GetGroups();
    }

    [HttpPut("groups/{id}")]
    public ActionResult UpdateGroup([FromRoute] int id, [FromBody] LocationGroup group)
    {
      Console.WriteLine($"# Update Group : {id}");
      return Ok();
    }

    [HttpGet("clusters")]
    public IEnumerable<Cluster> GetClusters()
    {
      return this._svc.GetClusters();
    }

    [HttpPut("clusters/{id}")]
    public ActionResult UpdateCluster([FromRoute] int id, [FromBody] Cluster cluster)
    {
      return Ok();
    }

    [HttpGet("segments")]
    public IEnumerable<SegmentWithPart> GetSegments()
    {
      return this._svc.GetSegments();
    }

    [HttpGet("points")]
    public IEnumerable<Point> GetPoints()
    {
      return this._svc.GetPoints();
    }
    [HttpPatch("points/{id}")]
    public ActionResult UpdatePoint([FromRoute] int id, [FromBody] PointUpdateDto point)
    {
      return Ok();
    }

    [HttpGet("stations")]
    public IEnumerable<Station> GetStations()
    {
      return this._svc.GetStations();
    }

    [HttpPost("buffers/{id}/carrier/{carrierId}")]
    public ActionResult InstallBufferCarrier([FromRoute] int id, [FromRoute] int carrierId)
    {
      return Ok();
    }

    [HttpDelete("buffers/{id}/carrier")]
    public ActionResult RemoveBufferCarrier([FromRoute] int id)
    {
      return Ok();
    }

    [HttpPatch("buffers/{id}")]
    public ActionResult UpdateBuffer([FromRoute] int id, [FromBody] BufferUpdateDto form)
    {
      return Ok();
    }

    [HttpPatch("zcus/{id}")]
    public ActionResult UpdateZcu([FromRoute] int id, [FromBody] ZcuUpdateDto form)
    {
      return Ok();
    }
  }
}