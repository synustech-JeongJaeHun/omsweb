using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class SystemsController : ControllerBase
  {
    private SystemsService _systemSvc;

    public SystemsController(SystemsService systemSvc)
    {
      this._systemSvc = systemSvc;
    }

    [HttpGet("states")]
    public ActionResult<SystemStatusModel> GetStates()
    {
      return this._systemSvc.HostStates;
    }

    [HttpPatch("states")]
    public ActionResult<SystemStatusModel> ChangeStates(SystemStatusModel nextStatus)
    {
      var current = this._systemSvc.HostStates;
      if (nextStatus != null)
      {
        // if (nextStatus.SessionStatus.HasValue)
        // {
        //   current.SessionStatus = nextStatus.SessionStatus.Value;
        // }

        if (nextStatus.HostMode.HasValue)
        {
          current.HostMode = nextStatus.HostMode.Value;
        }

        if (nextStatus.TscMode.HasValue)
        {
          current.TscMode = nextStatus.TscMode.Value;
        }

        if (nextStatus.AiMode.HasValue)
        {
          current.AiMode = nextStatus.AiMode.Value;
        }
      }
      return current;
    }

    [HttpGet("settings/client")]
    public ActionResult<ClientSettings> GetClientSettings()
    {
      return this._systemSvc.GetClientSettings();
    }
  }
}