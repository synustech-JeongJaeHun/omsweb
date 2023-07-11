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

        public IQueryable<OrderState> QueryOrderStates(int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = string.Empty;
            string LimitConditions = @"LIMIT @take OFFSET @skip";
            
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"ORDER BY {sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;
            
            IQueryable<OrderState> result;
            string prefix = "";
            if (_systemSvc.GetClientSettings().VHLAlias!=null)
            {
                prefix = _systemSvc.GetClientSettings().VHLAlias;
            }
            using (var conn = ConnectTrack())
            {
                var sql = $@"SELECT --*order_condition*
                                  *
                                  FROM (
                                    SELECT
                                    OD.id, 
                                    CASE
                                        WHEN OD.origin_details IS NOT NULL THEN OD.origin_details
                                        ELSE OD.origin 
                                    END AS origin,
                                    OD.logical_id, 
		                            CASE
			                            WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
			                            WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
                                        WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
                                        WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VR.logical_id
			                            ELSE OD.location_pickup
		                            EnD AS location_pickup,
		                            CASE
			                            WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT c_alias FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
			                            WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT c_alias FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
		                                WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
                                        WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VR.logical_id
			                            ELSE OD.location_pickup
		                            EnD AS location_pickup_alias,
		                            CASE
			                            WHEN OD.location_dropoff LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_dropoff)
			                            WHEN OD.location_dropoff LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_dropoff)
			                            ELSE OD.location_dropoff
		                            EnD AS location_dropoff,
		                            CASE
			                            WHEN OD.location_dropoff LIKE '%s%' THEN	(SELECT c_alias  FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_dropoff)
			                            WHEN OD.location_dropoff LIKE '%b%' THEN	(SELECT c_alias FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_dropoff)
			                            ELSE OD.location_dropoff
		                            EnD AS location_dropoff_alias,
		                            CASE
			                            WHEN OD.location_move LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_move)
			                            WHEN OD.location_move LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_move)
			                            ELSE OD.location_move
		                            EnD AS location_move,
                                    CASE
                                      WHEN OD.time_failed IS NOT NULL THEN 'FAILED'
                                      WHEN OD.time_aborted IS NOT NULL THEN 'ABORTED'
                                      WHEN OD.time_completed IS NOT NULL THEN 'COMPLETED'
                                      WHEN OD.time_unload_completed IS NOT NULL THEN 'UNLOADED'
                                      WHEN OD.time_unload_started IS NOT NULL THEN 'UNLOADING'
                                      WHEN OD.time_load_completed IS NOT NULL THEN 'LOADED'
                                      WHEN OD.time_load_started IS NOT NULL THEN 'LOADING'
                                      WHEN OD.time_vehicle_arrived IS NOT NULL THEN 'ARRIVED'
                                      WHEN OD.time_assigned IS NOT NULL THEN 'ASSIGNED'
                                      WHEN OD.time_assigned IS NULL THEN 'UNASSIGNED'
                                    END AS state,
                                    VR.logical_id As vehicle_id,
                                    OD.priority,
                                    OD.carrier_label,
                                    OD.time_created,
                                    OD.time_assigned,
                                    OD.time_completed,
                                    OD.time_aborted,
                                    OD.time_failed,
                                    EXTRACT(epoch FROM (
                                        CASE
                                        WHEN OD.time_failed IS NOT NULL THEN (OD.time_failed - OD.time_created)
                                        WHEN OD.time_aborted IS NOT NULL THEN (OD.time_aborted - OD.time_created)
                                        WHEN OD.time_completed IS NOT NULL THEN (OD.time_completed - OD.time_created)
                                        ELSE (now() - OD.time_created)
                                        END)) AS duration_total,
                                    EXTRACT(epoch FROM (OD.time_assigned - OD.time_created)) AS duration_unassigned,
                                    EXTRACT(epoch FROM (OD.time_load_started - OD.time_assigned)) AS duration_pickup,
                                    EXTRACT(epoch FROM (OD.time_load_completed - OD.time_load_started)) AS duration_load,
                                    EXTRACT(epoch FROM (
                                        CASE
                                        WHEN OD.time_load_completed IS NOT NULL THEN (OD.time_unload_started - OD.time_load_completed)
                                        ELSE (OD.time_unload_started - OD.time_assigned)
                                        END)) AS duration_dropoff,
                                    EXTRACT(epoch FROM (OD.time_unload_completed - OD.time_unload_started)) AS duration_unload,
                                    EXTRACT(epoch FROM (OD.time_vehicle_arrived - OD.time_assigned)) AS duration_move,
                                    OD.distance_pickup AS distance_pickup,
                                    OD.distance_deliver AS distance_dropoff,
                                    OD.distance_move AS distance_move,
                                    OD.status_details,
                                    OD.assignment_type, 
                                    OD.assignment_details,
                                    (@prefix || VS.physical_id) as vehicle_alias
                                    FROM orders AS OD
                                    LEFT OUTER JOIN vehicle_reg AS VR
                                        ON OD.vehicle_id = VR.id
                                    left join vehicles as VS
    		                            on OD.vehicle_id = VS.id
                                    WHERE OD.time_completed IS NULL AND OD.time_aborted IS NULL AND OD.time_failed IS NULL
                                    {SortConditions}
                                    --*user_id_condition*-- AND user_id = @userId
                                  ) AS WRAPPED_TABLE
                            {WhereConditions}

                            --LIMIT @take OFFSET @skip
                            {LimitConditions}
                            ";

                try
                {
                    result = conn.Query<OrderState>(sql, new { skip, take, prefix }).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }
        
        public int QueryOrderStatesCount(string condition)
        {
            int result = 0;
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            using (var conn = ConnectTrack())
            {
                var sql = $@"SELECT count(*)
                              FROM (
                                SELECT
                                OD.id
                                FROM orders AS OD
                                WHERE OD.time_completed IS NULL AND OD.time_aborted IS NULL AND OD.time_failed IS NULL
                                --*user_id_condition*-- AND user_id = @userId
                              ) AS WRAPPED_TABLE
                              {WhereConditions}
                              ";

                try
                {
                    result = conn.QueryFirst<int>(sql);
                }
                catch (Exception e)
                {
                    
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