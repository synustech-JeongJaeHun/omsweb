using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;
using OMSWeb.Services;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using OMSWeb.Filters;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class StatusController : ControllerBase
  {
    private readonly TrackService _trackSvc;
    public StatusController(TrackService trackSvc)
    {
      this._trackSvc = trackSvc;
    }

    [SnakeCase]
    [HttpGet("track")]
    public ActionResult<MapData> GetTrack()
    {
      return this._trackSvc.GetMapData();
    }
  }
}