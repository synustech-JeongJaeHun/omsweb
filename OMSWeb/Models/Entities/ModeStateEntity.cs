using System;

namespace OMSWeb.Models.Entities
{
  public class ModeStateEntity
  {
    public int comm_state { get; set; }
    public int control_state { get; set; }
    public int tsc_state { get; set; }
    public int pm_state { get; set; }
    public int ai_mode { get; set; }
  }

  public class ModeStateHistoryEntity : ModeStateEntity
  {
    public DateTime HistoryChangeTime { get; set; }
    public string HistoryChangeType { get; set; }
  }
}