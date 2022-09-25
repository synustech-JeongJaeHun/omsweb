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
using OMSWeb.Logger;

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

        [HttpPost("updateSettingsDelayedTransferTimeout/{timeout}&{warningNotify}&{tableNotify}")]
        public ActionResult<QueryResult> UpdateSettingsDelayedTransferTimeout(string timeout, string warningNotify, string tableNotify)
        {
            int ntimeout = 3600;
            try { ntimeout = Convert.ToInt32(timeout); } catch (Exception e) { ntimeout = 3600; }
            if (ntimeout < 0) ntimeout = 0;

            bool bwarningNotify = false;
            if (string.IsNullOrWhiteSpace(warningNotify) == false)
            {
                string w = warningNotify.ToLower();
                if (w.Contains("t") || w.Contains("y") || w.Contains("1"))
                    bwarningNotify = true;
            }
            bool btableNotify = false;
            if (string.IsNullOrWhiteSpace(tableNotify) == false)
            {
                string w = tableNotify.ToLower();
                if (w.Contains("t") || w.Contains("y") || w.Contains("1"))
                    btableNotify = true;
            }

            AppConfig.UpdateToOMSConfig("Dispatcher", "delayed_order_timeout", ntimeout.ToString());
            AppConfig.UpdateToOMSConfig("Dispatcher", "use_delayed_order_warning_notify", bwarningNotify.ToString());
            AppConfig.UpdateToOMSConfig("Dispatcher", "use_delayed_order_table_notify", btableNotify.ToString());

            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: ACTION_SETTING_DELAYED_ORDER_TIMEOUT");
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, "PACKET: delayed_order_timeout={0}, warning_notify={1}, table_notify={2}", ntimeout, bwarningNotify, btableNotify);

            return Ok(new QueryResult()
            {
                Retcode = (int)RET_CODE.Success,
                Message = String.Empty,
            });
        }

        [HttpGet("settingsDelayedTransferTimeout")]
        public ActionResult<QueryResult> GetSettingsDelayedTransferTimeout()
        {
            string strTimeout = AppConfig.GetFromOMSConfig("Dispatcher", "delayed_order_timeout", "3600");
            string strWarningNotify = AppConfig.GetFromOMSConfig("Dispatcher", "use_delayed_order_warning_notify", "true");
            string strTableNotify = AppConfig.GetFromOMSConfig("Dispatcher", "use_delayed_order_table_notify", "true");

            // timeout
            int timeout = 3600;
            try { timeout = Convert.ToInt32(strTimeout); } catch (Exception e) { timeout = 3600; }
            if (timeout < 0) timeout = 0;

            // warningNotify
            bool warningNotify = false;
            try { warningNotify = Convert.ToBoolean(strWarningNotify); } catch (Exception e) { warningNotify = false; }

            // tableNotify
            bool tableNotify = false;
            try { tableNotify = Convert.ToBoolean(strTableNotify); } catch (Exception e) { tableNotify = false; }

            return Ok(new DelayedTransferTimeoutEntity()
            {
                timeout = timeout,
                WarningNotify = warningNotify,
                TableNotify = tableNotify
            });
        }

        [HttpPost("updateSettingsRebalanceCfg/{homeMode}&{ivrMode}")]
        public ActionResult<QueryResult> UpdateSettingsRebalanceCfg(string homeMode, string ivrMode)
        {
            int home_mode = Convert.ToInt32(homeMode);  
            int ivr_mode = Convert.ToInt32(ivrMode);

            if (home_mode < 0 || home_mode > 1) home_mode = 0;
            if (ivr_mode < 0 || ivr_mode > 1) ivr_mode = 0;

            bool bHomeMode = home_mode == 1 ? true : false;
            bool bIvrMode = ivr_mode == 1 ? true : false;

            AppConfig.UpdateToOMSConfig("VehicleProcessor", "use_go_home", bHomeMode.ToString());
            AppConfig.UpdateToOMSConfig("VehicleProcessor", "use_ivr", bIvrMode.ToString());

            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: ACTION_SETTING_HOME_IVR_NONE");
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, "PACKET: use_go_home={0}, use_ivr={1}", home_mode, ivr_mode);

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

        [HttpPost("updateAlternateTransfer/{mode}&{retryTostb}&{retryToNearStocker}&{stations}")]
        public ActionResult<QueryResult> UpdateAlternateTransfer(string mode, string retryTostb, string retryToNearStocker, string stations)
        {
            try
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

                {
                    bool bUseNearOrderSTK = Convert.ToBoolean(retryToNearStocker);
                    string value = bUseNearOrderSTK.ToString();

                    AppConfig.UpdateToOMSConfig("TimeoutTransfer", "retry_to_near_stocker", value);
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
            }
            catch (Exception e)
            {
            }

            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: ACTION_SETTING_ALTERNATE_TRANSFER");
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, "PACKET: mode={0}, retryTostb={1}, retryToNearStocker={2}, stations={3}", mode, retryTostb, retryToNearStocker, stations);

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
            string retryToNearStocker = AppConfig.GetFromOMSConfig("TimeoutTransfer", "retry_to_near_stocker", "false");
            string stockList = AppConfig.GetFromOMSConfig("TimeoutTransfer", "stocker_list", "");

            List<AlternateStationEntity> alternateStationEntity = new List<AlternateStationEntity>();
            try
            {
                string smode = strMode.ToLower();
                if (!string.IsNullOrWhiteSpace(smode))
                {
                    if (smode.Contains("buffer") || smode.Contains("stb")) strMode = @"stb";
                    if (smode.Contains("station") || smode.Contains("stocker") || smode.Contains("stk")) strMode = @"stk";
                }

                // retryToBuffer
                int rtb = 0;
                try { rtb = Convert.ToInt32(retryToBuffer); } catch (Exception e) { rtb = 0; }
                if (rtb < 0) rtb = 0;
                if (rtb > 10) rtb = 10;
                retryToBuffer = rtb.ToString();

                // retryToNearStocker
                bool rts = false;
                try { rts = Convert.ToBoolean(retryToNearStocker); } catch (Exception e) { rts = false; }
                retryToNearStocker = rts.ToString();

                // stocker list
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
            }
            catch (Exception e)
            {
            }

            return Ok(new AlternateTransferEntity()
            {
                Mode = strMode,
                MaxRetryToBuffer = Convert.ToInt32(retryToBuffer),
                retryToNearStocker = Convert.ToBoolean(retryToNearStocker),
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