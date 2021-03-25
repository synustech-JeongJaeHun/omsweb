using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class TrackService
  {
    private readonly TrackRepository _trackRepo;
    private readonly CacheService _cache;
    private const int CACHE_LIFE = 30;

    public TrackService(TrackRepository trackRepo, CacheService cache)
    {
      this._trackRepo = trackRepo;
      this._cache = cache;
    }

    public MapData GetMapData()
    {
      var map = new MapData
      {
        Size = this._trackRepo.GetDimension(),
        Points = this._trackRepo.LoadPoints(),
        Segments = this._trackRepo.LoadSegments(),
        SegmentDisabled = this._trackRepo.LoadDisabledSegments(),
        Stations = this._trackRepo.LoadStations(),
        Buffers = this._trackRepo.LoadBuffers(),
        Mtls = this._trackRepo.LoadMtls(),
        Clusters = this._trackRepo.LoadClusters(),
        VehiclePaths = this._trackRepo.LoadVehiclePaths(),
        Vehicles = this._trackRepo.LoadVehiclePositions(),
        Groups = this._trackRepo.LoadGroups(),
      };
      return map;
    }

    private T GetMapItem<T>(CacheKeys key, Func<T> loader)
    {
      var data = _cache.GetValue<T>(key);
      if (data == null)
      {
        data = loader();
        _cache.SetValue<T>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
  }
}
