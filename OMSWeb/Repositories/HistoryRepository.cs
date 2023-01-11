using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class HistoryRepository : DataAccess
    {
        public HistoryRepository(IConfiguration configuration) : base(configuration)
        {
        }


        public int QueryOrdersCount(DateTimeOffset from, DateTimeOffset to, string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            /*
            var sql = $@"
                SELECT 
                    count(DISTINCT history_source_id)
                FROM order_history AS OD
                WHERE 
                    @from <= time_created and time_created <= @to
                    {WhereConditions}
                    ";*/

            string sql = $@"
                SELECT count(*) FROM (
                                   SELECT OD.id, OD.origin As origin, OD.history_source_id, OD.logical_id, 
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
                            OD.carrier_label As carrier_label, OD.time_created as time_created, OD.time_assigned as time_assigned, 
                            OD.time_vehicle_arrived, OD.time_load_started, OD.time_load_completed, 
                            OD.time_unload_started, OD.time_unload_completed, OD.time_completed as time_completed, OD.time_aborted as time_aborted, 
                            OD.time_failed as time_failed, 
                            CASE
                                WHEN OD.time_created IS NOT NULL AND OD.time_completed IS NOT NULL THEN extract('epoch' from OD.time_completed - OD.time_created) 
                                WHEN OD.time_created IS NOT NULL AND OD.time_aborted IS NOT NULL THEN extract('epoch' from OD.time_aborted - OD.time_created) 
                                WHEN OD.time_created IS NOT NULL AND OD.time_failed IS NOT NULL THEN extract('epoch' from OD.time_failed - OD.time_created) 
                                ELSE 0
                            END As age,
                            OD.distance_pickup, OD.distance_deliver AS distance_dropoff, OD.distance_move, OD.assignment_type, OD.assignment_details, 
                            OD.load_retry_cnt, OD.unload_retry_cnt as unload_retry_cnt, OD.err_result_code as result_code
                        FROM order_history AS OD
                        INNER JOIN (
                            SELECT history_source_id AS order_id, max(history_change_time) AS last_updated
                            FROM order_history
                            WHERE 
                                @from <= time_created and time_created <= @to
                            GROUP BY history_source_id
                        ) AS LAST_OD
                        ON OD.history_source_id = LAST_OD.order_id AND OD.history_change_time = LAST_OD.last_updated
                        LEFT OUTER JOIN vehicle_reg AS VR
                            ON OD.vehicle_id = VR.id

                ) OrderHistory

                {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                result = conn.QueryFirst<int>(sql, new { from, to });
            }
            return result;
        }

        public IQueryable<OrderHistoryEntity> QueryOrders(
            DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = string.Empty;
            string LimitConditions = @"LIMIT @take OFFSET @skip";

            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"ORDER BY {sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;

            string sql = $@"
                SELECT * FROM (
                        SELECT OD.id, OD.origin As origin, OD.history_source_id, OD.logical_id, 
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
                            OD.carrier_label As carrier_label, OD.time_created as time_created, OD.time_assigned as time_assigned, 
                            OD.time_vehicle_arrived, OD.time_load_started, OD.time_load_completed, 
                            OD.time_unload_started, OD.time_unload_completed, OD.time_completed as time_completed, OD.time_aborted as time_aborted, 
                            OD.time_failed as time_failed, 
                            CASE
                                WHEN OD.time_created IS NOT NULL AND OD.time_completed IS NOT NULL 
                                    THEN extract('epoch' from date_trunc('second', OD.time_completed) - date_trunc('second', OD.time_created)) * interval '1 sec' 
                                WHEN OD.time_created IS NOT NULL AND OD.time_aborted IS NOT NULL 
                                    THEN extract('epoch' from date_trunc('second', OD.time_aborted) - date_trunc('second', OD.time_created)) * interval '1 sec'
                                WHEN OD.time_created IS NOT NULL AND OD.time_failed IS NOT NULL 
                                    THEN extract('epoch' from date_trunc('second', OD.time_failed) - date_trunc('second', OD.time_created)) * interval '1 sec'
                                ELSE 0 * interval '1 sec'
                            END As age,
                            OD.distance_pickup, OD.distance_deliver AS distance_dropoff, OD.distance_move, OD.assignment_type, OD.assignment_details,
                            OD.load_retry_cnt, OD.unload_retry_cnt as unload_retry_cnt, 
                            CASE 
                                WHEN OD.err_result_code LIKE '%SourceInterlock%' THEN 'Source PIO Timeout'
                                WHEN OD.err_result_code LIKE '%DestInterlock%' THEN 'Dest PIO Timeout'
                                ELSE OD.err_result_code
                            END as result_code

                        FROM order_history AS OD
                        INNER JOIN (
                            SELECT history_source_id AS order_id, max(history_change_time) AS last_updated
                            FROM order_history
                            WHERE 
                                @from <= time_created and time_created <= @to
                            GROUP BY history_source_id
                        ) AS LAST_OD
                        ON OD.history_source_id = LAST_OD.order_id AND OD.history_change_time = LAST_OD.last_updated
                        LEFT OUTER JOIN vehicle_reg AS VR
                            ON OD.vehicle_id = VR.id

                        --ORDER BY history_source_id
                        {SortConditions}

                ) OrderHistory

                {WhereConditions}

                --LIMIT @take OFFSET @skip
                {LimitConditions}
                    ";

            IQueryable<OrderHistoryEntity> result;
            using (var conn = ConnectTrack(500))
            {
                result = conn.Query<OrderHistoryEntity>(sql, new { from, to, skip, take }).AsQueryable();
            }
            return result;
        }


        public int QueryVehiclesCount(DateTimeOffset from, DateTimeOffset to, string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";

            string sql = $@"
                SELECT count(*) FROM (
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
                            WHERE 
                                @from <= history_change_time and history_change_time <= @to
                                
                            GROUP BY history_source_id
                        ) AS LVH
                        ON VH.id = LVH.max_id    
                ) vehicleHistory

                {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                result = conn.QueryFirst<int>(sql, new { from, to });
            }
            return result;
        }

        public IQueryable<VehicleHistoryEntity> QueryVehicles(
            DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = @"VH.id";
            string LimitConditions = @"LIMIT @take OFFSET @skip";

            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"{sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;

            string sql = $@"
                SELECT * FROM (
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
                            WHERE 
                                @from <= history_change_time and history_change_time <= @to
                                
                            GROUP BY history_source_id

                        ) AS LVH
                        ON VH.id = LVH.max_id    
                        --ORDER BY VH.id 
                        ORDER BY {SortConditions}
                ) vehicleHistory

                {WhereConditions}

                --LIMIT @take OFFSET @skip
                {LimitConditions}
                    ";
            IQueryable<VehicleHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleHistoryEntity>(sql, new { from, to, skip, take }).AsQueryable();
            }
            return result;
        }


        public int QueryAlarmsCount(DateTimeOffset from, DateTimeOffset to, string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";

            string sql = $@"
                SELECT count(*) FROM (
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
                        WHERE 
                            @from <= VA.time and VA.time <= @to
                    ) alarmHistory

                    {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                result = conn.QueryFirst<int>(sql, new { from, to });
            }
            return result;
        }

        public IQueryable<AlarmHistory> QueryAlarms(
            DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = @"VA.id desc";
            string LimitConditions = @"LIMIT @take OFFSET @skip";

            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"{sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;

            string sql = $@"
                SELECT * FROM (
                        SELECT VA.id, VA.time, VA.error_code, VA.vehicle_id, VR.logical_id AS vehicle_logical_id,
                            VA.time_resolved, 
                            CASE 
                                WHEN VA.time_resolved IS NULL 
                                    THEN  extract('epoch' from date_trunc('second', now()) - date_trunc('second', VA.time)) * interval '1 sec'
                                    ELSE  extract('epoch' from date_trunc('second', VA.time_resolved) - date_trunc('second', VA.time)) * interval '1 sec'
                            END AS age,
                            VE.level, VE.cause, VE.description, VE.action, AN.annotation AS note, 
                            CASE WHEN VA.time_resolved IS NULL THEN  false ELSE true END AS cleared, VA.current
                        FROM vehicle_alarms AS VA
                        LEFT OUTER JOIN vehicle_reg VR
                            ON VA.vehicle_id = VR.id
                        LEFT OUTER JOIN vehicle_errors VE
                            ON VA.error_code = VE.id
                        LEFT OUTER JOIN annotations AN
                            ON VA.error_code = AN.reference_id and AN.reference_table = 'vehicle_errors'
                        WHERE 
                            @from <= VA.time and VA.time <= @to
                            
                        --ORDER BY VA.id desc
                        ORDER BY {SortConditions}

                    ) alarmHistory

                    {WhereConditions}

                    --LIMIT @take OFFSET @skip
                    {LimitConditions}
                    ";
            IQueryable<AlarmHistory> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<AlarmHistory>(sql, new { from, to, skip, take }).AsQueryable();
            }
            return result;
        }

        public int QueryAlertsCount(DateTimeOffset from, DateTimeOffset to, string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";

            string sql = $@"
                SELECT count(*) FROM (
                        SELECT 
                            ALT.id, ALT.time, ALT.level, ALT.tag, ALT.message, ALT.ack_time, ALT.ack_by 
                        FROM alerts AS ALT
                        WHERE 
                            @from <= ALT.time and ALT.time <= @to
 
                    ) alertHistory

                    {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                result = conn.QueryFirst<int>(sql, new { from, to });
            }
            return result;
        }

        public IQueryable<AlertEntity> QueryAlerts(
            DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = @"ALT.id desc";
            string LimitConditions = @"LIMIT @take OFFSET @skip";

            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"{sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;

            string sql = $@"
                SELECT * FROM (
                        SELECT 
                            ALT.id, ALT.time, ALT.level, ALT.tag, ALT.message, ALT.ack_time, ALT.ack_by 
                        FROM alerts AS ALT
                        WHERE 
                            @from <= ALT.time and ALT.time <= @to
                            
                        --ORDER BY ALT.id desc
                        ORDER BY {SortConditions}
 
                    ) alertHistory

                    {WhereConditions}

                    --LIMIT @take OFFSET @skip
                    {LimitConditions}
                    ";

            IQueryable<AlertEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<AlertEntity>(sql, new { from, to, skip, take }).AsQueryable();
            }
            return result;
        }

        public int QueryNacksCount(DateTimeOffset from, DateTimeOffset to, string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";

            string sql = $@"
                SELECT count(*) FROM (
                        SELECT 
                            CASE WHEN cmd_id is null THEN '' ELSE cmd_id END as CommandID, 
                            CASE WHEN time_modified is null THEN now() ELSE time_modified END as ModifiedTime, 
                            CASE WHEN origin is null THEN '' ELSE origin END as Origin,
                            CASE WHEN data::json->>'rcmd' is null THEN data::json->>'' ELSE data::json->>'rcmd' END as Rcmd,
                            CASE WHEN data::json->>'request' is null THEN data::json->>'' ELSE data::json->>'request' END as Request,
                            CASE WHEN data::json->>'sourceName' is null THEN data::json->>'' ELSE data::json->>'sourceName' END as SourceName,
                            CASE WHEN data::json->>'destName' is null THEN data::json->>'' ELSE data::json->>'destName' END as DestName,
                            CASE WHEN data::json->>'carrierID' is null THEN data::json->>'' ELSE data::json->>'carrierID' END as CarrierID,
                            CASE WHEN data::json->>'newCarrierID' is null THEN data::json->>'' ELSE data::json->>'newCarrierID' END as NewCarrierID,
                            CASE WHEN data::json->>'carrierLoc' is null THEN data::json->>'' ELSE data::json->>'carrierLoc' END as CarrierLoc,
                            CASE WHEN data::json->>'nack' is null THEN data::json->>'' ELSE data::json->>'nack' END as Nack,
                            CASE WHEN data::json->>'nackReason' is null THEN data::json->>'' ELSE data::json->>'nackReason' END as NackReason,
	                        CASE WHEN data::json->>'nackParam' is null THEN data::json->>'' ELSE data::json->>'nackParam' END as NackParam
                        FROM rcmd_history
                        WHERE 
                            @from <= time_modified AND time_modified <= @to 

                ) rmdHistory

                {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                result = conn.QueryFirst<int>(sql, new { from, to });
            }
            return result;
        }

        public IQueryable<NackHistoryEntity> QueryNacks(
            DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = @"ModifiedTime desc";
            string LimitConditions = @"LIMIT @take OFFSET @skip";

            if (string.IsNullOrWhiteSpace(condition) == false)  WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false)       SortConditions = $"{sort}";
            if (skip <= 0 && take <= 0)                         LimitConditions = string.Empty;

            string sql = $@"
                SELECT * FROM (
                        SELECT 
                            CASE WHEN cmd_id is null THEN '' ELSE cmd_id END as CommandID, 
                            CASE WHEN time_modified is null THEN now() ELSE time_modified END as ModifiedTime, 
                            CASE WHEN origin is null THEN '' ELSE origin END as Origin,
                            CASE WHEN data::json->>'rcmd' is null THEN data::json->>'' ELSE data::json->>'rcmd' END as Rcmd,
                            CASE WHEN data::json->>'request' is null THEN data::json->>'' ELSE data::json->>'request' END as Request,
                            CASE WHEN data::json->>'sourceName' is null THEN data::json->>'' ELSE data::json->>'sourceName' END as SourceName,
                            CASE WHEN data::json->>'destName' is null THEN data::json->>'' ELSE data::json->>'destName' END as DestName,
                            CASE WHEN data::json->>'carrierID' is null THEN data::json->>'' ELSE data::json->>'carrierID' END as CarrierID,
                            CASE WHEN data::json->>'newCarrierID' is null THEN data::json->>'' ELSE data::json->>'newCarrierID' END as NewCarrierID,
                            CASE WHEN data::json->>'carrierLoc' is null THEN data::json->>'' ELSE data::json->>'carrierLoc' END as CarrierLoc,
                            CASE WHEN data::json->>'nack' is null THEN data::json->>'' ELSE data::json->>'nack' END as Nack,
                            CASE WHEN data::json->>'nackReason' is null THEN data::json->>'' ELSE data::json->>'nackReason' END as NackReason,
	                        CASE WHEN data::json->>'nackParam' is null THEN data::json->>'' ELSE data::json->>'nackParam' END as NackParam
                        FROM rcmd_history
                        WHERE 
                            @from <= time_modified AND time_modified <= @to 
                            
                        --ORDER BY ModifiedTime desc
                        ORDER BY {SortConditions}

                ) rmdHistory

                {WhereConditions}

                --LIMIT @take OFFSET @skip
                {LimitConditions}
                    ";

            IQueryable<NackHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<NackHistoryEntity>(sql, new { from, to, skip, take }).AsQueryable();
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
        public IQueryable<VehicleDioHistoryEntity> QueryRecentDioBefore(int vehicleId, DateTimeOffset before)
        {
            var sql = @"
              SELECT 
                DIO.id, DIO.vehicle_id, 
                DIO.di_1, DIO.di_2, DIO.di_3, DIO.do_1, DIO.do_2, DIO.do_3, 
                DIO.history_change_time, DIO.history_change_type, DIO.history_source_id
              FROM vehicle_dio_history AS DIO
              WHERE
                DIO.vehicle_id = @vehicle_id 
                and
                DIO.history_change_time <= @before
              ORDER BY DIO.history_change_time desc
              LIMIT 1
              ";

            IQueryable<VehicleDioHistoryEntity> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDioHistoryEntity>(sql, new
                {
                    vehicle_id = vehicleId,
                    before = before
                }).AsQueryable();
            }
            return result;
        }
    }
}
