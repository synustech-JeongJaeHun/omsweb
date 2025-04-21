using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
  public class VhlStatusEntity
  {
    public int ID { get; set; }
    public int VehicleId { get; set; }
    public string LogicalId { get; set; }
    public DateTime VerChangeTime { get; set; }
    public string VcpSwVer { get; set; }
    public string MotionFwVer { get; set; }
    public string MotionLibVer { get; set; }
    public string IpAddress { get; set; }
  }
}