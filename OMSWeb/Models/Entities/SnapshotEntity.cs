using System;
namespace OMSWeb.Models.Entities
{
    public class SnapshotEntity
    {
        public DateTimeOffset Timestamp { get; set; }
        public string Data { get; set; }
    }
}