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

    public IQueryable<GroupEntity> GetSettingsGroups()
    {
      return _repo.QuerySettingsGroups();
    }

    public IQueryable<GroupedObjectEntity> GetSettingsGroupedObjects()
    {
      return _repo.QuerySettingsGroupedObjects();
    }

    public IQueryable<ObjectEntity> GetSettingsGroupHomeObjects()
    {
      return _repo.QuerySettingsGroupHomeObjects();
    }

    public IQueryable<ObjectEntity> GetSettingsGroupStationObjects()
    {
      return _repo.QuerySettingsGroupStationObjects();
    }

    public IQueryable<ObjectEntity> GetSettingsGroupVehicleObjects()
    {
      return _repo.QuerySettingsGroupVehicleObjects();
    }

    public IQueryable<ObjectEntity> GetSettingsGroupBufferObjects()
    {
      return _repo.QuerySettingsGroupBufferObjects();
    }

    public IQueryable<SegmentWithVPartsNBlockingEntity> GetSettingsSegements()
    {
      return _repo.QuerySettingsSegments();
    }

    public int UpdateSettingsSegment(SegmentWithVPartsNBlockingEntity segment)
    {
      return _repo.UpdateSettingsSegment(segment);
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

    public IQueryable<VehicleRegEntity> GetSettingsVehicleRegs()
    {
      return _repo.QuerySettingsVehicleRegs();
    }

    public int InsertSettingsVehicleRegs(VehicleRegEntity vehicleReg)
    {
      return _repo.InsertSettingsVehicleRegs(vehicleReg);
    }

    public int UpdateSettingsVehicleRegs(VehicleRegEntity vehicleReg)
    {
      return _repo.UpdateSettingsVehicleRegs(vehicleReg);
    }

    public int DeleteSettingsVehicleRegs(VehicleRegEntity vehicleReg)
    {
      return _repo.DeleteSettingsVehicleRegs(vehicleReg);
    }
  }
}
