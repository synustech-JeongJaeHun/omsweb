using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class OrderRepository : DataAccess
  {
    public OrderRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}