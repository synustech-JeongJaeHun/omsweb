namespace OMSWeb.Models
{
    public class ClientSettings
    {
        public string SID { get; set; }
        public string SyncId { get; set; }
        public bool RefreshPopup { get; set; }
        public bool RetainLogon { get; set; }
        public bool AllowPublicMonitor { get; set; }
        public bool KpiEnabled { get; set; }
        public bool BufferEnabled { get; set; }
        public bool i18nEnabled { get; set; }
        public bool OnOffLine { get; set; }
        public bool ZCUDetail { get; set; }
        public bool FireSensor { get; set; }
        public string Version { get; set; }
        
        public string TitleText { get; set; }
        
        public bool ActionScan { get; set; }
        
        public bool NextLine { get; set; }
        
        public string VHLAlias { get; set; }
        
        public bool CustomSetting { get; set; }
        
        public bool IsSilentSync { get; set; }
        
        public bool Backdrop { get; set; }
        
        public FireStationFilters FireStationFilters { get; set; }
        
    }
}