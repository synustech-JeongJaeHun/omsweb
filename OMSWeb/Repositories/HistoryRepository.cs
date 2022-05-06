using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class HistoryRepository : DataAccess
    {
        public HistoryRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<OrderHistoryEntity> QueryOrders()
        {
            var sql = @"
    SELECT OD.id, OD.origin, OD.history_source_id, OD.logical_id, 
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
    --OD.location_pickup, 
    --OD.location_dropoff, 
    --OD.location_move, 
    CASE
		WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
		WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
        WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
        WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VR.logical_id
		ELSE OD.location_pickup
	EnD AS location_pickup,
	CASE
		WHEN OD.location_dropoff LIKE '%s%' THEN (SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_dropoff)
		WHEN OD.location_dropoff LIKE '%b%' THEN (SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_dropoff)
		ELSE OD.location_dropoff
	EnD AS location_dropoff,
	CASE
		WHEN OD.location_move LIKE '%s%' THEN (SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_move)
		WHEN OD.location_move LIKE '%b%' THEN (SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_move)
		ELSE OD.location_move
	EnD AS location_move,

    OD.priority, 
    VR.logical_id As vehicle_id, 
    OD.carrier_label, OD.time_created, OD.time_assigned, OD.time_vehicle_arrived, OD.time_load_started, OD.time_load_completed, 
    OD.time_unload_started, OD.time_unload_completed, OD.time_completed, OD.time_aborted, OD.time_failed, 
    OD.distance_pickup, OD.distance_deliver AS distance_dropoff, OD.distance_move, OD.assignment_type, OD.assignment_details
    FROM order_history AS OD
    INNER JOIN (
        SELECT history_source_id AS order_id, max(history_change_time) AS last_updated
        FROM order_history
        GROUP BY history_source_id
    ) AS LAST_OD
    ON OD.history_source_id = LAST_OD.order_id AND OD.history_change_time = LAST_OD.last_updated
    LEFT OUTER JOIN vehicle_reg AS VR
        ON OD.vehicle_id = VR.id
      ";
            IQueryable<OrderHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<OrderHistoryEntity>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleHistoryEntity> QueryVehicles()
        {
            var sql = @"
    SELECT
    VH.history_change_time, VH.id, VH.history_source_id,
    VH.physical_id, VH.logical_id, 
    VH.moving_state, 
    VH.distance_total, VH.runtime_total, 
    VH.type, VH.map_db
    FROM vehicle_history AS VH
    INNER JOIN (
        SELECT history_source_id, max(id) AS max_id
        FROM vehicle_history
        --*where_condition*
        GROUP BY history_source_id
    ) AS LVH
    ON VH.id = LVH.max_id    
    ORDER BY VH.id        
      ";
            IQueryable<VehicleHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleHistoryEntity>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<AlarmHistory> QueryAlarms()
        {
            var sql = @"
    SELECT VA.id, VA.time, VA.error_code, VA.vehicle_id, VR.logical_id AS vehicle_logical_id,
    VA.time_resolved, 
    CASE WHEN VA.time_resolved IS NULL THEN  extract('epoch' from now()-VA.time) ELSE  extract('epoch' from VA.time_resolved-VA.time) END AS age,
    VE.level, VE.cause, VE.description, VE.action, AN.annotation AS note, 
    CASE WHEN VA.time_resolved IS NULL THEN  false ELSE true END AS cleared, VA.current
    FROM vehicle_alarms AS VA
    LEFT OUTER JOIN vehicle_reg VR
        ON VA.vehicle_id = VR.id
    LEFT OUTER JOIN vehicle_errors VE
        ON VA.error_code = VE.id
    LEFT OUTER JOIN annotations AN
        ON VA.error_code = AN.reference_id and AN.reference_table = 'vehicle_errors'
    ORDER BY VA.id desc
      ";
            IQueryable<AlarmHistory> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<AlarmHistory>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<AlertEntity> QueryAlerts()
        {
            var sql = @"
      SELECT ALT.id, ALT.time, ALT.level, ALT.tag, ALT.message, ALT.ack_time, ALT.ack_by 
      FROM alerts AS ALT
      ORDER BY ALT.id desc
      ";

            IQueryable<AlertEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<AlertEntity>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleDioHistoryEntity> QueryVehicleDios(int vehicleId, DateTimeOffset from, DateTimeOffset to)
        {
            var sql = @"
      SELECT DIO.id, DIO.vehicle_id, 
        DIO.di_1, DIO.di_2, DIO.di_3, DIO.do_1, DIO.do_2, DIO.do_3, 
        DIO.history_change_time, DIO.history_change_type, DIO.history_source_id
      FROM vehicle_dio_history AS DIO
      WHERE
        DIO.vehicle_id = @vehicle_id 
        and
        @from <= DIO.history_change_time 
        and
        DIO.history_change_time <= @to
      ORDER BY DIO.history_change_time asc
      ";

            IQueryable<VehicleDioHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDioHistoryEntity>(sql, new
                {
                    vehicle_id = vehicleId,
                    from = from,
                    to = to
                }).AsQueryable();
            }
            return result;
        }
        public IQueryable<VehicleDio> QueryRecentDioBefore(int vehicleId, DateTimeOffset before)
        {
            var sql = @"
      SELECT 
        DIO.vehicle_id, 
        DIO.di_1, DIO.di_2, DIO.di_3, DIO.do_1, DIO.do_2, DIO.do_3
      FROM vehicle_dio_history AS DIO
      WHERE
        DIO.vehicle_id = @vehicle_id 
        and
        DIO.history_change_time <= @before
      ORDER BY DIO.history_change_time desc
      LIMIT 1
      ";

            IQueryable<VehicleDio> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDio>(sql, new
                {
                    vehicle_id = vehicleId,
                    before = before
                }).AsQueryable();
            }
            return result;
        }
    }
}
