using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using Dapper;
using Npgsql;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class SettingsRepository : DataAccess
    {
        public SettingsRepository(IConfiguration configuration) : base(configuration)
        {
        }


        public SettingModeEntity QuerySettingsBalance()
        {
            SettingModeEntity result;

            var sql = @"SELECT home_mode, ivr_mode, chain_manual_command_disabled FROM setting_mode";

            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.QueryFirst<SettingModeEntity>(sql);
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }


        public IQueryable<AlternateStationEntity> QuerySettingsAlternateStations(string stationLikeKey)
        {
            IQueryable<AlternateStationEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = $@"SELECT id, logical_id FROM stations 
                            WHERE logical_id LIKE '%{stationLikeKey}%' ORDER BY id";

                try
                {
                    result = conn.Query<AlternateStationEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        
        public string QueryOnlineName(string id, string type)
        {
            string result = null;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = string.Empty;
                    if (type.ToLower() == "buffer") sql = $@"SELECT logical_id FROM buffers WHERE id={id}";
                    else if (type.ToLower() == "station") sql = $@"SELECT logical_id FROM stations WHERE id={id}";
                    else if (type.ToLower() == "vehicle") sql = $@"SELECT logical_id FROM vehicle_reg WHERE id={id}";

                    result = conn.QueryFirst<string>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryOnlineName] => null");
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<GroupEntity> QuerySettingsGroups()
        {
            IQueryable<GroupEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT DISTINCT GOS.group_id AS id
        FROM grouped_objects GOS
        ORDER BY GOS.group_id;
        ";

                try
                {
                    result = conn.Query<GroupEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<GroupedObjectEntity> QuerySettingsGroupedObjects()
        {
            IQueryable<GroupedObjectEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    SELECT
	                    GOS.id,
	                    GOS.group_id,
	                    GOS.reference_id,
	                    GOS.reference_table,
	                    COALESCE(HomesTable.point, 0) AS home_point
                    FROM grouped_objects GOS
                    LEFT JOIN homes HomesTable
                    ON GOS.reference_id = HomesTable.id AND GOS.reference_table = 'home'
                    ORDER BY GOS.id
                ";

                try
                {
                    result = conn.Query<GroupedObjectEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<int> QuerySettingsGroupIsAvailableHomes(int groupId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // Home이 중복 Group에 포함되도록 허용된 경우 아래 쿼리 사용
                // Group 중복 처리시에 @group_id 파라미터로 현재 조회중인 그룹 ID를 넘겨서 처리.
                var sql = string.Format(@"        
        SELECT id
        FROM homes HMS 
        WHERE NOT EXISTS
        (
	        SELECT 1 
	        FROM grouped_objects GOS 
	        WHERE GOS.reference_table = 'home' AND GOS.reference_id = HMS.id AND GOS.group_id = {0}
        )
        ORDER BY HMS.id;
        ", groupId);

                // 현재 Home (Home point는 중복 그룹에 포함되지 않아서 아래 쿼리 사용함.)
                /*
                var sql2 = @"
                SELECT id 
                FROM homes HMS 
                WHERE NOT EXISTS
                (
                    SELECT 1 
                    FROM grouped_objects GOS 
                    WHERE GOS.reference_table = 'home' AND GOS.reference_id = HMS.id
                )
                ORDER BY HMS.id;
                ";
                */

                try
                { 
                    result = conn.Query<int>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<int> QuerySettingsGroupIsAvailableStations(int groupId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // Station이 중복 Group에 포함되도록 허용된 경우 아래 쿼리 사용
                // Group 중복 처리시에 @group_id 파라미터로 현재 조회중인 그룹 ID를 넘겨서 처리.
                var sql = string.Format(@"
        SELECT id
        FROM stations STS
        WHERE NOT EXISTS
        (
	        SELECT 1 
	        FROM grouped_objects GOS 
	        WHERE GOS.reference_table = 'station' AND GOS.reference_id = STS.id	AND GOS.group_id = {0}
        )
        ORDER BY STS.id;
        ", groupId);

                // 현재 Station (Station은 중복 그룹에 포함되지 않아서 아래 쿼리 사용함.)
                /*
                var sql2 = @"
                SELECT id
                FROM stations STS
                WHERE NOT EXISTS
                (
                    SELECT 1 
                    FROM grouped_objects GOS 
                    WHERE GOS.reference_table = 'station' AND GOS.reference_id = STS.id	
                )
                ORDER BY STS.id;
                ";
                */

                try
                {
                    result = conn.Query<int>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<int> QuerySettingsGroupIsAvailableVehicles(int groupId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // Vehicle이 중복 Group에 포함되도록 허용된 경우 아래 쿼리 사용
                // Group 중복 처리시에 @group_id 파라미터로 현재 조회중인 그룹 ID를 넘겨서 처리.
                var sql = string.Format(@"
        SELECT id
        FROM vehicle_reg VHS
        WHERE NOT EXISTS
        (
	        SELECT 1 
	        FROM grouped_objects GOS 
	        WHERE GOS.reference_table = 'vehicle' AND GOS.reference_id = VHS.id AND GOS.group_id = {0}
        )
        ORDER BY VHS.id;
        ", groupId);

                // 현재 Vehicle (Vehicle은 중복 그룹에 포함되지 않아서 아래 쿼리 사용함.)
                /*
                var sql2 = @"
                SELECT id
                FROM vehicle_reg VHS
                WHERE NOT EXISTS
                (
                    SELECT 1 
                    FROM grouped_objects GOS 
                    WHERE GOS.reference_table = 'vehicle' AND GOS.reference_id = VHS.id		
                )
                ORDER BY VHS.id;
                ";
                */

                try
                {
                    result = conn.Query<int>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<int> QuerySettingsGroupIsAvailableBuffers(int groupId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // Buffer가 중복 Group에 포함되도록 허용된 경우 아래 쿼리 사용
                // Group 중복 처리시에 @group_id 파라미터로 현재 조회중인 그룹 ID를 넘겨서 처리.
                var sql = string.Format(@"
        SELECT id
        FROM buffers BFS
        WHERE NOT EXISTS
        (
	        SELECT 1 
	        FROM grouped_objects GOS 
	        WHERE GOS.reference_table = 'buffer' AND GOS.reference_id = BFS.id AND GOS.group_id = {0}
        )
        ORDER BY BFS.id;
        ", groupId);


                // 현재 Buffer (Buffer는 중복 그룹에 포함되지 않아서 아래 쿼리 사용함.)
                /*
                var sql2 = @"
                SELECT id
                FROM buffers BFS
                WHERE NOT EXISTS
                (
                    SELECT 1 
                    FROM grouped_objects GOS 
                    WHERE GOS.reference_table = 'buffer' AND GOS.reference_id = BFS.id		
                )
                ORDER BY BFS.id;
                ";
                */

                try
                {
                    result = conn.Query<int>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<ClusterEntity> QuerySettingsClusters()
        {
            IQueryable<ClusterEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT CS.id, CS.logical_id, CS.max_vehicles, CS.color 
        FROM clusters CS
        ORDER BY CS.id;
        ";

                try
                { 
                    result = conn.Query<ClusterEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<ClusterPointEntity> QuerySettingsClusterPoints()
        {
            IQueryable<ClusterPointEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT CPS.id, CPS.point_id, CPS.cluster_id 
        FROM cluster_points CPS 
        ORDER BY CPS.cluster_id, CPS.point_id; 
        ";
                try
                {
                    result = conn.Query<ClusterPointEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<int> QuerySettingsClusterIsAvailablePoints(int clusterId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // cluster_points 만 조회
                /*
                var sql_ = string.Format(@"
                SELECT CPS.point_id 
                FROM cluster_points CPS 
                    WHERE cluster_id != {0}
                ORDER BY CPS.point_id;
                ", clusterId);
                */
                var sql = string.Format(@"
        SELECT id
        FROM points PS 
        WHERE NOT EXISTS
        (
	        SELECT 1
	        FROM cluster_points CPS
	        WHERE CPS.cluster_id = {0} and CPS.point_id = PS.id
        )
        ORDER BY PS.id;
        ", clusterId);

                try
                { 
                    result = conn.Query<int>(sql).AsQueryable();
                }
                    catch (Exception e)
                {
                    result = null;
                }
        }
            return result;
        }

        public IQueryable<int> QuerySettingsClusterAssignedPoints(int clusterId)
        {
            IQueryable<int> result;
            using (var conn = ConnectTrack())
            {
                // cluster_points 만 조회
                /*
                var sql_ = string.Format(@"
                SELECT CPS.point_id 
                FROM cluster_points CPS 
                    WHERE cluster_id = {0}
                ORDER BY CPS.point_id;
                ", clusterId);
                */
                var sql = string.Format(@"
        SELECT id
        FROM points PS 
        WHERE EXISTS
        (
	        SELECT 1
	        FROM cluster_points CPS
	        WHERE CPS.cluster_id = {0} and CPS.point_id = PS.id
        )
        ORDER BY PS.id;        
        ", clusterId);

                try
                { 
                    result = conn.Query<int>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
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
                try
                { 
                    result = conn.Query<SegmentWithVPartsNBlockingEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public int UpdateSettingsSegment(SegmentWithVPartsNBlockingEntity segment)
        {
            int result = -1;

            var updateSegmentSql = @"
      UPDATE segments
      SET length = @length
      WHERE id = @id;
      ";

            var updateSegmentVPartsSql = @"
      UPDATE segment_vparts
      SET oblow = @oblow, obhigh = @obhigh, obdistance = @obdistance
      WHERE id = @id;
      ";

            using (var conn = ConnectTrack())
            {
                conn.Open();
                var trans = conn.BeginTransaction();

                using (var cmd = new NpgsqlCommand(updateSegmentSql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", segment.Id);
                        cmd.Parameters.AddWithValue("length", segment.Length);

                        result = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        //throw ex;
                    }
                }

                using (var cmd = new NpgsqlCommand(updateSegmentVPartsSql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", segment.Id);
                        cmd.Parameters.AddWithValue("oblow", segment.OBLow);
                        cmd.Parameters.AddWithValue("obhigh", segment.OBHigh);
                        cmd.Parameters.AddWithValue("obdistance", segment.OBDistance);

                        cmd.ExecuteNonQuery();
                        trans.Commit();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        //throw ex;
                    }
                }
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
                try
                { 
                    result = conn.Query<StationWithUnuseEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
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
                try
                { 
                    result = conn.Query<BufferWithUnuseEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
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

                try
                { 
                    result = conn.Query<PointWithAIVertexEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
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

                try 
                { 
                    result = conn.Query<ZcuEntity>(sql).AsQueryable();

                    foreach (ZcuEntity zcu in result)
                    {
                        var completePointSql = string.Format(@"
              SELECT ZCP.id, ZCP.zcu_id, ZCP.complete_point_id
              FROM zcu_complete_points ZCP
              WHERE ZCP.zcu_id = {0}
              ", zcu.Id);

                        IQueryable<ZcuCompletePointEntity> resultCompletePoints = conn.Query<ZcuCompletePointEntity>(completePointSql).AsQueryable();

                        int idx = 0;

                        foreach (ZcuCompletePointEntity completePointEntity in resultCompletePoints)
                        {
                            if (idx == 0)
                                zcu.CompletePoints = completePointEntity.CompletePointId.ToString();
                            else
                                zcu.CompletePoints += string.Format(",{0}", completePointEntity.CompletePointId);

                            idx++;
                        }

                        var inputZonesSql = string.Format(@"
              SELECT ZIP.id, ZIP.zcu_id, ZIP.priority_point, ZIP.zone_points
              FROM zcu_input_zones ZIP
              WHERE ZIP.zcu_id = {0}
              ", zcu.Id);

                        IQueryable<ZcuInputZoneEntity> resultInputZones = conn.Query<ZcuInputZoneEntity>(inputZonesSql).AsQueryable();
                        zcu.InputZones = resultInputZones.ToArray();
                    }
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<VehicleRegEntity> QuerySettingsVehicleRegs()
        {
            IQueryable<VehicleRegEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT VR.id, VR.logical_id, 
	        CASE 
		        WHEN VH.rail_in IS NULL THEN false
		        ELSE VH.rail_in
	        END AS rail_in
                
        FROM vehicle_reg AS VR
        LEFT JOIN vehicles AS VH on CAST(VH.physical_id AS INTEGER) = VR.id 
        ORDER BY VR.id;
        ";
                try
                { 
                    result = conn.Query<VehicleRegEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public int InsertSettingsVehicleRegs(VehicleRegEntity vehicleReg)
        {
            int result = -1;

            var insertVehicleRegSql = @"
      INSERT vehicle_reg (id, logical_id) 
      VALUES (@id, @logical_id);
      ";

            using (var conn = ConnectTrack())
            {
                conn.Open();

                using (var cmd = new NpgsqlCommand(insertVehicleRegSql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", vehicleReg.Id);
                        cmd.Parameters.AddWithValue("logical_id", vehicleReg.LogicalId);

                        result = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        //throw ex;
                    }
                }
            }
            return result;
        }

        public int UpdateSettingsVehicleRegs(VehicleRegEntity vehicleReg)
        {
            int result = -1;

            var updateVehicleRegSql = @"
      UPDATE vehicle_reg
      SET logical_id = @logical_id
      WHERE id = @id;
      ";

            using (var conn = ConnectTrack())
            {
                conn.Open();

                using (var cmd = new NpgsqlCommand(updateVehicleRegSql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", vehicleReg.Id);
                        cmd.Parameters.AddWithValue("logical_id", vehicleReg.LogicalId);

                        result = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        //throw ex;
                    }
                }
            }
            return result;
        }

        public int DeleteSettingsVehicleRegs(VehicleRegEntity vehicleReg)
        {
            int result = -1;

            var deleteVehicleRegSql = @"
      DELETE FROM vehicle_reg WHERE id = @id;
      ";

            using (var conn = ConnectTrack())
            {
                conn.Open();

                using (var cmd = new NpgsqlCommand(deleteVehicleRegSql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", vehicleReg.Id);

                        result = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        //throw ex;
                    }
                }
            }
            return result;
        }


        public IQueryable<TargetBlockEntity> QuerySettingsTargetBlocks()
        {
            IQueryable<TargetBlockEntity> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT
            vehicle_online_name as VehicleOnlineName,
            target_block_online_name as TargetBlockOnlineName
        FROM target_block
        ORDER BY vehicle_online_name, target_block_online_name;
        ";
                try
                {
                    result = conn.Query<TargetBlockEntity>(sql).AsQueryable();
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