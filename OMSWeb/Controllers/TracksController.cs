using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class TracksController : ControllerBase
  {
    private readonly TrackRepository _repo;

    public TracksController(TrackRepository trackRepository)
    {
      this._repo = trackRepository;
    }

    [HttpGet("groups")]
    public IEnumerable<LocationGroup> GetGroups()
    {
      return this._repo.LoadGroups();
    }

    [HttpPut("groups/{id}")]
    public ActionResult UpdateGroup([FromRoute] int id) {
      Console.WriteLine($"# Update Group : {id}");
      return Ok();
    }

    [HttpGet("clusters")]
    public IEnumerable<Cluster> GetClusters() {
      return this._repo.LoadClusters();
    }
  }
}