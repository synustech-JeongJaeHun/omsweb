using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class VehicleRepository : DataAccess
    {
        public VehicleRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<VehicleDio> QueryRecentDio(int vehicleId)
        {
            var sql = @"
      SELECT 
        DIO.vehicle_id, 
        DIO.di_1, DIO.di_2, DIO.di_3, DIO.do_1, DIO.do_2, DIO.do_3
      FROM vehicle_dio AS DIO
      WHERE DIO.vehicle_id = @vehicle_id
      ";

            IQueryable<VehicleDio> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDio>(sql, new
                {
                    vehicle_id = vehicleId
                }).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleDioCategory> QueryDioCategories()
        {
            var sql = @"
      SELECT CAT.id, CAT.in_category, CAT.in_name, CAT.out_category, CAT.out_name
      FROM vehicle_dio_category AS CAT
      ";

            IQueryable<VehicleDioCategory> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDioCategory>(sql).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleState> QueryVehicleStatus(int vehicleId)
        {
            var sql = @"
             SELECT
    VH.id, VH.physical_id, VH.logical_id, VH.last_point AS cur_point, 
    VH.moving_state, 
    VH.map_db, 0 AS mapVersion,
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
    VH.dest_point,
    OD.location_pickup, OD.location_dropoff, OD.location_move,
    VH.cargo_state, 
    VH.carrier_id,
    VH.mode,
    CASE 
        WHEN order_origin LIKE '%MCS%' THEN true 
        WHEN order_origin LIKE '%*%' THEN true 
        ELSE false
    END As host_order,  
    order_origin, can_be_pushed,
    VH.is_sensor_stopped, 
    VH.is_zcu_blocked, 
    VH.is_blocked,
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
    WHERE VH.id = @id
            ";

            IQueryable<VehicleState> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleState>(sql, new
                {
                    id = vehicleId
                }).AsQueryable();
            }
            return result;
        }
    }
}
