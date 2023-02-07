namespace OMSWeb.Models
{
    public class ClientSettings
    {
        public string SID { get; set; }
        public bool AllowPublicMonitor { get; set; }
        public bool KpiEnabled { get; set; }
        public bool BufferEnabled { get; set; }
        public bool i18nEnabled { get; set; }
        
        public bool OnOffLine { get; set; }
        public string Version { get; set; }
    }
}