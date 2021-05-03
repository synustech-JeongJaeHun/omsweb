using System;

namespace OMSWeb.Models.Entities {
  public class TimelineEntity {
    public int Id { get; set; }
    public DateTime EventTime { get; set; }
    public int EventId { get; set; }
    public string TableName { get; set; }
  }
}