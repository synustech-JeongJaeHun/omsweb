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

    public class ReportRepository : DataAccess
    {
        public ReportRepository(IConfiguration configuration) : base(configuration) { }

        public IQueryable<ReportLabel> QueryLabels()
        {
            IQueryable<ReportLabel> result;
            using (var conn = ConnectTrack())
            {
                var sql = @"
                    select *
                    from (
                        select
                            concat('b', id) as id,
                            logical_id as label,
                            'buffer' as section
                        from buffers
                        UNION
                        select
                            concat('s', id) as id,
                            logical_id as label,
                            'station' as section
                        from stations
                        union
                        select
                            id::text as id,
                            logical_id as label,
                            'vehicle' as section
                        from vehicles
                        union
                        select 
                            error_code::text as id, 
                            description as label, 
                            'alarm' as section 
                        from (
                            select distinct on (error_code) * from vehicle_alarms
                        ) temp
                        LEFT JOIN vehicle_errors as ve
                        on temp.error_code = ve.id
                        union
                        select  
                            current::text as id,
                            concat(current::text, ' (', p.physical_id ::text, ')') as label,
                            'point' as section
                        from (
                            select distinct on (current) * from vehicle_alarms
                        ) temp
                        left join points p on p.logical_id = current
                    ) as temp
                    order by id
                ";
                result = conn.Query<ReportLabel>(sql).AsQueryable();
            }
            return result;
        }

        public async Task CreateOrderView(string start, string end)
        {
            using (var conn = ConnectTrack())
            {
                var sql = $@"
                    CREATE or REPLACE VIEW total_orders as (
                        select *
                        from (
                            select
                                history_source_id as order_id,
                                max(id) as history_id
                            from order_history
                            where time_modified::date between '{start}' and '{end}'
                            group by history_source_id
                        ) temp
                        join order_history oh
                        on oh.id = temp.history_id
                    )
                ";

                await conn.ExecuteAsync(sql);
            }
        }

        public async Task CreateOrderViewAll()
        {
            using (var conn = ConnectTrack())
            {
                var sql = @"
                	CREATE or REPLACE VIEW total_all_orders as (
                        select *
                        from (
                            select
                                history_source_id as order_id,
                                max(id) as history_id
                            from order_history
                            group by history_source_id
                        ) temp
                        join order_history oh
                        on oh.id = temp.history_id
                    )
                ";

                await conn.ExecuteAsync(sql);
            }
        }
    }
}