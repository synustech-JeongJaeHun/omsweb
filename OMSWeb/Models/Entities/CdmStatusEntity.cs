using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
  public class CdmStatusEntity
  {
    public int ID { get; set; }
    public int ZcuId { get; set; }
    public DateTime VerChangeTime { get; set; }
    public string CdmModuleSwVer { get; set; }
    public string CdmNfModuleSwVer { get; set; }
  }
}