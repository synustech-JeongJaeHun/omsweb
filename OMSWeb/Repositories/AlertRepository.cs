using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class AlertRepository : DataAccess
    {
        public AlertRepository(IConfiguration configuration) : base(configuration)
        {
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
                result = conn.Query<NotificationCountModel>(sql).FirstOrDefault();
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
                result = conn.Query<AlertHistory>(sql).AsQueryable();
            }
            return result;
        }
    }
}