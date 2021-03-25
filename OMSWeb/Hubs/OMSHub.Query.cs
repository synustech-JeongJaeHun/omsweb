using OMSWeb.Models;

namespace OMSWeb.Hubs
{
  public partial class OMSHub
  {
    public AlarmSummary GetAlarmSummary()
    {
      return new AlarmSummary
      {
        AlarmCount = 20,
        AlertCount = 34,
      };
    }

  }
}