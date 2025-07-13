using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using Dapper;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;
using Npgsql;
using OMSWeb.Logger;

namespace OMSWeb.Repositories
{
    public class AlarmRepository : DataAccess
    {
        private SystemsService _systemSvc;
        public AlarmRepository(IConfiguration configuration, SystemsService systemSvc) : base(configuration)
        {
            this._systemSvc = systemSvc;
        }

        public NotificationCountModel GetCount()
        {
            NotificationCountModel result;

            string whereCondition = string.Empty;

            bool notificationAlarms = _systemSvc.GetNotificatonAlarmsFilter();
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"notificationAlarms={notificationAlarms}");
            if (notificationAlarms)
            {
                whereCondition = $" AND NOT (VA.mode = 'M' OR VA.maint IS TRUE)";
            }

            using (var conn = ConnectTrack())
            {
                var sql = @$"
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
                    WHERE VA.time_resolved IS NULL AND VA.ack_time is NULL
                    {whereCondition}
                ) AS COUNT_TABLE";

                try
                { 
                    result = conn.Query<NotificationCountModel>(sql).FirstOrDefault();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }

        public IQueryable<AlarmHistory> GetAlarms()
        {
            IQueryable<AlarmHistory> result;

            string whereCondition = string.Empty;

            bool notificationAlarms = _systemSvc.GetNotificatonAlarmsFilter();
            if (notificationAlarms)
            {
                whereCondition = $" AND NOT (VA.mode = 'M' OR VA.maint IS TRUE)";
            }

            using (var conn = ConnectTrack())
            {

                var sql = @$"
                SELECT VA.id, 
                        VA.time, 
                        VA.error_code, 
                        VA.vehicle_id, 
                        VR.logical_id AS vehicle_logical_id, 
                        VA.time_resolved,
                        VA.ack_time,
                        VA.ack_by,
                        --extract('epoch' from now()-VA.time) AS age, 
                        extract('epoch' from date_trunc('second', now()) - date_trunc('second', VA.time)) * interval '1 sec' AS age,
                        VE.level, 
                        VE.cause, 
                        VE.description, 
                        VE.action,  
                        AN.annotation AS note, 
                        CASE WHEN VA.time_resolved IS NULL THEN  false ELSE true END AS cleared, 
                        VA.current,
                        CASE
		                 WHEN VA.current LIKE '%s%' THEN	(SELECT logical_id FROM stations WHERE concat('s', cast(id as varchar)) = VA.current)
		                 WHEN VA.current LIKE '%b%' THEN	(SELECT logical_id FROM buffers WHERE concat('b', cast(id as varchar)) = VA.current)
                         WHEN VA.current LIKE '%p%' THEN	(SELECT logical_id FROM points WHERE concat('p', cast(id as varchar)) = VA.current)
		                 ELSE VA.current
	                 END AS location_onlineName
                FROM vehicle_alarms AS VA
                LEFT OUTER JOIN vehicle_reg VR
                    ON VA.vehicle_id = VR.id
                LEFT OUTER JOIN vehicle_errors VE
                    ON VA.error_code = VE.id
                LEFT OUTER JOIN annotations AN
                    ON VA.error_code = AN.reference_id and AN.reference_table = 'vehicle_errors'
                WHERE VA.time_resolved is NULL AND VA.ack_time is NULL
                {whereCondition}
                ORDER BY VA.id desc
                    ";

                try
                { 
                    result = conn.Query<AlarmHistory>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
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
                try
                {
                    conn.Open();
                    var trans = conn.BeginTransaction();

                    int resultCount = 0;

                    try
                    {
                        resultCount = conn.QuerySingle<int>(sqlSelect, new
                        {
                            reference_id = annotation.ReferenceID
                        });
                    }
                    catch (Exception e)
                    {
                        resultCount = 0;
                    }

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
                            //throw ex;
                        }
                    }
                }
                catch (Exception e)
                {

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

                try
                { 
                    result = conn.Query<VehicleError>(sql).AsQueryable();
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