using System;

namespace OMSWeb.Models.Entities
{
    public class CpsEntity
    {
        public string cps_server_id { get; set; }
        public string cps_converter_id { get; set; }
        public string cps_status { get; set; }
        public string cps_voltage { get; set; }
        public string cps_current_igbt { get; set; }
        public string cps_current_track { get; set; }
        public string cps_frequency { get; set; }
        public string cps_temp_radiator { get; set; }
        public string cps_temp_internal { get; set; }
        public string cps_sync { get; set; }
        public string cps_backup_id { get; set; }
        public string cps_error_code { get; set; }
        public string cps_voltage_rs { get; set; }
        public string cps_voltage_st { get; set; }
        public string cps_voltage_tr { get; set; }
        public string cps_current_r { get; set; }
        public string cps_current_s { get; set; }
        public string cps_current_t { get; set; }
        public string cps_total_kw { get; set; }
        public string cps_wh { get; set; }
    }
}