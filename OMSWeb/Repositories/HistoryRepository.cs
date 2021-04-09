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

    public IQueryable<OrderEntity> QueryOrders()
    {
      var sql = @"
    SELECT id, origin, history_source_id, logical_id, 
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
    location_pickup, location_dropoff, location_move, priority, vehicle_id, carrier_label, time_created, time_assigned, time_vehicle_arrived, time_load_started, time_load_completed, time_unload_started, time_unload_completed, time_completed, time_aborted, time_failed, distance_pickup, distance_deliver AS distance_dropoff, distance_move, assignment_type, assignment_details
    FROM order_history AS OD
    INNER JOIN (
        SELECT history_source_id AS order_id, max(history_change_time) AS last_updated
        FROM order_history
        GROUP BY history_source_id
    ) AS LAST_OD
    ON OD.history_source_id = LAST_OD.order_id AND OD.history_change_time = LAST_OD.last_updated
      ";
      IQueryable<OrderEntity> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<OrderEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<VehicleHistory> QueryVehicles()
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
      IQueryable<VehicleHistory> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<VehicleHistory>(sql).AsQueryable();
      }
      return result;
    }
  }
}
