using System;
using System.Linq;
using DevExtreme.AspNet.Mvc;
using OMSWeb.Logger;
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

        public IQueryable<OrderEntity> QueryOrders(DataSourceLoadOptions loadOptions)
        {
            (DateTimeOffset from, DateTimeOffset to) = GetTimeFilters(loadOptions);

            return this._repo.QueryOrders(from, to);
        }
        public IQueryable<VehicleHistoryEntity> QueryVehicles(DataSourceLoadOptions loadOptions)
        {
            (DateTimeOffset from, DateTimeOffset to) = GetTimeFilters(loadOptions);

            return this._repo.QueryVehicles(from, to);
        }
        public IQueryable<AlarmHistory> QueryAlarms(DataSourceLoadOptions loadOptions)
        {
            (DateTimeOffset from, DateTimeOffset to) = GetTimeFilters(loadOptions);

            return this._repo.QueryAlarms(from, to);
        }
        public IQueryable<AlertEntity> QueryAlerts(DataSourceLoadOptions loadOptions)
        {
            (DateTimeOffset from, DateTimeOffset to) = GetTimeFilters(loadOptions);

            return this._repo.QueryAlerts(from, to);
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

        private (DateTimeOffset from, DateTimeOffset to) GetTimeFilters(DataSourceLoadOptions loadOptions)
        {
            DateTimeOffset from = new DateTimeOffset();
            DateTimeOffset to = new DateTimeOffset();

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
                }
            }
            catch (Exception e)
            {
            }

            return (from, to);
        }
    }
}