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

        public SettingModeEntity GetSettingsRebalance()
        {
            return _repo.QuerySettingsBalance();
        }

        public IQueryable<AlternateStationEntity> GetSettingsAlternateStations(string stationLikeKey)
        {
            return _repo.QuerySettingsAlternateStations(stationLikeKey);
        }

        public string GetSettingsOnlineName(string id, string tyype)
        {
            return _repo.QueryOnlineName(id, "station");
        }

        public IQueryable<GroupEntity> GetSettingsGroups()
        {
            return _repo.QuerySettingsGroups();
        }

        public IQueryable<GroupedObjectEntity> GetSettingsGroupedObjects()
        {
            return _repo.QuerySettingsGroupedObjects();
        }

        public IQueryable<int> GetSettingsGroupIsAvailableHomes(int groupId)
        {
            return _repo.QuerySettingsGroupIsAvailableHomes(groupId);
        }

        public IQueryable<int> GetSettingsGroupIsAvailableStations(int groupId)
        {
            return _repo.QuerySettingsGroupIsAvailableStations(groupId);
        }

        public IQueryable<int> GetSettingsGroupIsAvailableVehicles(int groupId)
        {
            return _repo.QuerySettingsGroupIsAvailableVehicles(groupId);
        }

        public IQueryable<int> GetSettingsGroupIsAvailableBuffers(int groupId)
        {
            return _repo.QuerySettingsGroupIsAvailableBuffers(groupId);
        }

        public IQueryable<ClusterEntity> GetSettingsClusters()
        {
            return _repo.QuerySettingsClusters();
        }

        public IQueryable<ClusterPointEntity> GetSettingsClusterPoints()
        {
            return _repo.QuerySettingsClusterPoints();
        }

        public IQueryable<int> GetSettingsClusterIsAvailablePoints(int clusterId)
        {
            return _repo.QuerySettingsClusterIsAvailablePoints(clusterId);
        }

        public IQueryable<int> GetSettingsClusterAssignedPoints(int clusterId)
        {
            return _repo.QuerySettingsClusterAssignedPoints(clusterId);
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
