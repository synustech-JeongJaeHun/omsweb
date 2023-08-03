using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Connecting;
using MQTTnet.Client.Disconnecting;
using MQTTnet.Client.Options;
using MQTTnet.Implementations;
using MQTTnet.Protocol;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;
using OMSWeb.Logger;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using OMSWeb.OMSSettings;

namespace OMSWeb.Services
{
    public class MqttClientService : IMqttClientService
    {
        private IMqttClient mqttClient;
        private IMqttClientOptions options;
        private List<string> subTopicList;

        public MqttClientService(IMqttClientOptions options)
        {
            this.options = options;
            this.subTopicList = GetSubTopicList();

            mqttClient = new MqttFactory().CreateMqttClient();
            ConfigureMqttClient();
        }

        public List<string> GetSubTopicList()
        {
            List<string> subTopicList = new List<string>();
            subTopicList.Add("oms/map-update/status");

            return subTopicList;
        }


        private void ConfigureMqttClient()
        {
            mqttClient.ConnectedHandler = this;
            mqttClient.DisconnectedHandler = this;
            mqttClient.ApplicationMessageReceivedHandler = this;
        }

        public bool IsMapUpdateStatus(string topic)
        {
            if (topic.StartsWith("oms/map-update"))
                return true;
            return false;
        }

        public void GetNotifyParam(JObject json, string key, out string value)
        {
            value = (json.ContainsKey(key)) ? json[key].ToString() : null;
            if (value == null) value = string.Empty;
        }
        public void GetNotifyParam(JObject json, string key, out int value)
        {
            GetNotifyParam(json, key, out string v);
            if (v == null || string.Empty.Equals(v)) v = "0";
            value = Convert.ToInt32(v);
        }
        public void GetNotifyParam(JObject json, string key, out uint value)
        {
            GetNotifyParam(json, key, out string v);
            value = Convert.ToUInt32(v);
        }
        public void GetNotifyParam(JObject json, string key, out byte value)
        {
            GetNotifyParam(json, key, out string v);
            value = Convert.ToByte(v);
        }
        public void GetNotifyParam(JObject json, string key, out bool value)
        {
            GetNotifyParam(json, key, out string v);
            value = Convert.ToBoolean(v);
        }

        public void NotifyMapUpdateProc(string payload)
        {
            JObject json = JObject.Parse(payload);

            GetNotifyParam(json, "action", out string action);
            GetNotifyParam(json, "status", out string status);
            GetNotifyParam(json, "worker", out string worker);

            if (string.Equals(worker, "map-editor", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(worker, "omsweb", StringComparison.OrdinalIgnoreCase))
            {
                if (string.Equals(status, "start", StringComparison.OrdinalIgnoreCase))
                {
                    AppConfig.Lock_of_Mapupdate();
                    
                    Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"map-update -> {status}");
                }
                else if (string.Equals(status, "failed", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(status, "complete", StringComparison.OrdinalIgnoreCase))
                {
                    AppConfig.Unlock_of_Mapupdate();

                    Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"map-update -> {status}");
                }
            }
        }


        public Task HandleApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs eventArgs)
        {
            try
            {
                string topic = eventArgs.ApplicationMessage.Topic;
                string payload = Encoding.UTF8.GetString(eventArgs.ApplicationMessage.Payload);

                if (IsMapUpdateStatus(topic))
                {
                    NotifyMapUpdateProc(payload);
                }

                // System.Console.WriteLine($"Topic: {topic}. Message Received: {payload}");
            }
            catch (Exception ex)
            {
                System.Console.WriteLine(ex.Message, ex);
            }

            return Task.CompletedTask;
        }

        public async Task HandleConnectedAsync(MqttClientConnectedEventArgs eventArgs)
        {
            try
            {
                System.Console.WriteLine("connected to mqtt broker");
                if (this.subTopicList != null)
                {
                    foreach (string topic in this.subTopicList)
                    {
                        await mqttClient.SubscribeAsync(topic, MqttQualityOfServiceLevel.AtMostOnce);
                    }
                }
            }
            catch (Exception ex)
            {
                string s = string.Format("MqttClientService.HandleConnectedAsync exception : {0}", ex.Message);
                Console.WriteLine(s);
            }
        }

        public async Task HandleDisconnectedAsync(MqttClientDisconnectedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(1));
                await mqttClient.ConnectAsync(options, CancellationToken.None);
            }
            catch (Exception ex) 
            {
                string s = string.Format("MqttClientService.HandleDisconnectedAsync exception : {0}", ex.Message);
                Console.WriteLine(s);
            }
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                await mqttClient.ConnectAsync(options);
                if (!mqttClient.IsConnected)
                {
                    await mqttClient.ReconnectAsync();
                }
            }
            catch (Exception ex)
            {
                string s = string.Format("MqttClientService.StartAsync exception : {0}", ex.Message);
                Console.WriteLine(s);
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if(cancellationToken.IsCancellationRequested)
            {
                var disconnectOption = new MqttClientDisconnectOptions
                {
                    ReasonCode = MqttClientDisconnectReason.NormalDisconnection,
                    ReasonString = "NormalDiconnection"
                };
                await mqttClient.DisconnectAsync(disconnectOption, cancellationToken);
            }
            await mqttClient.DisconnectAsync();
        }

        public async Task SendMessage(string topic, string payload)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, "PACKET: topic={0}, payload={1}", topic, payload);

            Console.WriteLine("topic={0}, payload={1}", topic, payload);
            await mqttClient.PublishAsync(topic, payload, MqttQualityOfServiceLevel.AtMostOnce);
        }

        public async Task SendMessage(string topic, string payload, String loginId)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, "PACKET: topic={0}, payload={1}, login_id={2}", topic, payload, loginId);

            Console.WriteLine("topic={0}, payload={1}, login_id={2}", topic, payload, loginId);
            await mqttClient.PublishAsync(topic, payload, MqttQualityOfServiceLevel.AtMostOnce);
        }
    }
}
