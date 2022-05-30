namespace OMSWeb.Models
{
    public class CommandMessageDto
    {
        public string Type { get; set; }
        public string Action { get; set; }

        public int[] VehicleIds { get; set; }
        public int[] VehicleIds_Removed { get; set; }
        public string VehicleId { get; set; }
        public string Direction { get; set; }
        public int AlarmCode { get; set; }
        public int WarningId { get; set; }
        public int[] WarningIds { get; set; }
        public string WarningAckBy { get; set; }
        public int[] ZcuIds { get; set; }
        public string ZcuId { get; set; }
        public string ZcuUsingType { get; set; }
        public int? OrderId { get; set; }
        public int? SegmentId { get; set; }
        public bool hostOrder { get; set; }
        public string OrderOrigin { get; set; }
        public string LocationPickupType { get; set; }
        public string LocationDropoffType { get; set; }
        public string LocationMoveType { get; set; }
        public string LocationPickup { get; set; }
        public string LocationDropoff { get; set; }
        public string LocationMove { get; set; }
        public int? Priority { get; set; }
        public string CarrierLabel { get; set; }
        public bool? CanBePushed { get; set; }
        public string AcceptManualCommands { get; set; }
        public string State { get; set; }
        public string Mode { get; set; }
        public int GroupId { get; set; }
        public int[] StationIds { get; set; }
        public int[] StationIds_Removed { get; set; }
        public int[] BufferIds { get; set; }
        public int[] BufferIds_Removed { get; set; }
        public int[] SegmentIds { get; set; }
        public int? SpeedRatio { get; set; }
        public string LogicalId { get; set; }
        public string[] LogicalIds { get; set; }
        public int[] SpeedRatios { get; set; }
        public int? ClusterId { get; set; }
        public int? MaxVehicles { get; set; }
        public int[] HomeIds { get; set; }
        public int[] HomeIds_Removed { get; set; }
        public int? HomeId { get; set; }
        public int? PointId { get; set; }
        public int? StationId { get; set; }
        public int? BufferId { get; set; }
        public int? MtlId { get; set; }
        public int? Unused { get; set; }
        public string map_db_name { get; set; }
        public string map_source_file { get; set; }
    }
}
