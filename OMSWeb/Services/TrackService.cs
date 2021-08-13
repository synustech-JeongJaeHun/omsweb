using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;

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
                //Stations = this._trackRepo.LoadStations(),
                Stations = this._trackRepo.LoadStationPositions(),
                //Buffers = this._trackRepo.LoadBuffers(),
                Buffers = this._trackRepo.LoadBufferPositions(),
                Mtls = this._trackRepo.LoadMtls(),
                Clusters = this._trackRepo.LoadClusters(),
                VehiclePaths = this._trackRepo.LoadVehiclePaths(),
                Vehicles = this._trackRepo.LoadVehiclePositions(),
                Groups = this._trackRepo.LoadGroups(),
                Zcus = this._trackRepo.LoadZcus(),
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
                    //return this._trackRepo.LoadStations().ToArray() as dynamic[];
                    return this._trackRepo.LoadStationPositions().ToArray() as dynamic[];
                case CacheKeys.Buffers:
                    //return this._trackRepo.LoadBuffers().ToArray() as dynamic[];
                    return this._trackRepo.LoadBufferPositions().ToArray() as dynamic[];
                case CacheKeys.Mtls:
                    return this._trackRepo.LoadMtls().ToArray() as dynamic[];
                case CacheKeys.Clusters:
                    return this._trackRepo.LoadClusters().ToArray() as dynamic[];
                case CacheKeys.VehiclePaths:
                    return this._trackRepo.LoadVehiclePaths().ToArray() as dynamic[];
                case CacheKeys.Vehicles:
                    return this._trackRepo.LoadVehiclePositions().ToArray() as dynamic[];
                case CacheKeys.Groups:
                    return this._trackRepo.LoadGroups().ToArray() as dynamic[];
                case CacheKeys.Zcus:
                    return this._trackRepo.LoadZcus().ToArray() as dynamic[];
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

        //public IList<Station> GetStations()
        public IList<StationPosition> GetStationPositions()
        {
            return this._trackRepo.LoadStationPositions();
        }
    }
}
