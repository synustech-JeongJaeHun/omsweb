using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class OrderService
  {
    private readonly OrderRepository _repo;

    public OrderService(OrderRepository repo)
    {
      _repo = repo;
    }

    public IQueryable<OrderState> QueryStates() {
      return _repo.QueryStates();
    }
  }
}