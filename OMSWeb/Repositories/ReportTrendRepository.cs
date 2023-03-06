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

        public async Task CreateOrder10m()
        {
            using (var conn = ConnectTrack())
            {
                var sql = $@"
                    CREATE or REPLACE VIEW orders10m as (
                        select distinct on (logical_id) * 
                        from (
                            (
                                select 
                                * 
                                from orders
                                where time_modified >= now() - interval '10 minutes' 
                                    and location_pickup is not null
                                    and location_dropoff is not null
                            )
                            union (
                                select 
                                * 
                                from order_completed oc
                                where time_modified >= now() - interval '10 minutes'
                                    and location_pickup is not null
                                    and location_dropoff is not null
                            )
                        ) temp
                    )
                ";

                await conn.ExecuteAsync(sql);
            }
        }

        //public async Task<(int Value, int Count)> QueryDeliveryTime()
        public async Task<object> QueryDeliveryTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        EXTRACT(EPOCH FROM avg(time_completed - time_created))::int as value,
                        count(*)
                    from orders10m
                    where time_completed >= now() - interval '10 minutes'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
            //return result;
        }
        //ublic async Task<(int Value, int Count)> QueryWaitTime()
        public async Task<object> QueryWaitTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        EXTRACT(EPOCH FROM avg(time_load_completed  - time_created))::int as value,
                        count(*)
                    from orders10m
                    where time_load_completed >= now() - interval '10 minutes'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
            //return result;
        }
        //public async Task<(int Value, int Count)> QueryTransferTime()
        public async Task<object> QueryTransferTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        EXTRACT(EPOCH FROM avg(time_completed  - time_load_completed))::int as value,
                        count(*)
                    from orders10m
                    where time_completed >= now() - interval '10 minutes'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
            //return result;
        }
        //public async Task<(int Value, int Count)> QueryAssignTime()
        public async Task<object> QueryAssignTime()
        {
            (int Value, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        EXTRACT(EPOCH FROM avg(time_assigned  - time_created))::int as value,
                        count(*)
                    from orders10m
                    where time_assigned >= now() - interval '10 minutes'
                ";

                result = await conn.QueryFirstAsync<(int Value, int Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
            //return result;
        }

        //public async Task<(float Value, float Count)> QueryNumberOfOrderRequest()
        public async Task<object> QueryNumberOfOrderRequest()
        {
            (float Value, float Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        trunc((CAST(count(*) AS DECIMAL(5,1))/600), 2) as value,
                        trunc((CAST(count(*) AS DECIMAL(5,1)) * 6 * 24), 2) as count
                    from orders10m
                    where time_created >= now() - interval '10 minutes'
                ";

                result = await conn.QueryFirstAsync<(float Value, float Count)>(sql);
            }
            return new { Value = result.Value, Count = result.Count };
            //return result;
        }
        
        //public async Task<(int Auto, int Manual, int Error, int Disconnected)> QueryVehicles()
        public async Task<object> QueryVehicles()
        {
            (int Auto, int Manual, int Error, int Disconnected) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                select
                (
                    select count(*) from vehicles where connection in (1, 2) and (error_list = '') IS true and mode = 'A'
                ) as auto,
                (
                    select count(*) from vehicles where connection in (1, 2) and (error_list = '') IS true and mode = 'M'
                ) as manual,
                (
                    select count(*) from vehicles where connection in (1, 2) and (error_list = '') IS false
                ) as error,
                (
                    select count(*) from vehicles where connection in (0, 3, 4)
                ) as disconnected
                ";

                result = await conn.QueryFirstAsync<(int Auto, int Manual, int Error, int Disconnected)>(sql);
            }
            
            return new
            {
                Auto = result.Auto,
                Manual = result.Manual,
                Error = result.Error,
                Disconnected = result.Disconnected,
            };
            
            //return result;
        }
        
        //public async Task<(int Unloading, int Loading)> QueryLoadingUnLoading()
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
            //return result;
        }
        
        //public async Task<(DateTimeOffset BeforeTime, DateTimeOffset CurrentTime, int Count)> QueryRange()
        public async Task<object> QueryRange()
        {
            (DateTimeOffset BeforeTime, DateTimeOffset CurrentTime, int Count) result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select
                        now() - interval '10 minutes' as before_time,
                        now() as current_time,
                        count(*)
                    from orders10m
                ";

                result = await conn.QueryFirstAsync<(DateTimeOffset BeforeTime, DateTimeOffset CurrentTime, int Count)>(sql);
            }
            
            return new
            {
                before_time = result.BeforeTime.ToUnixTimeMilliseconds(),
                current_time = result.CurrentTime.ToUnixTimeMilliseconds(),
                Count = result.Count
            };
            
            //return result;
        }
        
        //public async Task<float> QueryUtilization()
        public async Task<object> QueryUtilization()
        {
            float result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select 
                        trunc(
                            (
                                sum(time)::decimal / (
                                    600 * (
                                            select count(*)::int 
                                            from vehicles 
                                        )::decimal
                                    )
                            ) * 100
                        , 2) as value
                    from (
                        select
                            extract(epoch from time) as time
                        from (
                            select
                            CASE
                                when time_assigned > now() - interval '10 minutes' and time_completed is null then now() - time_assigned
                                when time_assigned > now() - interval '10 minutes' and time_completed is not null then time_completed - time_assigned
                                when time_assigned <= now() - interval '10 minutes' and time_completed is null then interval '10 minutes'
                                when time_assigned <= now() - interval '10 minutes' and time_completed is not null then time_completed - (now() - interval '10 minutes')
                                ELSE interval '0 minutes'
                            end as time
                            from ( 
                                select
                                    time_assigned,
                                    time_completed
                                from orders10m
                                where (time_aborted is null and time_failed is null) and vehicle_id is not null
                            ) fol
                        ) ol
                    ) times
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
            //return result;
        }

        public async Task<object> QueryTrendUtilization()
        {
            float? result = null;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select 
                        trunc(
                            (
                                sum(time)::decimal / (
                                    600 * (
                                            select count(*)::int 
                                            from vehicles 
                                        )::decimal
                                    )
                            ) * 100
                        , 2) as value
                    from (
                        select
                            extract(epoch from time) as time
                        from (
                            select
                            CASE
                                when time_assigned > now() - interval '10 minutes' and time_completed is null then now() - time_assigned
                                when time_assigned > now() - interval '10 minutes' and time_completed is not null then time_completed - time_assigned
                                when time_assigned <= now() - interval '10 minutes' and time_completed is null then interval '10 minutes'
                                when time_assigned <= now() - interval '10 minutes' and time_completed is not null then time_completed - (now() - interval '10 minutes')
                                ELSE interval '0 minutes'
                            end as time
                            from ( 
                                select
                                    time_assigned,
                                    time_completed
                                from orders10m
                                where (time_aborted is null and time_failed is null) and vehicle_id is not null
                            ) fol
                        ) ol
                    ) times
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
                    from orders10m
                    where time_completed >= now() - interval '10 minutes'
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