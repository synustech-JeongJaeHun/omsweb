using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;
using OMSWeb.Services;

namespace OMSWeb.Repositories
{
    public class StatusRepository : DataAccess
    {
        private SystemsService _systemSvc;
        public StatusRepository(IConfiguration configuration, SystemsService systemSvc) : base(configuration)
        {
            this._systemSvc = systemSvc;
        }

        public IQueryable<OrderState> QueryOrderStates()
        {
            IQueryable<OrderState> result;
            string prefix = "";
            if (_systemSvc.GetClientSettings().VHLAlias!=null)
            {
                prefix = _systemSvc.GetClientSettings().VHLAlias;
            }
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("orderStatus");

                try
                {
                    result = conn.Query<OrderState>(sql, new {prefix}).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<VehicleState> QueryVehicleStates()
        {
            IQueryable<VehicleState> result;
            string prefix = "";
            if (_systemSvc.GetClientSettings().VHLAlias!=null)
            {
                prefix = _systemSvc.GetClientSettings().VHLAlias;
            }
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("vehicleStates");

                try
                { 
                    result = conn.Query<VehicleState>(sql, new {prefix}).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<StationState> QueryStationStates()
        {
            IQueryable<StationState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("stationStatus");

                try
                { 
                    result = conn.Query<StationState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<BufferState> QueryBufferStates()
        {
            IQueryable<BufferState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("bufferStatus");

                try
                { 
                    result = conn.Query<BufferState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<ZcuState> QueryZcuStates()
        {
            IQueryable<ZcuState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("zcuStatus");

                try
                { 
                    result = conn.Query<ZcuState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<FireShutterState> QueryFireShutterStates()
        {
            IQueryable<FireShutterState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("fireShutterStatus");

                try
                { 
                    result = conn.Query<FireShutterState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<ClusterState> QueryClusterStates()
        {
            IQueryable<ClusterState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("clusterStatus");

                try
                { 
                    result = conn.Query<ClusterState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<UnuseListState> QueryUnuseListStates()
        {
            IQueryable<UnuseListState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("unuseListStatus");

                try
                { 
                    result = conn.Query<UnuseListState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<DioState> QueryDioStates()
        {
            IQueryable<DioState> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("dioState");

                try
                { 
                    result = conn.Query<DioState>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

    }
}