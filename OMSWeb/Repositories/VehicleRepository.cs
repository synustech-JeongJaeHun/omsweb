using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class VehicleRepository : DataAccess
  {
    public VehicleRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}