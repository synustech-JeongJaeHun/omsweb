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

    [HttpGet("groups/isavailablehomes/{groupId}")]
    public IEnumerable<int> GetSettingsGroupIsAvailableHomes([FromRoute] int groupId)
    {
      return _settingsSvc.GetSettingsGroupIsAvailableHomes(groupId).ToList();
    }

    [HttpGet("groups/isavailablestations/{groupId}")]
    public IEnumerable<int> GetSettingsGroupIsAvailableStations([FromRoute] int groupId)
    {
      return _settingsSvc.GetSettingsGroupIsAvailableStations(groupId).ToList();
    }

    [HttpGet("groups/isavailablevehicles/{groupId}")]
    public IEnumerable<int> GetSettingsGroupIsAvailableVehicles([FromRoute] int groupId)
    {
      return _settingsSvc.GetSettingsGroupIsAvailableVehicles(groupId).ToList();
    }

    [HttpGet("groups/isavailablebuffers/{groupId}")]
    public IEnumerable<int> GetSettingsGroupIsAvailableBuffers([FromRoute] int groupId)
    {
      return _settingsSvc.GetSettingsGroupIsAvailableBuffers(groupId).ToList();
    }

    [HttpGet("clusters")]
    public IEnumerable<ClusterEntity> GetSettingsClusters()
    {
      return _settingsSvc.GetSettingsClusters().ToList();
    }

    [HttpGet("clusters/points")]
    public IEnumerable<ClusterPointEntity> GetSettingsClusterPoints()
    {
      return _settingsSvc.GetSettingsClusterPoints().ToList();
    }

    [HttpGet("clusters/isavailablepoints/{clusterId}")]
    public IEnumerable<int> GetSettingsClusterIsAvailablePoints([FromRoute] int clusterId)
    {
      return _settingsSvc.GetSettingsClusterIsAvailablePoints(clusterId).ToList();
    }

    [HttpGet("clusters/assignedpoints/{clusterId}")]
    public IEnumerable<int> GetSettingsClusterAssignedPoints([FromRoute] int clusterId)
    {
      return _settingsSvc.GetSettingsClusterAssignedPoints(clusterId).ToList();
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