using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using Npgsql;

namespace OMSWeb.Repositories
{
  public class ModuleStatusRepository : DataAccess
  {
    public ModuleStatusRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      IQueryable<ModuleStatusEntity> result;

      var sql = @"
      SELECT id, name, version, release_time, pid, start_time 
      FROM module_status
      ";

      using (var conn = ConnectTrack())
      {        
        result = conn.Query<ModuleStatusEntity>(sql).AsQueryable(); 
      }
      return result;
    }
  }
}
