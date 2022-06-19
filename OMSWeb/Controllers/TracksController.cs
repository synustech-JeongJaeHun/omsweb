using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using Buffer = OMSWeb.Models.Tracks.Buffer;

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

        [HttpGet("stations")]
        public IEnumerable<Station> GetStations()
        {
            return this._svc.GetStations();
        }

        [HttpGet("buffers/{id}")]
        public Buffer GetBufferById([FromRoute] int id)
        {
            return this._svc.GetBufferById(id);
        }
    }
}