using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class MetricsRepository : DataAccess
  {
    public MetricsRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}