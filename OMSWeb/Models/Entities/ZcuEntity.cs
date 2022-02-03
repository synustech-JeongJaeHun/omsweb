using System;

namespace OMSWeb.Models.Entities
{
  public class ZcuStatusEntity
  {
    public int id { get; set; }

    public string logicalId { get; set; }

    public int usingType { get; set; }

    public int ZcuType { get; set; }

    public bool status { get; set; }

    public int errorCode { get; set; }

    public string[] passVehicle { get; set; }

    public string[] vehicleCount { get; set; }

    public string[] vehicleInfo { get; set; }
  }
}