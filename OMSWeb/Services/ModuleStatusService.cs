using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class ModuleStatusService
  {
    private readonly ModuleStatusRepository _moduleStatusRepo;

    public ModuleStatusService(ModuleStatusRepository moduleStatus)
    {
      this._moduleStatusRepo = moduleStatus;
    }

    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      return this._moduleStatusRepo.GetModuleStatus();
    }
  }
}
