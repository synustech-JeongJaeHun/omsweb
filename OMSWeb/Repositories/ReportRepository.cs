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
                    logical_id as label
                    from buffers
                    union
                    select
                    concat('s', id) as id,
                    logical_id as label
                    from stations
                    union
                    select
                    id::text as id,
                    logical_id as label
                    from vehicles
                    order by id asc
                ) as temp
                order by id
                ";
                result = conn.Query<ReportLabel>(sql).AsQueryable();
            }
            return result;
        }
    }
}