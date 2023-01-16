using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models.Entities;
using OMSWeb.Models.Tracks;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
    public class DbVersionRepository : DataAccess
    {
        public DbVersionRepository(IConfiguration configuration) : base(configuration)
        { }

        public DbVersionEntity QueryCurrentMap()
        {
            DbVersionEntity result;

            var sql = @"SELECT db_name, db_version, src_map_file from db_version";

            using (var conn = ConnectTrack())
            {
                try
                { 
                    result = conn.QueryFirst<DbVersionEntity>(sql);
                }
                catch (Exception e)
                {
                    result = null;
                }
            }

            return result;
        }
    }
}