using System;
using Microsoft.AspNetCore.SignalR;
using System.Linq;

using OMSWeb.Hubs;
using OMSWeb.Models;
using System.Collections.Generic;
using Newtonsoft.Json.Serialization;
using System.Threading.Tasks;
using OMSWeb.Models.Tracks;

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
        private Newtonsoft.Json.JsonSerializerSettings jsonSerializerSettings;

        public PushService(IHubContext<OMSHub> hub, CacheService cacheSvc, TrackService trackSvc)
        {
            this._hub = hub;
            this._cache = cacheSvc;
            this._trackSvc = trackSvc;

            this.tableEventMap = new Dictionary<string, DataChangeEventTarget> 
            {
                // {"points", new DataChangeEventTarget(CacheKeys.Points, new[]{"pointChanged"})},
                {"segments", new DataChangeEventTarget(CacheKeys.Segments, new[]{"segmentChanged"})},
                {"segment_blocking", new DataChangeEventTarget(CacheKeys.SegmentDisabled, new[]{"segmentDisabledChanged"}, true)},
                {"stations", new DataChangeEventTarget(CacheKeys.Stations, new[]{"stationChanged"})},
                {"buffers", new DataChangeEventTarget(CacheKeys.Buffers, new[]{"bufferChanged"})},
                {"mtls", new DataChangeEventTarget(CacheKeys.Mtls, new[]{"mtlChanged"})},
                {"zcus", new DataChangeEventTarget(CacheKeys.Zcus, new[]{"zcuMapChanged"}, true)},
                {"zcu_status", new DataChangeEventTarget(CacheKeys.ZcuStatus, new[]{"zcuStatusTableChanged"}, true)},
                {"vehicles", new DataChangeEventTarget(CacheKeys.Vehicles, new[]{"vehicleChanged", "vehicleTableChanged"}, true)},
                {"vehicle_paths", new DataChangeEventTarget(CacheKeys.VehiclePaths, new[]{"vehiclePath"})},
                {"vehicle_dio", new DataChangeEventTarget(CacheKeys.VehicleDio, new[]{"vehicleDioChanged"}, true)},
                {"clusters", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
                {"cluster_points", new DataChangeEventTarget(CacheKeys.Clusters, new[]{"clusterChanged"})},
                {"cps_status", new DataChangeEventTarget(CacheKeys.CpsStatus, new[]{"cpsStatusTableChanged"}, true)},
                {"location_groups", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
                {"grouped_objects", new DataChangeEventTarget(CacheKeys.Groups, new[]{"groupChanged"})},
                {"orders", new DataChangeEventTarget(CacheKeys.None, new[]{"orderTableChanged"}, true)},
                {"vehicle_alarms", new DataChangeEventTarget(CacheKeys.None, new[]{"alarm"})},
                {"alerts", new DataChangeEventTarget(CacheKeys.None, new[]{"alert"})},
                {"server_status", new DataChangeEventTarget(CacheKeys.None, new[]{"serverStatus"})},
                {"mode_state", new DataChangeEventTarget(CacheKeys.None, new[]{"modeState"})},
                {"kpi_trend", new DataChangeEventTarget(CacheKeys.None, new[]{"kpiTrend"})},
            };                        

            this.cacheEventMap = new Dictionary<CacheKeys, string[]> 
            {
                // {CacheKeys.Points, new[]{"pointChanged"}},
                {CacheKeys.Segments, new[]{"segmentChanged"}},
                {CacheKeys.SegmentDisabled, new[]{"segmentDisabledChanged"}},
                {CacheKeys.Stations, new[]{"stationChanged"}},
                {CacheKeys.Buffers, new[]{"bufferChanged"}},
                {CacheKeys.Mtls, new[]{"mtlChanged"}},
                {CacheKeys.Zcus, new[]{"zcuMapChanged"}},
                {CacheKeys.ZcuStatus, new[]{"zcuStatusTableChanged"}},
                {CacheKeys.Vehicles, new[]{"vehicleChanged", "vehicleTableChanged"}},
                {CacheKeys.VehiclePaths, new[]{"vehiclePath"}},
                {CacheKeys.VehicleDio, new[]{"vehicleDioChanged"}},
                {CacheKeys.Clusters, new[]{"clusterChanged"}},
                {CacheKeys.Groups, new[]{"groupChanged"}},
            };

            this.sendingMap = new Dictionary<string, NotificationSendingState>();
            this.jsonSerializerSettings = new Newtonsoft.Json.JsonSerializerSettings()
            {
                NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new SnakeCaseNamingStrategy(),
                }
            };
        }

        public async Task PushWatcherEventAsync(long ts, string jsonPayload)
        {
            // this.PrintLog(ts, $"01 data received);
            // Console.WriteLine($">> Watcher received data >>, {jsonPayload}");
            var payload = Newtonsoft.Json.JsonConvert.DeserializeObject<DataWatcherPayload>(jsonPayload, this.jsonSerializerSettings);
            payload.Timestamp = ts;

            this.PrintLog(ts, $"02 \tjson => {payload.Table}: {payload.Id}");

            // if (payload.Table == "vehicles")
            //   Console.WriteLine($">> Watcher VH >> {payload.Id}: {payload.Data.NextPoint}");

            // Console.WriteLine($">> Watcher received json object >>, Table = {payload.Table}, Operation = {payload.Operation}, Id = {payload.Id}, VehicleId = {payload.VehicleId}");
            if (string.IsNullOrEmpty(payload.Table))
                return;

            this.tableEventMap.TryGetValue(payload.Table.ToLower(), out var targetInfo);

            if (targetInfo != null)
            {
                if (targetInfo.CacheKey != CacheKeys.None) // table event가 정의된 경우
                {
                    if (payload.Id > 0) // cache update 후 cache 데이터를 사용하여 push
                    {
                        await this.UpdateWithCacheAsync(targetInfo, payload);
                    }
                    else // 변경 event만 push
                    {
                        foreach (var name in targetInfo.PushNames)
                            await this.SendDBNotificationAsync(name, payload, null);
                    }
                }
                else  // 정의되지 않은 table event 이거나 cache를 사용하지 않은 데이터인 경우
                {
                    foreach (var name in targetInfo.PushNames)
                        await this.SendDBNotificationAsync(name, payload, null);
                }
            }
        }

        private void PrintLog(long ts, string message, DataWatcherPayload payload = null)
        {
            if ((ts / (10 ^ 7)) % 100 == 0)
            {
                var span = new TimeSpan(DateTime.Now.Ticks - ts);
                var milliseconds = span.TotalMilliseconds;

                if (milliseconds > 500)
                    Console.ForegroundColor = ConsoleColor.Red;
                else if (milliseconds > 100)
                    Console.ForegroundColor = ConsoleColor.Magenta;

                Console.WriteLine($"[PUSH] ~ {milliseconds,8:N2}\t{message}");
                Console.ResetColor();
            }
        }

        private async Task UpdateWithCacheAsync(DataChangeEventTarget targetInfo, DataWatcherPayload payload)
        {
            // this._cache.RemoveValue(targetInfo.CacheKey); // @NOTE 성능비교 : 무조건 해당 cache를 삭제한다.
            await this.UpdateCacheAsync(targetInfo, payload);

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

        private Task UpdateCacheAsync(DataChangeEventTarget targetInfo, DataWatcherPayload payload)
        {
            var needUpdate = false;

            // update cache
            if (payload.Data == null)
            {
                this._cache.RemoveValue(targetInfo.CacheKey);
                needUpdate = true;
            }
            else
            {  // @NOTE vehicle인 경우에만 Data가 있다.
                List<VehiclePosition> vehicles = this._trackSvc.GetVehicles().ToList();
                if (vehicles != null && vehicles.Count > 0)
                {
                    var matchIdx = vehicles.FindIndex(x => x.Id == payload.Id);
                    if (payload.Operation == "DELETE")
                    {
                        vehicles.RemoveAt(matchIdx);
                        needUpdate = true;
                    }
                    else
                    {
                        if (payload.Operation == "INSERT" && matchIdx == -1)
                        {
                            vehicles.Add(payload.Data);
                            needUpdate = true;
                        }
                        else if (payload.Operation == "UPDATE" && matchIdx != -1)
                        {
                            vehicles[matchIdx] = payload.Data;
                            needUpdate = true;
                        }
                    }
                }
                else
                {
                    vehicles = new List<VehiclePosition> {
            payload.Data
          };
                    needUpdate = true;
                }
                if (needUpdate)
                {
                    lock (vehicles)
                    {
                        this._cache.SetValue<List<VehiclePosition>>(CacheKeys.Vehicles, vehicles, DateTimeOffset.Now.AddMinutes(30));
                    }
                }
            }

            return Task.CompletedTask;
        }

        private Task SendDBNotificationAsync(string pushName, DataWatcherPayload payload, object body)
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
                this.PrintLog(payload.Timestamp.Value, $"03 \tsend => {pushName}: {payload.Id}");
                this._hub.Clients.All.SendAsync(pushName, meta, body);
                return Task.CompletedTask;
            }

            if (!this.sendingMap.TryGetValue(pushName, out var buffer))
            {
                buffer = new NotificationSendingState();
                this.sendingMap.Add(pushName, buffer);
            }
            if (!buffer.IsReserved)
            {
                var now = DateTime.Now;
                var timeDiff = (now - buffer.Time).Milliseconds;
                if ((now - buffer.Time).TotalMilliseconds > tableSendingInterval)
                {
                    this.PrintLog(payload.Timestamp.Value, $"03 \tsend => {pushName}: {payload.Id}");
                    this._hub.Clients.All.SendAsync(pushName, meta, body);
                    buffer.Time = now;
                    buffer.IsReserved = false;
                }
                else
                {
                    buffer.IsReserved = true;
                    Task.Delay(tableSendingInterval).ContinueWith(t =>
                    {
                        this.PrintLog(payload.Timestamp.Value + TimeSpan.FromMilliseconds(tableSendingInterval).Ticks, $"03.1\tdelay send => {pushName}: {payload.Id}");
                        this._hub.Clients.All.SendAsync(pushName, meta, body);
                        buffer.IsReserved = false;
                        buffer.Time = DateTime.Now;
                    });
                }
            }
            return Task.CompletedTask;
        }
    }
}