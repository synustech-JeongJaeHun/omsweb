using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
  }
}