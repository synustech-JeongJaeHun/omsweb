using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using Dapper;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
  public class SettingsRepository : DataAccess
  {
    public SettingsRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public IQueryable<SegmentWithVPartsNBlockingEntity> QuerySettingsSegments()
    {
      IQueryable<SegmentWithVPartsNBlockingEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT SG.id, SG.start_point, SG.end_point, SG.speed, SG.length, 
	        SGVP.steer_dir, SGVP.speed_ratio, SGVP.length, SGVP.oblow, SGVP.obhigh, SGVP.obdistance,
	        SGBL.id AS blocking_id, SGBL.segment_id AS segment_id, SGBL.disabled_by, SGBL.reason, 
	        CASE 
		        WHEN SGBL.id IS NOT NULL THEN true
		        WHEN SGBL.id IS NULL THEN false
	        END AS unuse
        FROM segments AS SG
	        LEFT JOIN segment_vparts AS SGVP on SG.id = SGVP.id
	        LEFT JOIN segment_blocking AS SGBL on SG.id = SGBL.segment_id
        ORDER BY SG.id;
        ";

        result = conn.Query<SegmentWithVPartsNBlockingEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<StationWithUnuseEntity> QuerySettingsStations()
    {
      IQueryable<StationWithUnuseEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT ST.id, ST.physical_id, ST.logical_id, ST.point, ST.direction, ST.carrier_type, ST.next_point, ST.offset, COALESCE(ST.unuse, false) as ususe
        FROM stations ST
        ORDER BY ST.id;
        ";

        result = conn.Query<StationWithUnuseEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<BufferWithUnuseEntity> QuerySettingsBuffers()
    {
      IQueryable<BufferWithUnuseEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT BF.id, BF.physical_id, BF.logical_id, BF.point, BF.direction, BF.next_point, BF.offset, COALESCE(BF.unuse, false) as unuse
        FROM buffers BF
        ORDER BY BF.id;
        ";

        result = conn.Query<BufferWithUnuseEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<PointWithAIVertexEntity> QuerySettingsPoints()
    {
      IQueryable<PointWithAIVertexEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT PS.id, PS.physical_id, PS.logical_id, PS.X, PS.Y,
	        AIV.id AS ai_vertices_id, AIV.point,
	        CASE 
		        WHEN AIV.id IS NOT NULL THEN true
		        WHEN AIV.id IS NULL THEN false
	        END AS vertex
        FROM points PS
	        LEFT JOIN ai_vertices AS AIV on PS.id = AIV.point 
        ORDER BY PS.id;
        ";

        result = conn.Query<PointWithAIVertexEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<ZcuEntity> QuerySettingsZcus()
    {
      IQueryable<ZcuEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT ZS.id, ZS.x, ZS.y, ZS.using_type, ZS.zcu_type
        FROM zcus AS ZS
        ORDER BY ZS.id;
        ";

        result = conn.Query<ZcuEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<ZcuInputZoneEntity> QuerySettingsZcuInputZones()
    {
      IQueryable<ZcuInputZoneEntity> result;
      using (var conn = ConnectTrack())
      {
        //var sql = @"
        //SELECT ZCP.id, ZCP.zcu_id, ZCP.priority_point, ZCP.zone_points
        //FROM zcu_input_zones AS ZCP
        //ORDER BY ZCP.zcu_id, ZCP.id
        //";
        var sql = @"
        SELECT ZCP.id, ZCP.zcu_id, ZCP.priority_point, ZCP.zone_points
        FROM zcu_input_zones AS ZCP
        WHERE ZCP.zcu_id = @ZCU_ID
        ORDER BY ZCP.zcu_id, ZCP.id;
        ";

        result = conn.Query<ZcuInputZoneEntity>(sql).AsQueryable();
        //result = conn.Query<ZcuInputZoneEntity>(sql, new { ZCU_ID = id }).AsQueryable();
      }
      return result;
    }

    public IQueryable<VehicleRegEntity> QuerySettingsVehicleRegs()
    {
      IQueryable<VehicleRegEntity> result;
      using (var conn = ConnectTrack())
      {
        var sql = @"
        SELECT VR.id, VR.logical_id
        FROM vehicle_reg AS VR
        ORDER BY VR.id;
        ";

        result = conn.Query<VehicleRegEntity>(sql).AsQueryable();
      }
      return result;
    }
  }
}