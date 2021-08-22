using System;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class SettingsService
  {
    private readonly SettingsRepository _repo;

    public SettingsService(SettingsRepository repo)
    {
      _repo = repo;
    }

    public IQueryable<SegmentWithVPartsNBlockingEntity> GetSettingsSegements()
    {
      return _repo.QuerySettingsSegments();
    }

    public IQueryable<StationWithUnuseEntity> GetSettingsStations()
    {
      return _repo.QuerySettingsStations();
    }

    public IQueryable<BufferWithUnuseEntity> GetSettingsBuffers()
    {
      return _repo.QuerySettingsBuffers();
    }

    public IQueryable<PointWithAIVertexEntity> GetSettingsPoints()
    {
      return _repo.QuerySettingsPoints();
    }

    public IQueryable<ZcuEntity> GetSettingsZcus()
    {
      return _repo.QuerySettingsZcus();
    }

    public IQueryable<ZcuInputZoneEntity> GetZcuInputZones()
    {
      return _repo.QuerySettingsZcuInputZones();
    }
  }
}
