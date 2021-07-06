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
        public string TOPIC = "oms/vehicle-manager/request";
        public string REQUEST_VEHICLE_MANAGER = "vehicle_manager";
        public string REQUEST_VEHICLE = "vehicle";
        public string REQUEST_TRACK = "track";
        public string REQUEST_PORT = "port";
        public string REQUEST_ZCU = "zcu";
        public string REQUEST_ORDER = "order";

        public MqttMessage()
        {

        }

        public string GetTopic(CommandMessageDto command)
        {
            if (command == null) return null;
            if (command.Action == null) return null;
            if (command.Action == "host_state") return "oms/vehicle-manager/request";
            if (command.Action == "tsc_state") return "oms/vehicle-manager/request";
            if (command.Action == "ai_mode") return "oms/vehicle-manager/request";
            if (command.Action == "pause") return "oms/vehicle-manager/request";
            if (command.Action == "resume") return "oms/vehicle-manager/request";
            if (command.Action == "reset") return "oms/vehicle-manager/request";
            if (command.Action == "stop") return "oms/vehicle-manager/request";
            if (command.Action == "initialize") return "oms/vehicle-manager/request";
            if (command.Action == "status") return "oms/vehicle-manager/request";
            if (command.Action == "rail_in") return "oms/vehicle-manager/request";
            if (command.Action == "remove") return "oms/vehicle-manager/request";
            if (command.Action == "update_map") return "oms/vehicle-manager/request";
            if (command.Action == "set_behavior") return "oms/vehicle-manager/request";
            if (command.Action == "calculate_path") return "oms/vehicle-manager/request";
            if (command.Action == "clear_path") return "oms/vehicle-manager/request";
            if (command.Action == "disable-segment") return "oms/vehicle-manager/request";
            if (command.Action == "enable-segment") return "oms/vehicle-manager/request";
            if (command.Action == "zcu_go") return "oms/vehicle-manager/request";
            if (command.Action == "zcu_using_type") return "oms/vehicle-manager/request";
            if (command.Action == "install_carrier") return "oms/vehicle-manager/request";
            if (command.Action == "remove_carrier") return "oms/vehicle-manager/request";
            if (command.Action == "go") return "oms/vehicle-manager/request";
            if (command.Action == "load") return "oms/vehicle-manager/request";
            if (command.Action == "unload") return "oms/vehicle-manager/request";
            if (command.Action == "A") return "oms/vehicle-manager/request";
            if (command.Action == "C") return "oms/vehicle-manager/request";

            return null;
        }

        public string GetRequest(string action)
        {
            switch (action)
            {
                case "control_state":
                case "tsc_state":
                case "ai_mode":
                case "pause":           // pause
                case "resume":          // auto
                    return REQUEST_VEHICLE_MANAGER;

                case "reset":
                case "stop":            // estop
                case "initialize":      // set vehicle auto
                case "status":
                case "rail_in":
                case "remove":          // rail_out
                case "update_map":
                case "set_behavior":    // push enable, host order enable
                case "calculate_path":
                case "clear_path":
                    return REQUEST_VEHICLE;

                case "disable-segment":
                case "enable-segment":
                    return REQUEST_TRACK;

                case "zcu_go":
                case "zcu_using_type":
                    return REQUEST_ZCU;

                case "install_carrier":
                case "remove_carrier":
                    return REQUEST_PORT;

                case "go":
                case "load":
                case "unload":
                case "A":                       // abort order
                case "C":                       // abort cancel
                    return REQUEST_ORDER;
            }
            return null;
        }

        public List<string> GetPayload(CommandMessageDto command)
        {
            if (command == null) return null;
            if (command.Action == null) return null;

            Dictionary<string, object> data = new Dictionary<string, object>();

            data["request"] = GetRequest(command.Action);
            data["action"] = command.Action;
            data["timestamp"] = 1623133510566;

            switch (command.Type)
            {
                case "VEHICLE":
                    data["vehicle_id"] = command.VehicleIds;
                    break;
                case "ORDER":
                    data["order_id"] = command.OrderId;
                    break;
                case "SEGMENT":
                    data["segment_id"] = command.SegmentId;
                    break;
            }

            List<string> results = new List<string>();
            results.Add(JsonConvert.SerializeObject(data));

            return results;

            /*
            if (command.Action == "tsc_mode")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE_MANAGER;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));

            }
            if (command.Action == "ai_mode")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE_MANAGER;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));

            }
            if (command.Action == "pause")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE_MANAGER;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));
            }
            if (command.Action == "resume")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE_MANAGER;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));
            }
            if (command.Action == "reset")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));
                foreach (int vehicle_id in command.VehicleIds)
                {
                    data["vehicle-id"] = vehicle_id;
                    payloads.Add(JsonConvert.SerializeObject(data));
                }
            }
            if (command.Action == "estop")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = REQUEST_VEHICLE;
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));

            }
            if (command.Action == "initialize")
            {

            }
            if (command.Action == "status")
            {

            }
            if (command.Action == "rail_in")
            {

            }
            if (command.Action == "remove")
            {

            }
            if (command.Action == "update_map")
            {

            }
            if (command.Action == "set_behavior")
            {

            }
            if (command.Action == "go")
            {

            }
            if (command.Action == "load")
            {

            }
            if (command.Action == "unload")
            {

            }
            if (command.Action == "calculate_path")
            {

            }
            if (command.Action == "clear_path")
            {

            }
            if (command.Action == "disable-segment")
            {

            }
            if (command.Action == "enable-segment")
            {

            }
            if (command.Action == "zcu_go")
            {

            }
            if (command.Action == "zcu_using_type") 
            {

            }
            if (command.Action == "install_carrier")
            {

            }
            if (command.Action == "remove_carrier")
            {

            }
            if (command.Action == "A")
            {

            }
            if (command.Action == "C")
            {

            }

            List<string> results = new List<string>();
            payloads.Add(JsonConvert.SerializeObject(data));

            if (command.Action == "pause" || 
                command.Action == "resume")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = "vehicle-manager";
                data["action"] = command.Action;
                payloads.Add(JsonConvert.SerializeObject(data));
            }
            else if (command.Action == "stop" || command.Action == "reset" || command.Action == "initialize" ||
                    command.Action == "host-order-enable" || command.Action == "push-enable" ||
                    command.Action == "rail-in" || command.Action == "remove")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = "vehicle";
                data["action"] = command.Action;
                foreach (int vehicle_id in command.VehicleIds)
                {
                    data["vehicle-id"] = vehicle_id;
                    payloads.Add(JsonConvert.SerializeObject(data));
                }
            }
            else if (command.Action == "go" || command.Action == "load" || command.Action == "unload" ||
                    command.Action == "carrier-install" || command.Action == "carrier-remove")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = "vehicle";
                data["action"] = command.Action;
                foreach (int vehicle_id in command.VehicleIds)
                {
                    data["vehicle-id"] = vehicle_id;
                    payloads.Add(JsonConvert.SerializeObject(data));
                }
            }
            else if (command.Action == "enable-segment" || command.Action == "disable-segment")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = "vehicle-manager";
                data["action"] = command.Action;
                data["segment_id"] = command.SegmentId;
                payloads.Add(JsonConvert.SerializeObject(data));
            }
            else if (command.Action == "zcu-go")
            {
                Dictionary<string, object> data = new Dictionary<string, object>();
                data["request"] = "vehicle-manager";
                data["action"] = command.Action;
                data["vehicle_id"] = command.VehicleId;
                payloads.Add(JsonConvert.SerializeObject(data));
            }
            return payloads;
            */
        }
    }
}
