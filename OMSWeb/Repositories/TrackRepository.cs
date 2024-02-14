using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Npgsql;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using Buffer = OMSWeb.Models.Tracks.Buffer;

namespace OMSWeb.Repositories
{
    public class TrackRepository : DataAccess
    {
        public const int CACHE_LIFE = 30;
        private readonly CacheService _cache;

        public TrackRepository(IConfiguration configuration, CacheService cache) : base(configuration)
        {
            this._cache = cache;
        }

        public MapDimension GetDimension(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.MapSize;
            MapDimension entity = _cache.GetValue<MapDimension>(key);
            if (entity == null)
            {
                string sql = QueryFactory.GetSql("size");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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

        public List<Point> LoadPoints(NpgsqlConnection conn = null)
        {
            // var data = _cache.GetValue<List<Point>>(key);
            // if (data == null)
            // {
            var key = CacheKeys.Points;
            var data = new List<Point>();
            var models = new List<Point>();
            string sql = QueryFactory.GetSql("point");
            if (conn is null)
            {
                conn = ConnectTrack();
                using (conn)
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        try
                        {
                            models = conn.Query<Point>(sql).ToList();
                        }
                        catch (System.Exception)
                        {
                            Console.WriteLine("[LoadPoints] => null");
                        }
                    }
                }
            }
            else
            {
                using (var cmd = new NpgsqlCommand(sql, conn))
                {
                    try
                    {
                        models = conn.Query<Point>(sql).ToList();
                    }
                    catch (System.Exception)
                    {
                        Console.WriteLine("[LoadPoints] => null");
                    }
                }
            }
            
            data = models.ToList();
            _cache.SetValue<List<Point>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            // }
            return data;
        }

        public List<SegmentWithPart> LoadSegments(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Segments;
            var data = _cache.GetValue<List<SegmentWithPart>>(key);
            if (data == null)
            {
                //var models = new List<SegmentWithPart>();
                string sql = QueryFactory.GetSql("segment");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        data = conn.Query<SegmentWithPart>(sql).AsList();
                    }
                }
                else
                {
                    data = conn.Query<SegmentWithPart>(sql).AsList();
                }
                
                // data = models;
                _cache.SetValue<List<SegmentWithPart>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<DisabledSegment> LoadDisabledSegments(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.SegmentDisabled;
            var data = _cache.GetValue<List<DisabledSegment>>(key);
            if (data == null)
            {
                var models = new List<DisabledSegment>();
                string sql = QueryFactory.GetSql("segmentDisable");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                                            User = dr["user"].TryString(),
                                            Note = dr["note"].TryString()
                                        }
                                    );
                                }
                            }
                        }
                        //data = conn.Query<DisabledSegment>(sql).AsList();
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                                        User = dr["user"].TryString(),
                                        Note = dr["note"].TryString()
                                    }
                                );
                            }
                        }
                    }
                }
                data = models.ToList();
                _cache.SetValue<List<DisabledSegment>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<Station> LoadStations(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Stations;
            var data = _cache.GetValue<List<Station>>(key);

            // if (true)
            // {
            var models = new List<Station>();
            string sql = QueryFactory.GetSql("station");
            if (conn is null)
            {
                conn = ConnectTrack();
                using (conn)
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
                                        NextPoint = dr["next_point"].TryIntegerOrNull(),
                                        Offset = dr["offset"].TryIntegerOrNull(),
                                        Unuse = dr["unuse"].TryBooleanOrNull(),
                                        State = dr["state"].TryIntegerOrNull(),
                                        User = dr["user"].TryString(),
                                        Note = dr["note"].TryString(),
                                        CAlias = dr["c_alias"].TryString(),
                                        CarrierId = dr["carrier_id"].TryString()
                                    }
                                );
                            }
                        }
                    }
                }
            }
            else
            {
                using (var cmd = new NpgsqlCommand(sql, conn))
                {
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
                                    NextPoint = dr["next_point"].TryIntegerOrNull(),
                                    Offset = dr["offset"].TryIntegerOrNull(),
                                    Unuse = dr["unuse"].TryBooleanOrNull(),
                                    State = dr["state"].TryIntegerOrNull(),
                                    User = dr["user"].TryString(),
                                    Note = dr["note"].TryString(),
                                    CAlias = dr["c_alias"].TryString(),
                                    CarrierId = dr["carrier_id"].TryString()
                                }
                            );
                        }
                    }
                }
            }
            
            data = models.ToList();
            _cache.SetValue(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            // }
            return data;
        }


        public List<Buffer> LoadBuffers(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Buffers;
            var data = _cache.GetValue<List<Buffer>>(key);
            if (data == null)
            {
                var models = new List<Buffer>();
                string sql = QueryFactory.GetSql("buffer");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                                            NextPoint = dr["next_point"].TryIntegerOrNull(),
                                            Offset = dr["offset"].TryIntegerOrNull(),
                                            Unuse = dr["unuse"].TryBooleanOrNull(),
                                            State = dr["state"].TryIntegerOrNull(),
                                            CarrierId = dr["carrier_id"].TryString(),
                                            User = dr["user"].TryString(),
                                            Note = dr["note"].TryString(),
                                            CAlias = dr["c_alias"].TryString(),
                                            ZoneId = dr["zone_id"].TryIntegerOrNull(),
                                            ZoneName = dr["zone_name"].TryString(),
                                            ZoneType = dr["zone_type"].TryString(),
                                            Capacity = dr["capacity"].TryIntegerOrNull(),
                                            Size = dr["size"].TryIntegerOrNull(),
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                                        NextPoint = dr["next_point"].TryIntegerOrNull(),
                                        Offset = dr["offset"].TryIntegerOrNull(),
                                        Unuse = dr["unuse"].TryBooleanOrNull(),
                                        State = dr["state"].TryIntegerOrNull(),
                                        CarrierId = dr["carrier_id"].TryString(),
                                        User = dr["user"].TryString(),
                                        Note = dr["note"].TryString(),
                                        CAlias = dr["c_alias"].TryString(),
                                        ZoneId = dr["zone_id"].TryIntegerOrNull(),
                                        ZoneName = dr["zone_name"].TryString(),
                                        ZoneType = dr["zone_type"].TryString(),
                                        Capacity = dr["capacity"].TryIntegerOrNull(),
                                        Size = dr["size"].TryIntegerOrNull(),
                                    }
                                );
                            }
                        }
                    }
                }

                data = models.ToList();
                _cache.SetValue<List<Buffer>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public Buffer LoadBufferById(int id)
        {

            var sql = $@"
            SELECT 
                BS.id, 
                BS.physical_id, 
                BS.logical_id, 
                BS.point as point_id, 
                BS.direction, 
                BS.next_point,
                BS.""offset"",
                BS.unuse,
                BS.carrier_id,
                Z.id as zone_id,
                Z.logical_id as zone_name,
                Z.capacity,
                Z.""size"",
                Z.""type"" as zone_type
            FROM buffers AS BS
            LEFT JOIN zone_ports as ZP
                ON bs.id = zp.port_id and ZP.port_type = 'buffer'
            LEFT JOIN zones as Z
                ON Z.id = ZP.zone_id 
            WHERE BS.id = {id}
            ";

            Buffer result;

            using (var conn = ConnectTrack())
            {
                 try
                {
                    result = conn.QueryFirst<Buffer>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[LoadBufferById] => null");
                    result = null;
                }
            }

            return result;
        }

        public List<Mtl> LoadMtls(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Mtls;
            var data = _cache.GetValue<List<Mtl>>(key);
            if (data == null)
            {
                var models = new List<Mtl>();
                string sql = QueryFactory.GetSql("mtl");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                                            Unuse = dr["unuse"].TryBooleanOrNull(),
                                            InDirection = dr["in_direction"].ToString(),
                                            OutDirection = dr["out_direction"].ToString(),
                                            InLockSegment = dr["in_lock_segment"].ToString(),
                                            OutLockSegment = dr["out_lock_segment"].ToString(),
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                                        Unuse = dr["unuse"].TryBooleanOrNull(),
                                        InDirection = dr["in_direction"].ToString(),
                                        OutDirection = dr["out_direction"].ToString(),
                                        InLockSegment = dr["in_lock_segment"].ToString(),
                                        OutLockSegment = dr["out_lock_segment"].ToString(),
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<Mtl>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<Zcu> LoadZcus(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Zcus;
            var data = _cache.GetValue<List<Zcu>>(key);
            if (data == null)
            {
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        string sql = QueryFactory.GetSql("zcu");
                        data = conn.Query<Zcu>(sql).AsList();

                        foreach (Zcu zcu in data)
                        {
                            var zcuComplePointsSql = string.Format(@"
                            SELECT ZCP.id, ZCP.zcu_id, ZCP.complete_point_id
                            FROM zcu_complete_points ZCP
                            WHERE ZCP.zcu_id = {0}
                            ORDER BY ZCP.id;
                            ", zcu.Id);

                            List<ZcuCompletePoint> zcuCompletePoints = conn.Query<ZcuCompletePoint>(zcuComplePointsSql).AsList();
                            zcu.CompletePoints = zcuCompletePoints.ToArray();

                            var zcuInputZonesSql = string.Format(@"
                            SELECT ZIP.id, ZIP.zcu_id, ZIP.priority_point, ZIP.zone_points
                            FROM zcu_input_zones ZIP
                            WHERE ZIP.zcu_id = {0}
                            ", zcu.Id);

                            List<ZcuInputZone> zcuInputZones = conn.Query<ZcuInputZone>(zcuInputZonesSql).AsList();
                            zcu.InputZones = zcuInputZones.ToArray();
                        }
                    }
                }
                else
                {
                    string sql = QueryFactory.GetSql("zcu");
                    data = conn.Query<Zcu>(sql).AsList();

                    foreach (Zcu zcu in data)
                    {
                        var zcuComplePointsSql = string.Format(@"
                        SELECT ZCP.id, ZCP.zcu_id, ZCP.complete_point_id
                        FROM zcu_complete_points ZCP
                        WHERE ZCP.zcu_id = {0}
                        ORDER BY ZCP.id;
                        ", zcu.Id);

                        List<ZcuCompletePoint> zcuCompletePoints = conn.Query<ZcuCompletePoint>(zcuComplePointsSql).AsList();
                        zcu.CompletePoints = zcuCompletePoints.ToArray();

                        var zcuInputZonesSql = string.Format(@"
                        SELECT ZIP.id, ZIP.zcu_id, ZIP.priority_point, ZIP.zone_points
                        FROM zcu_input_zones ZIP
                        WHERE ZIP.zcu_id = {0}
                        ", zcu.Id);

                        List<ZcuInputZone> zcuInputZones = conn.Query<ZcuInputZone>(zcuInputZonesSql).AsList();
                        zcu.InputZones = zcuInputZones.ToArray();
                    }
                }
                

                _cache.SetValue<List<Zcu>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<ZcuStatus> LoadZcuStatus(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.ZcuStatus;
            var data = _cache.GetValue<List<ZcuStatus>>(key);
            if (data == null)
            {
                var models = new List<ZcuStatus>();
                string sql = QueryFactory.GetSql("zcuStatus");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        using (var cmd = new NpgsqlCommand(sql, conn))
                        {
                            conn.Open();
                            using (var dr = cmd.ExecuteReader())
                            {
                                while (dr.Read())
                                {
                                    models.Add(new ZcuStatus
                                        {
                                            Id = Convert.ToInt32(dr["id"]),
                                            logicalId = dr["logical_id"].ToString(),
                                            usingType = dr["using_type"].ToString(),
                                            status = dr["status"].ToString(),
                                            errorCode = dr["error_code"].TryInteger(),
                                            passVehicle = dr["pass_vehicle"].ToString(),
                                            vehicleCount = dr["vehicle_count"].ToString(),
                                            vehicleInfo = dr["vehicle_info"].ToString(),
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                models.Add(new ZcuStatus
                                    {
                                        Id = Convert.ToInt32(dr["id"]),
                                        logicalId = dr["logical_id"].ToString(),
                                        usingType = dr["using_type"].ToString(),
                                        status = dr["status"].ToString(),
                                        errorCode = dr["error_code"].TryInteger(),
                                        passVehicle = dr["pass_vehicle"].ToString(),
                                        vehicleCount = dr["vehicle_count"].ToString(),
                                        vehicleInfo = dr["vehicle_info"].ToString(),
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<ZcuStatus>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<FireShutter> LoadFireShutters(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.FireShutters;
            var data = _cache.GetValue<List<FireShutter>>(key);
            if (data == null)
            {
                var models = new List<FireShutter>();
                string sql = QueryFactory.GetSql("fireShutter");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        using (var cmd = new NpgsqlCommand(sql, conn))
                        {
                            conn.Open();
                            using (var dr = cmd.ExecuteReader())
                            {
                                while (dr.Read())
                                {
                                    models.Add(new FireShutter
                                        {
                                            Id = Convert.ToInt32(dr["id"]),
                                            X = dr["x"].TryInteger(),
                                            Y = dr["y"].TryInteger(),
                                            LogicalId = dr["logical_id"].ToString(),
                                            Segments = dr["segments"].ToString(),
                                            Status = dr["status"].TryInteger(),
                                            fireDetect = dr["fire_detect"].TryInteger(),
                                            open = dr["open"].TryInteger()
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                models.Add(new FireShutter
                                    {
                                        Id = Convert.ToInt32(dr["id"]),
                                        X = dr["x"].TryInteger(),
                                        Y = dr["y"].TryInteger(),
                                        LogicalId = dr["logical_id"].ToString(),
                                        Segments = dr["segments"].ToString(),
                                        Status = dr["status"].TryInteger(),
                                        fireDetect = dr["fire_detect"].TryInteger(),
                                        open = dr["open"].TryInteger()
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<FireShutter>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<FireShutterStatus> LoadFireShutterStatus(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.FireShutterStatus;
            var data = _cache.GetValue<List<FireShutterStatus>>(key);
            if (data == null)
            {
                var models = new List<FireShutterStatus>();
                string sql = QueryFactory.GetSql("fireShutterStatus");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        using (var cmd = new NpgsqlCommand(sql, conn))
                        {
                            conn.Open();
                            using (var dr = cmd.ExecuteReader())
                            {
                                while (dr.Read())
                                {
                                    models.Add(new FireShutterStatus
                                        {
                                            Id = Convert.ToInt32(dr["id"]),
                                            logicalId = dr["logical_id"].ToString(),
                                            segments = dr["segments"].ToString(),
                                            status = dr["status"].TryInteger(),
                                            statusMsg = dr["status_msg"].ToString(),
                                            user = dr["user"].ToString(),
                                            note = dr["note"].ToString(),
                                            fireDetect = dr["fire_detect"].TryInteger(),
                                            open = dr["open"].TryInteger()
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                models.Add(new FireShutterStatus
                                    {
                                        Id = Convert.ToInt32(dr["id"]),
                                        logicalId = dr["logical_id"].ToString(),
                                        segments = dr["segments"].ToString(),
                                        status = dr["status"].TryInteger(),
                                        statusMsg = dr["status_msg"].ToString(),
                                        user = dr["user"].ToString(),
                                        note = dr["note"].ToString(),
                                        fireDetect = dr["fire_detect"].TryInteger(),
                                        open = dr["open"].TryInteger()
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<FireShutterStatus>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<Cluster> LoadClusters(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Clusters;
            var data = _cache.GetValue<List<Cluster>>(key);
            if (data == null)
            {
                var models = new List<Cluster>();
                //string sql = QueryFactory.GetSql("cluster");
                string sql = QueryFactory.GetSql("clusterSegments");
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                                            Segments = dr["segments"].ToString(),
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                                        Segments = dr["segments"].ToString(),
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<Cluster>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<ClusterState> LoadClusterStates(NpgsqlConnection conn = null) 
        {
            var key = CacheKeys.ClusterStatus;
            var data = _cache.GetValue<List<ClusterState>>(key);
            if (data == null)
            {
                IQueryable<ClusterState> result;
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        var sql = QueryFactory.GetSql("clusterStatusMap");
                        result = conn.Query<ClusterState>(sql).AsQueryable();
                    }
                }
                else
                {
                    var sql = QueryFactory.GetSql("clusterStatusMap");
                    result = conn.Query<ClusterState>(sql).AsQueryable();
                }
                
                data = result.ToList();
                _cache.SetValue<List<ClusterState>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public List<VehicleDio> LoadVehicleDio(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.VehicleDio;
            var data = _cache.GetValue<List<VehicleDio>>(key);
            if (data == null)
            {
                var models = new List<VehicleDio>();
                string sql = @"SELECT vehicle_id AS id, di_1, di_2, di_3, do_1, do_2, do_3 FROM vehicle_dio";
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        using (var cmd = new NpgsqlCommand(sql, conn))
                        {
                            conn.Open();
                            using (var dr = cmd.ExecuteReader())
                            {
                                while (dr.Read())
                                {
                                    models.Add(new VehicleDio
                                        {
                                            Id = Convert.ToInt32(dr["id"]),
                                            di_1 = Convert.ToInt32(dr["di_1"]),
                                            di_2 = Convert.ToInt32(dr["di_2"]),
                                            di_3 = Convert.ToInt32(dr["di_3"]),
                                            do_1 = Convert.ToInt32(dr["do_1"]),
                                            do_2 = Convert.ToInt32(dr["do_2"]),
                                            do_3 = Convert.ToInt32(dr["do_3"]),
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                models.Add(new VehicleDio
                                    {
                                        Id = Convert.ToInt32(dr["id"]),
                                        di_1 = Convert.ToInt32(dr["di_1"]),
                                        di_2 = Convert.ToInt32(dr["di_2"]),
                                        di_3 = Convert.ToInt32(dr["di_3"]),
                                        do_1 = Convert.ToInt32(dr["do_1"]),
                                        do_2 = Convert.ToInt32(dr["do_2"]),
                                        do_3 = Convert.ToInt32(dr["do_3"]),
                                    }
                                );
                            }
                        }
                    }
                }
                
                data = models.ToList();
                _cache.SetValue<List<VehicleDio>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<VehiclePath> LoadVehiclePaths(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.VehiclePaths;
            var data = _cache.GetValue<List<VehiclePath>>(key);
            if (data == null)
            {
                var models = new List<VehiclePath>();
                string sql = @"SELECT vehicle_id AS id, expected_path AS path, calculate_path AS is_calculate_path
                               FROM vehicle_paths
";
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                
                data = models.ToList();
                _cache.SetValue<List<VehiclePath>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<VehiclePosition> LoadVehiclePositions(bool reloadIfEmpty = false, NpgsqlConnection conn=null)
        {
            var key = CacheKeys.Vehicles;
            var data = _cache.GetValue<List<VehiclePosition>>(key);
            if (data == null || (reloadIfEmpty && data.Count == 0))
            {
                var models = new List<VehiclePosition>();
                string sql = QueryFactory.GetSql("vehiclePosition");
                if(conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
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
                                        hostOrder = dr["host_order"].TryBoolean(),
                                        OrderOrigin = dr["order_origin"].ToString(),
                                        MovingState = dr["moving_state"].ToString(),
                                        DistancePoint = dr["distance_point"].TryIntegerOrNull(),
                                        CargoState = dr["cargo_state"].ToString(),
                                        IsSensorStopped = dr["is_sensor_stopped"].TryBoolean(),
                                        IsZcuBlocked = dr["is_zcu_blocked"].TryBoolean(),
                                        IsBlocked = dr["is_blocked"].TryBoolean(),
                                        ErrorList = dr["error_list"].ToString(),
                                        Type = dr["type"].ToString(),
                                        CargoTransferResult = dr["cargo_transfer_result"].ToString(),
                                        CarrierLabel = dr["carrier_id"].ToString(),
                                        CarrierId = dr["carrier_id"].ToString(),
                                        MapDb = dr["map_db"].ToString(),
                                        OrderId = dr["order_id"].TryIntegerOrNull(),
                                        OrderLogicalId = dr["order_logical_id"].ToString(),
                                        LocationPickup = dr["location_pickup"].ToString(),
                                        LocationDropoff = dr["location_dropoff"].ToString(),
                                        LocationMove = dr["location_move"].ToString(),
                                        Priority = dr["priority"].TryIntegerOrNull(),
                                        IsMaint = dr["is_maint"].TryBoolean(),
                                        isConnected = dr["isConnected"].TryBoolean(),
                                        User = dr["user"].TryString(),
                                        Note = dr["note"].TryString(),
                                        RailIn = dr["rail_in"].TryBoolean()
                                    }
                                   );
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
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
                                    hostOrder = dr["host_order"].TryBoolean(),
                                    OrderOrigin = dr["order_origin"].ToString(),
                                    MovingState = dr["moving_state"].ToString(),
                                    DistancePoint = dr["distance_point"].TryIntegerOrNull(),
                                    CargoState = dr["cargo_state"].ToString(),
                                    IsSensorStopped = dr["is_sensor_stopped"].TryBoolean(),
                                    IsZcuBlocked = dr["is_zcu_blocked"].TryBoolean(),
                                    IsBlocked = dr["is_blocked"].TryBoolean(),
                                    ErrorList = dr["error_list"].ToString(),
                                    Type = dr["type"].ToString(),
                                    CargoTransferResult = dr["cargo_transfer_result"].ToString(),
                                    CarrierLabel = dr["carrier_id"].ToString(),
                                    CarrierId = dr["carrier_id"].ToString(),
                                    MapDb = dr["map_db"].ToString(),
                                    OrderId = dr["order_id"].TryIntegerOrNull(),
                                    OrderLogicalId = dr["order_logical_id"].ToString(),
                                    LocationPickup = dr["location_pickup"].ToString(),
                                    LocationDropoff = dr["location_dropoff"].ToString(),
                                    LocationMove = dr["location_move"].ToString(),
                                    Priority = dr["priority"].TryIntegerOrNull(),
                                    IsMaint = dr["is_maint"].TryBoolean(),
                                    isConnected = dr["isConnected"].TryBoolean(),
                                    User = dr["user"].TryString(),
                                    Note = dr["note"].TryString(),
                                    RailIn = dr["rail_in"].TryBoolean()
                                }
                               );
                            }
                        }
                    }
                }
                data = models.ToList();
                _cache.SetValue<List<VehiclePosition>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }
        public List<LocationGroup> LoadGroups(NpgsqlConnection conn = null)
        {
            var key = CacheKeys.Groups;
            var data = _cache.GetValue<List<LocationGroup>>(key);
            if (data == null)
            {
                var models = new List<LocationGroup>();
                string sql = @"SELECT location_groups.id, logical_id, color, 
                                ARRAY_AGG('{""type"":""'||reference_table||'"", ""id"":'||reference_id||'}') AS objects  
                               FROM location_groups 
                               LEFT JOIN grouped_objects ON location_groups.id = grouped_objects.group_id 
                               GROUP BY location_groups.id, logical_id, color 
                               ORDER BY location_groups.id ASC ";
                if (conn is null)
                {
                    conn = ConnectTrack();
                    using (conn)
                    {
                        using (var cmd = new NpgsqlCommand(sql, conn))
                        {
                            conn.Open();
                            using (var dr = cmd.ExecuteReader())
                            {
                                while (dr.Read())
                                {
                                    var json = dr["objects"] as string[];
                                    // var items = JsonConvert.DeserializeObject<LocationGroupObjectItem[]>(json);
                                    var items = json.Select(j => JsonConvert.DeserializeObject<LocationGroupObjectItem>(j.ToString())).ToArray();
                                    Console.WriteLine($"### group object json >> {json}");
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
                }
                else
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                var json = dr["objects"] as string[];
                                // var items = JsonConvert.DeserializeObject<LocationGroupObjectItem[]>(json);
                                var items = json.Select(j => JsonConvert.DeserializeObject<LocationGroupObjectItem>(j.ToString())).ToArray();
                                Console.WriteLine($"### group object json >> {json}");
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
                
                data = models.ToList();
                _cache.SetValue<List<LocationGroup>>(key, data, DateTimeOffset.Now.AddMinutes(CACHE_LIFE));
            }
            return data;
        }

        public string QueryCarrierId(string carrierLocation)
        {
            string result = null;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT carrier_id FROM carriers 
                                 WHERE carrier_location='{carrierLocation}' and installed=1 ";

                    result = conn.QueryFirst<string>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryCarrierId] => null");
                    result = null;
                }
            }

            return result;
        }


        public IQueryable<CarrierInfo> QueryCarrierInfo(string carrierLocation)
        {
            IQueryable<CarrierInfo> result;
            using (var conn = ConnectTrack())
            {
                var sql = $@"SELECT carrier_id FROM carriers 
                             WHERE carrier_location='{carrierLocation}' and installed=1 ";

                result = conn.Query<CarrierInfo>(sql).AsQueryable();
            }
            return result;
        }


        public IQueryable<CarrierLocation> QueryCarrierLoc(string carrierId)
        {
            IQueryable<CarrierLocation> result;
            using (var conn = ConnectTrack())
            {
                var sql = $@"SELECT carrier_location FROM carriers WHERE carrier_id='{carrierId}' and installed=1 ";

                result = conn.Query<CarrierLocation>(sql).AsQueryable();
            }
            return result;
        }

        public Boolean IsBranchPoint(int pointId)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM segments WHERE start_point={pointId} ";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[IsBranchPoint] => null");
                    count = 0;
                }
            }
            if (count > 1)  // if 2, the point is branch start
                result = true;

            return result;
        }

        public Boolean IsHomeInterlockPoint(int pointId)
        {
            Boolean result = false;
            int count = 0;

            using (var conn = ConnectTrack())
            {
                try
                {
                    // 1. get segment id
                    string sql = $@"SELECT id FROM segments WHERE end_point={pointId}";
                    int segment_id = conn.QueryFirst<int>(sql);

                    // 2. get start_point on segment parts is 1, STRAIGHT segment)
                    sql = $@"SELECT count(*) FROM segment_parts WHERE segment_id={segment_id}";
                    int segparts_count = conn.QueryFirst<int>(sql);

                    if (segparts_count == 1)
                    {
                        sql = $@"SELECT SG.start_point FROM segments as SG LEFT JOIN segment_parts as SP ON SG.id = SP.segment_id AND SP.type = 'D'
                                 WHERE SG.end_point={pointId} ";
                        int start_point = conn.QueryFirst<int>(sql);

                        // 3. check if start_point is branch point --> means the pointId is on straiht branch segment's end
                        sql = $@"SELECT count(*) FROM segments WHERE start_point={start_point}";
                        count = conn.QueryFirst<int>(sql);
                    }

                }
                catch (System.Exception)
                {
                    Console.WriteLine("[IsHomeInterlockPoint] => null");
                    count = 0;
                }
            }

            if (count > 1)  
                result = true;

            return result;
        }
        
        public List<Backdrop> LoadBackdrops(NpgsqlConnection conn = null)
        {
            var data = new List<Backdrop>();
            var models = new List<Backdrop>();
            string sql = QueryFactory.GetSql("backdrop");
            if (conn is null)
            {
                conn = ConnectTrack();
                using (conn)
                {
                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        try
                        {
                            models = conn.Query<Backdrop>(sql).ToList();
                        }
                        catch (System.Exception)
                        {
                            Console.WriteLine("[LoadPoints] => null");
                        }
                    }
                }
            }
            else
            {
                using (var cmd = new NpgsqlCommand(sql, conn))
                {
                    try
                    {
                        models = conn.Query<Backdrop>(sql).ToList();
                    }
                    catch (System.Exception)
                    {
                        Console.WriteLine("[LoadPoints] => null");
                    }
                }
            }
            
            data = models.ToList();
            // }
            return data;
        }

        public MapData LoadMapData()
        {
            var map = new MapData();
            using (var conn = ConnectTrack())
            {
                conn.Open();
                map = new MapData
                {
                    Size = GetDimension(conn),
                    Points = LoadPoints(conn),
                    Segments = LoadSegments(conn),
                    SegmentDisabled = LoadDisabledSegments(conn),
                    Stations = LoadStations(conn),
                    Buffers = LoadBuffers(conn),
                    Mtls = LoadMtls(conn),
                    Clusters = LoadClusters(conn),
                    ClusterStates = LoadClusterStates(conn),
                    VehicleDio = LoadVehicleDio(conn),
                    VehiclePaths = LoadVehiclePaths(conn),
                    Vehicles = LoadVehiclePositions(true, conn),
                    Groups = LoadGroups(conn),
                    Zcus = LoadZcus(conn),
                    ZcuStatus = LoadZcuStatus(conn),
                    FireShutters = LoadFireShutters(conn),
                    FireShutterStatus = LoadFireShutterStatus(conn),
                    Backdrops = LoadBackdrops(conn) 
                };
            }
            
            return map;
        }
    }
}