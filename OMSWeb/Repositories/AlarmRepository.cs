using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class AlarmRepository : DataAccess
  {
    public AlarmRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}