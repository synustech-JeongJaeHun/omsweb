using System;

namespace OMSWeb.Models.Entities
{
    public class AlarmEntity
    {
        public int Id { get; set; }
        public DateTime Time { get; set; }
        public int ErrorCode { get; set; }
        public int VehicleId { get; set; }
        public string VehicleLogicalId { get; set; }
        public DateTime? TimeResolved { get; set; }
    }

    public class AlarmHistory : AlarmEntity
    {
        public TimeSpan? Age { get; set; }
        public int Level { get; set; }
        public string Description { get; set; }
        public string Action { get; set; }
        public string Note { get; set; }
        public string Cause { get; set; }
        public bool Cleared { get; set; }
        public string Current { get; set; }
        public string PhysicalId { get; set; }
        public DateTime? AckTime { get; set; }
        public string AckBy { get; set; }
        public string State { get; set; }
        public string LocationOnlineName { get; set; }
    }

    public class VehicleError
    {
        public int Id { get; set; }
        public int Level { get; set; }
        public string Description { get; set; }
        public string Cause { get; set; }
        public string Action { get; set; }
    }
}