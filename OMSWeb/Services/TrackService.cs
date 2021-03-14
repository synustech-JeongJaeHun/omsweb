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

    public TrackService(TrackRepository trackRepo, CacheService cache)
    {
      this._trackRepo = trackRepo;
      this._cache = cache;
    }

    public MapData GetMapData()
    {
      var map = _cache.GetValue<MapData>(CacheKeys.MapData);
      if (map == null)
      {
        map = new MapData
        {
          Size = this._trackRepo.GetDimension(),
          Points = this._trackRepo.LoadPoints().ToArray(),
          Segments = this._trackRepo.LoadSegments().ToArray(),
          SegmentDisabled = this._trackRepo.LoadDisabledSegments().ToArray(),
          Stations = this._trackRepo.LoadStations().ToArray(),
          Buffers = this._trackRepo.LoadBuffers().ToArray(),
          Mtls = this._trackRepo.LoadMtls().ToArray(),
          Clusters = this._trackRepo.LoadClusters().ToArray(),
          VehiclePaths = this._trackRepo.LoadVehiclePaths().ToArray(),
          Vehicles = this._trackRepo.LoadVehiclePositions().ToArray(),
          Groups = this._trackRepo.LoadGroups().ToArray(),
        };
        _cache.SetValue<MapData>(CacheKeys.MapData, map, DateTimeOffset.Now.AddMinutes(30));
      }
      return map;
    }
  }
}
