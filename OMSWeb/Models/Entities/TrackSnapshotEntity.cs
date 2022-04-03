using System;
namespace OMSWeb.Models.Entities
{
    public class TrackSnapshotEntity
    {
        public DateTimeOffset Timestamp { get; set; }
        public string Data { get; set; }
    }
}