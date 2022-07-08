
namespace OMSWeb.Models
{
  public class ManualTransferFilters
  {
    public bool SourceFilterEnabled { get; set; }
    public string[] SourceWords { get; set; }

    public bool DestinationFilterEnabled { get; set; }
    public string[] DestinationWords { get; set; }
  }
}