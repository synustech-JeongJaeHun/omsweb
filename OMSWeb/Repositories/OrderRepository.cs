using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
  public class OrderRepository : DataAccess
  {
    public OrderRepository(IConfiguration configuration) : base(configuration)
    {
    }

  }
}