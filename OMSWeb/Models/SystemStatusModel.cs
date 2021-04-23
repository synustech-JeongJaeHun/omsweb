namespace OMSWeb.Models
{
  public class SystemStatusModel
  {
    public HostSessionStatusEnums? SessionStatus { get; set; }
    public HostModeEnums? HostMode { get; set; }
    public TscModeEnums? TscMode { get; set; }
    public bool? AiMode { get; set; }
  }
}