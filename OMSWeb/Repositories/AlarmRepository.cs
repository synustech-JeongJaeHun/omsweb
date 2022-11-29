using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using Dapper;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

using Npgsql;

namespace OMSWeb.Repositories
{
    public class AlarmRepository : DataAccess
    {
        public AlarmRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public NotificationCountModel GetCount()
        {
            NotificationCountModel result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
SELECT sum(level1) AS level1, sum(level2) AS level2, sum(level3) AS level3, sum(level_unknown) AS level_unknown
FROM (
    SELECT 
    CASE WHEN VE.level = 0 THEN 1 ELSE 0 END AS level1,
    CASE WHEN VE.level = 1 THEN 1 ELSE 0 END AS level2,
    CASE WHEN VE.level = 2 THEN 1 ELSE 0 END AS level3,
    CASE WHEN VE.level IS NULL THEN 1 ELSE 0 END AS level_unknown
    FROM vehicle_alarms AS VA
    LEFT OUTER JOIN vehicle_errors VE
        ON VA.error_code = VE.id
    WHERE VA.time_resolved IS NULL
) AS COUNT_TABLE";
                result = conn.Query<NotificationCountModel>(sql).FirstOrDefault();
            }
            return result;
        }

        public IQueryable<AlarmHistory> GetAlarms()
        {
            IQueryable<AlarmHistory> result;
            using (var conn = ConnectTrack())
            {

                var sql = @"
    SELECT VA.id, 
            VA.time, 
            VA.error_code, 
            VA.vehicle_id, 
            VR.logical_id AS vehicle_logical_id, 
            VA.time_resolved,
            --extract('epoch' from now()-VA.time) AS age, 
            extract('epoch' from date_trunc('second', now()) - date_trunc('second', VA.time)) * interval '1 sec' AS age,
            VE.level, 
            VE.cause, 
            VE.description, 
            VE.action,  
            AN.annotation AS note, 
            CASE WHEN VA.time_resolved IS NULL THEN  false ELSE true END AS cleared, 
            VA.current
    FROM vehicle_alarms AS VA
    LEFT OUTER JOIN vehicle_reg VR
        ON VA.vehicle_id = VR.id
    LEFT OUTER JOIN vehicle_errors VE
        ON VA.error_code = VE.id
    LEFT OUTER JOIN annotations AN
        ON VA.error_code = AN.reference_id and AN.reference_table = 'vehicle_errors'
    WHERE VA.time_resolved is NULL
    ORDER BY VA.id desc
        ";
                result = conn.Query<AlarmHistory>(sql).AsQueryable();
            }
            return result;
        }

        public int AddAnnotation(AnnotationDto annotation)
        {
            int result = -1;

            var sqlSelect = @"
      SELECT COUNT(*) as count FROM annotations WHERE reference_id = @reference_id;
      ";

            var sqlUpdate = @"
      UPDATE annotations 
      SET reference_table = @reference_table, 
          modified_time = CURRENT_TIMESTAMP, 
          modified_by = @modified_by, 
          annotation = @annotation
      WHERE 
          reference_id = @reference_id;
      ";

            var sqlInsert = @"
      INSERT INTO 
            annotations (reference_id, reference_table, modified_time, modified_by, annotation)
      VALUES 
            (@reference_id, @reference_table, CURRENT_TIMESTAMP, @modified_by, @annotation);
      ";

            string sql;
            using (var conn = ConnectTrack())
            {
                conn.Open();
                var trans = conn.BeginTransaction();

                int resultCount = conn.QuerySingle<int>(sqlSelect, new
                {
                    reference_id = annotation.ReferenceID
                });

                if (resultCount > 0)
                    sql = sqlUpdate;
                else
                    sql = sqlInsert;

                using (var cmd = new NpgsqlCommand(sql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("reference_id", annotation.ReferenceID);
                        cmd.Parameters.AddWithValue("reference_table", annotation.ReferenceTable);
                        cmd.Parameters.AddWithValue("modified_by", annotation.ModifiedBy);
                        cmd.Parameters.AddWithValue("annotation", annotation.Annotation);
                        result = cmd.ExecuteNonQuery();
                        trans.Commit();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        throw ex;
                    }
                }
            }
            return result;
        }

        public IQueryable<VehicleError> GetVehicleErrors()
        {
            IQueryable<VehicleError> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
        SELECT id, level, description, cause, action 
        FROM vehicle_errors;
        ";

                result = conn.Query<VehicleError>(sql).AsQueryable();
            }
            return result;
        }
    }
}