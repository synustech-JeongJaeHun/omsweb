using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Npgsql;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using Buffer = OMSWeb.Models.Tracks.Buffer;

namespace OMSWeb.Repositories
{
  public class TrackRepository : DataAccess
  {
    private const int CACHE_LIFE = 30;
    private readonly CacheService _cache;

    public TrackRepository(IConfiguration configuration, CacheService cache) : base(configuration)
    {
      this._cache = cache;
    }

    public MapDimension GetDimension()
    {
      var key = CacheKeys.MapSize;
      MapDimension entity = _cache.GetValue<MapDimension>(key);
      if (entity == null)
      {
        string sql = @"
SELECT min(x) AS min_x, min(y) AS min_y, max(x) AS max_x, max(y) AS max_y, 
  max(x) - min(x) AS width, max(y) - min(y) AS height 
FROM points
--*user_id_condition*--WHERE user_id =$1";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              if (dr.Read())
              {
                entity = new MapDimension
                {
                  MinX = Convert.ToInt32(dr["min_x"]),
                  MinY = Convert.ToInt32(dr["min_y"]),
                  MaxX = Convert.ToInt32(dr["max_x"]),
                  MaxY = Convert.ToInt32(dr["max_y"]),
                  Width = Convert.ToInt32(dr["width"]),
                  Height = Convert.ToInt32(dr["height"]),
                };
              }
            }
          }
        }
        _cache.SetValue<MapDimension>(key, entity, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return entity;
    }

    public Point[] LoadPoints()
    {
      var key = CacheKeys.Points;
      var data = _cache.GetValue<Point[]>(key);
      if (data == null)
      {
        var models = new List<Point>();
        string sql = @"
SELECT id AS id, x AS x, y AS y, physical_id AS physical_id, logical_id AS logical_id  
FROM points
--*user_id_condition*--WHERE user_id = $1
ORDER BY id";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new Point
                {
                  Id = Convert.ToInt32(dr["id"]),
                  X = Convert.ToInt32(dr["x"]),
                  Y = Convert.ToInt32(dr["y"]),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<Point[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }

    public SegmentWithPart[] LoadSegments()
    {
      var key = CacheKeys.Segments;
      var data = _cache.GetValue<SegmentWithPart[]>(key);
      if (data == null)
      {
        var models = new List<SegmentWithPart>();
        string sql = @"
SELECT SP.segment_id AS id, SG.physical_id AS physical_id, SG.logical_id AS logical_id, SG.start_point, SG.end_point, 
  SP.id AS segpart_id, 
  type,
  location,
  direction,
  SG.speed, SG.length
FROM segment_parts AS SP
INNER JOIN segments AS SG
  ON SP.segment_id = SG.id
--*user_id_condition*--WHERE SP.user_id = $1
ORDER BY SP.segment_id, SP.id
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new SegmentWithPart
                {
                  Id = dr["id"].TryInteger(),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                  StartPoint = dr["start_point"].TryInteger(),
                  EndPoint = dr["end_point"].TryInteger(),
                  Speed = dr["speed"].TryFloat(),
                  Length = dr["length"].TryFloat(),
                  Type = dr["type"].ToString(),
                  Direction = dr["direction"].ToString(),
                  Location = dr["location"].ToString(),
                  SegpartId = dr["segpart_id"].TryInteger(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<SegmentWithPart[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public DisabledSegment[] LoadDisabledSegments()
    {
      var key = CacheKeys.SegmentDisabled;
      var data = _cache.GetValue<DisabledSegment[]>(key);
      if (data == null)
      {
        var models = new List<DisabledSegment>();
        string sql = @"
SELECT id, segment_id, disabled_by AS disabled_by, reason AS disabled_reason
FROM segment_blocking
--*user_id_condition*--WHERE user_id =$1
ORDER BY segment_id
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new DisabledSegment
                {
                  Id = Convert.ToInt32(dr["id"]),
                  DisabledBy = dr["disabled_by"].ToString(),
                  DisabledReason = dr["disabled_reason"].ToString(),
                  SegmentId = Convert.ToInt32(dr["segment_id"]),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<DisabledSegment[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public Station[] LoadStations()
    {
      var key = CacheKeys.Stations;
      var data = _cache.GetValue<Station[]>(key);
      if (data == null)
      {
        var models = new List<Station>();
        string sql = @"
SELECT id AS id, physical_id AS physical_id, logical_id AS logical_id, point AS point_id,
  direction AS direction, carrier_type AS carrier_type
FROM stations
--*user_id_condition*--WHERE user_id =$1
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new Station
                {
                  Id = Convert.ToInt32(dr["id"]),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                  PointId = dr["point_id"].TryIntegerOrNull(),
                  Direction = dr["direction"].ToString(),
                  CarrierType = dr["carrier_type"].TryIntegerOrNull(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<Station[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public Buffer[] LoadBuffers()
    {
      var key = CacheKeys.Buffers;
      var data = _cache.GetValue<Buffer[]>(key);
      if (data == null)
      {
        var models = new List<Buffer>();
        string sql = @"
SELECT id, physical_id, logical_id AS logical_id, point AS point_id,
  direction AS direction
FROM buffers
--*user_id_condition*--WHERE user_id =$1
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new Buffer
                {
                  Id = Convert.ToInt32(dr["id"]),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                  PointId = dr["point_id"].TryIntegerOrNull(),
                  Direction = dr["direction"].ToString(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<Buffer[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public Mtl[] LoadMtls()
    {
      var key = CacheKeys.Mtls;
      var data = _cache.GetValue<Mtl[]>(key);
      if (data == null)
      {
        var models = new List<Mtl>();
        string sql = @"
SELECT id, physical_id, logical_id AS logical_id, point AS point_id
FROM mtls
--*user_id_condition*--WHERE user_id =$1
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new Mtl
                {
                  Id = Convert.ToInt32(dr["id"]),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                  PointId = dr["point_id"].TryIntegerOrNull(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<Mtl[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public Cluster[] LoadClusters()
    {
      var key = CacheKeys.Clusters;
      var data = _cache.GetValue<Cluster[]>(key);
      if (data == null)
      {
        var models = new List<Cluster>();
        string sql = @"
SELECT id, logical_id, max_vehicles, string_agg(point_id::TEXT, ', ' ORDER BY point_id) AS points, color
FROM (
    SELECT CT.id, CT.logical_id, CT.max_vehicles, CP.point_id AS point_id, CT.color
    FROM clusters AS CT
    INNER JOIN cluster_points AS CP
      ON CT.id = CP.cluster_id
      --*user_id_condition*--WHERE CT.user_id = $1
) AS NEW_DATA
GROUP BY id, logical_id, max_vehicles, color
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new Cluster
                {
                  Id = Convert.ToInt32(dr["id"]),
                  LogicalId = dr["logical_id"].ToString(),
                  MaxVehicles = dr["max_vehicles"].TryInteger(),
                  Color = dr["color"].ToString(),
                  Points = dr["points"].ToString(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<Cluster[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public VehiclePath[] LoadVehiclePaths()
    {
      var key = CacheKeys.VehiclePaths;
      var data = _cache.GetValue<VehiclePath[]>(key);
      if (data == null)
      {
        var models = new List<VehiclePath>();
        string sql = @"
SELECT vehicle_id AS id, expected_path AS path, calculate_path AS is_calculate_path
FROM vehicle_paths
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new VehiclePath
                {
                  Id = Convert.ToInt32(dr["id"]),
                  Path = dr["path"].ToString(),
                  IsCalculatePath = dr["is_calculate_path"].TryBooleanOrNull(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<VehiclePath[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public VehiclePosition[] LoadVehiclePositions()
    {
      var key = CacheKeys.Vehicles;
      var data = _cache.GetValue<VehiclePosition[]>(key);
      if (data == null)
      {
        var models = new List<VehiclePosition>();
        string sql = @"
SELECT 
    VH.id, VH.physical_id, VH.logical_id, VH.last_point AS cur_point, VH.next_point, VH.last_contact,
    VH.mode, VH.can_be_pushed, VH.order_origin, VH.moving_state, VH.cargo_state, VH.is_sensor_stopped, VH.is_blocked, VH.error_list, VH.type, VH.cargo_transfer_result, VH.map_db,
    OD.id AS order_id, OD.logical_id AS order_logical_id, OD.location_pickup, OD.location_dropoff, OD.location_move, OD.priority,
    CASE 
    WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NOT NULL   -- FROM-TO order
    THEN
    CASE 
        WHEN OD.time_vehicle_arrived IS NULL
        THEN OD.location_pickup		                                      -- display FROM
        ELSE OD.location_dropoff		                                      -- display To
    END
    WHEN OD.location_pickup IS NOT NULL AND OD.location_dropoff IS NULL       -- FROM order
    THEN OD.location_pickup		                                      -- display FROM
    WHEN OD.location_pickup IS NULL AND OD.location_dropoff IS NOT NULL       -- TO order
    THEN OD.location_dropoff		                                      -- display TO
    WHEN OD.location_move IS NOT NULL                                         -- MOVE order
    THEN OD.location_move		                                      -- display MOVETO
    END AS command_point
FROM vehicles AS VH
LEFT OUTER JOIN orders AS OD
ON VH.order_id = OD.id AND OD.time_completed IS NULL AND OD.time_aborted IS NULL
--*user_id_condition*--AND VH.user_id = OD.user_id    
--*user_id_condition*--WHERE VH.user_id = $1
ORDER BY VH.id
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                models.Add(new VehiclePosition
                {
                  Id = Convert.ToInt32(dr["id"]),
                  PhysicalId = dr["physical_id"].ToString(),
                  LogicalId = dr["logical_id"].ToString(),
                  CurPoint = dr["cur_point"].TryIntegerOrNull(),
                  NextPoint = dr["next_point"].TryIntegerOrNull(),
                  CommandPoint = dr["command_point"].ToString(),
                  LastContact = dr["last_contact"].TryDateTimeOrNull(),
                  Mode = dr["mode"].ToString(),
                  CanBePushed = dr["can_be_pushed"].TryBoolean(),
                  OrderOrigin = dr["order_origin"].ToString(),
                  MovingState = dr["moving_state"].ToString(),
                  CargoState = dr["cargo_state"].ToString(),
                  IsSensorStopped = dr["is_sensor_stopped"].TryBoolean(),
                  IsBlocked = dr["is_blocked"].TryBoolean(),
                  ErrorList = dr["error_list"].ToString(),
                  Type = dr["type"].ToString(),
                  CargoTransferResult = dr["cargo_transfer_result"].ToString(),
                  MapDb = dr["map_db"].ToString(),
                  OrderId = dr["order_id"].TryIntegerOrNull(),
                  OrderLogicalId = dr["order_logical_id"].ToString(),
                  LocationPickup = dr["location_pickup"].ToString(),
                  LocationDropoff = dr["location_dropoff"].ToString(),
                  LocationMove = dr["location_move"].ToString(),
                  Priority = dr["priority"].TryIntegerOrNull(),
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<VehiclePosition[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
    public LocationGroup[] LoadGroups()
    {
      var key = CacheKeys.Groups;
      var data = _cache.GetValue<LocationGroup[]>(key);
      if (data == null)
      {
        var models = new List<LocationGroup>();
        string sql = @"
SELECT location_groups.id, logical_id, color, ARRAY_AGG('{""type"":""'||reference_table||'"", ""id"":'||reference_id||'}') AS objects
FROM location_groups
LEFT JOIN grouped_objects ON location_groups.id = grouped_objects.group_id
GROUP BY location_groups.id, logical_id, color
ORDER BY location_groups.id ASC
";
        using (var conn = ConnectTrack())
        {
          using (var cmd = new NpgsqlCommand(sql, conn))
          {
            conn.Open();
            using (var dr = cmd.ExecuteReader())
            {
              while (dr.Read())
              {
                var json = dr["objects"].TryString();
                var items = JsonConvert.DeserializeObject<LocationGroupObjectItem[]>(json);
                models.Add(new LocationGroup
                {
                  Id = Convert.ToInt32(dr["id"]),
                  LogicalId = dr["logical_id"].ToString(),
                  Color = dr["color"].ToString(),
                  Objects = items,
                }
               );
              }
            }
          }
        }
        data = models.ToArray();
        _cache.SetValue<LocationGroup[]>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
      }
      return data;
    }
  }
}