using System;

namespace OMSWeb.Models.Entities
{
    public class OrderEntity : IIntId
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public string Origin { get; set; }
        public string VehicleId { get; set; }
        public string State { get; set; }
        public string LocationPickup { get; set; }
        public string LocationDropoff { get; set; }
        public string LocationMove { get; set; }
        public int Priority { get; set; }
        public string AssignmentDetails { get; set; }
        public string AssignmentType { get; set; }
        public string CarrierLabel { get; set; }
        public DateTime? TimeCreated { get; set; }
        public DateTime? TimeAssigned { get; set; }
        public DateTime? TimeCompleted { get; set; }
        public DateTime? TimeAborted { get; set; }
        public DateTime? TimeFailed { get; set; }
        public TimeSpan? Age { get; set; }
        public float? DistancePickup { get; set; }
        public float? DistanceDropoff { get; set; }
        public float? DistanceMove { get; set; }
        public int? LoadRetryCnt { get; set; }
        public int? UnloadRetryCnt { get; set; }
        public string ResultCode { get; set; }
        public string? locationPickupAlias { get; set; }
        public string? locationDropoffAlias { get; set; }
    }
    public class OrderHistoryEntity : OrderEntity
    {
        public int HistorySourceId { get; set; }
        public DateTime HistoryChangeTime { get; set; }
        public string HistoryChangeType { get; set; }
    }
}