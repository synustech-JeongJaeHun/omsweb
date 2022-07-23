using System;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
    public class TransferService
    {
        private readonly TransferRepository _transferRepo;

        public TransferService(TransferRepository _transferRepo)
        {
            this._transferRepo = _transferRepo;
        }


        public TransferHCACK CheckTransfer(
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



        public TransferHCACK CheckCarrierChange(
            string rcmd,
            string carrierLoc,
            string loctype,
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


            if (string.IsNullOrEmpty(rcmd))
            {
                HCACK = MCS_HCACK.NotAbleToExcute;
            }
            else if (rcmd.Equals("install", StringComparison.OrdinalIgnoreCase))
            {
                #region Check CarrierID
                if (CARRIER_IsInstalled_AnotherPort(carrierLoc, carrierId))  // CarrierID 
                {
                    CPNAME = "CARRIERID";    // CARRIERID
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                #endregion

                #region Check CarrierLoc
                SourceType sourceType = ORDER_VerifySource(carrierLoc);

                if (sourceType == SourceType.NONE)
                {
                    CPNAME = "CARRIERLOC";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (sourceType == SourceType.VEHICLE)
                {
                    if (!VEHICLE_Has_a_Carrier(carrierLoc))
                    {
                        CPNAME = "CARRIERLOC";    // CARRIERLOC
                        CPACK = (int)MCS_HCACK.NotAbleToExcute;
                        CPNackCount++;
                    }
                }
                #endregion


                if (HCACK == MCS_HCACK.AlreadyConfirmed)
                {
                    if (CPNackCount == 0)
                    {
                        if (sourceType == SourceType.STATION)
                            HCACK = MCS_HCACK.NotAbleToExcute;
                        else if (sourceType == SourceType.VEHICLE)
                        {
                            if (!VEHICLE_IsRailIn(carrierLoc) ||
                                !VEHICLE_IsManualMode(carrierLoc))
                            {
                                HCACK = MCS_HCACK.NotAbleToExcute;
                            }
                            else if (ORDER_CheckInterlock_Port_InOrder(carrierLoc, SourceType.VEHICLE) ||
                                     ORDER_CheckInterlock_CarrierID_InOrder(carrierId))
                            {
                                HCACK = MCS_HCACK.Reject;
                            }
                            else
                                HCACK = MCS_HCACK.Confirm;
                        }
                        else if (sourceType == SourceType.BUFFER)
                        {
                            if (!BUFFER_Available(carrierLoc))
                            {
                                HCACK = MCS_HCACK.NotAbleToExcute;
                            }
                            else if (CARRIERLOC_Has_a_Carrier(carrierLoc) ||
                                     ORDER_CheckInterlock_Port_InOrder(carrierLoc, SourceType.BUFFER) ||
                                     ORDER_CheckInterlock_CarrierID_InOrder(carrierId))
                            {
                                HCACK = MCS_HCACK.Reject;
                            }
                            else
                                HCACK = MCS_HCACK.Confirm;
                        }
                        else
                            HCACK = MCS_HCACK.NotAbleToExcute;
                    }
                    else
                        HCACK = MCS_HCACK.ParameterInvalid;
                }
                else
                    HCACK = MCS_HCACK.NotAbleToExcute;
            }
            else if (rcmd.Equals("remove", StringComparison.OrdinalIgnoreCase))
            {
                #region Check CarrierID
                if (CARRIER_IsInstalled_AnotherPort(carrierLoc, carrierId))  // CarrierID 
                {
                    CPNAME = "CARRIERID";    // CARRIERID
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                #endregion

                #region Check CarrierLoc
                SourceType sourceType = ORDER_VerifySource(carrierLoc);

                if (sourceType == SourceType.NONE)
                {
                    CPNAME = "CARRIERLOC";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (sourceType == SourceType.STATION)
                {
                    CPNAME = "CARRIERLOC";
                    CPACK = (int)MCS_HCACK.NotAbleToExcute;
                    CPNackCount++;
                }
                else if (sourceType == SourceType.VEHICLE)
                {
                    if (!VEHICLE_Has_Valid_Carrier(carrierLoc, carrierId))
                    {
                        CPNAME = "CARRIERID";
                        CPACK = (int)MCS_HCACK.NotAbleToExcute;
                        CPNackCount++;
                    }
                }
                else if (sourceType == SourceType.BUFFER)
                {
                    if (!CARRIERLOC_Has_Valid_Carrier(carrierLoc, carrierId))
                    {
                        CPNAME = "CARRIERID";
                        CPACK = (int)MCS_HCACK.NotAbleToExcute;
                        CPNackCount++;
                    }
                }
                #endregion


                if (CPNackCount == 0)
                {
                    if (sourceType == SourceType.VEHICLE)
                    {
                        if (!VEHICLE_IsRailIn(carrierLoc) ||
                            !VEHICLE_IsManualMode(carrierLoc))
                        {
                            HCACK = MCS_HCACK.NotAbleToExcute;
                        }
                        else if (ORDER_CheckInterlock_Port_InOrder(carrierLoc, SourceType.VEHICLE) ||
                                 ORDER_CheckInterlock_CarrierID_InOrder(carrierId))
                        {
                            HCACK = MCS_HCACK.Reject;
                        }
                        else
                            HCACK = MCS_HCACK.Confirm;
                    }
                    else if (sourceType == SourceType.BUFFER)
                    {
                        if (!BUFFER_Available(carrierLoc))
                        {
                            HCACK = MCS_HCACK.NotAbleToExcute;
                        }
                        else if (ORDER_CheckInterlock_Port_InOrder(carrierLoc, SourceType.BUFFER) ||
                                 ORDER_CheckInterlock_CarrierID_InOrder(carrierId))
                        {
                            HCACK = MCS_HCACK.Reject;
                        }
                        else
                            HCACK = MCS_HCACK.Confirm;
                    }
                    else
                        HCACK = MCS_HCACK.NotAbleToExcute;
                }
                else
                    HCACK = MCS_HCACK.ParameterInvalid;
            }
            else
                HCACK = MCS_HCACK.NotAbleToExcute;
        
 
            transferHCACK.HCACK = (int)HCACK;
            transferHCACK.CPNAME = CPNAME;
            transferHCACK.CPACK = CPACK;

            return transferHCACK;
        }



        public string GetOnlineName(string id, string type)
        {
            return this._transferRepo.QueryOnlineName(id, type);
        }

        public Boolean STATION_Available(string onlineName)
        {
            return this._transferRepo.QueryStationAvailable(onlineName);
        }

        public Boolean BUFFER_Available(string onlineName)
        {
            return this._transferRepo.QueryBufferAvailable(onlineName);
        }

        public Boolean BUFFER_Has_a_Carrier(string onlineName)
        {
            return this._transferRepo.QueryHasACarrier(onlineName);
        }

        public Boolean BUFFER_Has_Valid_Carrier(string onlineName, string carrierId)
        {
            return this._transferRepo.QueryHasValidCarrier(onlineName, carrierId);
        }

        public Boolean VEHICLE_IsRailIn(string onlineName)
        {
            return this._transferRepo.QueryVehicleRailIn(onlineName);
        }

        public Boolean VEHICLE_IsManualMode(string onlineName)
        {
            return this._transferRepo.QueryVehicleManualMode(onlineName);
        }


        public Boolean VEHICLE_IsHostOrderEnable(string onlineName)
        {
            return this._transferRepo.QueryVehicleHostOderEnable(onlineName);
        }

        public Boolean VEHICLE_Has_a_Carrier(string onlineName)
        {
            return this._transferRepo.QueryHasACarrier(onlineName);
        }

        public Boolean VEHICLE_Has_Valid_Carrier(string onlineName, string carrierId)
        {
            return this._transferRepo.QueryHasValidCarrier(onlineName, carrierId);
        }

        public Boolean CARRIER_IsInstalled_AnotherPort(string onlineName, string carrierId)
        {
            return this._transferRepo.QueryInstallAnotherPort(onlineName, carrierId);
        }

        public Boolean CARRIERLOC_Has_a_Carrier(string onlineName)
        {
            return this._transferRepo.QueryHasACarrier(onlineName);
        }

        public Boolean CARRIERLOC_Has_Valid_Carrier(string onlineName, string carrierId)
        {
            return this._transferRepo.QueryHasValidCarrier(onlineName, carrierId);
        }

        public DestType ORDER_VerifyDest(string onlineName)
        {
            return this._transferRepo.QueryDestVerify(onlineName);
        }

        public SourceType ORDER_VerifySource(string onlineName)
        {
            return this._transferRepo.QuerySourceVerify(onlineName);
        }

        public Boolean ORDER_CheckInterlock_Port_InOrder(string onlineName, SourceType srctype)
        {
            string portName = this._transferRepo.QueryPortNameByOnlineName(onlineName, (int)srctype);

            return this._transferRepo.QueryInterlockPortInOrder(portName);
        }

        public Boolean ORDER_CheckInterlock_CarrierID_InOrder(string carrierId)
        {
            return this._transferRepo.QueryInterlockCarrierIDInOrder(carrierId);
        }

        public Boolean ORDER_CheckInterlock_Dest_InOrder(string onlineName, DestType destType)
        {
            string portName = this._transferRepo.QueryPortNameByOnlineName(onlineName, (int)destType);

            return this._transferRepo.QueryInterlockDestInOrder(portName);
        }

        public Boolean ORDER_CheckDuplicatedOrder(string CommandID, string carrierId)
        {
            return this._transferRepo.QueryDuplicatedInOrder(CommandID, carrierId);
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
