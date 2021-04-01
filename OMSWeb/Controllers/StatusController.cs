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
    private readonly CacheService _cache;

    public StatusController(TrackService trackSvc, StatusService statusSvc, CacheService cache)
    {
      this._trackSvc = trackSvc;
      this._statusSvc = statusSvc;
      this._cache = cache;
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
      var vehicles = this._trackSvc.GetVehicles();
      var paths = this._trackSvc.GetVehiclePaths();

      return new VehicleResponse
      {
        Vehicles = vehicles,
        VehiclePaths = paths,
      };
    }
    [HttpGet("tracks/clear")]
    public ActionResult<string> ClearCache()
    {
      this._cache.RemoveValue(CacheKeys.Buffers);
      this._cache.RemoveValue(CacheKeys.Clusters);
      this._cache.RemoveValue(CacheKeys.Groups);
      this._cache.RemoveValue(CacheKeys.MapSize);
      this._cache.RemoveValue(CacheKeys.Mtls);
      this._cache.RemoveValue(CacheKeys.Points);
      this._cache.RemoveValue(CacheKeys.SegmentDisabled);
      this._cache.RemoveValue(CacheKeys.Segments);
      this._cache.RemoveValue(CacheKeys.Stations);
      this._cache.RemoveValue(CacheKeys.VehiclePaths);
      this._cache.RemoveValue(CacheKeys.Vehicles);

      return "OK";
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