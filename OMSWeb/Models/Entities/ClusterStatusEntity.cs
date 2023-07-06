using System;

namespace OMSWeb.Models.Entities
{
    public class ClusterStatusEntity
    {
        public int Id { get; set; }
        public int server_id { get; set; }
        public string logicalId { get; set; }
        public string status { get; set; }
        public string voltage { get; set; }
        public string current_igbt { get; set; }
        public string current_track { get; set; }
        public string frequency { get; set; }
        public string temp_radiator { get; set; }
        public string temp_internal { get; set; }
        public string sync { get; set; }
        public string backup_id { get; set; }
        public string error_code { get; set; }
        public string voltage_rs { get; set; }
        public string voltage_st { get; set; }
        public string voltage_tr { get; set; }
        public string current_r { get; set; }
        public string current_s { get; set; }
        public string current_t { get; set; }
        public string total_kw { get; set; }
        public string wh { get; set; }
        public string speedRatio { get; set; }
    }
}