using System;
using System.Linq;
using DevExtreme.AspNet.Mvc;
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

        public int QueryOrdersCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryOrdersCount(from, to);
        }

        public IQueryable<OrderEntity> QueryOrders(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryOrders(from, to, skip, take);
        }

        public int QueryVehiclesCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryVehiclesCount(from, to);
        }

        public IQueryable<VehicleHistoryEntity> QueryVehicles(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryVehicles(from, to, skip, take);
        }

        public int QueryAlarmsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryAlarmsCount(from, to);
        }

        public IQueryable<AlarmHistory> QueryAlarms(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryAlarms(from, to, skip, take);
        }

        public int QueryAlertsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
             return this._repo.QueryAlertsCount(from, to);
        }

        public IQueryable<AlertEntity> QueryAlerts(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
             return this._repo.QueryAlerts(from, to, skip, take);
        }

        public int QueryNacksCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryNacksCount(from, to);
        }

        public IQueryable<NackHistoryEntity> QueryNacks(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryNacks(from, to, skip, take);
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

        public (DateTimeOffset from, DateTimeOffset to, int skip, int take) GetLoadFilters(DataSourceLoadOptions loadOptions)
        {
            DateTimeOffset from = new DateTimeOffset();
            DateTimeOffset to = new DateTimeOffset();
            int skip = 0;
            int take = 0;

            try
            {
                if (loadOptions.Filter?.Count == 3)
                { 
                    string s0 = loadOptions.Filter[0].TryString();
                    string s2 = loadOptions.Filter[2].TryString();

                    if (string.IsNullOrEmpty(s0) == false)
                        s0 = s0.Replace("\"", "").Replace("\r\n", "").Replace("[", "").Replace("]", "").Trim();

                    if (string.IsNullOrEmpty(s2) == false)
                        s2 = s2.Replace("\"", "").Replace("\r\n", "").Replace("[", "").Replace("]", "").Trim();

                    string[] ar0 = s0.Split(',');
                    string[] ar2 = s2.Split(',');

                    if (ar0.Length == 3) from = DateTimeOffset.Parse(ar0[2].Trim());
                    if (ar2.Length == 3) to = DateTimeOffset.Parse(ar2[2].Trim());

                    skip = loadOptions.Skip;
                    take = loadOptions.Take;
                }
            }
            catch (Exception e)
            {
            }

            return (from, to, skip, take);
        }
    }
}