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

namespace OMSWeb.Services
{
    public class MqttClientService : IMqttClientService
    {
        private IMqttClient mqttClient;
        private IMqttClientOptions options;

        public MqttClientService(IMqttClientOptions options)
        {
            this.options = options;
            mqttClient = new MqttFactory().CreateMqttClient();
            ConfigureMqttClient();
        }

        private void ConfigureMqttClient()
        {
            mqttClient.ConnectedHandler = this;
            mqttClient.DisconnectedHandler = this;
            mqttClient.ApplicationMessageReceivedHandler = this;
        }

        public Task HandleApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs eventArgs)
        {
            //throw new System.NotImplementedException();
            try
            {
                string topic = eventArgs.ApplicationMessage.Topic;

                if (string.IsNullOrWhiteSpace(topic) == false)
                {
                    string payload = Encoding.UTF8.GetString(eventArgs.ApplicationMessage.Payload);
                    System.Console.WriteLine($"Topic: {topic}. Message Received: {payload}");

                    //mqttClient.PublishAsync("hello/cyg", "this is a law dakjsjfd", MqttQualityOfServiceLevel.AtMostOnce);
                }
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
                System.Console.WriteLine("connected");
                await mqttClient.SubscribeAsync("oms/track", MqttQualityOfServiceLevel.AtMostOnce);
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
            await mqttClient.PublishAsync(topic, payload, MqttQualityOfServiceLevel.AtMostOnce);
        }
    }
}
