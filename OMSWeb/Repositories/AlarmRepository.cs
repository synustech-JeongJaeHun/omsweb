using Microsoft.Extensions.Configuration;
using System.Linq;
using Dapper;
using OMSWeb.Models;

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
  }
}