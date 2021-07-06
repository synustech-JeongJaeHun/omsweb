using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using OMSWeb.Models;
using OMSWeb.Services.MqttClient;

namespace OMSWeb.Services
{
  public class MessageService
  {
        private readonly IMqttClientService _mqttClientService;

    public MessageService(MqttClientServiceProvider provider)
    {
        _mqttClientService = provider.MqttClientService;
    }

    public Task SendMessage(CommandMessageDto command)
    {
        // Console.WriteLine($"# SendMessage -> {command.Type}, {command.Action}, {command.OrderId}");
        MqttMessage m = new MqttMessage();
        string topic = m.GetTopic(command);
        List<string> payloads = m.GetPayload(command);

        if (topic == null || payloads == null)
        {
            return Task.CompletedTask;
        }

        foreach (string payload in payloads)
        {
            _mqttClientService.SendMessage(topic, payload);
        }

        return Task.CompletedTask;
    }
  }
}