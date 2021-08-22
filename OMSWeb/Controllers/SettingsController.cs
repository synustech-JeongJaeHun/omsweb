using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;

using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class SettingsController : ControllerBase
  {
    private readonly SettingsService _settingsSvc;

    public SettingsController(SettingsService settingsSvc)
    {
      this._settingsSvc = settingsSvc;
    }

    [HttpGet("segments")]
    public object GetSettingsSegements(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsSegements(), loadOptions);
    }

    [HttpGet("stations")]
    public object GetSettingsStations(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsStations(), loadOptions);
    }

    [HttpGet("buffers")]
    public object GetSettingsBuffers(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsBuffers(), loadOptions);
    }

    [HttpGet("points")]
    public object GetSettingsPoints(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsPoints(), loadOptions);
    }

    [HttpGet("zcus")]
    public object GetSettingsZcus(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsZcus(), loadOptions);
    }

    [HttpGet("zcu-input-zones")]
    public object GetSettingsZcusInputZones(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetZcuInputZones(), loadOptions);
    }
  }
}