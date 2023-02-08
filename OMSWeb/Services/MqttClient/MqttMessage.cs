using Newtonsoft.Json;
using OMSWeb.Logger;
using OMSWeb.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Services.MqttClient
{
    public class MqttMessage
    {
        public const string TOPIC_DEFAULT = "oms/vehicle-manager/request";
        public const string TOPIC_MAP_UPDATE = "oms/map-update/status";
        public const string TOPIC_ALIVE = "oms/alive/request";

        public const string REQUEST_HAS = "has";
        public const string REQUEST_VEHICLE_MANAGER = "vehicle_manager";
        public const string REQUEST_VEHICLE = "vehicle";
        public const string REQUEST_TRACK = "track";
        public const string REQUEST_CARRIER = "carrier";
        public const string REQUEST_ZCU = "zcu";
        public const string REQUEST_ORDER = "order";

        public const string ACTION_MAP_UPDATE = "map_update";
        public const string ACTION_CONTROL_STATE = "control_state";
        public const string ACTION_TSC_STATE = "tsc_state";
        public const string ACTION_AI_MODE = "ai_mode";
        public const string ACTION_HOME_MODE = "home_mode";
        public const string ACTION_IVR_MODE = "ivr_mode";
        public const string ACTION_CHAIN_MANUAL_COMMAND_DISABLED = "chain_manual_command_disabled";
        public const string ACTION_RESET_VEHICLE_MILEAGE_TOTAL = "reset_vehicle_mileage_total";
        public const string ACTION_PAUSE = "pause";
        public const string ACTION_RESUME = "resume";
        public const string ACTION_ALARM_CLEAR = "alarm_clear";
        public const string ACTION_WARNING_CLEAR = "warning_clear";
        public const string ACTION_RESET = "reset";
        public const string ACTION_STOP = "stop";                           // estop
        public const string ACTION_INITIALIZE = "initialize";               // set vehicle auto
        public const string ACTION_STATUS = "status";
        public const string ACTION_MTL_IN = "mtl_in";
        public const string ACTION_MTL_OUT = "mtl_out";
        public const string ACTION_RAIL_IN = "rail_in";
        public const string ACTION_RAIL_OUT = "rail_out";
        public const string ACTION_REMOVE = "remove";
        public const string ACTION_UPDATE_MAP = "update_map";
        public const string ACTION_GET_MAP_INFO = "get_map_info";
        public const string ACTION_SET_BEHAVIOR = "set_behavior";           // push enable, host order enable
        public const string ACTION_CALCULATE_PATH = "calculate_path";
        public const string ACTION_CLEAR_PATH = "clear_path";
        public const string ACTION_DISABLE_SEGMENT = "disable-segment";
        public const string ACTION_ENABLE_SEGMENT = "enable-segment";
        public const string ACTION_DISABLE_HOME = "disable-home";
        public const string ACTION_ENABLE_HOME = "enable-home";
        public const string ACTION_GROUP_SETTING = "group-setting";
        public const string ACTION_CLUSTER_SETTING = "cluster-setting";
        public const string ACTION_SEGMENT_SETTING = "segment-setting";
        public const string ACTION_STATION_SETTING = "station-setting";
        public const string ACTION_BUFFER_SETTING = "buffer-setting";
        public const string ACTION_VEHICLE_SETTING = "vehicle-setting";
        public const string ACTION_ZCU_GO = "zcu_go";
        public const string ACTION_ZCU_USING_TYPE = "zcu_using_type";
        public const string ACTION_ZCU_SETTING = "zcu-setting";
        public const string ACTION_ZCU_RESET = "zcu_reset";
        public const string ACTION_INSTALL_CARRIER = "install_carrier";
        public const string ACTION_REMOVE_CARRIER = "remove_carrier";
        public const string ACTION_RENAME_CARRIER = "rename_carrier";
        public const string ACTION_N = "N";                                 // fromto, from, to, move
        public const string ACTION_A = "A";                                 // abort order            
        public const string ACTION_C = "C";                                 // cancel order
        public const string ACTION_M = "M";                                 // update

        public const string ORIGIN_DEFAULT = "OMS";
        public const string ORIGIN_OMS = "OMS";
        public const string ORIGIN_LOCAL_ORDER = "OMS";
        public const string ORIGIN_HOST_ORDER = "OMS,MCS";

        public const int DEFAULT_PRIORITY = 30;

        public const string DEFAULT_DIRECTION = "forward";

        public MqttMessage()
        {

        }

        public string GetTopic(CommandMessageDto command)
        {
            if (command == null) return null;
            if (command.Action == null) return null;

            switch (command.Action)
            {
                case ACTION_MAP_UPDATE:
                case ACTION_CONTROL_STATE:
                case ACTION_TSC_STATE:
                case ACTION_AI_MODE:
                case ACTION_HOME_MODE:
                case ACTION_IVR_MODE:
                case ACTION_CHAIN_MANUAL_COMMAND_DISABLED:
                case ACTION_RESET_VEHICLE_MILEAGE_TOTAL:
                case ACTION_PAUSE:
                case ACTION_RESUME:
                case ACTION_ALARM_CLEAR:
                case ACTION_WARNING_CLEAR:
                case ACTION_RESET:
                case ACTION_STOP:
                case ACTION_INITIALIZE:
                case ACTION_STATUS:
                case ACTION_MTL_IN:
                case ACTION_MTL_OUT:
                case ACTION_RAIL_IN:
                case ACTION_RAIL_OUT:
                case ACTION_REMOVE:
                case ACTION_UPDATE_MAP:
                case ACTION_GET_MAP_INFO:
                case ACTION_SET_BEHAVIOR:
                case ACTION_CALCULATE_PATH:
                case ACTION_CLEAR_PATH:
                case ACTION_DISABLE_SEGMENT:
                case ACTION_ENABLE_SEGMENT:
                case ACTION_DISABLE_HOME:
                case ACTION_ENABLE_HOME:
                case ACTION_GROUP_SETTING:
                case ACTION_CLUSTER_SETTING:
                case ACTION_SEGMENT_SETTING:
                case ACTION_STATION_SETTING:
                case ACTION_BUFFER_SETTING:
                case ACTION_VEHICLE_SETTING:
                case ACTION_ZCU_GO:
                case ACTION_ZCU_USING_TYPE:
                case ACTION_ZCU_SETTING:
                case ACTION_ZCU_RESET:
                case ACTION_INSTALL_CARRIER:
                case ACTION_REMOVE_CARRIER:
                case ACTION_RENAME_CARRIER:
                case ACTION_N:
                case ACTION_A:
                case ACTION_C:
                case ACTION_M:
                    return TOPIC_DEFAULT;   // "oms/vehicle-manager/request";
            }

            return null;
        }

        public string GetAction(string action)
        {
            switch (action)
            {
                case ACTION_INSTALL_CARRIER:
                    return "install";
                case ACTION_REMOVE_CARRIER:
                    return "remove";
                case ACTION_RENAME_CARRIER:
                    return "rename";
                case ACTION_ZCU_RESET:
                    return "reset";
                default:
                    return action;
            }
        }
         
        public string GetRequest(string action)
        {
            switch (action)
            {
                case ACTION_CONTROL_STATE:
                case ACTION_TSC_STATE:
                    return REQUEST_HAS;

                case ACTION_MAP_UPDATE:
                case ACTION_AI_MODE:
                case ACTION_HOME_MODE:
                case ACTION_IVR_MODE:
                case ACTION_CHAIN_MANUAL_COMMAND_DISABLED:
                case ACTION_RESET_VEHICLE_MILEAGE_TOTAL:
                case ACTION_PAUSE:
                case ACTION_RESUME:
                case ACTION_ALARM_CLEAR:
                case ACTION_WARNING_CLEAR:
                case ACTION_GROUP_SETTING:
                case ACTION_CLUSTER_SETTING:
                case ACTION_SEGMENT_SETTING:
                case ACTION_STATION_SETTING:
                case ACTION_BUFFER_SETTING:
                case ACTION_VEHICLE_SETTING:
                case ACTION_ZCU_SETTING:
                    return REQUEST_VEHICLE_MANAGER;

                case ACTION_RESET:
                case ACTION_STOP:
                case ACTION_INITIALIZE:
                case ACTION_STATUS:
                case ACTION_MTL_IN:
                case ACTION_MTL_OUT:
                case ACTION_RAIL_IN:
                case ACTION_RAIL_OUT:
                case ACTION_REMOVE:
                case ACTION_UPDATE_MAP:
                case ACTION_GET_MAP_INFO:
                case ACTION_SET_BEHAVIOR:
                case ACTION_CALCULATE_PATH:
                case ACTION_CLEAR_PATH:
                    return REQUEST_VEHICLE;

                case ACTION_DISABLE_SEGMENT:
                case ACTION_ENABLE_SEGMENT:
                case ACTION_DISABLE_HOME:
                case ACTION_ENABLE_HOME:
                    return REQUEST_TRACK;

                case ACTION_ZCU_GO:
                case ACTION_ZCU_USING_TYPE:
                case ACTION_ZCU_RESET:
                    return REQUEST_ZCU;

                case ACTION_INSTALL_CARRIER:
                case ACTION_REMOVE_CARRIER:
                case ACTION_RENAME_CARRIER:
                    return REQUEST_CARRIER;

                case ACTION_N:
                case ACTION_A:
                case ACTION_C:
                case ACTION_M:
                    return REQUEST_ORDER;
            }
            return null;
        }

        public string GetUser(CommandMessageDto command)
        {
            if (string.IsNullOrWhiteSpace(command.User) == false)
                return command.User;
            return string.Empty;
        }

        public string GetNote(CommandMessageDto command)
        {
            if (string.IsNullOrWhiteSpace(command.Note) == false)
                return command.Note;
            return string.Empty;
        }

        public object GetVehicleId(CommandMessageDto command)
        {
            if (command.VehicleId != null && (command.VehicleIds == null || command.VehicleIds.Length == 0))
            {
                int numericValue;
                bool isNumber = int.TryParse(command.VehicleId, out numericValue);
                if (isNumber)
                    return numericValue;

                return command.VehicleId;
            }

            return command.VehicleIds;
        }

        public object GetOrderOrigin(CommandMessageDto command)
        {
            if (command.hostOrder) // true or false
                return ORIGIN_HOST_ORDER;

            return ORIGIN_LOCAL_ORDER;
        }

        public object GetAlarmErrorCode(CommandMessageDto command)
        {
            return command.AlarmCode;
        }
        public object GetWarningId(CommandMessageDto command)
        {
            if (command.WarningIds != null)
            {
                if (command.WarningIds.Length > 0)
                    if (command.WarningIds[0] == -1)
                        return "*"; // all selected
                    else
                        return command.WarningIds[0];  // use single selection
            }

            if (command.WarningId == -1)
                return "*";

            return command.WarningId;
        }
        public object GetWarningAckBy(CommandMessageDto command)
        {
            return command.WarningAckBy;
        }
        public object GetZcuId(CommandMessageDto command)
        {
            if (command.ZcuId != null && command.ZcuIds == null)
                return command.ZcuId;

            return command.ZcuIds;
        }

        public string GetLocationPickup(CommandMessageDto command)
        {
            if (string.Equals(command.LocationPickupType, "Station", StringComparison.OrdinalIgnoreCase))
                return "s" + command.LocationPickup;
            if (string.Equals(command.LocationPickupType, "Buffer", StringComparison.OrdinalIgnoreCase))
                return "b" + command.LocationPickup;
            if (string.Equals(command.LocationPickupType, "Point", StringComparison.OrdinalIgnoreCase))
                return "p" + command.LocationPickup;
            return null;
        }

        public string GetLocationDropoff(CommandMessageDto command)
        {
            if (string.Equals(command.LocationDropoffType, "Station", StringComparison.OrdinalIgnoreCase))
                return "s" + command.LocationDropoff;
            if (string.Equals(command.LocationDropoffType, "Buffer", StringComparison.OrdinalIgnoreCase))
                return "b" + command.LocationDropoff;
            if (string.Equals(command.LocationDropoffType, "Point", StringComparison.OrdinalIgnoreCase))
                return "p" + command.LocationDropoff;
            return null;
        }

        public string GetLocationMove(CommandMessageDto command)
        {
            if (string.Equals(command.LocationMoveType, "Station", StringComparison.OrdinalIgnoreCase))
                return "s" + command.LocationMove;
            if (string.Equals(command.LocationMoveType,"Buffer", StringComparison.OrdinalIgnoreCase))
                return "b" + command.LocationMove;
            if (string.Equals(command.LocationMoveType, "Point", StringComparison.OrdinalIgnoreCase))
                return "p" + command.LocationMove;
            return null;
        }

        public string NowUTCString()
        {
            string dateFormat = "yyyy-MM-ddT HH:mm:ss.ffffff";

            // now utc date time
            DateTime dT = new DateTime();
            dT = DateTime.UtcNow;
            return dT.ToString(dateFormat);
        }

        public string GenerateLogicalID(string base_id)
        {
            if (base_id == null || "".Equals(base_id))
            {
                return string.Format("OMS_{0}", NowUTCString());
            }
            return base_id.Replace('-', '_');
        }

        public List<string> GetPayload(CommandMessageDto command)
        {
            if (command == null) return null;
            if (command.Action == null) return null;

            Dictionary<string, object> data = new Dictionary<string, object>();
            if (command.Action != null)
            {
                data["request"] = GetRequest(command.Action);
                data["action"] = GetAction(command.Action);
            }

            if (command.Action == ACTION_CONTROL_STATE ||
                command.Action == ACTION_TSC_STATE)
            {
                if (command.State != null)
                    data["state"] = command.State;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_MAP_UPDATE)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_AI_MODE)
            {
                if (command.State != null)
                    data["mode"] = command.Mode;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_HOME_MODE)
            {
                if (command.Mode != null)
                    data["mode"] = command.Mode;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_IVR_MODE)
            {
                if (command.Mode != null)
                    data["mode"] = command.Mode;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_CHAIN_MANUAL_COMMAND_DISABLED)
            {
                if (command.Mode != null)
                    data["mode"] = command.Mode;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_RESET_VEHICLE_MILEAGE_TOTAL)
            {
                data["vehicle_id"] = GetVehicleId(command);
                if (command.Mode != null)
                    data["mode"] = command.Mode;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_PAUSE ||
                     command.Action == ACTION_RESUME)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_ALARM_CLEAR)
            {
                data["vehicle_id"] = GetVehicleId(command);
                data["error_code"] = GetAlarmErrorCode(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_WARNING_CLEAR)
            {
                data["id"] = GetWarningId(command);
                data["ack_by"] = GetWarningAckBy(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_MTL_IN || command.Action == ACTION_MTL_OUT)
            {
                data["vehicle_id"] = GetVehicleId(command);
                if (command.MtlId != null)
                    data["mtl_id"] = command.MtlId;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_RESET || command.Action == ACTION_STOP ||
                     command.Action == ACTION_RAIL_IN || command.Action == ACTION_RAIL_OUT ||
                     command.Action == ACTION_REMOVE || command.Action == ACTION_UPDATE_MAP ||
                     command.Action == ACTION_GET_MAP_INFO)
            {
                data["vehicle_id"] = GetVehicleId(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_INITIALIZE)
            {
                data["vehicle_id"] = GetVehicleId(command);

                if (command.Direction != null)
                    data["direction"] = command.Direction;
                else
                    data["direction"] = DEFAULT_DIRECTION;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: auto");
            }
            else if (command.Action == ACTION_SET_BEHAVIOR)
            {
                if (command.VehicleId != null || command.VehicleIds != null)
                    data["vehicle_id"] = GetVehicleId(command);

                if (command.CanBePushed != null)
                {
                    data["can_be_pushed"] = command.CanBePushed;

                    Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: ACTION_PUSH_DISABLE");
                }
                else
                {
                    if (command.OrderOrigin == null)
                    {
                        data["order_origin"] = GetOrderOrigin(command);

                        data["user"] = GetUser(command);
                        data["note"] = GetNote(command);

                        Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: ACTION_HOST_COMMAND_DISABLE");
                    }
                }
            }
            else if (command.Action == ACTION_CALCULATE_PATH ||
                     command.Action == ACTION_CLEAR_PATH)
            {
                if (command.VehicleId != null || command.VehicleIds != null)
                    data["vehicle_id"] = GetVehicleId(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_DISABLE_SEGMENT ||
                     command.Action == ACTION_ENABLE_SEGMENT)
            {
                if (command.SegmentId != null)
                {
                    data["segment_id"] = command.SegmentId;
                    data["source"] = "uid-admin";
                    data["reason"] = "";
                }

                data["user"] = GetUser(command);
                data["note"] = GetNote(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_DISABLE_HOME ||
                     command.Action == ACTION_ENABLE_HOME)
            {
                if (command.PointId != null)
                {
                    data["point_id"] = command.PointId;
                }
                if (command.GroupId != null)
                {
                    data["group_id"] = command.GroupId;
                }
                else if (command.GroupIds != null)
                {
                    data["group_id"] = command.GroupIds;
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_GROUP_SETTING)
            {
                try
                {
                    data["group"] = command.GroupId;
                    data["home_pt"] = command.HomeIds;
                    data["home_pt_removed"] = command.HomeIds_Removed;
                    data["station_id"] = command.StationIds;
                    data["station_id_removed"] = command.StationIds_Removed;
                    data["buffer_id"] = command.BufferIds;
                    data["buffer_id_removed"] = command.BufferIds_Removed;
                    data["vehicle_id"] = command.VehicleIds;
                    data["vehicle_id_removed"] = command.VehicleIds_Removed;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_CLUSTER_SETTING)
            {
                try
                {
                    data["cluster"] = command.ClusterId;
                    data["max_vehicle"] = command.MaxVehicles;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_SEGMENT_SETTING)
            {
                try
                {
                    if (command.Type == "SEGMENT-ALL")
                    {
                        data["id"] = "*";
                        data["speed_ratio"] = command.SpeedRatio;
                    }
                    else
                    {
                        data["id"] = command.SegmentIds;
                        data["speed_ratio"] = command.SpeedRatios;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_STATION_SETTING)
            {
                try
                {
                    data["id"] = command.StationIds;
                    data["unused"] = command.Unused;

                    data["user"] = GetUser(command);
                    data["note"] = GetNote(command);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_BUFFER_SETTING)
            {
                try
                {
                    data["id"] = command.BufferIds;
                    data["unused"] = command.Unused;

                    data["user"] = GetUser(command);
                    data["note"] = GetNote(command);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_VEHICLE_SETTING)
            {
                try
                {
                    data["id"] = command.VehicleIds;
                    data["id_removed"] = command.VehicleIds_Removed;
                    data["online_name"] = command.LogicalIds;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_ZCU_GO)
            {
                if (command.VehicleId != null || command.VehicleIds != null)
                    data["vehicle_id"] = GetVehicleId(command);

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_ZCU_SETTING)
            {
                data["id"] = GetZcuId(command);
                data["using_type"] = command.ZcuUsingType switch
                {
                    "none" => 0,
                    "hw" => 1,
                    "sw" => 2,
                    _ => throw new NotImplementedException(),
                };

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_ZCU_USING_TYPE)
            {
                if (command.ZcuId != null || command.ZcuIds != null)
                    data["zcu_id"] = GetZcuId(command);

                if (command.ZcuUsingType != null)
                    data["zcu_using_type"] = command.ZcuUsingType;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_ZCU_RESET)
            {
                if (command.ZcuId != null || command.ZcuIds != null)
                    data["zcu_id"] = GetZcuId(command);

                if (command.ZcuUsingType != null)
                    data["type"] = command.ZcuUsingType;

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_INSTALL_CARRIER ||
                     command.Action == ACTION_REMOVE_CARRIER ||
                     command.Action == ACTION_RENAME_CARRIER)
            {
                if (command.CarrierLabel != null)
                    data["carrier_id"] = command.CarrierLabel.Trim();

                if (command.NewCarrierId != null)
                    data["new_carrier_id"] = command.NewCarrierId.Trim();

                if (command.LogicalId != null)
                {
                    data["carrier_loc"] = command.LogicalId;
                    data["location_type"] = "b";
                    data["manual"] = true;
                    data["user_id"] = "admin";
                    data["note"] = "";
                }
                else if (command.BufferId != null)
                {
                    data["carrier_loc"] = "b" + command.BufferId;
                    data["location_type"] = "b";
                    data["manual"] = true;
                    data["user_id"] = "admin";
                    data["note"] = "";
                }
                else if (command.VehicleId != null)
                {
                    data["carrier_loc"] = "v" + command.VehicleId;
                    data["location_type"] = "v";
                    data["manual"] = true;
                    data["user_id"] = "admin";
                    data["note"] = "";
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: {command.Action}");
            }
            else if (command.Action == ACTION_N)
            {
                data["logical_id"] = GenerateLogicalID("");

                if (command.VehicleId != null || command.VehicleIds != null) data["vehicle_id"] = GetVehicleId(command);
                if (command.LocationPickup != null) data["location_pickup"] = GetLocationPickup(command);
                if (command.LocationDropoff != null) data["location_dropoff"] = GetLocationDropoff(command);
                if (command.LocationMove != null) data["location_move"] = GetLocationMove(command);
                if (command.CarrierLabel != null) data["carrier_id"] = command.CarrierLabel;
                
                data["priority"] = command.Priority != null ? command.Priority : DEFAULT_PRIORITY;

                if (command.CommandID != null)
                {
                    data["logical_id"] = command.CommandID;
                    data["commandID"] = command.CommandID;
                }

                data["origin"] = ORIGIN_OMS;    // oms

                if (command.LocationPickup != null && command.LocationDropoff != null)
                    Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: Manual Transfer - fromto");
                else if (command.LocationPickup != null && command.LocationDropoff == null)
                    Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: Manual Transfer - from");
                else if (command.LocationPickup == null && command.LocationDropoff != null)
                    Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: Manual Transfer - to");
                else if (command.LocationPickup == null && command.LocationDropoff == null && command.LocationMove != null)
                    Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: Manual Transfer - move");
            }
            else if (command.Action == ACTION_M)
            {
                if (command.CommandID != null)          data["command_id"] = command.CommandID;
                if (command.LocationDropoff != null)    data["dest_port"] = command.LocationDropoff;
                if (command.Priority != null)           data["priority"] = command.Priority;
                data["origin"] = ORIGIN_OMS;    // oms

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: update");
            }
            else if (command.Action == ACTION_A ||
                     command.Action == ACTION_C)
            {
                if (command.OrderId != null)          data["order_id"] = command.OrderId;

                data["origin"] = ORIGIN_OMS;    // oms

                if      (command.Action == ACTION_A) Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: abort");
                else if (command.Action == ACTION_C) Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: cancel");
            }

            // build JSON list
            List<string> results = new List<string>();
            results.Add(JsonConvert.SerializeObject(data));

            return results;
        }
    }
}
