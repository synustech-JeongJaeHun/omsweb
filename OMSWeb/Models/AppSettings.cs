namespace OMSWeb.Models
{
  public class AppSettings
  {
    public string JwtSecret { get; set; }
    public uint JwtLifeMinutes { get; set; }

    public ClientSettings Client { get; set; }

  }
}