using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;

namespace OMSWeb.Repositories
{
    public class AlertRepository : DataAccess
    {
        private SystemsService _systemSvc;
        public AlertRepository(IConfiguration configuration, SystemsService systemSvc) : base(configuration)
        {
            this._systemSvc = systemSvc;
        }

        public NotificationCountModel GetCount()
        {
            NotificationCountModel result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
SELECT sum(level1) AS level1, sum(level2) AS level2, sum(level3) AS level3
  FROM (
    SELECT 
      CASE WHEN level = 0 THEN 1 ELSE 0 END AS level1,
      CASE WHEN level = 1 THEN 1 ELSE 0 END AS level2,
      CASE WHEN level = 2 THEN 1 ELSE 0 END AS level3
    FROM alerts
      WHERE ack_time IS NULL
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

        public IQueryable<AlertHistory> GetAlerts()
        {
            IQueryable<AlertHistory> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
    SELECT AL.id, 
            AL.time, 
            AL.level, 
            AL.tag,
            AL.message, 
            AL.ack_time,
            AL.ack_by
    FROM alerts AL
    ORDER BY AL.id desc
        ";
                try
                { 
                    result = conn.Query<AlertHistory>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }
        
        public int QueryAlertsCount(string condition)
        {
            string WhereConditions = string.Empty;
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";

            string sql = $@"
                SELECT count(*) FROM (
                        SELECT 
                            ALT.id, ALT.time, ALT.level, ALT.tag, ALT.message, ALT.ack_time, ALT.ack_by 
                        FROM alerts AS ALT
                    ) alertHistory

                    {WhereConditions}
                    ";

            int result = 0;
            using (var conn = ConnectTrack())
            {
                try 
                { 
                    result = conn.QueryFirst<int>(sql);
                }
                catch (Exception e)
                {
                    result = 0;
                }
            }
            return result;
        }

        public IQueryable<AlertEntity> QueryAlerts(int skip, int take, string condition, string sort)
        {
            string WhereConditions = string.Empty;
            string SortConditions = string.Empty;
            string LimitConditions = @"LIMIT @take OFFSET @skip";
            string MessageType = "";
            try
            {
                MessageType = 
                    String.Join(", ", 
                        _systemSvc.GetClientSettings().WarningMessageType
                            .Select(c => (int)c)
                    );
            }
            catch (Exception e)
            {
                MessageType = ((int)DisplayType.LogicalId).ToString();
            }
            finally
            {
                MessageType = "1, " + MessageType + ", 5";                
            }
            
            if (string.IsNullOrWhiteSpace(condition) == false) WhereConditions = $" WHERE {condition}";
            if (string.IsNullOrWhiteSpace(sort) == false) SortConditions = $"ORDER BY {sort}";
            if (skip <= 0 && take <= 0) LimitConditions = string.Empty;

            string sql = $@"
                SELECT
                  row_number() OVER () AS row_index,
                  ALT.id,
                  ALT.time,
                  ALT.level,
                  ALT.tag,
                  CASE 
                    WHEN array_length(subquery.messages_array, 1) = 1 THEN ALT.message 
                    ELSE 
                      STRING_AGG(
                        CASE 
                          WHEN ALT.position = 1 THEN subquery.messages_array[ALT.position] || '['
                          WHEN ALT.position = 5 THEN ']' || subquery.messages_array[ALT.position] 
                          ELSE subquery.messages_array[ALT.position] END,
                        ' ' ORDER BY ALT.position
                      )  
                  END AS message,
                  ALT.ack_time,
                  ALT.ack_by
                FROM
                  (
                    SELECT
                      *,
                      unnest(array[{MessageType}]) AS position
                    FROM
                      alerts
                  ) AS ALT
                JOIN (
                  SELECT
                    id,
                    string_to_array(message, '^') AS messages_array,
                    unnest(array[{MessageType}]) AS position
                  FROM
                    alerts
                ) AS subquery ON ALT.id = subquery.id AND ALT.position = subquery.position
                {WhereConditions}
                GROUP BY
                  ALT.id, ALT.time, ALT.level, ALT.tag, ALT.ack_time, ALT.ack_by, ALT.message, subquery.messages_array
                {SortConditions}
                --LIMIT @take OFFSET @skip
                {LimitConditions}
                ";

            IQueryable<AlertEntity> result;
            using (var conn = ConnectTrack())
            {
                try
                { 
                    result = conn.Query<AlertEntity>(sql, new {skip, take }).AsQueryable();
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