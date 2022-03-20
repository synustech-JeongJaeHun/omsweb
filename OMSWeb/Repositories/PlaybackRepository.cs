using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models.Entities;
using OMSWeb.Models.Tracks;
using Buffer = OMSWeb.Models.Tracks.Buffer;
using OMSWeb.Models;

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
      SELECT TIMESTAMP AS time
      FROM snapshots
      ORDER BY TIMESTAMP
      LIMIT 1
      ";
      DateTime? result;
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.QueryFirst<DateTime>(sql);
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetFirstSnapshotTime] => null");
          result = null;
        }
      }
      return result;
    }

    public DateTime? GetFirstEventTime(DateTime start, DateTime end)
    {
      var sql = $@"
      SELECT event_time AS time
      FROM timeline
      WHERE event_time > @start
        AND event_time < @end
      ORDER BY event_time
      LIMIT 1
      ";
      DateTime? result;
      using (var conn = ConnectTrack())
      {
        try
        {
          result = conn.QueryFirst<DateTime>(sql, new
          {
            start = start,
            end = end,
          });
        }
        catch (System.Exception)
        {
          Console.WriteLine("[GetFirstEventTime] => null");
          result = null;
        }
      }
      return result;
    }

    public DateTime GetLastTrackSnapshotTime(DateTime start)
    {
      var sql = $@"
      SELECT TIMESTAMP AS time
      FROM track_snapshots
      WHERE timestamp  < @start
      ORDER BY TIMESTAMP DESC
      LIMIT 1
      ";
      //WHERE timestamp  < @start  + '1 day'::interval
      DateTime result;
      using (var conn = ConnectTrack())
      {
        result = conn.QuerySingle<DateTime>(sql, new
        {
          start = start
        });
      }
      return result;
    }

    public IList<DateTime> GetSnapshotTimes(DateTime start, DateTime end)
    {
      var sql = $@"
      SELECT TIMESTAMP AS time
      FROM snapshots
      WHERE timestamp >= @start 
        AND timestamp < @end 
      ORDER BY TIMESTAMP
      ";
      IList<DateTime> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<DateTime>(sql, new
        {
          start = start,
          end = end,
        }).AsList();
      }
      return result;
    }

    public DateTime GetNextSnapshotTime(DateTime currentSnapshot, int skipCount = 0)
    {
      var sqlSnapshot = $@"
        SELECT TIMESTAMP AS time
        FROM snapshots
        WHERE timestamp  > @currentSnapshot
        ORDER BY TIMESTAMP
        LIMIT {skipCount}
        ";
      var sqlTimeline = $@"
        SELECT event_time as time
        FROM timeline
        WHERE event_time  > @currentSnapshot 
        ORDER BY id DESC
        LIMIT {skipCount}
        ";

      var param = new
      {
        currentSnapshot = currentSnapshot
      };

      IQueryable<DateTime> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<DateTime>(sqlSnapshot, param).AsQueryable();
        if (result.Count() == 0)
        {
          Console.WriteLine("next snapshot is not exists -> searching fallback timelines");
          result = conn.Query<DateTime>(sqlTimeline, param).AsQueryable();
        }
      }
      return result.Last();
    }

    public IList<TimelineEntity> GetTimeline(string type, TimelineQueryOptions options)
    {
      string sql;
      object param;
      (sql, param) = this.BuildTimelineQuery("event_list", options);
      IList<TimelineEntity> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<TimelineEntity>(sql, param).AsList();
      }
      return result;
    }

    public IQueryable<EventBoundary> GetEventBoundaries(TimeRange range)
    {
      var sql = $@"
      SELECT min(event_id), max(event_id), table_name
    FROM timeline
    WHERE event_time BETWEEN @start AND @end
    GROUP BY table_name
      ";
      IQueryable<EventBoundary> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<EventBoundary>(sql, new
        {
          start = range.Start.Value,
          end = range.End.Value,
        }).AsQueryable();
      }
      return result;
    }

    public IList<T> GetEvents<T>(EventBoundary boundary)
    {
      var extraColumns = boundary.TableName == "vehicle_history" ? ",last_point AS cur_point" : "";
      var sql = $@"
      SELECT * {extraColumns}
      FROM {boundary.TableName} 
      WHERE id >= '{boundary.Min}' AND id <= '{boundary.Max}'";
      IList<T> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<T>(sql, new
        {
          min = boundary.Min,
          max = boundary.Max,
        }).AsList();
      }
      return result;
    }

    public void CleanStaticTables()
    {
      var sql = @"
      DELETE FROM playback_points;
      DELETE FROM playback_segments;
      DELETE FROM playback_segment_parts;
      DELETE FROM playback_clusters;
      DELETE FROM playback_cluster_points;
      DELETE FROM playback_stations;
      DELETE FROM playback_buffers;
      DELETE FROM playback_mtls;
      ";
      using (var conn = ConnectTrack())
      {
        conn.Open();
        var trans = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          try
          {
            cmd.ExecuteNonQuery();
            trans.Commit();
          }
          catch (System.Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }
      }
    }
    public void CleanDynamicTables(string userId)
    {
      var sql = $@"
      DELETE FROM playback_segment_blocking WHERE user_id=@userId;
      DELETE FROM playback_vehicles WHERE user_id=@userId;
      DELETE FROM playback_orders WHERE user_id=@userId;
      ";
      using (var conn = ConnectTrack())
      {
        conn.Open();
        var trans = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("userId", userId);
            cmd.ExecuteNonQuery();
            trans.Commit();
          }
          catch (System.Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }
      }
    }

    public void RetrieveSnapshots(string userId, DateTime trackSnapshotTime, DateTime snapshotTime, bool excludeStatic)
    {
      var sql = $@"
        INSERT INTO playback_segments
        SELECT *, @userId
        FROM json_populate_recordset(null::segments, extract_table('TRACK_SNAPSHOT', 'segments', @trackSnapshotTime));

        INSERT INTO playback_segment_parts
        SELECT *, @userId
        FROM json_populate_recordset(null::segment_parts, extract_table('TRACK_SNAPSHOT', 'segment_parts', @trackSnapshotTime));

        INSERT INTO playback_vehicles
        SELECT *, @userId
        FROM json_populate_recordset(null::vehicles, extract_table('SNAPSHOT', 'vehicles', @snapshotTime));

        INSERT INTO playback_orders
        SELECT *, @userId
        FROM json_populate_recordset(null::orders, extract_table('SNAPSHOT', 'orders', @snapshotTime));

        INSERT INTO playback_segment_blocking
        SELECT *, @userId
        FROM json_populate_recordset(null::segment_blocking, extract_table('SNAPSHOT', 'segment_blocking', @snapshotTime));
      ";
      if (!excludeStatic)
      {
        sql += $@"
        INSERT INTO playback_points
        SELECT *, @userId
        FROM json_populate_recordset(null::points, extract_table('TRACK_SNAPSHOT', 'points', @trackSnapshotTime));

        INSERT INTO playback_clusters
        SELECT *, @userId
        FROM json_populate_recordset(null::clusters, extract_table('TRACK_SNAPSHOT', 'clusters', @trackSnapshotTime));

        INSERT INTO playback_cluster_points
        SELECT *, @userId
        FROM json_populate_recordset(null::cluster_points, extract_table('TRACK_SNAPSHOT', 'cluster_points', @trackSnapshotTime));

        INSERT INTO playback_stations
        SELECT *, @userId
        FROM json_populate_recordset(null::stations, extract_table('TRACK_SNAPSHOT', 'stations', @trackSnapshotTime));

        INSERT INTO playback_buffers
        SELECT *, @userId
        FROM json_populate_recordset(null::buffers, extract_table('TRACK_SNAPSHOT', 'buffers', @trackSnapshotTime));

        INSERT INTO playback_mtls
        SELECT *, @userId
        FROM json_populate_recordset(null::mtls, extract_table('TRACK_SNAPSHOT', 'mtls', @trackSnapshotTime));
        ";
      }
      using (var conn = ConnectTrack())
      {
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          conn.Open();
          cmd.Parameters.AddWithValue("userId", userId);
          cmd.Parameters.AddWithValue("trackSnapshotTime", trackSnapshotTime);
          cmd.Parameters.AddWithValue("snapshotTime", snapshotTime);
          cmd.ExecuteNonQuery();
        }
      }
    }

    public MapDimension GetDimension(string userId)
    {
      var sql = QueryFactory.GetSql("size", userId);
      MapDimension result;
      using (var conn = ConnectTrack())
      {
        result = conn.QueryFirstOrDefault<MapDimension>(sql, new
        {
          userId = userId
        });
      }
      return result;
    }

    public List<Point> GetPoints(string userId)
    {
      var sql = QueryFactory.GetSql("point", userId);
      List<Point> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Point>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<SegmentWithPart> GetSegments(string userId)
    {
      var sql = QueryFactory.GetSql("segment", userId);
      List<SegmentWithPart> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<SegmentWithPart>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<DisabledSegment> GetDisabledSegments(string userId)
    {
      var sql = QueryFactory.GetSql("segmentDisable", userId);
      List<DisabledSegment> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<DisabledSegment>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<Station> GetStations(string userId)
    {
      var sql = QueryFactory.GetSql("station", userId);
      List<Station> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Station>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<Buffer> GetBuffers(string userId)
    {
      var sql = QueryFactory.GetSql("buffer", userId);
      List<Buffer> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Buffer>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<Mtl> GetMtls(string userId)
    {
      var sql = QueryFactory.GetSql("mtl", userId);
      List<Mtl> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Mtl>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<Cluster> GetClusters(string userId)
    {
      var sql = QueryFactory.GetSql("cluster", userId);
      List<Cluster> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Cluster>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<VehiclePosition> GetVehiclePositions(string userId)
    {
      var sql = QueryFactory.GetSql("vehiclePosition", userId);
      List<VehiclePosition> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<VehiclePosition>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    public List<OrderState> GetOrderStates(string userId, IQueryable<EventBoundary> boundaries)
    {
      var sql = QueryFactory.GetSql("orderStatus", userId);
      if (boundaries != null && boundaries.Count() > 0)
      {
        string orderSql = "", vehicleSql = "";
        var found = boundaries.Where(x => x.TableName == "order_history").SingleOrDefault();
        if (found != null)
        {
          orderSql = $@"
          SELECT DISTINCT(history_source_id) as order_id
                FROM order_history
                WHERE id >= {found.Max} AND id <= {found.Max}";
        }

        found = boundaries.Where(x => x.TableName == "vehicle_history").SingleOrDefault();
        if (found != null)
        {
          vehicleSql = $@"
          SELECT DISTINCT(order_id) as order_id
                FROM vehicle_history
                WHERE id >= {found.Min} AND id <= {found.Max}";
        }

        if (!string.IsNullOrEmpty(orderSql) || !string.IsNullOrEmpty(vehicleSql))
        {
          var unionSql = (orderSql != "" && vehicleSql != "") ? "UNION ALL" : "";
          sql += $@"
          WHERE id IN (
                    {orderSql}
                    {unionSql}
                    {vehicleSql}
                )";
        }
      }
      List<OrderState> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<OrderState>(sql, new
        {
          userId = userId
        }).AsList();
      }
      return result;
    }

    private (string sql, object param) BuildTimelineQuery(string type, TimelineQueryOptions options)
    {
      var sql = $@"
      SELECT id, event_time, event_id, table_name 
      FROM timeline
      --*where_condition*
      ORDER BY id
      --*limit_condition*
      ";
      object param = null;

      if (type == "start") { }
      else if (type == "fastforward" || type == "play") { }
      else if (type == "event_list")
      {
        if (options.End.HasValue)
        {
          sql = sql.Replace("--*where_condition*",
          $"WHERE event_time >= @start::timestamptz AND event_time <= @end::timestamptz ");
        }
        else
        {
          sql = sql.Replace("--*where_condition*",
          $"WHERE event_time >= @start::timestamptz AND event_time <= @end::timestamptz + '1 day'::interval ");
        }
        param = new
        {
          start = options.Start.Value,
          end = options.End.Value
        };
      }
      return (sql, param);
    }
  }
}