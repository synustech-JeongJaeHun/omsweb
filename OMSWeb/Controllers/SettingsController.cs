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

    [HttpGet("groups")]
    public IEnumerable<GroupEntity> GetSettingsGroups()
    {
      return _settingsSvc.GetSettingsGroups().ToList();
    }

    [HttpGet("groups/grouped_objects")]
    public IEnumerable<GroupedObjectEntity> GetSettingsGroupedObjects()
    {
      return _settingsSvc.GetSettingsGroupedObjects().ToList();
    }

    [HttpGet("groups/homes")]
    public IEnumerable<ObjectEntity> GetSettingsGroupHomeObjects()
    {
      return _settingsSvc.GetSettingsGroupHomeObjects().ToList();
    }

    [HttpGet("groups/stations")]
    public IEnumerable<ObjectEntity> GetSettingsGroupStationObjects()
    {
      return _settingsSvc.GetSettingsGroupStationObjects().ToList();
    }

    [HttpGet("groups/vehicles")]
    public IEnumerable<ObjectEntity> GetSettingsGroupVehicleObjects()
    {
      return _settingsSvc.GetSettingsGroupVehicleObjects().ToList();
    }

    [HttpGet("groups/buffers")]
    public IEnumerable<ObjectEntity> GetSettingsGroupBufferObjects()
    {
      return _settingsSvc.GetSettingsGroupBufferObjects().ToList();
    }

    [HttpGet("segments")]
    public IEnumerable<SegmentWithVPartsNBlockingEntity> GetSettingsSegments()
    {
      return _settingsSvc.GetSettingsSegements().ToList();
    }

    [HttpPost("segments/save")]
    public IActionResult SaveSettingsSegments([FromBody] SegmentWithVPartsNBlockingEntity[] segments)
    {
      var updateSegements = segments.ToList();

      foreach (SegmentWithVPartsNBlockingEntity segment in segments)
      {
        _settingsSvc.UpdateSettingsSegment(segment);
      }

      return Ok();
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


    [HttpPost("vehicleRegs/save")]
    public IActionResult SaveVehicleRegs([FromBody] VehicleRegEntity[] vehicleRegs)
    {
      var updateVehicleRegs = vehicleRegs.Where(u => !u.IsNew.HasValue || !u.IsNew.Value).ToList();
      var addVehicleRegs = vehicleRegs.Where(u => u.IsNew.HasValue && u.IsNew.Value).ToList();

      foreach (VehicleRegEntity vehicleReg in updateVehicleRegs)
      {
        _settingsSvc.UpdateSettingsVehicleRegs(vehicleReg);
      }

      foreach (VehicleRegEntity vehicleReg in addVehicleRegs)
      {
        _settingsSvc.InsertSettingsVehicleRegs(vehicleReg);
      }

      return Ok();
    }

    [HttpPost("vehicleRegs/remove")]
    public IActionResult DeleteVehicleRegs([FromBody] VehicleRegEntity[] vehicleRegs)
    {
      foreach (VehicleRegEntity vehicleReg in vehicleRegs)
      {
        _settingsSvc.DeleteSettingsVehicleRegs(vehicleReg);
      }
      return Ok();
    }
  }
}