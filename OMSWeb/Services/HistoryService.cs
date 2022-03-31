using System;
using System.Linq;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

#nullable enable

namespace OMSWeb.Services
{
    public class HistoryService
    {
        private readonly HistoryRepository _repo;

        public HistoryService(HistoryRepository historyRepo)
        {
            this._repo = historyRepo;
        }

        public IQueryable<OrderEntity> QueryOrders()
        {
            return this._repo.QueryOrders();
        }
        public IQueryable<VehicleHistoryEntity> QueryVehicles()
        {
            return this._repo.QueryVehicles();
        }
        public IQueryable<AlarmHistory> QueryAlarms()
        {
            return this._repo.QueryAlarms();
        }
        public IQueryable<AlertEntity> QueryAlerts()
        {
            return this._repo.QueryAlerts();
        }

        public IQueryable<VehicleDioHistoryEntity> QueryVehicleDios(int vehicleId, DateTimeOffset from, DateTimeOffset to)
        {
            return this._repo.QueryVehicleDios(vehicleId, from, to);
        }

        public VehicleDio? QueryRecentDioBefore(int vehicleId, DateTimeOffset before)
        {
            var vehicleDios = this._repo.QueryRecentDioBefore(vehicleId, before);

            if (vehicleDios.AsEnumerable().Count() == 1)
                return vehicleDios.First();
            else
                return null;
        }
    }
}