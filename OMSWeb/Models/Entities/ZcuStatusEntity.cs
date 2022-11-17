using System;
namespace OMSWeb.Models.Entities
{
  public class ZcuStatusEntity
  {
    public int Id { get; set; }

    public string logicalId { get; set; }

    public string usingType { get; set; }

    public string ZcuType { get; set; }

    public string status { get; set; }

    public int errorCode { get; set; }

    public string passVehicle { get; set; }

    public string vehicleCount { get; set; }

    public string vehicleInfo { get; set; }

  }
  public class ZcuHistoryEntity
  {
    public int Id { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int UsingType { get; set; }
    public int ZcuType { get; set; }
    public int Status { get; set; }
    public string User { get; set; }
    public string Note { get; set; }
    public int HistorySourceId { get; set; }
    public DateTime HistoryChangeTime { get; set; }
    public string HistoryChangeType { get; set; }
  }
}