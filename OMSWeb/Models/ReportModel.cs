using System;
using System.ComponentModel.DataAnnotations.Schema;
using OMSWeb.Models.Entities;

namespace OMSWeb.Models
{
    public class ReportTranNormal
    {
        public int? DurationTotal { get; set; }
        public int? DurationDropoff { get; set; }
        public int? DurationPickup { get; set; }
        public int? DurationUnassigned { get; set; }
        public int? DurationLoad { get; set; }
        public int? DurationUnload { get; set; }
        public int? DurationMove { get; set; }
    }

    public class ReportTranAbnormal
    {
        public string LocationPickup { get; set; }
        public string LocationDropoff { get; set; }
        public string LocationMove { get; set; }
    }

    public class ReportAlarms
    {

    }
}