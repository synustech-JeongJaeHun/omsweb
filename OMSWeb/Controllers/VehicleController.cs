using System;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Services;
using OMSWeb.Models.Entities;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly HistoryService _historySvc;
        private readonly VehicleService _vehicleSvc;

        public VehicleController(HistoryService historyService, VehicleService vehicleService)
        {
            this._historySvc = historyService;
            this._vehicleSvc = vehicleService;
        }



        /// <summary>
        /// 비클 상태
        /// </summary>
        /// <param name="vehicleId"></param>
        /// <returns></returns>
        [HttpGet("{vehicleId}/status")]
        public ActionResult<VehicleState> GetVehicleStatus(int vehicleId)
        {
            var result = _vehicleSvc.QueryVehicleStatus(vehicleId);

            if (result == null)
                return Ok(null);
            else
                return Ok(result);
        }

        [HttpGet("{vehicleId}/recent-dio")]
        public ActionResult<VehicleDio> GetRecentVehicleDio(int vehicleId)
        {
            var result = _vehicleSvc.QueryRecentDio(vehicleId);

            if (result == null)
                return Ok(new VehicleDio()
                {
                    VehicleId = vehicleId,
                    Di1 = 0,
                    Di2 = 0,
                    Di3 = 0,
                    Do1 = 0,
                    Do2 = 0,
                    Do3 = 0
                });
            else
                return Ok(result);
        }


        [HttpGet("{vehicleId}/recent-dio-before/{before}")]
        public ActionResult GetRecentVehicleDioBefore(int vehicleId, DateTimeOffset before)
        {
            var result = _historySvc.QueryRecentDioBefore(vehicleId, before);

            if (result == null)
                return Ok(new VehicleDioHistoryEntity()
                {
                    VehicleId = vehicleId,
                    HistorySourceId = vehicleId,
                    HistoryChangeTime = before.AddSeconds(-1),
                    HistoryChangeType = "",
                    Di1 = 0,
                    Di2 = 0,
                    Di3 = 0,
                    Do1 = 0,
                    Do2 = 0,
                    Do3 = 0,
                });
            else
                return Ok(result);
        }

        [HttpGet("{vehicleId}/dio")]
        public object GetVehicleDio(int vehicleId, [FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to)
        {
            return _historySvc.QueryVehicleDios(vehicleId, from, to);
        }

        [HttpGet("dio-categories")]
        public object GetVehicleDioCategory()
        {
            return _vehicleSvc.QueryDioCategory();
        }
    }
}