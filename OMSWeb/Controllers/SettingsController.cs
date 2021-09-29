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
    public IEnumerable<SegmentWithVPartsNBlockingEntity> GetSettingsSegments()
    {
      return _settingsSvc.GetSettingsSegements().ToList();
    }

    [HttpGet("stations")]
    public IEnumerable<StationWithUnuseEntity> GetSettingsStations()
    {
      return _settingsSvc.GetSettingsStations().ToList();
    }

    [HttpGet("buffers")]
    public IEnumerable<BufferWithUnuseEntity> GetSettingsBuffers()
    {
      return _settingsSvc.GetSettingsBuffers().ToList();
    }

    [HttpGet("points")]
    public object GetSettingsPoints(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetSettingsPoints(), loadOptions);
    }

    [HttpGet("zcus")]
    public IEnumerable<ZcuEntity> GetSettingsZcus()
    {
      return _settingsSvc.GetSettingsZcus();
    }

    [HttpGet("zcu-input-zones")]
    public object GetSettingsZcusInputZones(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_settingsSvc.GetZcuInputZones(), loadOptions);
    }

    [HttpGet("vehicleRegs")]
    public IEnumerable<VehicleRegEntity> GetSettingsVehicleRegs()
    {
      return _settingsSvc.GetSettingsVehicleRegs();
    }
  }
}