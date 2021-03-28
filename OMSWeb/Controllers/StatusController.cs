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
    [HttpGet("tracks")]
    public ActionResult<MapData> GetMapTrack()
    {
      return this._trackSvc.GetMapData();
    }
    [HttpGet("tracks/vehicles")]
    public ActionResult<VehicleResponse> GetVehicles()
    {
      var vehicles = this._trackSvc.GetMapItem(CacheKeys.Vehicles) as VehiclePosition[];
      var paths = this._trackSvc.GetMapItem(CacheKeys.VehiclePaths) as VehiclePath[];
      
      return new VehicleResponse
      {
        Vehicles = vehicles,
        VehiclePaths = paths,
      };
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