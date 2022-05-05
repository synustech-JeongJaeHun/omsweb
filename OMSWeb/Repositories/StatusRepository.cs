using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
    public class StatusRepository : DataAccess
    {
        public StatusRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<OrderState> QueryOrderStates()
        {
            IQueryable<OrderState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("orderStatus");
                result = conn.Query<OrderState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleState> QueryVehicleStates()
        {
            IQueryable<VehicleState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("vehicleStates");
                result = conn.Query<VehicleState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<StationState> QueryStationStates()
        {
            IQueryable<StationState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("stationStatus");
                result = conn.Query<StationState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<BufferState> QueryBufferStates()
        {
            IQueryable<BufferState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("bufferStatus");
                result = conn.Query<BufferState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<ZcuState> QueryZcuStates()
        {
            IQueryable<ZcuState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("zcuStatus");
                result = conn.Query<ZcuState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<ClusterState> QueryClusterStates()
        {
            IQueryable<ClusterState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("clusterStatus");
                result = conn.Query<ClusterState>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<DioState> QueryDioStates()
        {
            IQueryable<DioState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("dioState");
                result = conn.Query<DioState>(sql).AsQueryable();
            }
            return result;
        }

    }
}