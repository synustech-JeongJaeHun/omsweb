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
    VH.distance_total, VH.runtime_total, VH.type, VH.rail_in, GO.group_id
    FROM vehicles AS VH
        LEFT OUTER JOIN orders AS OD
    ON VH.order_id = OD.id AND OD.time_completed IS NULL AND OD.time_aborted IS NULL
        LEFT JOIN grouped_objects AS GO 
	  ON VH.id = GO.reference_id AND GO.reference_table = 'vehicle'
    ORDER BY VH.id
        ";
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
  }
}