using System;
using System.Collections;
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
    public class TransferRepository : DataAccess
    {
        public const int CACHE_LIFE = 30;
        private readonly CacheService _cache;

        public TransferRepository(IConfiguration configuration, CacheService cache) : base(configuration)
        {
            this._cache = cache;
        }

        public string QueryOnlineName(string id, string type)
        {
            string result = null;
            using (var conn = ConnectTrack())
            {
                try {
                    var sql = string.Empty;
                    if (type.ToLower() == "buffer") sql = $@"SELECT logical_id FROM buffers WHERE id={id}";
                    else if (type.ToLower() == "station") sql = $@"SELECT logical_id FROM stations WHERE id={id}";
                    else if (type.ToLower() == "vehicle") sql = $@"SELECT logical_id FROM vehicle_reg WHERE id={id}";

                    result = conn.QueryFirst<string>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryOnlineName] => null");
                    result = null;
                }
            }
            return result;
        }

        public SourceType QuerySourceVerify(string onlineName)
        {
            if (onlineName == null) return SourceType.NONE;

            if (QueryType(onlineName, SourceType.BUFFER) > 0) return SourceType.BUFFER;
            if (QueryType(onlineName, SourceType.STATION) > 0) return SourceType.STATION;
            if (QueryType(onlineName, SourceType.VEHICLE)> 0) return SourceType.VEHICLE;

            return SourceType.NONE;
        }

        public int QueryType(string onlineName, SourceType type)
        {
            int result = 0;
            using (var conn = ConnectTrack())
            {
                try { 
                    var sql = string.Empty;
                    if (type == SourceType.BUFFER) sql = $@"SELECT count(*) FROM buffers WHERE logical_id='{onlineName}' ";
                    else if (type == SourceType.STATION) sql = $@"SELECT count(*) FROM stations WHERE logical_id='{onlineName}' ";
                    else if (type == SourceType.VEHICLE) sql = $@"SELECT count(*) FROM vehicle_reg WHERE logical_id='{onlineName}' ";

                    result = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryType] => null");
                    result = 0;
                }
            }
            return result;
        }

        public Boolean QueryInstallAnotherPort(string onlineName, string carrierId)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM carriers WHERE carrier_location != '{onlineName}' 
                                            AND carrier_id='{carrierId}' AND installed=1 ";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryInstallAnotherPort] => null");
                    count = 0;
                }
            }
            if (count > 0) 
                result = true;

            return result;
        }

        public Boolean QueryStationAvailable(string onlineName)
        {
            Boolean result = true;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT COALESCE(unuse, false) AS unuse FROM stations WHERE logical_id = '{onlineName}' ";
                    bool unuse = conn.QueryFirst<Boolean>(sql);
                    if (unuse) result = false;
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryStationAvailable] => null");
                    result = true;
                }
            }
            return result;
        }

        public Boolean QueryBufferAvailable(string onlineName)
        {
            Boolean result = true;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT COALESCE(unuse, false) AS unuse FROM buffers WHERE logical_id='{onlineName}' ";
                    bool unuse = conn.QueryFirst<Boolean>(sql);
                    if (unuse) result = false;
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryBufferAvailable] => null");
                    result = true;
                }
            }
            return result;
        }

        public Boolean QueryHasACarrier(string onlineName)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM carriers WHERE carrier_location='{onlineName}' AND installed=1 ";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryHasACarrier] => null");
                    count = 0;
                }
            }
            if (count > 0) 
                result = true;

            return result;
        }

        public Boolean QueryHasValidCarrier(string onlineName, string carrierId)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM carriers WHERE carrier_location='{onlineName}' 
                                    AND carrier_id='{carrierId}' AND installed = 1 ";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryHasValidCarrier] => null");
                    count = 0;
                }
            }
            if (count > 0)
                result = true;

            return result;
        }

        public Boolean QueryVehicleHostOderEnable(string onlineName)
        {
            Boolean result = false;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT order_origin FROM vehicles WHERE logical_id='{onlineName}' ";
                    string origin = conn.QueryFirst<string>(sql);

                    if (origin != null && (origin.Contains("MCS") || origin.Contains("*")))
                        result = true;
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryVehicleHostOderEnable] => null");
                    result = false;
                }
            }
            return result;
        }

        public DestType QueryDestVerify(string onlineName)
        {
            if (onlineName == null) return DestType.NONE;

            if (QueryType(onlineName, SourceType.BUFFER) > 0) return DestType.BUFFER;
            if (QueryType(onlineName, SourceType.STATION) > 0) return DestType.STATION;

            return DestType.NONE;
        }

        public Boolean QueryInterlockDestInOrder(string portName)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM orders WHERE location_dropoff='{portName}' 
                            AND time_completed is NULL AND time_aborted is NULL AND time_failed is NULL";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryInterlockDestInOrder] => null");
                    count = 0;
                }
            }
            if (count > 0)
                result = true;

            return result;
        }

        public string QueryPortNameByOnlineName(string onlineName, int srcType)
        {
            string result = string.Empty;

            var sql = string.Empty;
            if (srcType == (int)SourceType.VEHICLE) sql = $@"SELECT id FROM vehicles WHERE logical_id='{onlineName}' ";
            else if (srcType == (int)SourceType.BUFFER) sql = $@"SELECT id FROM buffers WHERE logical_id='{onlineName}' ";
            else if (srcType == (int)SourceType.STATION) sql = $@"SELECT id FROM stations WHERE logical_id='{onlineName}' ";
            else return string.Empty;

            using (var conn = ConnectTrack())
            {
                try
                {
                    string name = conn.QueryFirst<string>(sql);
                    if (srcType == (int)SourceType.VEHICLE) result = "v" + name;
                    if (srcType == (int)SourceType.BUFFER) result = "b" + name;
                    if (srcType == (int)SourceType.STATION) result = "s" + name;
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryPortNameByOnlineName] => null");
                    result = null;
                }
            }
            return result;
        }

        public Boolean QueryDuplicatedInOrder(string commandID, string carrierId)
        {
            Boolean result = false;
            int count = 0;
            using (var conn = ConnectTrack())
            {
                try
                {
                    var sql = $@"SELECT count(*) FROM orders WHERE carrier_label='{carrierId}' 
                                and time_completed is null and time_aborted is null and time_failed is null ";
                    count = conn.QueryFirst<int>(sql);
                }
                catch (System.Exception)
                {
                    Console.WriteLine("[QueryDuplicatedInOrder] => null");
                    count = 0;
                }
            }
            if (count > 0)
                result = true;

            return result;
        }
    }


}