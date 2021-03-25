using System;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Text.Json.Serialization;

using OMSWeb.Hubs;
using OMSWeb.Models;
using System.Collections.Generic;
using Newtonsoft.Json.Serialization;

namespace OMSWeb.Services
{
  public class PushService
  {
    private IHubContext<OMSHub> _hub;
    private IDictionary<string, DataChangeEventTarget> eventMap;
    private CacheService _cache;

    public PushService(IHubContext<OMSHub> hub, CacheService cacheSvc)
    {
      this._hub = hub;
      this._cache = cacheSvc;

      this.eventMap = new Dictionary<string, DataChangeEventTarget>() {
        {"point", new DataChangeEventTarget(CacheKeys.Points, new[]{"pointChanged"})},
        {"segments", new DataChangeEventTarget(CacheKeys.Segments, new[]{"segmentChanged"})},
        {"segment_blocking", new DataChangeEventTarget(CacheKeys.SegmentDisabled, new[]{"segmentDisabledChanged"}, true)},
        {"stations", new DataChangeEventTarget(CacheKeys.Stations, new[]{"stationChanged"})},
        {"buffers", new DataChangeEventTarget(CacheKeys.Buffers, new[]{"bufferChanged"})},
        {"mtls", new DataChangeEventTarget(CacheKeys.Mtls, new[]{"mtlChanged"})},
        {"vehicles", new DataChangeEventTarget(CacheKeys.Vehicles, new[]{"vehicleChanged", "vehicleTableChanged"}, true)},
        {"orders", new DataChangeEventTarget(CacheKeys.None, new[]{"orderTableChanged"}, true)},
        {"vehicle_paths", new DataChangeEventTarget(CacheKeys.VehiclePaths, new[]{"vehiclePath"})},
        {"clusters", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
        {"cluster_points", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
        {"location_groups", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
        {"grouped_objects", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
        {"vehicle_alarms", new DataChangeEventTarget(CacheKeys.None, new[]{"alarm"})},
        {"alerts", new DataChangeEventTarget(CacheKeys.None, new[]{"alert"})},
        {"server_status", new DataChangeEventTarget(CacheKeys.None, new[]{"serverStatus"})},
      };
    }

    public void EmitWatcherEvent(string jsonPayload)
    {
      // Console.WriteLine($">> Watcher received data >>, {jsonPayload}");
      // DataWatcherEvent payload = JsonSerializer.Deserialize<DataWatcherEvent>(jsonPayload, new JsonSerializerOptions
      // {
      //   PropertyNameCaseInsensitive = false,
      //   PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      // });
      var payload = Newtonsoft.Json.JsonConvert.DeserializeObject<DataWatcherEvent>(jsonPayload, new Newtonsoft.Json.JsonSerializerSettings()
      {
        NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
        ContractResolver = new DefaultContractResolver
        {
          NamingStrategy = new SnakeCaseNamingStrategy(),
        }
      });
      if (string.IsNullOrEmpty(payload.Table)) return;
      if (!this.eventMap.TryGetValue(payload.Table.ToLower(), out var targetInfo)) return;
      
      if (payload.Id > 0 && targetInfo.CacheKey.HasValue && targetInfo.CacheKey.Value != CacheKeys.None)
      {
        // update cache
        this._cache.RemoveValue(targetInfo.CacheKey.Value);  
      }

      foreach (var name in targetInfo.EmitNames)
      {
        // send
        this._hub.Clients.All.SendAsync(name, payload);
      }
      // this._hub.Clients.All.SendAsync("dataChanged", payload);
    }
  }
}