using Newtonsoft.Json;
using OMSWeb.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Services.MqttClient
{
    public class MqttMessage
    {
        public const string TOPIC_DEFAULT = "oms/vehicle-manager/request";

        public const string REQUEST_HAS = "has";
        public const string REQUEST_VEHICLE_MANAGER = "vehicle_manager";
        public const string REQUEST_VEHICLE = "vehicle";
        public const string REQUEST_TRACK = "track";
        public const string REQUEST_PORT = "port";
        public const string REQUEST_ZCU = "zcu";
        public const string REQUEST_ORDER = "order";

        public const string ACTION_CONTROL_STATE = "control_state";
        public const string ACTION_TSC_STATE = "tsc_state";
        public const string ACTION_AI_MODE = "ai_mode";
        public const string ACTION_PAUSE = "pause";
        public const string ACTION_RESUME = "resume";
        public const string ACTION_RESET = "reset";
        public const string ACTION_STOP = "stop";                           // estop
        public const string ACTION_INITIALIZE = "initialize";               // set vehicle auto
        public const string ACTION_STATUS = "status";
        public const string ACTION_RAIL_IN = "rail_in";
        public const string ACTION_REMOVE = "remove";                       // rail_out
        public const string ACTION_UPDATE_MAP = "update_map";
        public const string ACTION_GET_MAP_INFO = "get_map_info";
        public const string ACTION_SET_BEHAVIOR = "set_behavior";           // push enable, host order enable
        public const string ACTION_CALCULATE_PATH = "calculate_path";
        public const string ACTION_CLEAR_PATH = "clear_path";
        public const string ACTION_DISABLE_SEGMENT = "disable-segment";
        public const string ACTION_ENABLE_SEGMENT = "enable-segment";
        public const string ACTION_ZCU_GO = "zcu_go";
        public const string ACTION_ZCU_USING_TYPE = "zcu_using_type";
        public const string ACTION_INSTALL_CARRIER = "install_carrier";
        public const string ACTION_REMOVE_CARRIER = "remove_carrier";
        public const string ACTION_N = "N";                                 // fromto, from, to, move
        public const string ACTION_A = "A";                                 // abort order            
        public const string ACTION_C = "C";                                 // cancel order

        public const string ORIGIN_DEFAULT = "OMS";
        public const string ORIGIN_OMS = "OMS";

        public MqttMessage()
        {

        }

        public string GetTopic(CommandMessageDto command)
        {
            if (command == null) return null;
            if (command.Action == null) return null;

            switch (command.Action)
            {
                case ACTION_CONTROL_STATE:
                case ACTION_TSC_STATE:
                case ACTION_AI_MODE:
                case ACTION_PAUSE:
                case ACTION_RESUME:
                case ACTION_RESET:
                case ACTION_STOP:
                case ACTION_INITIALIZE:
                case ACTION_STATUS:
                case ACTION_RAIL_IN:
                case ACTION_REMOVE:
                case ACTION_UPDATE_MAP:
                case ACTION_GET_MAP_INFO:
                case ACTION_SET_BEHAVIOR:
                case ACTION_CALCULATE_PATH:
                case ACTION_CLEAR_PATH:
                case ACTION_DISABLE_SEGMENT:
                case ACTION_ENABLE_SEGMENT:
                case ACTION_ZCU_GO:
                case ACTION_ZCU_USING_TYPE:
                case ACTION_INSTALL_CARRIER:
                case ACTION_REMOVE_CARRIER:
                case ACTION_N:
                case ACTION_A:
                case ACTION_C:
                    return TOPIC_DEFAULT;   // "oms/vehicle-manager/request";
            }

            return null;
        }

        public string GetRequest(string action)
        {
            switch (action)
            {
                case ACTION_CONTROL_STATE:
                case ACTION_TSC_STATE:
                    return REQUEST_HAS;

                case ACTION_AI_MODE:
                case ACTION_PAUSE:
                case ACTION_RESUME:
                    return REQUEST_VEHICLE_MANAGER;

                case ACTION_RESET:
                case ACTION_STOP:
                case ACTION_INITIALIZE:
                case ACTION_STATUS:
                case ACTION_RAIL_IN:
                case ACTION_REMOVE:
                case ACTION_UPDATE_MAP:
                case ACTION_GET_MAP_INFO:
                case ACTION_SET_BEHAVIOR:
                case ACTION_CALCULATE_PATH:
                case ACTION_CLEAR_PATH:
                    return REQUEST_VEHICLE;

                case ACTION_DISABLE_SEGMENT:
                case ACTION_ENABLE_SEGMENT:
                    return REQUEST_TRACK;

                case ACTION_ZCU_GO:
                case ACTION_ZCU_USING_TYPE:
                    return REQUEST_ZCU;

                case ACTION_INSTALL_CARRIER:
                case ACTION_REMOVE_CARRIER:
                    return REQUEST_PORT;

                case ACTION_N:
                case ACTION_A:
                case ACTION_C:
                    return REQUEST_ORDER;
            }
            return null;
        }

        public object GetVehicleId(CommandMessageDto command)
        {
            if (command.VehicleId != null && command.VehicleIds == null)
            {
                int numericValue;
                bool isNumber = int.TryParse(command.VehicleId, out numericValue);
                if (isNumber)
                    return numericValue;

                return command.VehicleId;
            }

            return command.VehicleIds;
        }
        public object GetZcuId(CommandMessageDto command)
        {
            if (command.ZcuId != null && command.ZcuIds == null)
                return command.ZcuId;

            return command.ZcuIds;
        }

        public string GetLocationPickup(CommandMessageDto command)
        {
            if (command.LocationPickupType == "Station")
                return "s" + command.LocationPickup;
            if (command.LocationPickupType == "Buffer")
                return "b" + command.LocationPickup;
            if (command.LocationPickupType == "Point")
                return "p" + command.LocationPickup;
            return null;
        }

        public string GetLocationDropoff(CommandMessageDto command)
        {
            if (command.LocationDropoffType == "Station")
                return "s" + command.LocationDropoff;
            if (command.LocationDropoffType == "Buffer")
                return "b" + command.LocationDropoff;
            if (command.LocationDropoffType == "Point")
                return "p" + command.LocationDropoff;
            return null;
        }

        public string GetLocationMove(CommandMessageDto command)
        {
            if (command.LocationMoveType == "Station")
                return "s" + command.LocationMove;
            if (command.LocationMoveType == "Buffer")
                return "b" + command.LocationMove;
            if (command.LocationMoveType == "Point")
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
                data["action"]  = command.Action;
            }

            if (command.Action == ACTION_CONTROL_STATE || 
                command.Action == ACTION_TSC_STATE)
            {
                if (command.State != null) 
                    data["state"] = command.State;
            }
            else if (command.Action == ACTION_AI_MODE)
            {
                if (command.State != null) 
                    data["mode"] = command.Mode;
            }
            else if (command.Action == ACTION_PAUSE || 
                     command.Action == ACTION_RESUME)
            {

            }
            else if (command.Action == ACTION_RESET      || command.Action == ACTION_STOP         || 
                     command.Action == ACTION_INITIALIZE || command.Action == ACTION_STATUS       || 
                     command.Action == ACTION_RAIL_IN    || command.Action == ACTION_REMOVE       ||
                     command.Action == ACTION_UPDATE_MAP || command.Action == ACTION_GET_MAP_INFO)
            {
                data["vehicle_id"] = GetVehicleId(command);
            }
            else if (command.Action == ACTION_SET_BEHAVIOR)
            {
                if (command.VehicleId != null || command.VehicleIds != null)
                    data["vehicle_id"] = GetVehicleId(command);

                if (command.OrderOrigin != null)  
                    data["order_origin"]  = command.OrderOrigin;

                if (command.CanBePushed != null)  
                    data["can_be_pushed"] = command.CanBePushed;
            }
            else if (command.Action == ACTION_CALCULATE_PATH || 
                     command.Action == ACTION_CLEAR_PATH)
            {
                if (command.VehicleId != null || command.VehicleIds != null)
                    data["vehicle_id"] = GetVehicleId(command);
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
            }
            else if (command.Action == ACTION_ZCU_GO)
            {
                if (command.VehicleId != null || command.VehicleIds != null) 
                    data["vehicle_id"] = GetVehicleId(command);
            }
            else if (command.Action == ACTION_ZCU_USING_TYPE)
            {
                if (command.ZcuId != null || command.ZcuIds != null) 
                    data["zcu_id"] = GetZcuId(command);

                if (command.ZcuUsingType != null) 
                    data["zcu_using_type"] = command.ZcuUsingType;
            }
            else if (command.Action == ACTION_INSTALL_CARRIER || 
                     command.Action == ACTION_REMOVE_CARRIER)
            {
                if (command.CarrierLabel != null) 
                    data["carrier_id"] = command.CarrierLabel;
            }
            else if (command.Action == ACTION_N)
            {
                data["logical_id"] = GenerateLogicalID("");

                if (command.VehicleId != null || command.VehicleIds != null) 
                    data["vehicle_id"] = GetVehicleId(command);

                if (command.LocationPickup != null)  
                    data["location_pickup"]  = GetLocationPickup(command);

                if (command.LocationDropoff != null) 
                    data["location_dropoff"] = GetLocationDropoff(command);

                if (command.LocationMove    != null) 
                    data["location_move"]    = GetLocationMove(command);

                data["origin"] = ORIGIN_OMS;    // oms
            }
            else if (command.Action == ACTION_A || 
                     command.Action == ACTION_C)
            {
                if (command.OrderId != null) 
                    data["order_id"] = command.OrderId;

                data["origin"]   = ORIGIN_OMS;    // oms
            }

            // build JSON list
            List<string> results = new List<string>();
            results.Add(JsonConvert.SerializeObject(data));

            return results;
        }
    }
}
