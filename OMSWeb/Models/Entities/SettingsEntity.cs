using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
    public class SegmentEntity : IIntId
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public int StartPoint { get; set; }
        public int EndPoint { get; set; }
        public double Speed { get; set; }
        public double Length { get; set; }
    }

    public class SegmentWithVPartsEntity : SegmentEntity
    {
        public int SteerDir { get; set; }
        public int SpeedRatio { get; set; }
        public string OBLow { get; set; }
        public string OBHigh { get; set; }
        public string OBDistance { get; set; }
    }

    public class SegmentWithVPartsNBlockingEntity : SegmentWithVPartsEntity
    {
        public int BlockingId { get; set; }
        public int SegmentId { get; set; }
        public string DisabledBy { get; set; }
        public string Reason { get; set; }
        public bool UnUse { get; set; }
    }

    public class StationWithUnuseEntity : IIntId
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public int Point { get; set; }
        public string Direction { get; set; }
        public int? CarrierType { get; set; }
        public int NextPoint { get; set; }
        public int Offset { get; set; }
        public bool UnUse { get; set; }
    }

    public class BufferWithUnuseEntity : IIntId
    {
        //BF.id, BF.physical_id, BF.logical_id, BF.point, BF.direction, BF.next_point, BF.offset
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public int Point { get; set; }
        public string Direction { get; set; }
        public int NextPoint { get; set; }
        public int Offset { get; set; }
        public bool UnUse { get; set; }
    }

    public class PointEntity : IIntId
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
    }

    public class PointWithAIVertexEntity : PointEntity
    {
        public int AIVertexId { get; set; }
        public int Point { get; set; }
        public bool Vertex { get; set; }
    }

    public class ZcuEntity : IIntId
    {
        public int Id { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int UsingType { get; set; }
        public int ZcuType { get; set; }
        public string CompletePoints { get; set; }
        public ZcuInputZoneEntity[] InputZones { get; set; }
    }

    public class ZcuCompletePointEntity : IIntId
    {
        public int Id { get; set; }
        public int ZcuId { get; set; }
        public int CompletePointId { get; set; }
    }

    public class ZcuInputZoneEntity : IIntId
    {
        public int Id { get; set; }
        public int ZcuId { get; set; }
        public int PriorityPoint { get; set; }
        public string ZonePoints { get; set; }
    }

    public class VehicleRegEntity : IIntId
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public bool RailIn { get; set; }
        public bool? IsNew { get; set; }
    }

    public class GroupEntity : IIntId
    {
        public int Id { get; set; }
    }

    public class GroupedObjectEntity : IIntId
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int ReferenceId { get; set; }
        public string ReferenceTable { get; set; }
        public int HomePoint { get; set; }
    }

    public class ClusterEntity : IIntId
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public int MaxVehicles { get; set; }
        public string Color { get; set; }
    }

    public class ClusterPointEntity : IIntId
    {
        public int Id { get; set; }
        public int PointId { get; set; }
        public int ClusterId { get; set; }
    }

    public class AlternateTransferEntity
    {
        public string Mode { get; set; }
        public int MaxRetryToBuffer { get; set; }
        public bool retryToNearStocker { get; set; }
        public AlternateStationEntity[] StationList { get; set; }
        
        public int TimeoutForAlternate { get; set; }
    }

    public class AlternateStationEntity
    {
        public string Id { get; set; }
        public string logicalId { get; set; }
    }

    public class DelayedTransferTimeoutEntity
    {
        public int timeout { get; set; }
        public bool WarningNotify { get; set; }
        public bool TableNotify { get; set; }
    }


    public class TargetBlockEntity
    {
        public string VehicleOnlineName { get; set; }
        public string TargetBlockOnlineName { get; set; }
    }
}