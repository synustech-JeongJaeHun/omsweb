namespace OMSWeb.Models
{
    public class AppSettings
    {
        public string JwtSecret { get; set; }
        public uint JwtLifeMinutes { get; set; }
        public string SID { get; set; }
        public string SyncId { get; set; }
        public bool RefreshPopup { get; set; }
        
        public bool RetainLogon { get; set; }
        public string Version { get; set; }
        public bool KpiEnabled { get; set; }
        public bool BufferEnabled { get; set; }
        public bool i18nEnabled { get; set; }
        public bool ZCUDetail { get; set; }
        public string TitleText { get; set; }
        public bool FireSensor { get; set; }
        public bool OnOffLine { get; set; }
        
        public bool ActionScan { get; set; }
        
        public bool NextLine { get; set; }
        public ClientSettings Client { get; set; }

        public DefaultColorSettings DefaultColor { get; set; }

        public ManualTransferFilters ManualTransferFilters { get; set; }  

        public NodeMargins NodeMargins {get;set;}
        public VehicleOrderIdContents VehicleOrderIdContents {get;set;} 
        
        public string VHLAlias { get; set; }
            
        public bool CustomSetting { get; set; }
        
        public bool IsSilentSync { get; set; }
        
        public bool Backdrop { get; set; }
        
        public bool Reference { get; set; }
        public bool HoldEnabled { get; set; }

        public FireStationFilters FireStationFilters { get; set; }
        
        public bool IndicatorFireEmergency { get; set; }
        public bool DisableHWZCU { get; set; }
        public bool IsForceMTLIn { get; set; }
        
        public bool DisableBufferNack { get; set; }
        
        public string[] WarningMessageType { get; set; }
    }
}