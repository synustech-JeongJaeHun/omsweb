using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class VehicleRepository : DataAccess
    {
        public VehicleRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<VehicleDio> QueryRecentDio(int vehicleId)
        {
            var sql = @"
      SELECT 
        DIO.vehicle_id, 
        DIO.di_1, DIO.di_2, DIO.di_3, DIO.do_1, DIO.do_2, DIO.do_3
      FROM vehicle_dio AS DIO
      WHERE DIO.vehicle_id = @vehicle_id
      ";

            IQueryable<VehicleDio> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDio>(sql, new
                {
                    vehicle_id = vehicleId
                }).AsQueryable();
            }
            return result;
        }

        public IQueryable<VehicleDioCategory> QueryDioCategories()
        {
            var sql = @"
      SELECT CAT.id, CAT.in_category, CAT.in_name, CAT.out_category, CAT.out_name
      FROM vehicle_dio_category AS CAT
      ";

            IQueryable<VehicleDioCategory> result;
            using (var conn = ConnectTrack())
            {
                result = conn.Query<VehicleDioCategory>(sql).AsQueryable();
            }
            return result;
        }
    }
}
