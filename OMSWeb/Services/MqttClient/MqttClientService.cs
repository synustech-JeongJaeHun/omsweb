using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Connecting;
using MQTTnet.Client.Disconnecting;
using MQTTnet.Client.Options;
using MQTTnet.Protocol;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OMSWeb.Logger;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using OMSWeb.OMSSettings;
using Newtonsoft.Json;
using MQTTnet.Client.Publishing;
using OMSWeb.Services.MqttClient;

namespace OMSWeb.Services
{
    public class MqttClientService : IMqttClientService
    {
        private IMqttClient mqttClient;
        private IMqttClientOptions options;
        private List<string> subTopicList;
        private PushService _pushService;
        private CacheService _cache;

        public MqttClientService(IMqttClientOptions options, PushService pushService, CacheService cacheService)
        {
            this.options = options;
            this.subTopicList = GetSubTopicList();
            this._pushService = pushService;
            this._cache = cacheService;

            mqttClient = new MqttFactory().CreateMqttClient();
            ConfigureMqttClient();
        }

        public List<string> GetSubTopicList()
        {
            List<string> subTopicList = new List<string>();
            subTopicList.Add("oms/map-update/status");
            subTopicList.Add("oms/alive/request");

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

        public bool IsAliveRequest(string topic)
        {
            if (topic.StartsWith("oms/alive/request"))
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
                try
                {
                    if (string.Equals(status, "start", StringComparison.OrdinalIgnoreCase))
                    {
                        AppConfig.Lock_of_Mapupdate();

                        Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"map-update -> {status}");
                    }
                    else if (string.Equals(status, "failed", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(status, "complete", StringComparison.OrdinalIgnoreCase))
                    {

                        if (string.Equals(status, "complete", StringComparison.OrdinalIgnoreCase))
                        {
                            var now = DateTime.Now;
                            var ts = now.Ticks;

                            _pushService.PushWatcherEventAsync(ts,
                                "{\"table\" : \"db_version\", \"operation\" : \"UPDATE\", \"id\" : 1}");
                        }

                        AppConfig.Unlock_of_Mapupdate();
                        this._cache.ClearMap();

                        Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"map-update -> {status}");
                    }
                }
                catch (Exception e)
                {
                    AppConfig.Unlock_of_Mapupdate();
                    Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"map-update-fail -> {status}");
                }
            }
        }

        public async Task NotifyAliveRequestProc()
        {
            try
            {
                // response alive status
                Dictionary<string, object> data_end = new Dictionary<string, object>();
                data_end.Add("request", "alive");
                data_end.Add("action", "status");
                data_end.Add("module", "omsweb");

                await SendMessage(MqttMessage.TOPIC_ALIVE_STATUS, JsonConvert.SerializeObject(data_end));
            }
            catch (Exception e) 
            {
                Log.FilePrint(LogType.HOST, LogEventLevel.Information, $"alive-response-fail");
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
                else if (IsAliveRequest(topic))
                {
                    _ = NotifyAliveRequestProc();
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
