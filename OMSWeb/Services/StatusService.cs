using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
    public class StatusService
    {
        private readonly StatusRepository _repo;

        public StatusService(StatusRepository repo)
        {
            _repo = repo;
        }

        public IQueryable<OrderState> QueryOrderStates()
        {
            return _repo.QueryOrderStates();
        }
        public IQueryable<VehicleState> QueryVehicleStates()
        {
            return _repo.QueryVehicleStates();
        }
        public IQueryable<StationState> QueryStationStates()
        {
            return _repo.QueryStationStates();
        }
        public IQueryable<BufferState> QueryBufferStates()
        {
            return _repo.QueryBufferStates();
        }
        public IQueryable<ZcuState> QueryZcuStates()
        {
            return _repo.QueryZcuStates();
        }
        public IQueryable<FireShutterState> QueryFireShutterStates()
        {
            return _repo.QueryFireShutterStates();
        }
        public IQueryable<ClusterState> QueryClusterStates()
        {
            return _repo.QueryClusterStates();
        }
        public IQueryable<DioState> QueryDioStates()
        {
            return _repo.QueryDioStates();
        }
    }
}