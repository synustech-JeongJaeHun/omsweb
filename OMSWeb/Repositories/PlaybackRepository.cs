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
        public DateTime? GetLastTimelineEventTime()
        {
            var sql = @"
      SELECT event_time as data
      FROM timeline
      ORDER BY event_time DESC
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
                    Console.WriteLine("[GetLastTimelineEventTime] => null");
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
                select *
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

        public IList<VehicleHistoryWithTimeLine> GetVehicleTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
        {
            var sql = @"
            SELECT t.id as event_id, t.event_time, t.table_name, jt.*
            FROM timeline t join vehicle_history jt ON t.event_id = jt.id
            WHERE t.event_time between @from AND @to and table_name = 'vehicle_history'
            ORDER BY t.event_time ASC
            ";

            var result = new List<VehicleHistoryWithTimeLine>();
            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<VehicleHistoryWithTimeLine>(sql, new
                    {
                        from = from,
                        to = to
                    }).ToList();
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[GetTimelineEventsBetween] => null");
                }
            }
            return result;
        }
        public IList<OrderHistoryWithTimeLine> GetOrderTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
        {
            var sql = @"
            SELECT 
                t.id as event_id, 
                t.event_time, 
                t.table_name, 
                jt.*, 
                CASE
                    WHEN jt.time_failed IS NOT NULL THEN 'FAILED'
                    WHEN jt.time_aborted IS NOT NULL THEN 'ABORTED'
                    WHEN jt.time_completed IS NOT NULL THEN 'COMPLETED'
                    WHEN jt.time_unload_completed IS NOT NULL THEN 'UNLOADED'
                    WHEN jt.time_unload_started IS NOT NULL THEN 'UNLOADING'
                    WHEN jt.time_load_completed IS NOT NULL THEN 'LOADED'
                    WHEN jt.time_load_started IS NOT NULL THEN 'LOADING'
                    WHEN jt.time_vehicle_arrived IS NOT NULL THEN 'ARRIVED'
                    WHEN jt.time_assigned IS NOT NULL THEN 'ASSIGNED'
                    WHEN jt.time_assigned IS NULL THEN 'UNASSIGNED'    
                END AS state
            FROM timeline t join order_history jt ON t.event_id = jt.id
            WHERE t.event_time between @from AND @to AND table_name = 'order_history'
            ORDER BY t.event_time ASC
            ";

            var result = new List<OrderHistoryWithTimeLine>();
            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<OrderHistoryWithTimeLine>(sql, new
                    {
                        from = from,
                        to = to
                    }).ToList();
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[GetTimelineEventsBetween] => null");
                }
            }
            return result;
        }
        public IList<SegmentBlockingHistoryEntityWithTimeline> GetSegmentBlockingTimelineEventsBetween(DateTimeOffset from, DateTimeOffset to)
        {
            var sql = @"
            SELECT t.id as event_id, t.event_time, t.table_name, jt.*
            FROM timeline t join segment_blocking_history jt ON t.event_id = jt.id
            WHERE t.event_time between @from AND @to AND table_name = 'segment_blocking_history'
            ORDER BY t.event_time ASC
            ";

            var result = new List<SegmentBlockingHistoryEntityWithTimeline>();
            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<SegmentBlockingHistoryEntityWithTimeline>(sql, new
                    {
                        from = from,
                        to = to
                    }).ToList();
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[GetTimelineEventsBetween] => null");
                }
            }
            return result;
        }
    }
}

#nullable disable