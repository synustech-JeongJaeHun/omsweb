using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class PlaybackRepository : DataAccess
  {
    public PlaybackRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}