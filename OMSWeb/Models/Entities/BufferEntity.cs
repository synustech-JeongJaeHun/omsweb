using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
  public class BufferEntity
  {
    public int Id { get; set; }

    public string PhysicalId { get; set; }

    public string LogicalId { get; set; }

    public int Point { get; set; }

    public string Direction { get; set; }

    public int NextPoint { get; set; }

    public int Offset { get; set; }
  }
}