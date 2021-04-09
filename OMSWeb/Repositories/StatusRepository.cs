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
        var sql = @"
    SELECT
    id, 
    origin,
    logical_id, location_pickup, location_dropoff, location_move,
    CASE
      WHEN time_failed IS NOT NULL THEN 'FAILED'
      WHEN time_aborted IS NOT NULL THEN 'ABORTED'
      WHEN time_completed IS NOT NULL THEN 'COMPLETED'
      WHEN time_unload_completed IS NOT NULL THEN 'UNLOADED'
      WHEN time_unload_started IS NOT NULL THEN 'UNLOADING'
      WHEN time_load_completed IS NOT NULL THEN 'LOADED'
      WHEN time_load_started IS NOT NULL THEN 'LOADING'
      WHEN time_vehicle_arrived IS NOT NULL THEN 'ARRIVED'
      WHEN time_assigned IS NOT NULL THEN 'ASSIGNED'
      WHEN time_assigned IS NULL THEN 'UNASSIGNED'
    END AS state,
    vehicle_id,
    priority,
    carrier_label,
    time_created,
    time_assigned,
    time_completed,
    time_aborted,
    time_failed,
    EXTRACT(epoch FROM (
        CASE
        WHEN time_failed IS NOT NULL THEN (time_failed - time_created)
        WHEN time_aborted IS NOT NULL THEN (time_aborted - time_created)
        WHEN time_completed IS NOT NULL THEN (time_completed - time_created)
        ELSE (now() - time_created)
        END)) AS duration_total,
    EXTRACT(epoch FROM (time_assigned - time_created)) AS duration_unassigned,
    EXTRACT(epoch FROM (time_load_started - time_assigned)) AS duration_pickup,
    EXTRACT(epoch FROM (time_load_completed - time_load_started)) AS duration_load,
    EXTRACT(epoch FROM (
        CASE
        WHEN time_load_completed IS NOT NULL THEN (time_unload_started - time_load_completed)
        ELSE (time_unload_started - time_assigned)
        END)) AS duration_dropoff,
    EXTRACT(epoch FROM (time_unload_completed - time_unload_started)) AS duration_unload,
    EXTRACT(epoch FROM (time_vehicle_arrived - time_assigned)) AS duration_move,
    distance_pickup AS distance_pickup,
    distance_deliver AS distance_dropoff,
    distance_move AS distance_move,
    assignment_type, assignment_details
    FROM orders
    WHERE time_completed IS NULL AND time_aborted IS NULL AND time_failed IS NULL
        ";
        result = conn.Query<OrderState>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<VehicleState> QueryVehicleStates()
    {
      IQueryable<VehicleState> result;
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
    VH.cargo_state, VH.mode,
    order_origin, can_be_pushed,
    VH.is_sensor_stopped, VH.is_blocked,
    CASE
    WHEN LENGTH(VH.error_list) = 0 THEN '0' ELSE VH.error_list
    END AS error_list,
    VH.distance_total, VH.runtime_total, VH.type
    FROM vehicles AS VH
        LEFT OUTER JOIN orders AS OD
    ON VH.order_id = OD.id AND OD.time_completed IS NULL AND OD.time_aborted IS NULL
    ORDER BY VH.id
        ";
        result = conn.Query<VehicleState>(sql).AsQueryable();
      }
      return result;
    }
  }
}