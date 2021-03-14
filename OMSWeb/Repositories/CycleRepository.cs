using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class CycleRepository : DataAccess
  {
    public CycleRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}