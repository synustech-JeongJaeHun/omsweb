using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using OMSWeb.Logger;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  
  public class ModuleStatusService
  {
    private readonly ModuleStatusRepository _moduleStatusRepo;

    private Dictionary<string, string> _processSets;
    
    private Timer _timer;

    private IQueryable<ModuleStatusEntity> moduleStatusEntity;
    private IQueryable<VhlStatusEntity> vhlStatusEntity;
    private IQueryable<CdmStatusEntity> cdmStatusEntity;
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

      TimerCallback(new Object());
      _timer = new Timer(TimerCallback);
      _timer.Change(0, 60000 * 5);
    }

    private void TimerCallback(Object state)
    {
      try
      {
        Console.WriteLine($"### timer callback >> {DateTime.Now}");
        moduleStatusEntity = this._moduleStatusRepo.GetModuleStatus();
        vhlStatusEntity = this._moduleStatusRepo.GetVhlStatus();
        cdmStatusEntity = this._moduleStatusRepo.GetCdmStatus();
      
        foreach (var module in moduleStatusEntity)
        {
          if (module.Name != null)
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
        }
      }
      catch (Exception e)
      {
        Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
      }
      
    }

    public Process GetProcByID(string name)
    {
      Process[] processlist = Process.GetProcesses();
      return processlist.FirstOrDefault(pr => string.Compare(pr.ProcessName, name, StringComparison.CurrentCultureIgnoreCase) == 0);
    }

    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      return moduleStatusEntity;
    }

    public IQueryable<VhlStatusEntity> GetVhlStatus()
    {
      return vhlStatusEntity;
    }

    public IQueryable<CdmStatusEntity> GetCdmStatus()
    {
      return cdmStatusEntity;
    }
  }
  
}
