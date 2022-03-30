using System;
using System.Linq;
using OMSWeb.Models;
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

        public VehicleState? QueryVehicleStatus(int vehicleId)
        {
            var vehicleStatus = this._repo.QueryVehicleStatus(vehicleId);

            if (vehicleStatus.AsEnumerable().Count() == 1)
                return vehicleStatus.First();
            else
                return null;
        }
    }
}