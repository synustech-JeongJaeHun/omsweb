using System;

namespace OMSWeb.Models.Entities
{
    public class VehicleEntity : IIntId
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public string MovingState { get; set; }
        public int? DistancePoint { get; set; }
        public int? DistanceTotal { get; set; }
        public int? RuntimeTotal { get; set; }
        public int? Distance { get; set; }
        public int? Runtime { get; set; }
        public string Type { get; set; }
        public string MapDb { get; set; }
        public string MapVersion { get; set; }


        public int? LastPoint { get; set; }
        public int? CurPoint { get; set; }
        public int? NextPoint { get; set; }
        public string CommandPoint { get; set; }
        public string DestPoint { get; set; }
        public DateTime? LastContact { get; set; }
        public string Mode { get; set; }
        public bool CanBePushed { get; set; }
        public bool hostOrder { get; set; }
        public string OrderOrigin { get; set; }
        public string CargoState { get; set; }
        public string CarrierId { get; set; }
        public string CarrierLabel { get; set; }
        public bool IsSensorStopped { get; set; }
        public bool IsZcuBlocked { get; set; }
        public bool IsBlocked { get; set; }
        public string ErrorList { get; set; }
        public string CargoTransferResult { get; set; }
        public bool FireSensor { get; set; }
        public int? OrderId { get; set; }
        public bool RailIn { get; set; }
        public bool IsMaint { get; set; }
        public bool isConnected { get; set; }
        public int? GroupId { get; set; }
        public string User { get; set; }
        public string Note { get; set; }
        
        public int? PauseState { get; set; }
        
        public DateTime? PmTime { get; set; }
        public string PmUser { get; set; }
        public string PmNote { get; set; }
        
        
    }

    public class VehicleHistoryEntity : IIntId
    {
        public int Id { get; set; }
        public string PhysicalId { get; set; }
        public string LogicalId { get; set; }
        public string MovingState { get; set; }
        public int? DistancePoint { get; set; }
        public int? DistanceTotal { get; set; }
        public int? Distance { get; set; }
        public string Type { get; set; }
        public string MapDb { get; set; }
        public string MapVersion { get; set; }


        public int? LastPoint { get; set; }
        public int? CurPoint { get; set; }
        public int? NextPoint { get; set; }
        public string CommandPoint { get; set; }
        public string DestPoint { get; set; }
        public DateTime? LastContact { get; set; }
        public string Mode { get; set; }
        public bool CanBePushed { get; set; }
        public bool hostOrder { get; set; }
        public string OrderOrigin { get; set; }
        public string CargoState { get; set; }
        public string CarrierId { get; set; }
        public string CarrierLabel { get; set; }
        public bool IsSensorStopped { get; set; }
        public bool IsZcuBlocked { get; set; }
        public bool IsBlocked { get; set; }
        public string ErrorList { get; set; }
        public string CargoTransferResult { get; set; }
        public bool FireSensor { get; set; }
        public int? OrderId { get; set; }
        public bool RailIn { get; set; }
        public bool IsMaint { get; set; }
        public bool isConnected { get; set; }
        public int? GroupId { get; set; }
        public string User { get; set; }
        public string Note { get; set; }
        
        public int? PauseState { get; set; }
        
        public DateTime? PmTime { get; set; }
        public string PmUser { get; set; }
        public string PmNote { get; set; }
        public int HistorySourceId { get; set; }
        public DateTime HistoryChangeTime { get; set; }
        public string HistoryChangeType { get; set; }

        // not in vehicle entity
        public string Command { get; set; }
        public int Connection { get; set; }
        public int DistanceRange { get; set; }
        public string RuntimeRange { get; set; }
        public string RuntimeTotal { get; set; }
        public string Runtime { get; set; }
    }

    public class VehicleDioHistoryEntity
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public int Di1 { get; set; }
        public int Di2 { get; set; }
        public int Di3 { get; set; }
        public int Do1 { get; set; }
        public int Do2 { get; set; }
        public int Do3 { get; set; }
        public DateTimeOffset HistoryChangeTime { get; set; }
        public string HistoryChangeType { get; set; }
        public int HistorySourceId { get; set; }
    }

    public class VehicleDio
    {
        public int VehicleId { get; set; }
        public int Di1 { get; set; }
        public int Di2 { get; set; }
        public int Di3 { get; set; }
        public int Do1 { get; set; }
        public int Do2 { get; set; }
        public int Do3 { get; set; }
    }

    public class VehicleDioCategory
    {
        public int Id { get; set; }
        public string InCategory { get; set; }
        public string InName { get; set; }
        public string OutCategory { get; set; }
        public string OutName { get; set; }
    }
}