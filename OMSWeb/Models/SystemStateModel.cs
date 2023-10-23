using System;

#nullable enable

namespace OMSWeb.Models
{
  public class SystemState
  {
    public int Id { get; set; }
    public bool FireEmergency { get; set; }
    public bool FireDetect	{ get; set; }
    public DateTime HistoryChangeTime { get; set; }
    public string HistoryChangeType { get; set; }
    public string AckAction { get; set; }
    public DateTime AckTime { get; set; }
    public string AckBy { get; set; }
  }
}
