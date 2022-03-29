using System;
using System.Linq;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

#nullable enable

namespace OMSWeb.Services
{
    public class VehicleService
    {
        private readonly VehicleRepository _repo;

        public VehicleService(VehicleRepository vehicleRepo)
        {
            this._repo = vehicleRepo;
        }

        public VehicleDio? QueryRecentDio(int vehicleId)
        {
            var vehicleDios = this._repo.QueryRecentDio(vehicleId);

            if (vehicleDios.AsEnumerable().Count() == 1)
                return vehicleDios.First();
            else
                return null;
        }

        public IQueryable<VehicleDioCategory> QueryDioCategory()
        {
            return this._repo.QueryDioCategories();
        }
    }
}