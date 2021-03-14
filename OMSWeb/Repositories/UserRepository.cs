using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class UserRepository : DataAccess
  {
    public UserRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}