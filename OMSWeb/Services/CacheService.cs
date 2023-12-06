using System;
using Microsoft.Extensions.Caching.Memory;

namespace OMSWeb.Services
{
  public enum CacheKeys : uint
  {
    None,
    MapSize,
    Points,
    Segments,
    SegmentDisabled,
    Stations,
    Buffers,
    Mtls,
    Zcus,
    ZcuStatus,
    FireShutters,
    FireShutterStatus,
    Clusters,
    ClusterStatus,
    VehicleDio,
    VehiclePaths,
    Vehicles,
    Groups,
  }

  public class CacheService
  {
    private readonly IMemoryCache _cache;

    public CacheService(IMemoryCache cache)
    {
      this._cache = cache;
    }

    public void SetValue<T>(CacheKeys key, T value, TimeSpan offset)
    {
      var options = new MemoryCacheEntryOptions().SetSlidingExpiration(offset);
      _cache.Set<T>(key, value, options);
    }

    public void SetValue<T>(CacheKeys key, T value, DateTimeOffset absolute)
    {
      var options = new MemoryCacheEntryOptions().SetAbsoluteExpiration(absolute);
      _cache.Set<T>(key, value, options);
    }

    public T GetValue<T>(CacheKeys key)
    {
      if (!_cache.TryGetValue<T>(key, out T value)) return default;

      return value;
    }

    public void RemoveValue(CacheKeys key)
    {
      _cache.Remove(key);
    }

    public void ClearMap()
    {
      RemoveValue(CacheKeys.Buffers);
      RemoveValue(CacheKeys.Clusters);
      RemoveValue(CacheKeys.Groups);
      RemoveValue(CacheKeys.MapSize);
      RemoveValue(CacheKeys.Mtls);
      RemoveValue(CacheKeys.Points);
      RemoveValue(CacheKeys.SegmentDisabled);
      RemoveValue(CacheKeys.Segments);
      RemoveValue(CacheKeys.Stations);
      RemoveValue(CacheKeys.VehicleDio);
      RemoveValue(CacheKeys.VehiclePaths);
      RemoveValue(CacheKeys.Vehicles);
      RemoveValue(CacheKeys.Zcus);
      RemoveValue(CacheKeys.ZcuStatus);
      RemoveValue(CacheKeys.ClusterStatus);
      RemoveValue(CacheKeys.FireShutters);
      RemoveValue(CacheKeys.FireShutterStatus);
    }
  }
}
