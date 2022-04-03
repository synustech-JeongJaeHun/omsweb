using System;
namespace OMSWeb.Models.Entities
{
    public interface ITimeline
    {
        public int EventId { get; set; } // original name id
        public DateTimeOffset EventTime { get; set; }
        public string TableName { get; set; }
    }
    public class VehicleHistoryWithTimeLine : VehicleHistoryEntity, ITimeline
    {
        public int EventId { get; set; }
        public DateTimeOffset EventTime { get; set; }
        public string TableName { get; set; }
    }
    public class OrderHistoryWithTimeLine : OrderHistoryEntity, ITimeline
    {
        public int EventId { get; set; }
        public DateTimeOffset EventTime { get; set; }
        public string TableName { get; set; }
    }
    public class SegmentBlockingHistoryEntityWithTimeline : SegmentBlockingHistoryEntity, ITimeline
    {
        public int EventId { get; set; }
        public DateTimeOffset EventTime { get; set; }
        public string TableName { get; set; }
    }
}