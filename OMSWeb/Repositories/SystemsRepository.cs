using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class SystemsRepository : DataAccess
  {
    public SystemsRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}