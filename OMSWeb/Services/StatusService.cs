using System;
using System.Linq;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Newtonsoft.Json.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
    public class StatusService
    {
        private readonly StatusRepository _repo;
        private readonly HistoryService _historySvc;

        public StatusService(StatusRepository repo, HistoryService historyService)
        {
            _repo = repo;
            this._historySvc = historyService;
        }

        public IQueryable<OrderState> QueryOrderStates(int skip, int take, string condition, string sort)
        {
            return _repo.QueryOrderStates(skip, take, condition, sort);
        }
        public int QueryOrderStatesCount(string condition)
        {
            return _repo.QueryOrderStatesCount(condition);
        }
        public IQueryable<VehicleState> QueryVehicleStates()
        {
            return _repo.QueryVehicleStates();
        }
        public IQueryable<StationState> QueryStationStates()
        {
            return _repo.QueryStationStates();
        }
        public IQueryable<BufferState> QueryBufferStates()
        {
            return _repo.QueryBufferStates();
        }
        public IQueryable<ZcuState> QueryZcuStates()
        {
            return _repo.QueryZcuStates();
        }
        public IQueryable<FireShutterState> QueryFireShutterStates()
        {
            return _repo.QueryFireShutterStates();
        }
        public IQueryable<ClusterState> QueryClusterStates()
        {
            return _repo.QueryClusterStates();
        }
        public IQueryable<UnuseListState> QueryUnuseListStates()
        {
            return _repo.QueryUnuseListStates();
        }
        public IQueryable<DioState> QueryDioStates()
        {
            return _repo.QueryDioStates();
        }
        
        //GetLoadFilter for notificationsService 
        public (int skip, int take, string condition, string sort) GetLoadFilters(
            DataSourceLoadOptions loadOptions, string tableName)
        {
            int skip = 0;
            int take = 0;
            string condition = string.Empty;
            string sort = string.Empty;

            try
            {
                // pagination
                skip = loadOptions.Skip;
                take = loadOptions.Take;

                // sort
                if (loadOptions.Sort != null && loadOptions.Sort?.Count() > 0)
                {
                    SortingInfo sortingInfo = loadOptions.Sort[0];

                    string selector = TryORM(tableName, "", sortingInfo.Selector);
                    if (string.IsNullOrWhiteSpace(selector) == false)
                    {
                        sort += $" {selector} ";
                        sort += sortingInfo.Desc ? "DESC" : "ASC";
                    }
                }

                // from, to, conditions
                if (loadOptions.Filter?.Count == 3)
                {
                    JToken token0 = JToken.FromObject(loadOptions.Filter[0]);
                    JToken token2 = JToken.FromObject(loadOptions.Filter[2]);

                    bool existExtraConditions = this._historySvc.HasExtraConditions(tableName, token0, token2);

                    if (existExtraConditions == true)   // no extra condition
                    {
                        condition = this._historySvc.GetConditions(tableName, token0);
                    }
                }
                
                if (loadOptions.Filter?.Count == 1)
                {
                    JToken token = JToken.FromObject(loadOptions.Filter[0]);
                    bool existExtraConditions = HasExtraConditions(token);

                    if (existExtraConditions == true)   // no extra condition
                    {
                        condition = this._historySvc.GetConditions(tableName, token);
                    }
                }
            }
            catch (Exception e)
            {
            }

            return (skip, take, condition, sort);
        }
        
        public bool HasExtraConditions(JToken token)
        {
            bool bRet = true;
            try
            {
                foreach (var child in token.Children().Select((value, index) => (value, index)))
                {
                    var v = child.value;
                    var i = child.index;

                    if (i == 0 || i == 2)
                    {
                        if (v == null)
                        {
                            bRet = false;
                            break;
                        }
                    }
                }
            }
            catch (Exception e) { }

            return bRet;
        }
        
        public string TryORM(string tableName, string sOperator, string s)
        {
            if (string.Compare(tableName, "orders", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "logicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "logical_id";
                if (string.Compare(s, "historySourceId", StringComparison.CurrentCultureIgnoreCase) == 0)
                {
                    if (string.Compare(sOperator, "contains", StringComparison.CurrentCultureIgnoreCase) == 0 ||
                        string.Compare(sOperator, "notcontains", StringComparison.CurrentCultureIgnoreCase) == 0 ||
                        string.Compare(sOperator, "startswith", StringComparison.CurrentCultureIgnoreCase) == 0 ||
                        string.Compare(sOperator, "endswith", StringComparison.CurrentCultureIgnoreCase) == 0)
                    {
                        return "CAST(history_source_id AS TEXT) ";
                    }

                    return "history_source_id";
                }
                if (string.Compare(s, "origin", StringComparison.CurrentCultureIgnoreCase) == 0) return "origin";
                if (string.Compare(s, "priority", StringComparison.CurrentCultureIgnoreCase) == 0) return "priority";
                if (string.Compare(s, "state", StringComparison.CurrentCultureIgnoreCase) == 0) return "state";
                if (string.Compare(s, "vehicleId", StringComparison.CurrentCultureIgnoreCase) == 0) return "vehicle_id";
                if (string.Compare(s, "locationPickup", StringComparison.CurrentCultureIgnoreCase) == 0) return "location_pickup";
                if (string.Compare(s, "locationDropoff", StringComparison.CurrentCultureIgnoreCase) == 0) return "location_dropoff";
                if (string.Compare(s, "locationMove", StringComparison.CurrentCultureIgnoreCase) == 0) return "location_move";
                if (string.Compare(s, "carrierLabel", StringComparison.CurrentCultureIgnoreCase) == 0) return "carrier_label";
                if (string.Compare(s, "timeCreated", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_created";
                if (string.Compare(s, "timeAssigned", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_assigned";
                if (string.Compare(s, "timeCompleted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_completed";
                if (string.Compare(s, "timeAborted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_aborted";
                if (string.Compare(s, "timeFailed", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_failed";
                if (string.Compare(s, "resultCode", StringComparison.CurrentCultureIgnoreCase) == 0) return "result_code";
                if (string.Compare(s, "age", StringComparison.CurrentCultureIgnoreCase) == 0) return "age";
                if (string.Compare(s, "unloadRetryCnt", StringComparison.CurrentCultureIgnoreCase) == 0) return "unload_retry_cnt";
                if (string.Compare(s, "fromDistance", StringComparison.CurrentCultureIgnoreCase) == 0) return "from_distance";
                if (string.Compare(s, "toDistance", StringComparison.CurrentCultureIgnoreCase) == 0) return "to_distance";
                if (string.Compare(s, "vehicleAlias", StringComparison.CurrentCultureIgnoreCase) == 0) return "vehicle_alias";
                if (string.Compare(s, "locationPickupAlias", StringComparison.CurrentCultureIgnoreCase) == 0) return "location_pickup_alias";
                if (string.Compare(s, "locationDropoffAlias", StringComparison.CurrentCultureIgnoreCase) == 0) return "location_dropoff_alias";
                if (string.Compare(s, "assignmentType", StringComparison.CurrentCultureIgnoreCase) == 0) return "assignment_type";
                if (string.Compare(s, "durationTotal", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_total";
                if (string.Compare(s, "durationUnassigned", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_unassigned";
                if (string.Compare(s, "durationPickup", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_pickup";
                if (string.Compare(s, "durationLoad", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_load";
                if (string.Compare(s, "durationDropoff", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_dropoff";
                if (string.Compare(s, "durationUnload", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_unload";
                if (string.Compare(s, "durationMove", StringComparison.CurrentCultureIgnoreCase) == 0) return "duration_move";
                if (string.Compare(s, "distancePickup", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_pickup";
                if (string.Compare(s, "distanceDropoff", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_dropoff";
                if (string.Compare(s, "distanceMove", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_move";
                if (string.Compare(s, "statusDetails", StringComparison.CurrentCultureIgnoreCase) == 0) return "status_details";
            }
            return s;
        }
    }
    
}