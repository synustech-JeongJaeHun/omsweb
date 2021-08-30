using System;

namespace OMSWeb.Models.Entities
{
  public class AlarmEntity
  {
    public int Id { get; set; }
    public DateTime Time { get; set; }
    public int ErrorCode { get; set; }
    public int VehicleId { get; set; }
    public DateTime? TimeResolved { get; set; }
  }

  public class AlarmHistory : AlarmEntity
  {
    public int Age { get; set; }
    public int Level { get; set; }
    public string Description { get; set; }
    public string Action { get; set; }
    public string Note { get; set; }
  }

  public class VehicleError
  {
    public int Id { get; set; }
    public int Level { get; set; }
    public string Description { get; set; }
    public string Cause { get; set; }
    public string Action { get; set; }
  }
}