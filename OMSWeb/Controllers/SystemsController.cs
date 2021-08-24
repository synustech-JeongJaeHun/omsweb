using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class SystemsController : ControllerBase
  {
    private SystemsService _systemSvc;
    private ModuleStatusService _moduleStatusSvc;

    public SystemsController(SystemsService systemSvc, ModuleStatusService moduleStatusSvc)
    {
      this._systemSvc = systemSvc;
      this._moduleStatusSvc = moduleStatusSvc;
    }

    [HttpGet("states")]
    public ActionResult<SystemStatusModel> GetStates()
    {
      return this._systemSvc.GetHostStatus();
    }

    [HttpGet("settings/client")]
    public ActionResult<ClientSettings> GetClientSettings()
    {
      return this._systemSvc.GetClientSettings();
    }

    [HttpGet("module-status")]
    public IQueryable<ModuleStatusEntity> GetModuleStatus()
    {
      return this._moduleStatusSvc.GetModuleStatus();
    }
  }
}