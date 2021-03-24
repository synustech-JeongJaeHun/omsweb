using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services {
  public class StatusService
  {
    private readonly StatusRepository _repo;

    public StatusService(StatusRepository repo)
    {
      _repo = repo;
    }

    public IQueryable<OrderState> QueryOrderStates() {
      return _repo.QueryOrderStates();
    }
    public IQueryable<VehicleState> QueryVehicleStates() {
      return _repo.QueryVehicleStates();
    }

  }
}