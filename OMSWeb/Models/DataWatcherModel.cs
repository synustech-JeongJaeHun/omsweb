using Newtonsoft.Json;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;

namespace OMSWeb.Models
{
  public class DataChangeEventTarget {

    public string[] EmitNames { get; set; }
    public CacheKeys? CacheKey { get; set; }
    public bool IsSingleUpdate { get; set; }

    public DataChangeEventTarget(CacheKeys key, string[] emitNames, bool isSingleUpdate = false)
    {
      this.CacheKey = key;
      this.EmitNames = emitNames;
      this.IsSingleUpdate = isSingleUpdate;
    }
  }
  public class DataWatcherEvent
  {
    public string Table { get; set; }
    public string Operation { get; set; }
    public int Id { get; set; }
    public int? Level { get; set; }
    public VehiclePosition Data { get; set; }
    public int? VehicleId { get; set; }
  }

}