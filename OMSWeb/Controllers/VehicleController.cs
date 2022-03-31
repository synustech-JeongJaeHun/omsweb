using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OMSWeb.Models;
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
    public class VehicleController : ControllerBase
    {
        private readonly HistoryService _historySvc;
        private readonly VehicleService _vehicleSvc;

        public VehicleController(HistoryService historyService, VehicleService vehicleService)
        {
            this._historySvc = historyService;
            this._vehicleSvc = vehicleService;
        }

        [HttpGet("{vehicleId}/status")]
        public ActionResult<VehicleState> GetVehicleStatus(int vehicleId)
        {
            var result = _vehicleSvc.QueryVehicleStatus(vehicleId);

            if (result == null)
                return NotFound();
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
                    Id = vehicleId,
                    di_1 = 0,
                    di_2 = 0,
                    di_3 = 0,
                    do_1 = 0,
                    do_2 = 0,
                    do_3 = 0
                });
            else
                return Ok(result);
        }


        [HttpGet("{vehicleId}/recent-dio-before/{before}")]
        public ActionResult<VehicleDio> GetRecentVehicleDioBefore(int vehicleId, DateTimeOffset before)
        {
            var result = _historySvc.QueryRecentDioBefore(vehicleId, before);

            if (result == null)
                return Ok(new VehicleDio()
                {
                    Id = vehicleId,
                    di_1 = 0,
                    di_2 = 0,
                    di_3 = 0,
                    do_1 = 0,
                    do_2 = 0,
                    do_3 = 0
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