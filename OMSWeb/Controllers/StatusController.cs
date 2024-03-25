using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using DevExtreme.AspNet.Data.ResponseModel;
using OMSWeb.Logger;


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
            var vehicles = this._trackSvc.GetVehicles(true);
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
            this._cache.ClearMap();
            return Ok();
        }

        [HttpGet("orders")]
        public object GetOrderStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                (int skip, int take, string condition, string sort) = _statusSvc.GetLoadFilters(loadOptions, @"orders");
                int totalCount = _statusSvc.QueryOrderStatesCount(condition);
                loadOptions.Skip = 0;
                loadResult = DataSourceLoader.Load(_statusSvc.QueryOrderStates(skip, take, condition, sort), loadOptions);
                loadResult.totalCount = totalCount;
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("vehicles")]
        public object GetVehicleStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryVehicleStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("stations")]
        public object GetStationStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryStationStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("buffers")]
        public object GetBufferStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryBufferStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("zcus")]
        public object GetZcuStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryZcuStates(), loadOptions);
            }
            catch (Exception e)
            {
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("clusters")]
        public object GetClusterStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryClusterStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("unuseLists")]
        public object GetUnuseListStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryUnuseListStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("dio")]
        public object GetVehicleDio(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryDioStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }

        [HttpGet("id-list/{type}")]
        public IEnumerable<NodeInfo> GetIdList(string type)
        {
            try
            {
                return this._trackSvc.GetIdList(type.ToUpper());
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
            }
            return null;
        }
        
        [HttpGet("fcus")]
        public object GetFcuStatus(DataSourceLoadOptions loadOptions)
        {
            LoadResult loadResult;
            try
            {
                loadResult = DataSourceLoader.Load(_statusSvc.QueryFireShutterStates(), loadOptions);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
                loadResult = null;
            }
            return loadResult;
        }
    }
}