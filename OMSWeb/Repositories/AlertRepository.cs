using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class AlertRepository : DataAccess
  {
    public AlertRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}