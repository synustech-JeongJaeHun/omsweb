using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  
  public class ModuleStatusService
  {
    private readonly ModuleStatusRepository _moduleStatusRepo;

    private Dictionary<string, string> _processSets;

    public ModuleStatusService(ModuleStatusRepository moduleStatus)
    {
      this._moduleStatusRepo = moduleStatus;
      _processSets = new Dictionary<string, string>()
      {
        {"OMS Server","oms_srv" },
        {"AI Module", "oms_srv" },
        {"OMS Web",   "OMSWeb" },
        {"VAS",       "VAS" },
        {"HAS",       "HAS" },
        {"ZCU",       "zcu_mgr" },
        {"CPS",       "cps_mgr" },
        {"MTL",       "mtl_mgr" },
        {"FCU",       "fcu_mgr" },
        {"FDC",       "fdc_mgr" },
        {"RDS",       "RDS" },
      };
    }

    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      IQueryable<ModuleStatusEntity> moduleStatusEntity = this._moduleStatusRepo.GetModuleStatus();
      
      foreach (var module in moduleStatusEntity)
      {
        Process process = this.GetProcByID(_processSets[module.Name]);
        if (process == null)
        {
          module.PID = -1;
          module.StartTime = null;
          ModuleStatusDto dto = new ModuleStatusDto();
          dto.PID = module.PID;
          dto.ID = module.ID;

          this._moduleStatusRepo.UpdateModuleStatus(dto);
        }
      }

      return moduleStatusEntity;
    }
    
    public Process GetProcByID(string name)
    {
      Process[] processlist = Process.GetProcesses();
      return processlist.FirstOrDefault(pr => pr.ProcessName == name);
    }
    
    public IQueryable<VhlStatusEntity> GetVhlStatus()
    {
      IQueryable<VhlStatusEntity> vhlStatusEntity = this._moduleStatusRepo.GetVhlStatus();
      return vhlStatusEntity;
    }
    
    public IQueryable<CdmStatusEntity> GetCdmStatus()
    {
      IQueryable<CdmStatusEntity> cdmStatusEntity = this._moduleStatusRepo.GetCdmStatus();
      return cdmStatusEntity;
    }
  }
  
}
