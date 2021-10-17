using System.Linq;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

namespace OMSWeb.Services {
  public class HistoryService
  {
    private readonly HistoryRepository _repo;

    public HistoryService(HistoryRepository historyRepo)
    {
      this._repo = historyRepo;
    }

    public IQueryable<OrderEntity> QueryOrders() {
      return this._repo.QueryOrders();
    }
    public IQueryable<VehicleHistoryEntity> QueryVehicles() {
      return this._repo.QueryVehicles();
    }
    public IQueryable<AlarmHistory> QueryAlarms() {
      return this._repo.QueryAlarms();
    }
    public IQueryable<AlertEntity> QueryAlerts()
    {
      return this._repo.QueryAlerts();
    }
  }
}