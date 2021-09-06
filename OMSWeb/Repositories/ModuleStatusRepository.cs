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
    private readonly int ID_OMS_SRV = 1;
    private readonly int ID_AI_MODULE = 2;
    private readonly int ID_OMS_UI = 3;
    private readonly int ID_VAS = 4;
    private readonly int ID_HAS = 5;

    private readonly string NAME_OMS_SRV = "OMS Server";
    private readonly string NAME_AI_MODULE = "AI Module";
    private readonly string NAME_OMS_UI = "OMS Web";
    private readonly string NAME_VAS = "VAS";
    private readonly string NAME_HAS = "HAS";

    public ModuleStatusRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      IQueryable<ModuleStatusEntity> result;

      var sql = @"SELECT id, name, version, release_time, pid, start_time 
                FROM module_status ORDER BY id";

      using (var conn = ConnectTrack())
      {        
        result = conn.Query<ModuleStatusEntity>(sql).AsQueryable(); 
      }
      return result;
    }

    public string GetOmsServerVersion()
    {
      List<string> data;
      string sql = string.Format(@"SELECT version FROM module_status WHERE id={0}", ID_OMS_SRV);
      using (var conn = ConnectTrack())
      {
        data = conn.Query<string>(sql).AsList();
      }
      return (data != null) ? data[0] : "";
    }
  }
}
