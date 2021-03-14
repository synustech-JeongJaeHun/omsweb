using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class HistoryRepository : DataAccess
  {
    public HistoryRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}