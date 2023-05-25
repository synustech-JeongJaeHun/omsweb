using System;

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

    public bool? Unuse { get; set; }
    
    public int? State { get; set; }

    public string CarrierId { get; set; }

    public int? GroupId { get; set; }

    public int? SlideOffset { get; set; }

    public string User { get; set; }

    public string Note { get; set; }
    
    public string? CAlias { get; set; }
  }

  public class BufferHistoryEntity
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public bool? Unuse { get; set; }
    public string CarrierId { get; set; }
    public string User { get; set; }
    public string Note { get; set; }
    public DateTime UnusedTime { get; set; }
    public int HistorySourceId { get; set; }
    public DateTime HistoryChangeTime { get; set; }
    public string HistoryChangeType { get; set; }
    public string CAlias { get; set; }
  }
}