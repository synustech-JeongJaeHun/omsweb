using System;
using System.ComponentModel.DataAnnotations.Schema;
using OMSWeb.Models.Entities;

namespace OMSWeb.Models
{
    public class OrderState : OrderEntity
    {
        public int? DurationTotal { get; set; }
        public int? DurationDropoff { get; set; }
        public int? DurationPickup { get; set; }
        public int? DurationUnassigned { get; set; }
        public int? DurationLoad { get; set; }
        public int? DurationUnload { get; set; }
        public int? DurationMove { get; set; }
    }

    public class VehicleState : VehicleEntity
    {
        public string LocationPickup { get; set; }
        public string LocationDropoff { get; set; }
        public string LocationMove { get; set; }
    }

    public class StationState : StationEntity
    {
    }

    public class BufferState : BufferEntity
    {
    }

    public class ZcuState : ZcuStatusEntity
    {

    }

    public class ClusterState : ClusterStatusEntity
    {

    }

    public class DioState : DioEntity
    {
    }
}