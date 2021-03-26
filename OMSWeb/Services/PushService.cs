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
    private IDictionary<string, DataChangeEventTarget> tableEventMap;
    private IDictionary<CacheKeys, string[]> cacheEventMap;
    private CacheService _cache;

    public PushService(IHubContext<OMSHub> hub, CacheService cacheSvc)
    {
      this._hub = hub;
      this._cache = cacheSvc;

      this.tableEventMap = new Dictionary<string, DataChangeEventTarget> {
        {"point", new DataChangeEventTarget(CacheKeys.Points, new[]{"pointChanged"})},
        {"segments", new DataChangeEventTarget(CacheKeys.Segments, new[]{"segmentChanged"})},
        {"segment_blocking", new DataChangeEventTarget(CacheKeys.SegmentDisabled, new[]{"segmentDisabledChanged"}, true)},
        {"stations", new DataChangeEventTarget(CacheKeys.Stations, new[]{"stationChanged"})},
        {"buffers", new DataChangeEventTarget(CacheKeys.Buffers, new[]{"bufferChanged"})},
        {"mtls", new DataChangeEventTarget(CacheKeys.Mtls, new[]{"mtlChanged"})},
        {"vehicles", new DataChangeEventTarget(CacheKeys.Vehicles,
          new[]{"vehicleChanged", "vehicleTableChanged"}, true)},
        {"vehicle_paths", new DataChangeEventTarget(CacheKeys.VehiclePaths, new[]{"vehiclePath"})},
        {"clusters", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
        {"cluster_points", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
        {"location_groups", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
        {"grouped_objects", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
        {"orders", new DataChangeEventTarget(CacheKeys.None, new[]{"orderTableChanged"}, true)},
        {"vehicle_alarms", new DataChangeEventTarget(CacheKeys.None, new[]{"alarm"})},
        {"alerts", new DataChangeEventTarget(CacheKeys.None, new[]{"alert"})},
        {"server_status", new DataChangeEventTarget(CacheKeys.None, new[]{"serverStatus"})},
      };

      this.cacheEventMap = new Dictionary<CacheKeys, string[]> {
        {CacheKeys.Points, new[]{"pointChanged"}},
        {CacheKeys.Segments, new[]{"segmentChanged"}},
        {CacheKeys.SegmentDisabled, new[]{"segmentDisabledChanged"}},
        {CacheKeys.Stations, new[]{"stationChanged"}},
        {CacheKeys.Buffers, new[]{"bufferChanged"}},
        {CacheKeys.Mtls, new[]{"mtlChanged"}},
        {CacheKeys.Vehicles, new[]{"vehicleChanged", "vehicleTableChanged"}},
        {CacheKeys.VehiclePaths, new[]{"vehiclePath"}},
        {CacheKeys.Clusters, new[]{"clusterChanged"}},
        {CacheKeys.Groups, new[]{"groupChanged"}},
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

      this.tableEventMap.TryGetValue(payload.Table.ToLower(), out var targetInfo);
      if (targetInfo != null && targetInfo.CacheKey != CacheKeys.None) // table event가 정의된 경우
      {
        this.cacheEventMap.TryGetValue(targetInfo.CacheKey, out var cacheEvents);

        if (payload.Id > 0)
        {
          // update cache
          this.UpdateCacheItem(targetInfo, payload);
        }

        foreach (var name in targetInfo.EmitNames)
        {
          // send
          this._hub.Clients.All.SendAsync(name, payload);
        }
      }
      else  // 정의되지 않은 table event 이거나 cache를 사용하지 않은 데이터인 경우
      {

      }
      // this._hub.Clients.All.SendAsync("dataChanged", payload);
    }

    private void UpdateCacheItem(DataChangeEventTarget targetInfo, DataWatcherEvent payload)
    {
      // update cache
      this._cache.RemoveValue(targetInfo.CacheKey);
    }
  }
}