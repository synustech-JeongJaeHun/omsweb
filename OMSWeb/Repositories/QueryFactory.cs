using System;
using System.Collections.Generic;

namespace OMSWeb.Repositories
{
    public class QueryFactory
    {
        private static IDictionary<string, string> sqlMap = new Dictionary<string, string> {
      {"size", @"
        SELECT min(x) AS min_x,
          min(y) AS min_y,
					MAX(x) AS max_x,
          max(y) AS max_y, 
	        (max(x) - min(x)) AS width,
          (max(y) - min(y)) AS height 
        FROM points
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"point", @"
        SELECT 
          points.id AS id, 
          points.x AS x, 
          points.y AS y, 
          points.physical_id AS physical_id, 
          points.logical_id AS logical_id,
          homes.id as home_id
        FROM 
          points
          LEFT JOIN homes ON points.id = homes.point 
        ORDER BY points.id
      "},
      {"segment", @"
        SELECT SP.segment_id AS id, SG.physical_id AS physical_id, SG.logical_id AS logical_id, SG.start_point, SG.end_point, 
          SP.id AS segpart_id, 
          type,
          location,
          direction,
          SG.speed, SG.length
        FROM segment_parts AS SP
        INNER JOIN segments AS SG
          ON SP.segment_id = SG.id
        --*user_id_condition*--WHERE SP.user_id = @userId
        ORDER BY SP.segment_id, SP.id
      "},
      {"segmentDisable", @"
        SELECT id, segment_id, disabled_by AS disabled_by, reason AS disabled_reason
        FROM segment_blocking
        --*user_id_condition*--WHERE user_id =@userId
        ORDER BY segment_id
      "},
      {"cluster", @"
        SELECT id, logical_id, max_vehicles, string_agg(point_id::TEXT, ', ' ORDER BY point_id) AS points, color
        FROM (
            SELECT CT.id, CT.logical_id, CT.max_vehicles, CP.point_id AS point_id, CT.color
            FROM clusters AS CT
            INNER JOIN cluster_points AS CP
              ON CT.id = CP.cluster_id
              --*user_id_condition*--WHERE CT.user_id = @userId
        ) AS NEW_DATA
        GROUP BY id, logical_id, max_vehicles, color
      "},
       {"clusterSegments", @"
        SELECT id, logical_id, max_vehicles, string_agg(segment_id::TEXT, ', ' ORDER BY segment_id) AS segments, color
        FROM (
            SELECT CT.id, CT.logical_id, CT.max_vehicles, CS.segment_id AS segment_id, CT.color
            FROM clusters AS CT
            INNER JOIN cluster_segments AS CS
              ON CT.id = CS.cluster_id
              --*user_id_condition*--WHERE CT.user_id = @userId
        ) AS NEW_DATA
        GROUP BY id, logical_id, max_vehicles, color
      "},
       {"clusterStatus", @"
         SELECT CT.id, CT.logical_id, CS.server_id, 
            CASE 
                WHEN CS.status = 0 THEN 'RUN'
                WHEN CS.status = 1 THEN 'STOP'
                WHEN CS.status = 2 THEN 'Fault'
                WHEN CS.status = 3 THEN 'Warning'
                WHEN CS.status = 4 THEN 'Fail-Over'
                WHEN CS.status = 5 THEN 'Comm Fail'
                ELSE ' '
            END AS status, 
            CONCAT( CAST(CS.voltage AS TEXT),' [V]' ) AS voltage, 
            CONCAT( CAST(CS.current_igbt AS TEXT), ' [A]' ) AS current_igbt,
            CONCAT( CAST(CS.current_track AS TEXT), ' [A]' ) AS current_track, 
            CONCAT( CAST(TRUNC(CS.frequency::numeric / 10, 1) AS TEXT), ' [kHz]' ) AS frequency, 
            CONCAT( CAST(TRUNC(CS.temp_radiator::numeric / 10, 1) AS TEXT), ' [℃]' ) AS temp_radiator, 
            CONCAT( CAST(TRUNC(CS.temp_internal::numeric / 10, 1) AS TEXT), ' [℃]' ) AS temp_internal,  
            CASE 
                WHEN CS.sync = 0 THEN 'N.G'
                WHEN CS.sync = 11 THEN 'OK'
                ELSE ' '
            END AS sync, 
            CS.backup_id,
            CS.error_code, 
            CONCAT( CAST(CS.voltage_rs AS TEXT), ' [V]' ) AS voltage_rs, 
            CONCAT( CAST(CS.voltage_st AS TEXT), ' [V]' ) AS voltage_st,  
            CONCAT( CAST(CS.voltage_tr AS TEXT), ' [V]' ) AS voltage_tr,  
            CONCAT( CAST(CS.current_r AS TEXT), ' [A]' ) AS current_r, 
            CONCAT( CAST(CS.current_s AS TEXT), ' [A]' ) AS current_s,  
            CONCAT( CAST(CS.current_t AS TEXT), ' [A]' ) AS current_t, 
            CONCAT( CAST(CS.total_kw AS TEXT), ' [kW]' ) AS total_kw, 
            CONCAT( CAST(TRUNC(CS.wh::numeric / 1000, 3) AS TEXT), ' [kWh]' ) AS wh
        FROM clusters AS CT
        LEFT OUTER JOIN cluster_status AS CS
        ON CT.id = CS.converter_id
        ORDER BY CT.id
        --*user_id_condition*--WHERE user_id =@userId
      "},
       {"clusterStatusMap", @"
         SELECT CT.id, CT.logical_id, CS.server_id, CS.status, 
            CONCAT( CAST(CS.voltage AS TEXT),' [V]' ) AS voltage, 
            CONCAT( CAST(CS.current_igbt AS TEXT), ' [A]' ) AS current_igbt,
            CONCAT( CAST(CS.current_track AS TEXT), ' [A]' ) AS current_track, 
            CONCAT( CAST(TRUNC(CS.frequency::numeric / 10, 1) AS TEXT), ' [kHz]' ) AS frequency, 
            CONCAT( CAST(TRUNC(CS.temp_radiator::numeric / 10, 1) AS TEXT), ' [℃]' ) AS temp_radiator, 
            CONCAT( CAST(TRUNC(CS.temp_internal::numeric / 10, 1) AS TEXT), ' [℃]' ) AS temp_internal,  
            CASE 
                WHEN CS.sync = 0 THEN 'N.G'
                WHEN CS.sync = 11 THEN 'OK'
                ELSE ' '
            END AS sync, 
            CS.backup_id,
            CS.error_code, 
            CONCAT( CAST(CS.voltage_rs AS TEXT), ' [V]' ) AS voltage_rs, 
            CONCAT( CAST(CS.voltage_st AS TEXT), ' [V]' ) AS voltage_st,  
            CONCAT( CAST(CS.voltage_tr AS TEXT), ' [V]' ) AS voltage_tr,  
            CONCAT( CAST(CS.current_r AS TEXT), ' [A]' ) AS current_r, 
            CONCAT( CAST(CS.current_s AS TEXT), ' [A]' ) AS current_s,  
            CONCAT( CAST(CS.current_t AS TEXT), ' [A]' ) AS current_t, 
            CONCAT( CAST(CS.total_kw AS TEXT), ' [kW]' ) AS total_kw, 
            CONCAT( CAST(TRUNC(CS.wh::numeric / 1000, 3) AS TEXT), ' [kWh]' ) AS wh
        FROM clusters AS CT
        LEFT OUTER JOIN cluster_status AS CS
        ON CT.id = CS.converter_id
        ORDER BY CT.id
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"station", @"
        SELECT id AS id, physical_id AS physical_id, logical_id AS logical_id, point AS point_id,
          direction AS direction, carrier_type AS carrier_type, next_point, ""offset"" AS offset, unuse, carrier_id
        FROM stations
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"buffer", @"
        SELECT id, physical_id, logical_id AS logical_id, point AS point_id,
          direction AS direction, next_point, ""offset"" AS offset, unuse, carrier_id
        FROM buffers
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"zcu", @"
        SELECT Z.id, Z.x, Z.y, Z.using_type, Z.zcu_type, 
        CASE WHEN Z.status = 5 THEN TRUE ELSE FALSE END AS error 
        FROM zcus AS Z
        ORDER BY Z.id
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"zcuStatus", @"
        SELECT Z.id, Z.id::text AS logical_id, 
            CASE 
                WHEN Z.using_type = 0 THEN 'Not Use'
                WHEN Z.using_type = 1 THEN 'HW'
                WHEN Z.using_type = 2 THEN 'SW'
                ELSE 'HW'
            END AS using_type, 
            CASE
                WHEN Z.zcu_type = 0 THEN 'Std'
                WHEN Z.zcu_type = 1 THEN 'NType'
                ELSE 'Std'
            END AS zcu_type, 
            CASE 
                WHEN ZS.status = 5 THEN 'Error' 
                ELSE 'Normal' 
            END AS status,
            CASE
                WHEN ZS.errorCode IS NULL THEN 0
                ELSE ZS.errorCode
            END AS error_code,
            CASE
                WHEN ZS.pass_vehicle IS NULL THEN ';'
                WHEN ZS.pass_vehicle = '' THEN ';'
                ELSE ZS.pass_vehicle
            END AS pass_vehicle, 
            CASE
                WHEN ZS.vehicle_count IS NULL THEN '0;0'
                WHEN ZS.vehicle_count = '' THEN '0;0'
                ELSE ZS.vehicle_count
            END AS vehicle_count,
            CASE
                WHEN ZS.vehicle_info IS NULL THEN ',,,,,;,,,,,'
                WHEN ZS.vehicle_info = '' THEN ',,,,,;,,,,,'
                ELSE ZS.vehicle_info
            END AS vehicle_info
        FROM zcus AS Z
        LEFT OUTER JOIN zcu_status AS ZS
        ON Z.id = ZS.zcu_id
        ORDER BY Z.id
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"fireShutter", @"
        SELECT F.id, F.x, F.y, F.logical_id, F.segments, F.status 
        FROM fireshutters AS F
        ORDER BY F.id
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"fireShutterStatus", @"
        SELECT F.id, F.logical_id, F.segments, F.status, 
            CASE 
                WHEN F.status = 0 THEN 'Door closed'
                WHEN F.status = 1 THEN 'Door opened'
                ELSE 'Door opened'
            END AS status_msg
        FROM fireshutters AS F
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"mtl", @"
        SELECT id, physical_id, logical_id AS logical_id, point AS point_id, in_direction, out_direction, 
                '' AS in_lock_segment, '' AS out_lock_segment, unuse
        FROM mtls
        --*user_id_condition*--WHERE user_id =@userId
      "},
      {"vehiclePosition", @"
        SELECT 
            VH.id, VH.physical_id, VH.logical_id, VH.last_point AS cur_point, VH.next_point, VH.distance_point, VH.last_contact,
            VH.mode, VH.can_be_pushed, 
            CASE 
                WHEN VH.order_origin LIKE '%MCS%' THEN true 
                WHEN VH.order_origin LIKE '%*%' THEN true 
                ELSE false
            END As host_order, 
            VH.order_origin, VH.moving_state, VH.cargo_state, VH.is_sensor_stopped, VH.is_blocked, VH.error_list, VH.type, VH.cargo_transfer_result, 
            VH.map_db, 0 AS mapVersion,
            OD.id AS order_id, OD.logical_id AS order_logical_id, 
            --OD.location_pickup, 
            --OD.location_dropoff, 
            --OD.location_move, 
            CASE
			    WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
			    WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
                WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
                WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VH.logical_id
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
            VH.is_maint, 
            CASE 
                WHEN VH.connection = 0 THEN FALSE
                WHEN VH.connection = 1 THEN TRUE
                WHEN VH.connection = 2 THEN TRUE
                WHEN VH.connection = 3 THEN FALSE
                WHEN VH.connection IS NULL THEN FALSE
            END AS isConnected, 
            CASE 
            WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NOT NULL   -- FROM-TO order
                THEN
                    CASE 
                        WHEN OD.time_vehicle_arrived IS NULL
                        THEN OD.location_pickup		                                          -- display FROM
                        ELSE OD.location_dropoff		                                      -- display To
                    END
            WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NULL       -- FROM order
                THEN OD.location_pickup		                                          -- display FROM
            WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL       -- TO order
                THEN OD.location_dropoff		                                      -- display TO
            WHEN OD.location_move IS NOT NULL                                         -- MOVE order
                THEN OD.location_move		                                          -- display MOVETO
            END AS command_point

            FROM vehicles AS VH
            LEFT OUTER JOIN orders AS OD
            ON VH.order_id = OD.id AND OD.time_completed IS NULL AND OD.time_aborted IS NULL
            --*user_id_condition*--AND VH.user_id = OD.user_id    
            --*user_id_condition*--WHERE VH.user_id = @userId
            ORDER BY VH.id
      "},
       {"vehicleStates",  @"
            SELECT
            VH.id, VH.physical_id, VH.logical_id, VH.last_point AS cur_point, 
            VH.moving_state, VH.map_db,
            OD.id AS order_id,
            CASE 
                WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NOT NULL        -- FROM-TO order
                    THEN
                CASE 
                    WHEN OD.time_vehicle_arrived IS NULL THEN OD.location_pickup		                                        -- display FROM
                    ELSE OD.location_dropoff		                                    -- display To
                END
                WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NULL            -- FROM order
                    THEN OD.location_pickup		                                               -- display FROM
                WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL            -- TO order
                    THEN OD.location_dropoff		                                           -- display TO
                WHEN OD.location_move IS NOT NULL                                              -- MOVE order
                    THEN OD.location_move		                                               -- display MOVETO
            END AS command_point,

            --OD.location_pickup, 
            --OD.location_dropoff, 
            --OD.location_move,
            CASE
			    WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
			    WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
                WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
                WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VH.logical_id
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

            VH.cargo_state, 
            CR.carrier_id AS CarrierLabel,
            VH.mode,
            CASE 
                WHEN order_origin LIKE '%MCS%' THEN true 
                WHEN order_origin LIKE '%*%' THEN true 
                ELSE false
            END As host_order,  
            order_origin, can_be_pushed,
            VH.is_sensor_stopped, VH.is_zcu_blocked, VH.is_blocked,
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
	            ON VH.logical_id = CR.carrier_location and installed=1
            ORDER BY VH.id
      "},
      {"orderStatus", @"
      SELECT --*order_condition*
      *
      FROM (
        SELECT
        OD.id, 
        OD.origin,
        OD.logical_id, 
		CASE
			WHEN OD.location_pickup LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_pickup)
			WHEN OD.location_pickup LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_pickup)
            WHEN OD.location_pickup LIKE '%v%' THEN	(SELECT logical_Id FROM vehicles WHERE concat('v', cast(id as varchar)) = OD.location_pickup)
            WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL THEN VR.logical_id
			ELSE OD.location_pickup
		EnD AS location_pickup,
		CASE
			WHEN OD.location_dropoff LIKE '%s%' THEN	(SELECT logical_Id FROM stations WHERE concat('s', cast(id as varchar)) = OD.location_dropoff)
			WHEN OD.location_dropoff LIKE '%b%' THEN	(SELECT logical_Id FROM buffers WHERE concat('b', cast(id as varchar)) = OD.location_dropoff)
			ELSE OD.location_dropoff
		EnD AS location_dropoff,
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
        OD.assignment_type, 
        OD.assignment_details
        FROM orders AS OD
        LEFT OUTER JOIN vehicle_reg AS VR
            ON OD.vehicle_id = VR.id
        WHERE OD.time_completed IS NULL AND OD.time_aborted IS NULL AND OD.time_failed IS NULL
        --*user_id_condition*-- AND user_id = @userId
      ) AS WRAPPED_TABLE
      "},
      {"stationStatus", @"
        SELECT SS.id, SS.physical_id, SS.logical_id, SS.point, SS.direction, SS.next_point, SS.""offset"", SS.unuse, SS.carrier_id, GO.group_id
        FROM stations AS SS
            LEFT JOIN grouped_objects AS GO
        ON SS.id = GO.reference_id AND GO.reference_table = 'station'
        --*user_id_condition*-- AND user_id = @userId
      "},
      {"bufferStatus", @"
        SELECT BS.id, BS.physical_id, BS.logical_id, BS.point, BS.direction, BS.next_point, BS.""offset"", BS.unuse, BS.carrier_id, GO.group_id
        FROM buffers AS BS
            LEFT JOIN grouped_objects AS GO
        ON BS.id = GO.reference_id AND GO.reference_table = 'buffer'
        --*user_id_condition*--WHERE user_id =@userId
      "}
    };
        public static string GetSql(string name)
        {
            sqlMap.TryGetValue(name, out var sql);
            return sql;
        }

        public static string GetSql(string name, string userId)
        {
            var sql = GetSql(name);
            sql = sql.Replace("from points", "from playback_points", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join points", "join playback_points", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from segments", "from playback_segments", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join segments", "join playback_segments", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from segment_parts", "from playback_segment_parts", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join segment_parts", "join playback_segment_parts", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from segment_blocking", "from playback_segment_blocking", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join segment_blocking", "join playback_segment_blocking", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from stations", "from playback_stations", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join stations", "join playback_stations", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from buffers", "from playback_buffers", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join buffers", "join playback_buffers", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from mtls", "from playback_mtls", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join mtls", "join playback_mtls", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from clusters", "from playback_clusters", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join clusters", "join playback_clusters", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from cluster_points", "from playback_cluster_points", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join cluster_points", "join playback_cluster_points", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from vehicles", "from playback_vehicles", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join vehicles", "join playback_vehicles", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("from orders", "from playback_orders", StringComparison.OrdinalIgnoreCase);
            sql = sql.Replace("join orders", "join playback_orders", StringComparison.OrdinalIgnoreCase);

            sql = sql.Replace("--*user_id_condition*--", "", StringComparison.OrdinalIgnoreCase);

            return sql;
        }
    }
}