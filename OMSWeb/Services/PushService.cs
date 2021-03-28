using System;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Linq;

using OMSWeb.Hubs;
using OMSWeb.Models;
using System.Collections.Generic;
using Newtonsoft.Json.Serialization;
using System.Threading.Tasks;

namespace OMSWeb.Services
{

  class NotificationSendingState
  {
    public DateTime Time { get; set; } = DateTime.MinValue;
    public bool IsReserved { get; set; } = false;
  }
  public class PushService
  {
    private const int tableSendingInterval = 500; // @TODO 초기값 : 500

    private IHubContext<OMSHub> _hub;
    private IDictionary<string, DataChangeEventTarget> tableEventMap;
    private IDictionary<CacheKeys, string[]> cacheEventMap;
    private IDictionary<string, NotificationSendingState> sendingMap;
    private CacheService _cache;
    private TrackService _trackSvc;

    // private lastSentTable;

    public PushService(IHubContext<OMSHub> hub, CacheService cacheSvc, TrackService trackSvc)
    {
      this._hub = hub;
      this._cache = cacheSvc;
      this._trackSvc = trackSvc;

      this.tableEventMap = new Dictionary<string, DataChangeEventTarget> {
        {"points", new DataChangeEventTarget(CacheKeys.Points, new[]{"pointChanged"})},
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

      this.sendingMap = new Dictionary<string, NotificationSendingState>();
    }

    public async Task PushWatcherEventAsync(string jsonPayload)
    {
      // Console.WriteLine($">> Watcher received data >>, {jsonPayload}");
      // DataWatcherEvent payload = JsonSerializer.Deserialize<DataWatcherEvent>(jsonPayload, new JsonSerializerOptions
      // {
      //   PropertyNameCaseInsensitive = false,
      //   PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      // });
      var payload = Newtonsoft.Json.JsonConvert.DeserializeObject<DataWatcherPayload>(jsonPayload, new Newtonsoft.Json.JsonSerializerSettings()
      {
        NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
        ContractResolver = new DefaultContractResolver
        {
          NamingStrategy = new SnakeCaseNamingStrategy(),
        }
      });
      // Console.WriteLine($">> Watcher received json object >>, Table = {payload.Table}, Operation = {payload.Operation}, Id = {payload.Id}, VehicleId = {payload.VehicleId}\n");
      if (string.IsNullOrEmpty(payload.Table)) return;

      this.tableEventMap.TryGetValue(payload.Table.ToLower(), out var targetInfo);
      if (targetInfo != null && targetInfo.CacheKey != CacheKeys.None) // table event가 정의된 경우
      {

        if (payload.Id > 0) // cache update 후 cache 데이터를 사용하여 push
        {
          // update cache
          await this.UpdateCacheItemAsync(targetInfo, payload);
        }
        else // 변경 event만 push
        {
          foreach (var name in targetInfo.PushNames)
          {
            // this._hub.Clients.All.SendAsync(name, payload);
            await this.SendDBNotificationAsync(name, payload, null);
          }
        }

      }
      else  // 정의되지 않은 table event 이거나 cache를 사용하지 않은 데이터인 경우
      {
        foreach (var name in targetInfo.PushNames)
        {
          await this.SendDBNotificationAsync(name, payload, null);
        }
      }
    }

    private async Task UpdateCacheItemAsync(DataChangeEventTarget targetInfo, DataWatcherPayload payload)
    {
      // update cache
      this._cache.RemoveValue(targetInfo.CacheKey);

      this.cacheEventMap.TryGetValue(targetInfo.CacheKey, out var cacheEvents);
      foreach (var e in cacheEvents)
      {
        var isTable = e.Contains("table", StringComparison.OrdinalIgnoreCase);
        object body = null;
        if (!isTable)
        {
          var list = this._trackSvc.GetMapItem(targetInfo.CacheKey);
          if (targetInfo.IsSingleUpdate)
            body = list.Where(x => x.Id == payload.Id).FirstOrDefault();
          else
            body = list;
        }
        await this.SendDBNotificationAsync(e, payload, body);
      }

      foreach (var name in targetInfo.PushNames.Where(n => !cacheEvents.Contains(n)))
      {
        await this.SendDBNotificationAsync(name, payload, null);
      }

    }

    private async Task SendDBNotificationAsync(string pushName, DataWatcherPayload payload, object body)
    {
      var meta = new
      {
        Operation = payload.Operation,
        Id = payload.Id,
        Level = payload.Level,
        VehicleId = payload.VehicleId,
      };
      if (!pushName.Contains("table", StringComparison.OrdinalIgnoreCase))
      {
        // Console.WriteLine($"## PUSH ## {pushName}: {payload.Id}");
        await this._hub.Clients.All.SendAsync(pushName, meta, body);
        return;
      }

      if (!this.sendingMap.TryGetValue(pushName, out var buffer))
      {
        buffer = new NotificationSendingState();
        this.sendingMap.Add(pushName, buffer);
      }
      // Console.WriteLine($"## [{DateTime.Now}] start >> {pushName}: {payload.Id} reserved: {buffer.IsReserved}");
      if (!buffer.IsReserved)
      {
        var now = DateTime.Now;
        var timeDiff = (now - buffer.Time).Milliseconds;
        if ((now - buffer.Time).TotalMilliseconds > tableSendingInterval)
        {
          await this._hub.Clients.All.SendAsync(pushName, meta, body);
          // Console.WriteLine($"## [{DateTime.Now}] direct send >> {pushName}: {payload.Id}");
          buffer.Time = now;
          buffer.IsReserved = false;
        }
        else
        {
          buffer.IsReserved = true;
          // Console.WriteLine($"## [{DateTime.Now}] -> delay {tableSendingInterval} >> {pushName}: {payload.Id}");
          await Task.Delay(tableSendingInterval).ContinueWith(async t =>
          {
            await this._hub.Clients.All.SendAsync(pushName, meta, body);
            // Console.WriteLine($"## [{DateTime.Now}] --->> delayed send >> {pushName}: {payload.Id}");
            buffer.IsReserved = false;
            buffer.Time = DateTime.Now;
          });
        }
      }
      // Console.WriteLine($"## [{DateTime.Now}] end >> {pushName}: {payload.Id}");
    }
  }
}