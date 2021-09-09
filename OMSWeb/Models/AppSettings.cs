namespace OMSWeb.Models
{
  public class AppSettings
  {
    public string JwtSecret { get; set; }
    public uint JwtLifeMinutes { get; set; }
    
    public string SID { get; set; }
    public string Version { get; set; }
    public bool KpiEnabled { get; set; }
    public string LogBaseDir { get; set; }
    public string LogTempZipDir { get; set; }
    public string LogTempCopyDir { get; set; }

    public ClientSettings Client { get; set; }

  }
}