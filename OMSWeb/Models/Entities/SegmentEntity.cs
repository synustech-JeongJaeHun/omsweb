using System;
namespace OMSWeb.Models.Entities
{
    public class SegmentBlockingEntity : IIntId
    {
        public int Id { get; set; }
        public int SegmentId { get; set; }
        public string DisabledBy { get; set; }
        public string Reason { get; set; }
    }

    public class SegmentBlockingHistoryEntity : SegmentBlockingEntity
    {
        public int HistorySourceId { get; set; }
        public DateTime HistoryChangeTime { get; set; }
        public string HistoryChangeType { get; set; }
    }
}