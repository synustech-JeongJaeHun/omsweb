using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models.Entities;
using OMSWeb.Models;

#nullable enable
namespace OMSWeb.Repositories
{
  public class PlaybackRepository : DataAccess
  {
    public PlaybackRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public DateTime? GetFirstSnapshotTime()
    {
      var sql = @"
      SELECT timestamp as data
      FROM snapshots
      ORDER BY timestamp ASC
      LIMIT 1
      ";
      SimpleResponse<DateTime>? result;
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.QueryFirst<SimpleResponse<DateTime>>(sql);
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetFirstSnapshotTime] => null");
          result = null;
        }
      }
      return result?.Data ?? null;
    }
    public DateTime? GetLastHistoryTime()
    {
      var sql = @"
                SELECT history.history_change_time as data
                FROM 
                (
                (SELECT history_change_time
                FROM vehicle_history vh 
                ORDER BY history_change_time desc
                LIMIT 1)
                
                UNION

                (SELECT history_change_time
                FROM segment_blocking_history sbh
                ORDER BY history_change_time desc
                LIMIT 1)

                UNION

                (SELECT history_change_time
                FROM order_history oh
                ORDER BY history_change_time desc
                LIMIT 1)
                ) AS history
                ORDER BY history_change_time DESC
                LIMIT 1
      ";
      SimpleResponse<DateTime>? result;
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.QueryFirst<SimpleResponse<DateTime>>(sql);
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetLastHistoryTime] => null");
          result = null;
        }
      }
      return result?.Data ?? null;
    }

    public IList<DateTimeOffset> GetTrackTimes()
    {
      var sql = @"
            SELECT timestamp as data
            FROM track_snapshots
            ORDER BY timestamp DESC
            ";

      var result = new List<DateTimeOffset>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<SimpleResponse<DateTimeOffset>>(sql).Select(r => r.Data).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetTrackTimes] => null");
        }
      }
      return result;
    }

    public TrackSnapshotEntity? GetRecentTrackBefore(DateTimeOffset before)
    {
      var sql = $@"
                SELECT * 
                FROM track_snapshots
                WHERE timestamp <= @before
                ORDER BY timestamp desc
                LIMIT 1
            ";

      TrackSnapshotEntity? result;
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.QueryFirst<TrackSnapshotEntity>(sql, new
          {
            before = before
          });
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetRecentTrackBefore] => null");
          result = null;
        }
      }
      return result ?? null;
    }

    public BeforeNextSnapshots GetBeforeNextSnapshots(DateTimeOffset from)
    {
      var beforeSql = @"
                select *
                from snapshots
                where timestamp <= @from
                order by timestamp desc 
                limit 1
            ";

      var result = new BeforeNextSnapshots();

      using (var conn = ConnectTrack())
      {
        try
        {
          var before = conn.QueryFirst<SnapshotEntity>(beforeSql, new
          {
            from = from
          });
          result.Before = before;
        }
        catch (System.Exception)
        {
          Console.WriteLine("[BeforeSnapshotTime] => null");
          result.Before = null;
        }
      }

      var nextSql = @"
                select timestamp
                from snapshots
                where timestamp > @from
                order by timestamp ASC 
                limit 1
                ";

      using (var conn = ConnectTrack())
      {
        try
        {
          var next = conn.QueryFirst<SnapshotEntity>(nextSql, new
          {
            from = from
          });
          result.Next = next;
        }
        catch (System.Exception)
        {
          Console.WriteLine("[NextSnapshotTime] => null");
          result.Next = null;
        }
      }

      return result;
    }

    public IList<RemainedAlarm> GetRemainedAlarmsAt(DateTimeOffset at)
    {
      var sql = @"
          select 
            va.id, va.time, va.error_code, va.vehicle_id, va.time_resolved, va.current, 
            ve.level, ve.description, ve.cause, ve.action
          from 
            vehicle_alarms va 
            left outer join 
            vehicle_errors ve 
            on va.error_code = ve.id
          where 
            va.time < @at
            and 
            va.time_resolved is null
      ";

      var result = new List<RemainedAlarm>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<RemainedAlarm>(sql, new
          {
            at
          }).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetRemainedAlarmsAt] => null");
        }
      }
      return result;
    }

    public IList<AlarmChange> GetAlarmChangesInTime(DateTimeOffset from, DateTimeOffset to)
    {
      var sql = @"
         select *
         from ((
          select 
            va.id, va.time, va.error_code, va.vehicle_id, va.time_resolved, va.current, 
            ve.level, ve.description, ve.cause, ve.action,
            va.time as history_change_time,
            'INSERT' as history_change_type
          from 
            vehicle_alarms va 
            left outer join 
            vehicle_errors ve 
            on va.error_code = ve.id
          where 
            va.time between @from and @to
          )

          union all 

          (
          select 
            va.id, va.time, va.error_code, va.vehicle_id, va.time_resolved, va.current, 
            ve.level, ve.description, ve.cause, ve.action,
            va.time_resolved as history_change_time,
            'UPDATE' as history_change_type
          from 
            vehicle_alarms va 
            left outer join 
            vehicle_errors ve 
            on va.error_code = ve.id
          where 
            va.time_resolved between @from and @to
          )) change
          order by change.history_change_time
      ";

      var result = new List<AlarmChange>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<AlarmChange>(sql, new
          {
            from,
            to
          }).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetAlarmChangesInTime] => null");
        }
      }
      return result;
    }

    public IList<VehicleHistoryWithTableName> GetVehicleHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
    {
      var sql = @"
            SELECT *
            FROM vehicle_history vh
            WHERE vh.history_change_time between @from AND @to
            ORDER BY vh.history_change_time ASC
            ";

      var result = new List<VehicleHistoryWithTableName>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<VehicleHistoryWithTableName>(sql, new
          {
            from = from,
            to = to
          }).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetHistoriesBetween] => null");
        }
      }
      return result;
    }
    public IList<OrderHistoryWithTableName> GetOrderHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
    {
      var sql = @"
            SELECT 
                *,
                CASE
                    WHEN oh.time_failed IS NOT NULL THEN 'FAILED'
                    WHEN oh.time_aborted IS NOT NULL THEN 'ABORTED'
                    WHEN oh.time_completed IS NOT NULL THEN 'COMPLETED'
                    WHEN oh.time_unload_completed IS NOT NULL THEN 'UNLOADED'
                    WHEN oh.time_unload_started IS NOT NULL THEN 'UNLOADING'
                    WHEN oh.time_load_completed IS NOT NULL THEN 'LOADED'
                    WHEN oh.time_load_started IS NOT NULL THEN 'LOADING'
                    WHEN oh.time_vehicle_arrived IS NOT NULL THEN 'ARRIVED'
                    WHEN oh.time_assigned IS NOT NULL THEN 'ASSIGNED'
                    WHEN oh.time_assigned IS NULL THEN 'UNASSIGNED'    
                END AS state
            FROM order_history oh
            WHERE oh.history_change_time between @from AND @to
            ORDER BY oh.history_change_time ASC
            ";

      var result = new List<OrderHistoryWithTableName>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<OrderHistoryWithTableName>(sql, new
          {
            from = from,
            to = to
          }).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetHistoriesBetween] => null");
        }
      }
      return result;
    }
    public IList<SegmentBlockingHistoryWithTableName> GetSegmentBlockingHistoriesBetween(DateTimeOffset from, DateTimeOffset to)
    {
      var sql = @"
            SELECT *
            FROM segment_blocking_history sbh
            WHERE sbh.history_change_time between @from AND @to
            ORDER BY sbh.history_change_time ASC
            ";

      var result = new List<SegmentBlockingHistoryWithTableName>();
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.Query<SegmentBlockingHistoryWithTableName>(sql, new
          {
            from = from,
            to = to
          }).ToList();
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetHistoriesBetween] => null");
        }
      }
      return result;
    }
  }
}

#nullable disable