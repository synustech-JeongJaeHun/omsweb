using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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


        public TransferHCACK GetTransferHCACK(
            string category,
            string vehicleId,
            string source,
            string srctype,
            string dest,
            string dsttype,
            string carrierId
            )
        {
            TransferHCACK transferHCACK = new TransferHCACK
            {
                HCACK = (int)MCS_HCACK.AlreadyConfirmed,
                CPNAME = string.Empty,
                CPACK = (int)MCS_HCACK.AlreadyConfirmed,
            };

            MCS_HCACK HCACK = MCS_HCACK.AlreadyConfirmed;
            string CPNAME = string.Empty;
            int CPACK = 0;
            int CPNackCount = 0;

            string SourceName = string.Empty;
            string DestName = string.Empty;
            string CarrierID = carrierId;

            if (category == "to")
            {
                source = vehicleId;
                srctype = "vehicle";
            }

            SourceName = GetOnlineName(source, srctype);
            DestName = GetOnlineName(dest, dsttype);

            #region Check Source
            SourceType sourceType = ORDER_VerifySource(SourceName);

            if (sourceType == SourceType.NONE)
            {
                CPNAME = "SOURCEPORT";
                CPACK = (int)MCS_HCACK.NotAbleToExcute;
                CPNackCount++;
            }
            else if (sourceType == SourceType.STATION)
            {
                if (CARRIER_IsInstalled_AnotherPort(SourceName, CarrierID))
                {
                    CPNAME = "CARRIERID";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
            }
            else if (sourceType == SourceType.BUFFER)
            {
                if (!BUFFER_Available(SourceName))
                {
                    HCACK = MCS_HCACK.NotAbleToExcute;
                }
                else if (!BUFFER_Has_a_Carrier(SourceName))
                {
                    CPNAME = "CARRIERID";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (!BUFFER_Has_Valid_Carrier(SourceName, CarrierID))
                {
                    CPNAME = "CARRIERID";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
            }
            else if (sourceType == SourceType.VEHICLE)
            {
                if (!VEHICLE_IsHostOrderEnable(SourceName))
                {
                    HCACK = MCS_HCACK.NotAbleToExcute;
                }
                else if (!VEHICLE_Has_a_Carrier(SourceName))
                {
                    CPNAME = "CARRIERID";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (!VEHICLE_Has_Valid_Carrier(SourceName, CarrierID))
                {
                    CPNAME = "CARRIERID";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
            }
            #endregion

            #region Check Dest

            DestType destType = DestType.NONE;

            if (category != "from") // from은 Dest 체크 없음
            {
                destType = ORDER_VerifyDest(DestName);

                if (destType == DestType.NONE)
                {
                    CPNAME = "DESTPORT";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (destType == DestType.BUFFER)
                {
                    if (ORDER_CheckInterlock_Dest_InOrder(DestName, DestType.BUFFER))
                    {
                        HCACK = MCS_HCACK.NotAbleToExcute;
                    }
                    else if (BUFFER_Has_a_Carrier(DestName))
                    {
                        HCACK = MCS_HCACK.NotAbleToExcute;
                    }
                }
            }
            #endregion

            if (HCACK == MCS_HCACK.AlreadyConfirmed)
            {
                if (CPNackCount == 0)
                {
                    if (ORDER_CheckDuplicatedOrder("", CarrierID))
                    {
                        HCACK = MCS_HCACK.Reject;
                    }
                    else if (ORDER_CheckInterlock(sourceType, SourceName, destType, DestName, category))
                    {
                        HCACK = MCS_HCACK.NotAbleToExcute;
                    }
                    //else if (!CTRL.DB.IsReachablePath(CommandID, (isFromTo ? @"FROMTO" : @"TO"), SourceName, DestName))
                    //{
                    //    HCACK = MCS_HCACK.NotAbleToExcute;
                    //}
                    else
                        HCACK = MCS_HCACK.Confirm;
                }
                else
                {
                    HCACK = MCS_HCACK.ParameterInvalid;
                }
            }

            transferHCACK.HCACK = (int)HCACK;
            transferHCACK.CPNAME = CPNAME;
            transferHCACK.CPACK = CPACK;

            return transferHCACK;
        }

        public string GetOnlineName(string id, string type)
        {
            return this._trackRepo.QueryOnlineName(id, type);
        }

        public SourceType ORDER_VerifySource(string onlineName)
        {
            return this._trackRepo.QuerySourceVerify(onlineName);
        }

        public Boolean CARRIER_IsInstalled_AnotherPort(string onlineName, string carrierId)
        {
            return this._trackRepo.QueryInstallAnotherPort(onlineName, carrierId);
        }

        public Boolean STATION_Available(string onlineName)
        {
            return this._trackRepo.QueryStationAvailable(onlineName);
        }

        public Boolean BUFFER_Available(string onlineName)
        {
            return this._trackRepo.QueryBufferAvailable(onlineName);
        }

        public Boolean BUFFER_Has_a_Carrier(string onlineName)
        {
            return this._trackRepo.QueryHasACarrier(onlineName);
        }

        public Boolean BUFFER_Has_Valid_Carrier(string onlineName, string carrierId)
        {
            return this._trackRepo.QueryHasValidCarrier(onlineName, carrierId);
        }

        public Boolean VEHICLE_IsHostOrderEnable(string onlineName)
        {
            return this._trackRepo.QueryVehicleHostOderEnable(onlineName);
        }

        public Boolean VEHICLE_Has_a_Carrier(string onlineName)
        {
            return this._trackRepo.QueryHasACarrier(onlineName);
        }

        public Boolean VEHICLE_Has_Valid_Carrier(string onlineName, string carrierId)
        {
            return this._trackRepo.QueryHasValidCarrier(onlineName, carrierId);
        }

        public DestType ORDER_VerifyDest(string onlineName)
        {
            return this._trackRepo.QueryDestVerify(onlineName);
        }

        public Boolean ORDER_CheckInterlock_Dest_InOrder(string onlineName, DestType destType)
        {
            string portName = this._trackRepo.QueryPortNameByOnlineName(onlineName, (int)destType);

            return this._trackRepo.QueryInterlockDestInOrder(portName);
        }

        public Boolean ORDER_CheckDuplicatedOrder(string CommandID, string carrierId)
        {
            return this._trackRepo.QueryDuplicatedInOrder(CommandID, carrierId);
        }

        public Boolean ORDER_CheckInterlock(SourceType sourceType, string sourceName, DestType destType, string destName, string category)
        {
            if (category != "from") // from 제외
            {
                if (destType == DestType.STATION && !STATION_Available(destName)) return true;
                if (destType == DestType.BUFFER && !BUFFER_Available(destName)) return true;
            }

            if (sourceType == SourceType.VEHICLE) return false;
            if (sourceType == SourceType.STATION && !STATION_Available(sourceName)) return true;
            if (sourceType == SourceType.BUFFER && !BUFFER_Available(sourceName)) return true;

            return false;
        }
    }
}
