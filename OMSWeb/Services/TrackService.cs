using System.Collections.Generic;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;
using Buffer = OMSWeb.Models.Tracks.Buffer;

namespace OMSWeb.Services
{
    public class TrackService
    {
        private readonly TrackRepository _trackRepo;
        public TrackService(TrackRepository trackRepo)
        {
            this._trackRepo = trackRepo;
        }

        public MapData GetMapData()
        {
            var map = new MapData
            {
                Size = this._trackRepo.GetDimension(),
                Points = this._trackRepo.LoadPoints(),
                Segments = this._trackRepo.LoadSegments(),
                SegmentDisabled = this._trackRepo.LoadDisabledSegments(),
                Stations = this._trackRepo.LoadStations(),
                Buffers = this._trackRepo.LoadBuffers(),
                Mtls = this._trackRepo.LoadMtls(),
                Clusters = this._trackRepo.LoadClusters(),
                ClusterStates = this._trackRepo.LoadClusterStates(),
                VehicleDio = this._trackRepo.LoadVehicleDio(),
                VehiclePaths = this._trackRepo.LoadVehiclePaths(),
                Vehicles = this._trackRepo.LoadVehiclePositions(),
                Groups = this._trackRepo.LoadGroups(),
                Zcus = this._trackRepo.LoadZcus(),
                ZcuStatus = this._trackRepo.LoadZcuStatus(),
                FireShutters = this._trackRepo.LoadFireShutters(),
                FireShutterStatus = this._trackRepo.LoadFireShutterStatus(),
            };
            return map;
        }

        public dynamic[] GetMapItem(CacheKeys key)
        {
            switch (key)
            {
                case CacheKeys.Points:
                    return this._trackRepo.LoadPoints().ToArray() as dynamic[];
                case CacheKeys.Segments:
                    return this._trackRepo.LoadSegments().ToArray() as dynamic[];
                case CacheKeys.SegmentDisabled:
                    return this._trackRepo.LoadDisabledSegments().ToArray() as dynamic[];
                case CacheKeys.Stations:
                    return this._trackRepo.LoadStations().ToArray() as dynamic[];
                case CacheKeys.Buffers:
                    return this._trackRepo.LoadBuffers().ToArray() as dynamic[];
                case CacheKeys.Mtls:
                    return this._trackRepo.LoadMtls().ToArray() as dynamic[];
                case CacheKeys.Clusters:
                    return this._trackRepo.LoadClusters().ToArray() as dynamic[];
                case CacheKeys.ClusterStatus:
                    return this._trackRepo.LoadClusterStates().ToArray() as dynamic[];
                case CacheKeys.VehicleDio:
                    return this._trackRepo.LoadVehicleDio().ToArray() as dynamic[];
                case CacheKeys.VehiclePaths:
                    return this._trackRepo.LoadVehiclePaths().ToArray() as dynamic[];
                case CacheKeys.Vehicles:
                    return this._trackRepo.LoadVehiclePositions().ToArray() as dynamic[];
                case CacheKeys.Groups:
                    return this._trackRepo.LoadGroups().ToArray() as dynamic[];
                case CacheKeys.Zcus:
                    return this._trackRepo.LoadZcus().ToArray() as dynamic[];
                case CacheKeys.ZcuStatus:
                    return this._trackRepo.LoadZcuStatus().ToArray() as dynamic[];
                case CacheKeys.FireShutters:
                    return this._trackRepo.LoadFireShutters().ToArray() as dynamic[];
                case CacheKeys.FireShutterStatus:
                    return this._trackRepo.LoadFireShutterStatus().ToArray() as dynamic[];
                default:
                    return null;
            }
        }

        public List<VehiclePosition> GetVehicles(bool reloadIfEmpty = false)
        {
            return this._trackRepo.LoadVehiclePositions(reloadIfEmpty);
        }

        public List<VehiclePath> GetVehiclePaths()
        {
            return this._trackRepo.LoadVehiclePaths();
        }

        public List<NodeInfo> GetIdList(string type)
        {
            dynamic[] targetList;
            switch (type)
            {
                case "VEHICLE":
                    targetList = this.GetMapItem(CacheKeys.Vehicles);
                    break;
                case "POINT":
                    targetList = this.GetMapItem(CacheKeys.Points);
                    break;
                case "STATION":
                    targetList = this.GetMapItem(CacheKeys.Stations);
                    break;
                case "BUFFER":
                    targetList = this.GetMapItem(CacheKeys.Buffers);
                    break;
                case "ZCU":
                    targetList = this.GetMapItem(CacheKeys.Zcus);
                    break;
                case "FireShutter":
                    targetList = this.GetMapItem(CacheKeys.FireShutters);
                    break;
                default:
                    targetList = new dynamic[] { };
                    break;
            }
            return targetList.Select(x => new NodeInfo
            {
                Id = x.Id,
                LogicalId = x.LogicalId,
                PhysicalId = x.PhysicalId,
            }).ToList();
        }

        public string GetCarrierId(string carrierLocation)
        {
            return this._trackRepo.QueryCarrierId(carrierLocation);
        }

        public CarrierInfo GetCarrierInfo(string carrierLocation)
        {
            var carrierInfos = this._trackRepo.QueryCarrierInfo(carrierLocation);

            if (carrierInfos.AsEnumerable().Count() == 1)
                return carrierInfos.First();
            else
                return null;
        }


        public CarrierLocation GetCarrierLoc(string carrierId)
        {
            var carrierLocs = this._trackRepo.QueryCarrierLoc(carrierId);

            if (carrierLocs.AsEnumerable().Count() == 1)
                return carrierLocs.First();
            else
                return null;
        }

        public CarrierQuery GetCarrierQuery(string carrierLoc, string carrierId)
        {
            CarrierInfo carrierInfos = GetCarrierInfo(carrierLoc);
            CarrierLocation carrierLocs = GetCarrierLoc(carrierId);

            return new CarrierQuery
            {
                CarrierId = carrierInfos != null ? carrierInfos.CarrierId : string.Empty,
                CarrierLoc = carrierLocs != null ? carrierLocs.CarrierLoc : string.Empty,
            };
        }

        public QueryResult CheckPointHomeInterlock(int pointId)
        {
            QueryResult queryResult = new QueryResult
            {
                Retcode = (int)RET_CODE.Failed,
                Message = string.Empty,
            };

            bool res = this._trackRepo.IsBranchPoint(pointId);

            queryResult.Retcode = res ? 1 : 0;

            return queryResult;
        }

        public IList<LocationGroup> GetGroups()
        {
            return this._trackRepo.LoadGroups();
        }

        public IList<Cluster> GetClusters()
        {
            return this._trackRepo.LoadClusters();
        }

        public IList<SegmentWithPart> GetSegments()
        {
            return this._trackRepo.LoadSegments();
        }

        public IList<Point> GetPoints()
        {
            return this._trackRepo.LoadPoints();
        }

        public IList<Station> GetStations()
        {
            return this._trackRepo.LoadStations();
        }

        public Buffer GetBufferById(int id)
        {
            return this._trackRepo.LoadBufferById(id);
        }
    }
}
