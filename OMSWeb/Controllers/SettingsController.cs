using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;

using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;
using OMSWeb.Services;
using System.Configuration;
using OMSWeb.OMSSettings;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly SettingsService _settingsSvc;

        public SettingsController(SettingsService settingsSvc)
        {
            this._settingsSvc = settingsSvc;
        }

        [HttpGet("appsettings")]
        public ActionResult<string> GetAppSettings()
        {
            return System.IO.File.ReadAllText("./appsettings.json");
        }

        [HttpPost("updateSettingsRebalanceCfg/{homeMode}&{ivrMode}")]
        public ActionResult<QueryResult> UpdateSettingsRebalanceCfg(string homeMode, string ivrMode)
        {
            int home_mode = Convert.ToInt32(homeMode);  
            int ivr_mode = Convert.ToInt32(ivrMode);

            if (home_mode < 0 || home_mode > 1) home_mode = 0;
            if (ivr_mode < 0 || ivr_mode > 1) ivr_mode = 0;

            AppConfig.UpdateToOMSConfig("VehicleProcessor", "use_go_home", home_mode.ToString());
            AppConfig.UpdateToOMSConfig("VehicleProcessor", "use_ivr", ivr_mode.ToString());

            return Ok(new QueryResult()
            {
                Retcode = (int)RET_CODE.Success,
                Message = String.Empty,
            });
        }

        [HttpGet("settingsRebalance")]
        public ActionResult<QueryResult> GetSettingsRebalance()
        {
            SettingModeEntity result = _settingsSvc.GetSettingsRebalance();

            string message = "none";
            if (result != null)
            {
                if (result.home_mode == 1) message = "home";
                else if (result.home_mode == 0 && result.ivr_mode == 1) message = "ivr";
                else if (result.home_mode == 0 && result.ivr_mode == 0) message = "none";
                else message = "none";
            }

            return Ok(new QueryResult()
            {
                Retcode = (int)RET_CODE.Success,
                Message = message,
            });
        }

        [HttpPost("updateAlternateTransfer/{mode}&{retryTostb}&{stations}")]
        public ActionResult<QueryResult> UpdateAlternateTransfer(string mode, string retryTostb, string stations)
        {
            if (!string.IsNullOrEmpty(mode))
            {
                string value = "station";
                string s = mode.ToLower().Trim();
                if (s.Contains("stb") || s.Contains("buffer")) value = "buffer";
                if (s.Contains("stk") || s.Contains("stocker") || s.Contains("station")) value = "station";

                AppConfig.UpdateToOMSConfig("TimeoutTransfer", "dest_type", value);
            }

            {
                int retryCnt = Convert.ToInt32(retryTostb);
                if (retryCnt < 0) retryCnt = 0;
                if (retryCnt > 10) retryCnt = 10;
                string value = retryCnt.ToString();

                AppConfig.UpdateToOMSConfig("TimeoutTransfer", "retry_cnt_to_buffer", value);
            }

            if (!string.IsNullOrEmpty(stations))
            {
                string value = string.Empty;
                string[] Ids = stations.Split(";");
                if (Ids != null)
                {
                    foreach (string Id in Ids)
                    {
                        if (!string.IsNullOrEmpty(Id))
                            value += "s" + Id + ";";
                    }
                }

                AppConfig.UpdateToOMSConfig("TimeoutTransfer", "stocker_list", value);
            }

            return Ok(new QueryResult()
                {
                    Retcode = (int)RET_CODE.Success,
                    Message = String.Empty,
                });
        }

        [HttpGet("alternateTransfer")]
        public ActionResult<AlternateTransferEntity> GetAlternateTransfer()
        {
            string strMode = AppConfig.GetFromOMSConfig("TimeoutTransfer", "dest_type", "stk");
            string retryToBuffer = AppConfig.GetFromOMSConfig("TimeoutTransfer", "retry_cnt_to_buffer", "3");
            string stockList = AppConfig.GetFromOMSConfig("TimeoutTransfer", "stocker_list", "");

            string c = strMode.ToLower();
            if (!string.IsNullOrWhiteSpace(c))
            {
                if (c.Contains("buffer") || c.Contains("stb"))  strMode = @"stb";
                if (c.Contains("station") || c.Contains("stocker") || c.Contains("stk"))  strMode = @"stk";
            }

            List<AlternateStationEntity> alternateStationEntity = new List<AlternateStationEntity>();
            string[] stations = stockList.Split(";");
            if (stations != null)
            {
                foreach (string s in stations)
                {
                    if (!string.IsNullOrEmpty(s))
                    {
                        string sId = s.Replace('s', ' ').Trim();
                        if (!string.IsNullOrEmpty(sId))
                        {
                            string sLogicalId = _settingsSvc.GetSettingsOnlineName(sId, "station");
                            alternateStationEntity.Add(
                                new AlternateStationEntity()
                                {
                                    Id = sId,
                                    logicalId = sLogicalId
                                });
                        }
                    }
                }
            }

            return Ok(new AlternateTransferEntity()
            {
                Mode = strMode,
                MaxRetryToBuffer = Convert.ToInt32(retryToBuffer),
                StationList = alternateStationEntity.ToArray(),
            });
        }


        [HttpGet("alternateStations")]
        public IEnumerable<AlternateStationEntity> GetAlternateStations()
        {
            string stationLikeKey = @"STK";

            return _settingsSvc.GetSettingsAlternateStations(stationLikeKey).ToList();
        }

        [HttpGet("groups")]
        public IEnumerable<GroupEntity> GetSettingsGroups()
        {
            return _settingsSvc.GetSettingsGroups().ToList();
        }

        [HttpGet("groups/grouped_objects")]
        public IEnumerable<GroupedObjectEntity> GetSettingsGroupedObjects()
        {
            return _settingsSvc.GetSettingsGroupedObjects().ToList();
        }

        [HttpGet("groups/isavailablehomes/{groupId}")]
        public IEnumerable<int> GetSettingsGroupIsAvailableHomes([FromRoute] int groupId)
        {
            return _settingsSvc.GetSettingsGroupIsAvailableHomes(groupId).ToList();
        }

        [HttpGet("groups/isavailablestations/{groupId}")]
        public IEnumerable<int> GetSettingsGroupIsAvailableStations([FromRoute] int groupId)
        {
            return _settingsSvc.GetSettingsGroupIsAvailableStations(groupId).ToList();
        }

        [HttpGet("groups/isavailablevehicles/{groupId}")]
        public IEnumerable<int> GetSettingsGroupIsAvailableVehicles([FromRoute] int groupId)
        {
            return _settingsSvc.GetSettingsGroupIsAvailableVehicles(groupId).ToList();
        }

        [HttpGet("groups/isavailablebuffers/{groupId}")]
        public IEnumerable<int> GetSettingsGroupIsAvailableBuffers([FromRoute] int groupId)
        {
            return _settingsSvc.GetSettingsGroupIsAvailableBuffers(groupId).ToList();
        }

        [HttpGet("clusters")]
        public IEnumerable<ClusterEntity> GetSettingsClusters()
        {
            return _settingsSvc.GetSettingsClusters().ToList();
        }

        [HttpGet("clusters/points")]
        public IEnumerable<ClusterPointEntity> GetSettingsClusterPoints()
        {
            return _settingsSvc.GetSettingsClusterPoints().ToList();
        }

        [HttpGet("clusters/isavailablepoints/{clusterId}")]
        public IEnumerable<int> GetSettingsClusterIsAvailablePoints([FromRoute] int clusterId)
        {
            return _settingsSvc.GetSettingsClusterIsAvailablePoints(clusterId).ToList();
        }

        [HttpGet("clusters/assignedpoints/{clusterId}")]
        public IEnumerable<int> GetSettingsClusterAssignedPoints([FromRoute] int clusterId)
        {
            return _settingsSvc.GetSettingsClusterAssignedPoints(clusterId).ToList();
        }

        [HttpGet("segments")]
        public IEnumerable<SegmentWithVPartsNBlockingEntity> GetSettingsSegments()
        {
            return _settingsSvc.GetSettingsSegements().ToList();
        }

        [HttpPost("segments/save")]
        public IActionResult SaveSettingsSegments([FromBody] SegmentWithVPartsNBlockingEntity[] segments)
        {
            var updateSegements = segments.ToList();

            foreach (SegmentWithVPartsNBlockingEntity segment in segments)
            {
                _settingsSvc.UpdateSettingsSegment(segment);
            }

            return Ok();
        }

        [HttpGet("stations")]
        public IEnumerable<StationWithUnuseEntity> GetSettingsStations()
        {
            return _settingsSvc.GetSettingsStations().ToList();
        }

        [HttpGet("buffers")]
        public IEnumerable<BufferWithUnuseEntity> GetSettingsBuffers()
        {
            return _settingsSvc.GetSettingsBuffers().ToList();
        }

        [HttpGet("points")]
        public object GetSettingsPoints(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_settingsSvc.GetSettingsPoints(), loadOptions);
        }

        [HttpGet("zcus")]
        public IEnumerable<ZcuEntity> GetSettingsZcus()
        {
            return _settingsSvc.GetSettingsZcus();
        }

        [HttpGet("vehicleRegs")]
        public IEnumerable<VehicleRegEntity> GetSettingsVehicleRegs()
        {
            return _settingsSvc.GetSettingsVehicleRegs();
        }


        [HttpPost("vehicleRegs/save")]
        public IActionResult SaveVehicleRegs([FromBody] VehicleRegEntity[] vehicleRegs)
        {
            var updateVehicleRegs = vehicleRegs.Where(u => !u.IsNew.HasValue || !u.IsNew.Value).ToList();
            var addVehicleRegs = vehicleRegs.Where(u => u.IsNew.HasValue && u.IsNew.Value).ToList();

            foreach (VehicleRegEntity vehicleReg in updateVehicleRegs)
            {
                _settingsSvc.UpdateSettingsVehicleRegs(vehicleReg);
            }

            foreach (VehicleRegEntity vehicleReg in addVehicleRegs)
            {
                _settingsSvc.InsertSettingsVehicleRegs(vehicleReg);
            }

            return Ok();
        }

        [HttpPost("vehicleRegs/remove")]
        public IActionResult DeleteVehicleRegs([FromBody] VehicleRegEntity[] vehicleRegs)
        {
            foreach (VehicleRegEntity vehicleReg in vehicleRegs)
            {
                _settingsSvc.DeleteSettingsVehicleRegs(vehicleReg);
            }
            return Ok();
        }
    }
}