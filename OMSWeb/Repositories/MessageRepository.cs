using Microsoft.Extensions.Configuration;

namespace OMSWeb.Repositories
{
  public class MessageRepository : DataAccess
  {
    public MessageRepository(IConfiguration configuration) : base(configuration)
    {
    }
  }
}