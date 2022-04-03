using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
    public class ReportRepository : DataAccess
    {
        public ReportRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<ReportTranNormal> QueryReportTranNormal()
        {
            IQueryable<ReportTranNormal> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("reportTranNormal");
                result = conn.Query<ReportTranNormal>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<ReportTranNormal> QueryReportTranNormal(DateTime start, DateTime end)
        {
            IQueryable<ReportTranNormal> result;
            using (var conn = ConnectTrack())
            {
                //var sql = QueryFactory.GetSql("reportTranNormal");
                var sql = @"
                    select total, avg, min, max, devn, 
	                    (total/duration_hour) as ph,
	                    (total/duration_year) as yealy,
	                    (total/duration_month) as monthly,
	                    (total/duration_week) as weekly,
	                    (total/duration_day) as daily
                    from
                    (
	                    select total, avg, min, max, devn, 
		                    extract(epoch from max_time - min_time) / 3600 as duration_hour, 
		                    (extract(day from max_time) - extract(day from min_time) + 1) as duration_day,
		                    (extract('week' from max_time) - extract('week' from min_time) + 1) as duration_week,
		                    (extract(month from max_time) - extract(month from min_time) + 1) as duration_month,
		                    (extract(year from max_time) - extract(year from min_time) + 1) as duration_year
	                    from
	                    (
		                    select
			                    count(t) as total, avg(t), min(t), max(t), stddev(t) as devn, min(time_last) as min_time, max(time_last) as max_time
		                    from
			                    (select id, t, time_last
			                    from
				                    (select id,vehicle_id, 
				 	                    location_pickup as source, location_dropoff as dest,
				 	                    time_created, time_completed,
					                    greatest(time_created, time_assigned, time_vehicle_arrived,
							                    time_load_completed, time_unload_started, time_completed) as time_last,
					                    extract(epoch from time_completed - time_created) as t
				                    from orders
				                    ) od0
			                    where t is not null
			                        --*and_condition_start*
			                        --*and_condition_end*
			                    ) od1
	                    ) od2
                    ) od3	
                    ";
                    sql = sql.Replace("--*and_condition_start*", $"and time_last >= @start::timestamptz");
                    sql = sql.Replace("--*and_condition_end*", $"and time_last <= @end::timestamptz");

                result = conn.Query<ReportTranNormal>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<ReportTranAbnormal> QueryReportTranAbnormal()
        {
            IQueryable<ReportTranAbnormal> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
    SELECT
    VH.id, VH.physical_id, VH.logical_id, VH.last_point AS cur_point, 
    VH.moving_state, VH.map_db,
    OD.id AS order_id,
    CASE 
    WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NOT NULL        -- FROM-TO order
    THEN
        CASE 
        WHEN OD.time_vehicle_arrived IS NULL
        THEN OD.location_pickup		                                        -- display FROM
        ELSE OD.location_dropoff		                                    -- display To
        END
    WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NULL            -- FROM order
    THEN OD.location_pickup		                                                -- display FROM
    WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL            -- TO order
    THEN OD.location_dropoff		                                            -- display TO
    WHEN OD.location_move IS NOT NULL                                              -- MOVE order
    THEN OD.location_move		                                                -- display MOVETO
    END AS command_point,
    OD.location_pickup, OD.location_dropoff, OD.location_move,
    VH.cargo_state, 
    CR.carrier_id AS CarrierLabel,
    VH.mode,
    CASE 
        WHEN order_origin LIKE '%MCS%' THEN true 
        WHEN order_origin LIKE '%*%' THEN true 
        ELSE false
    END As host_order,  
    order_origin, can_be_pushed,
    VH.is_sensor_stopped, VH.is_blocked,
    CASE
    WHEN LENGTH(VH.error_list) = 0 THEN '0' ELSE VH.error_list
    END AS error_list,
    VH.distance_total, VH.runtime_total, VH.type, VH.rail_in, VH.is_maint, 
    CASE 
        WHEN VH.connection = 0 THEN FALSE
        WHEN VH.connection = 1 THEN TRUE
        WHEN VH.connection = 2 THEN TRUE
        WHEN VH.connection = 3 THEN FALSE
        WHEN VH.connection IS NULL THEN FALSE
    ENd AS isConnected, 
    GO.group_id
    FROM vehicles AS VH
    LEFT OUTER JOIN orders AS OD
        ON VH.order_id = OD.id AND OD.time_completed IS NULL AND OD.time_aborted IS NULL
    LEFT JOIN grouped_objects AS GO 
	    ON VH.id = GO.reference_id AND GO.reference_table = 'vehicle'
    LEFT JOIN carriers AS CR 
	    ON VH.logical_id = CR.carrier_location
    ORDER BY VH.id
        ";
                result = conn.Query<ReportTranAbnormal>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<ReportAlarms> QueryReportAlarms()
        {
            IQueryable<ReportAlarms> result;
            using (var conn = ConnectTrack())
            {
                var sql = QueryFactory.GetSql("reportAlarms");
                result = conn.Query<ReportAlarms>(sql).AsQueryable();
            }
            return result;
        }
    }
}