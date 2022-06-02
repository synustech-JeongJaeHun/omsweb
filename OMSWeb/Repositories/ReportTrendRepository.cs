using System.Collections.Generic;
using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;
using System.Threading.Tasks;

#nullable enable

namespace OMSWeb.Repositories
{
    public class ReportTrendReposity : DataAccess
    {
        public ReportTrendReposity(IConfiguration configuration) : base(configuration) { }

        public async Task<object> QueryDeliveryTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    EXTRACT(EPOCH FROM avg(time_completed - time_created))::int as value,
                    count(*)
                    from orders
                    where time_completed >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
        }
        public async Task<object> QueryWaitTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    EXTRACT(EPOCH FROM avg(time_load_completed  - time_created))::int as value,
                    count(*)
                    from orders
                    where time_load_completed >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
        }
        public async Task<object> QueryTransferTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    EXTRACT(EPOCH FROM avg(time_completed  - time_load_completed))::int as value,
                    count(*)
                    from orders
                    where time_load_completed >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
        }
        public async Task<object> QueryAssignTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    EXTRACT(EPOCH FROM avg(time_assigned  - time_created))::int as value,
                    count(*)
                    from orders
                    where time_assigned >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
        }
        public async Task<object> QueryNumberOfOrderRequest()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    count(*) as value,
                    count(*)
                    from orders
                    where time_created >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
        }
        public async Task<object> QueryVehicles()
        {
            (int Auto, int Manual, int Error, int Idle) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                select
                (
                    select count(*) from vehicles where mode = 'A'
                ) as auto,
                (
                    select count(*) from vehicles where mode = 'M' and (error_list = '') IS true
                ) as manual,
                (
                    select count(*) from vehicles where (error_list = '') IS false
                ) as error,
                (
                    select count(*) from vehicles where order_id is null
                ) as idle
                ";

                result = await conn.QueryFirstAsync<(int Auto, int Manual, int Error, int Idle)>(sql);
            }
            return new
            {
                Auto = result.Auto,
                Manual = result.Manual,
                Error = result.Error,
                Idle = result.Idle,
            };
        }
        public async Task<object> QueryLoadingUnLoading()
        {
            (int Unloading, int Loading) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                select
                (
                    select count(*)
                    from vehicles
                    where cargo_state = 'U' or cargo_state = 'E'
                ) as unloading,
                (
                    select count(*)
                    from vehicles
                    where cargo_state = 'L' or cargo_state = 'F'
                ) as loading
                ";

                result = await conn.QueryFirstAsync<(int Unloading, int Loading)>(sql);
            }
            return new { Unloading = result.Unloading, Loading = result.Loading };
        }
        public async Task<object> QueryRange()
        {
            (DateTimeOffset BeforeTime, DateTimeOffset CurrentTime, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    now() - interval '1 hours' as before_time,
                    now() as current_time,
                    count(*)
                    from orders where time_modified >= now() - interval '1 hours'
                ";

                result = await conn.QueryFirstAsync<(DateTimeOffset BeforeTime, DateTimeOffset CurrentTime, int Count)>(sql);
            }
            return new
            {
                before_time = result.BeforeTime.ToUnixTimeMilliseconds(),
                current_time = result.CurrentTime.ToUnixTimeMilliseconds(),
                Count = result.Count
            };
        }
        public async Task<object> QueryUtilization()
        {
            float result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    TRUNC((EXTRACT(epoch FROM avg(time)) / 3600) * 100, 2)::float as value
                    from (
                    select
                    CASE
                        when time_created > now() - interval '1 hours' and max_field is null then now() - time_created
                        when time_created <= now() - interval '1 hours' and max_field is null then interval '1 hours'
                        when time_created <= now() - interval '1 hours' and max_field is not null and time_completed is null then interval '1 hours'
                        when time_completed is not null then time_completed - (now() - interval '1 hours')
                        ELSE interval '1 hours'
                    end as time,
                    id,
                    time_created,
                    max_field,
                    time_completed
                    from (
                        select * from (
                        select
                        id,
                        time_created,
                        greatest (
                            time_assigned, time_vehicle_arrived,
                            time_load_started, time_load_completed,
                            time_unload_started, time_unload_completed,
                            time_completed
                        ) as max_field,
                        time_completed
                        from orders
                        where time_aborted is null and
                        time_modified between now() - interval '1 hours' and now()
                        ) temp
                    ) temp
                    ) temp
                ";

                try
                {
                    result = await conn.QueryFirstAsync<float>(sql);
                }
                catch (System.Exception)
                {
                    result = 0;
                }
            }
            return new { Value = result };
        }

        public async Task<object> QueryTrendUtilization()
        {
            float? result = null;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    TRUNC((EXTRACT(epoch FROM avg(time)) / 3600) * 100, 2)::float as value
                    from (
                    select
                    CASE
                        when time_created > now() - interval '1 hours' and max_field is null then now() - time_created
                        when time_created <= now() - interval '1 hours' and max_field is null then interval '1 hours'
                        when time_created <= now() - interval '1 hours' and max_field is not null and time_completed is null then interval '1 hours'
                        when time_completed is not null then time_completed - (now() - interval '1 hours')
                        ELSE interval '1 hours'
                    end as time,
                    id,
                    time_created,
                    max_field,
                    time_completed
                    from (
                        select * from (
                        select
                        id,
                        time_created,
                        greatest (
                            time_assigned, time_vehicle_arrived,
                            time_load_started, time_load_completed,
                            time_unload_started, time_unload_completed,
                            time_completed
                        ) as max_field,
                        time_completed
                        from orders
                        where time_aborted is null and
                        time_modified between now() - interval '1 hours' and now()
                        ) temp
                    ) temp
                    ) temp
                ";
                try
                {
                    result = await conn.QueryFirstAsync<float>(sql);
                }
                catch (System.Exception)
                {
                    result = null;
                }
            }

            var ret = new Dictionary<string, float?>();
            ret.Add("Value", result);

            return ret;
        }

        public async Task<object> QueryTrendDeliveryTime()
        {
            (int? Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                    EXTRACT(EPOCH FROM avg(time_completed - time_created))::int as value,
                    count(*)
                    from orders
                    where time_completed >= now() - interval '1 hours'
                ";

                try
                {
                    result = await conn.QueryFirstAsync<(int? Value, int Count)>(sql);
                }
                catch (System.Exception)
                {
                    result = (null, 0);
                }
            }

            var ret = new Dictionary<string, dynamic>();
            ret.Add("Value", result.Value);
            ret.Add("Count", result.Count.ToString());

            return ret;
        }
    }
}