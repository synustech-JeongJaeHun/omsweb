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
    private readonly StatusService _statusSvc;

    public StatusController(TrackService trackSvc, StatusService statusSvc)
    {
      this._trackSvc = trackSvc;
      this._statusSvc = statusSvc;
    }

    // [SnakeCase]
    [HttpGet("track")]
    public ActionResult<MapData> GetTrack()
    {
      return this._trackSvc.GetMapData();
    }

    [HttpGet("orders")]
    public object GetOrderStatus(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_statusSvc.QueryOrderStates(), loadOptions);
    }

    [HttpGet("vehicles")]
    public object GetVehicleStatus(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_statusSvc.QueryVehicleStates(), loadOptions);
    }
  }
}