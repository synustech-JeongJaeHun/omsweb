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

        // for cluster, id means server_id
        public int Id { get; set; }
        public int? Level { get; set; }
        public VehiclePosition Data { get; set; }
        // public JObject Data { get; set; }
        public int? VehicleId { get; set; }
        // public VehiclePosition Vehicle { get; set; }

        #region Buffer, Station, Vehicle, SegmentBlocking
        public string User { get; set; }
        public string Note { get; set; }
        #endregion

        #region Station And Buffer
        public bool? Unuse { get; set; }
        #endregion

        #region Buffer
        public string CarrierId  { get; set; }
        #endregion

        #region ClusterState
        public int ConverterId { get; set; }
        public int Status { get; set; }
        public int BackupId { get; set; }
        
        public int MaxVehicles  { get; set; }
        #endregion

        #region Home
        public int? Point { get; set; }
        #endregion

        #region GroupedObject
        public int? GroupId { get; set; }
        public int? ReferenceId { get; set; }
#nullable enable
        public string? ReferenceTable { get; set; }
#nullable disable
        #endregion
    }
}
