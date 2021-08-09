using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
  public class ModuleStatusEntity
  {
    public int ID { get; set; }
    public string Name { get; set; }
    public string Version { get; set; }
    public DateTime ReleaseTime { get; set; }
    public int PID { get; set; }
    public DateTime StartTime { get; set; }
  }
}