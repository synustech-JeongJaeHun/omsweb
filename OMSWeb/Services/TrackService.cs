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

    public TrackService(TrackRepository trackRepo)
    {
      this._trackRepo = trackRepo;
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

    public dynamic[] GetMapItem(CacheKeys key) {
      switch (key)
      {
          case CacheKeys.Points:
            return this._trackRepo.LoadPoints();
          case CacheKeys.Segments:
            return this._trackRepo.LoadSegments();
          case CacheKeys.SegmentDisabled:
            return this._trackRepo.LoadDisabledSegments();
          case CacheKeys.Stations:
            return this._trackRepo.LoadStations();
          case CacheKeys.Buffers:
            return this._trackRepo.LoadBuffers();
          case CacheKeys.Mtls:
            return this._trackRepo.LoadMtls();
          case CacheKeys.Clusters:
            return this._trackRepo.LoadClusters();
          case CacheKeys.VehiclePaths:
            return this._trackRepo.LoadVehiclePaths();
          case CacheKeys.Vehicles:
            return this._trackRepo.LoadVehiclePositions();
          case CacheKeys.Groups:
            return this._trackRepo.LoadGroups();
          default:
            return null;
      }
    }
  }
}
