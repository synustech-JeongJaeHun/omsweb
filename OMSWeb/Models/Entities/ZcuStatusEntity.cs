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
}