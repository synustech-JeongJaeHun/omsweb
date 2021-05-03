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

    public DateTime GetFirstSnapshotTime()
    {
      var sql = @"
      SELECT TIMESTAMP AS time
      FROM snapshots
      ORDER BY TIMESTAMP
      LIMIT 1
      ";
      DateTime result;
      using (var conn = ConnectTrack())
      {
        result = conn.QuerySingleOrDefault<DateTime>(sql);
      }
      return result;
    }

    public DateTime GetLastTrackSnapshotTime(string start)
    {
      var sql = $@"
      SELECT TIMESTAMP AS time
      FROM track_snapshots
      WHERE timestamp at time zone 'utc' < '{start}' at time zone 'utc' + '1 day'::interval
      ORDER BY TIMESTAMP
      LIMIT 1
      ";
      DateTime result;
      using (var conn = ConnectTrack())
      {
        result = conn.QuerySingle<DateTime>(sql);
      }
      return result;
    }

    public IList<DateTime> GetSnapshotTimes(string start, string end)
    {
      var sql = $@"
      SELECT TIMESTAMP AS time
      FROM snapshots
      WHERE timestamp at time zone 'utc' >= '{start}' at time zone 'utc' 
        AND timestamp at time zone 'utc' < '{end}' at time zone 'utc'
      ORDER BY TIMESTAMP
      ";
      IList<DateTime> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<DateTime>(sql).AsList();
      }
      return result;
    }

    public IList<TimelineEntity> GetTimeline(string type, TimelineQueryOptions options)
    {
      var sql = this.BuildTimelineQuery("event_list", options);
      IList<TimelineEntity> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<TimelineEntity>(sql).AsList();
      }
      return result;
    }

    public IQueryable<EventBoundary> GetEventBoundaries(TimeRange range)
    {
      var sql = $@"
      SELECT min(event_id), max(event_id), table_name
    FROM timeline
    WHERE event_time BETWEEN '{range.Start.Value}' AND '{range.End.Value}'
    GROUP BY table_name
      ";
      IQueryable<EventBoundary> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<EventBoundary>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<T> GetEvents<T>(EventBoundary boundary)
    {
      var sql = $@"
      SELECT * 
      FROM {boundary.TableName} 
      WHERE id >= '{boundary.Min}' AND id <= '{boundary.Max}'";
      IQueryable<T> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<T>(sql).AsQueryable();
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
        var trans = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          conn.Open();
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
      DELETE FROM playback_segment_blocking WHERE user_id='${userId}';
      DELETE FROM playback_vehicles WHERE user_id='${userId}';
      DELETE FROM playback_orders WHERE user_id='${userId}';
      ";
      using (var conn = ConnectTrack())
      {
        var trans = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          conn.Open();
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

    public void RetrieveSnapshots(string userId, DateTime trackSnapshotTime, DateTime snapshotTime)
    {
      var sql = $@"
        INSERT INTO playback_points
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::points, extract_table('TRACK_SNAPSHOT', 'points', '{trackSnapshotTime}'));

        INSERT INTO playback_segments
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::segments, extract_table('TRACK_SNAPSHOT', 'segments', '{trackSnapshotTime}'));

        INSERT INTO playback_segment_parts
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::segment_parts, extract_table('TRACK_SNAPSHOT', 'segment_parts', '{trackSnapshotTime}'));

        INSERT INTO playback_clusters
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::clusters, extract_table('TRACK_SNAPSHOT', 'clusters', '{trackSnapshotTime}'));

        INSERT INTO playback_cluster_points
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::cluster_points, extract_table('TRACK_SNAPSHOT', 'cluster_points', '{trackSnapshotTime}'));

        INSERT INTO playback_stations
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::stations, extract_table('TRACK_SNAPSHOT', 'stations', '{trackSnapshotTime}'));

        INSERT INTO playback_buffers
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::buffers, extract_table('TRACK_SNAPSHOT', 'buffers', '{trackSnapshotTime}'));

        INSERT INTO playback_mtls
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::mtls, extract_table('TRACK_SNAPSHOT', 'mtls', '{trackSnapshotTime}'));

        INSERT INTO playback_vehicles
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::vehicles, extract_table('SNAPSHOT', 'vehicles', '{snapshotTime}'));

        INSERT INTO playback_orders
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::orders, extract_table('SNAPSHOT', 'orders', '{snapshotTime}'));

        INSERT INTO playback_segment_blocking
        SELECT *, '{userId}'
        FROM json_populate_recordset(null::segment_blocking, extract_table('SNAPSHOT', 'segment_blocking', '{snapshotTime}'));
      ";
      using (var conn = ConnectTrack())
      {
        conn.Open();
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
          conn.Open();
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
        result = conn.QuerySingle<MapDimension>(sql);
      }
      return result;
    }

    public List<Point> GetPoints(string userId)
    {
      var sql = QueryFactory.GetSql("point", userId);
      List<Point> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Point>(sql).AsList();
      }
      return result;
    }

    public List<SegmentWithPart> GetSegments(string userId)
    {
      var sql = QueryFactory.GetSql("segment", userId);
      List<SegmentWithPart> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<SegmentWithPart>(sql).AsList();
      }
      return result;
    }

    public List<DisabledSegment> GetDisabledSegments(string userId)
    {
      var sql = QueryFactory.GetSql("segmentDisable", userId);
      List<DisabledSegment> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<DisabledSegment>(sql).AsList();
      }
      return result;
    }

    public List<Station> GetStations(string userId)
    {
      var sql = QueryFactory.GetSql("station", userId);
      List<Station> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Station>(sql).AsList();
      }
      return result;
    }

    public List<Buffer> GetBuffers(string userId)
    {
      var sql = QueryFactory.GetSql("buffer", userId);
      List<Buffer> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Buffer>(sql).AsList();
      }
      return result;
    }

    public List<Mtl> GetMtls(string userId)
    {
      var sql = QueryFactory.GetSql("mtl", userId);
      List<Mtl> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Mtl>(sql).AsList();
      }
      return result;
    }

    public List<Cluster> GetClusters(string userId)
    {
      var sql = QueryFactory.GetSql("cluster", userId);
      List<Cluster> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<Cluster>(sql).AsList();
      }
      return result;
    }

    public List<VehiclePosition> GetVehiclePositions(string userId)
    {
      var sql = QueryFactory.GetSql("vehiclePosition", userId);
      List<VehiclePosition> result;
      using (var conn = ConnectTrack())
      {
        result = conn.Query<VehiclePosition>(sql).AsList();
      }
      return result;
    }

    public List<OrderState> GetOrderStates(string userId, IQueryable<EventBoundary> boundaries)
    {
      var sql = QueryFactory.GetSql("orderStatus", userId);
      if (boundaries != null && boundaries.Count() > 0)
      {
        string orderSql = "", vehicleSql = "";
        var found = boundaries.Where(x => x.TableName == "order_history").Single();
        if (found != null)
        {
          orderSql = $@"
          SELECT DISTINCT(history_source_id) as order_id
                FROM order_history
                WHERE id >= {found.Max} AND id <= {found.Max}";
        }

        found = boundaries.Where(x => x.TableName == "vehicle_history").Single();
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
        result = conn.Query<OrderState>(sql).AsList();
      }
      return result;
    }

    private string BuildTimelineQuery(string type, TimelineQueryOptions options)
    {
      var sql = $@"
      SELECT id, event_time, event_id, table_name 
      FROM timeline
      --*where_condition*
      ORDER BY id
      --*limit_condition*
      ";

      if (type == "start") { }
      else if (type == "fastforward" || type == "play") { }
      else if (type == "event_list")
      {
        if (options.End.HasValue)
        {
          sql = sql.Replace("--*where_condition*",
          $"WHERE event_time >= '${options.Start.Value}'::timestamptz AND event_time <= '{options.End.Value}'::timestamptz ");
        }
        else
        {
          sql = sql.Replace("--*where_condition*",
          $"WHERE event_time >= '${options.Start.Value}'::timestamptz AND event_time <= '{options.End.Value}'::timestamptz + '1 day'::interval ");
        }
      }
      return sql;
    }
  }
}