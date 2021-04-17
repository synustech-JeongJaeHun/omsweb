using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;

namespace OMSWeb.Models
{
  public class DataChangeEventTarget
  {
    public string[] PushNames { get; set; }
    public CacheKeys CacheKey { get; set; }
    public bool IsSingleUpdate { get; set; }

    public DataChangeEventTarget(CacheKeys key, string[] pushNames, bool isSingleUpdate = false)
    {
      this.CacheKey = key;
      this.PushNames = pushNames;
      this.IsSingleUpdate = isSingleUpdate;
    }
  }
  public class DataWatcherPayload
  {
    public long? Timestamp { get; set; }
    public string Table { get; set; }
    public string Operation { get; set; }
    public int Id { get; set; }
    public int? Level { get; set; }
    public VehiclePosition Data { get; set; }
    // public JObject Data { get; set; }
    public int? VehicleId { get; set; }
    // public VehiclePosition Vehicle { get; set; }
  }
}
