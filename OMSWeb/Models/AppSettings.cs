namespace OMSWeb.Models
{
    public class AppSettings
    {
        public string JwtSecret { get; set; }
        public uint JwtLifeMinutes { get; set; }

        public string SID { get; set; }
        public string Version { get; set; }
        public bool KpiEnabled { get; set; }
        public bool BufferEnabled { get; set; }
        public bool i18nEnabled { get; set; }
        
        public bool ResetSWZCU { get; set; }
        public bool ZCUDetail { get; set; }
        

        public ClientSettings Client { get; set; }

        public DefaultColorSettings DefaultColor { get; set; }

        public ManualTransferFilters ManualTransferFilters { get; set; }  

        public NodeMargins NodeMargins {get;set;}
        public VehicleOrderIdContents VehicleOrderIdContents {get;set;} 
    }
}