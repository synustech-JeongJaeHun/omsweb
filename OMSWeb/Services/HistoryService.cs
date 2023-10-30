using System;
using System.Data;
using System.Linq;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Newtonsoft.Json.Linq;
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

        public int QueryOrdersCount(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition)
        {
            return this._repo.QueryOrdersCount(from, to, condition);
        }

        public IQueryable<OrderHistoryEntity> QueryOrders(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group)
        {
            return this._repo.QueryOrders(from, to, skip, take, condition, sort, group);
        }

        public int QueryVehiclesCount(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition)
        {
            return this._repo.QueryVehiclesCount(from, to, condition);
        }

        public IQueryable<VehicleHistoryEntity> QueryVehicles(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group)
        {
            return this._repo.QueryVehicles(from, to, skip, take, condition, sort, group);
        }

        public int QueryAlarmsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition)
        {
            return this._repo.QueryAlarmsCount(from, to, condition);
        }

        public IQueryable<AlarmHistory> QueryAlarms(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group)
        {
            return this._repo.QueryAlarms(from, to, skip, take, condition, sort, group);
        }

        public int QueryAlertsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition)
        {
            return this._repo.QueryAlertsCount(from, to, condition);
        }

        public IQueryable<AlertEntity> QueryAlerts(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group)
        {
            return this._repo.QueryAlerts(from, to, skip, take, condition, sort, group);
        }

        public int QueryNacksCount(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition)
        {
            return this._repo.QueryNacksCount(from, to, condition);
        }

        public IQueryable<NackHistoryEntity> QueryNacks(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group)
        {
            return this._repo.QueryNacks(from, to, skip, take, condition, sort, group);
        }

        public IQueryable<VehicleDioHistoryEntity> QueryVehicleDios(int vehicleId, DateTimeOffset from, DateTimeOffset to)
        {
            return this._repo.QueryVehicleDios(vehicleId, from, to);
        }

        public VehicleDioHistoryEntity? QueryRecentDioBefore(int vehicleId, DateTimeOffset before)
        {
            var vehicleDios = this._repo.QueryRecentDioBefore(vehicleId, before);

            if (vehicleDios.AsEnumerable().Count() == 1)
                return vehicleDios.First();
            else
                return null;
        }


        public (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) GetLoadFilters(
            DataSourceLoadOptions loadOptions, string tableName)
        {
            DateTimeOffset from = new DateTimeOffset();
            DateTimeOffset to = new DateTimeOffset();
            int skip = 0;
            int take = 0;
            string condition = string.Empty;
            string sort = string.Empty;
            string group = string.Empty;

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

                    bool existExtraConditions = HasExtraConditions(tableName, token0, token2);

                    if (existExtraConditions == false)   // no extra condition
                    {
                        if (token0.Count() == 3 && token2.Count() == 3)
                        {
                            from = DateTimeOffset.Parse(token0[2].TryString());
                            to = DateTimeOffset.Parse(token2[2].TryString());
                        }
                    }
                    else  // has extra conditions
                    {
                        condition = GetConditions(tableName, token0);

                        if (token2.Children().Count() == 3)
                        {
                            foreach (var child in token2.Children().Select((value, index) => (value, index)))
                            {
                                var v = child.value;
                                var i = child.index;

                                if (v != null && v.Type == JTokenType.Array && v.Count() == 3)
                                {
                                    if (i == 0) from = DateTimeOffset.Parse(v[2].TryString());
                                    if (i == 2) to = DateTimeOffset.Parse(v[2].TryString());
                                }
                            }
                        }
                    }
                }
                
                // group
                if (loadOptions.Group?.Length > 0)
                {
                    GroupingInfo groupingInfo = loadOptions.Group[0];

                    string grouping = TryORM(tableName, "", groupingInfo.Selector);
                    if (string.IsNullOrWhiteSpace(grouping) == false)
                    {
                        group += $" {grouping} ";
                    }
                }
                
            }
            catch (Exception e)
            {
            }

            return (from, to, skip, take, condition, sort, group);
        }

        public bool HasExtraConditions(string tableName, JToken token0, JToken token2)
        {
            bool bRet = true;
            try
            {
                foreach (var child in token2.Children().Select((value, index) => (value, index)))
                {
                    var v = child.value;
                    var i = child.index;

                    if (i == 0 || i == 2)
                    {
                        if (v == null || v.Type != JTokenType.Array)
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

        public string GetConditions(string tableName, JToken token)
        {
            string conditions = string.Empty;
            if (token == null || token.Type != JTokenType.Array) return conditions;

            try
            {
                int count = CountOfConditions(token);
                if (count == 0)
                {
                    return conditions;
                }
                else if (count == 1)
                {
                    if (token.Type == JTokenType.Array)
                    {
                        string selector = token[0].TryString();
                        string sOperator = token[1].TryString();
                        string value = token[2].TryString();
                        JTokenType jType = token[2].Type;

                        conditions = BuildConditions(tableName, selector, sOperator, value, jType);
                    }
                }
                else
                {
                    foreach (var child in token.Children())
                    {
                        if (child.Type == JTokenType.Array)
                        {
                            string selector = child[0].TryString();
                            string sOperator = child[1].TryString();
                            string value = child[2].TryString();
                            JTokenType jType = child[2].Type;

                            conditions += BuildConditions(tableName, selector, sOperator, value, jType);
                        }
                    }
                }
            }
            catch (Exception e)
            {

            }

            // build conditions 
            string[] ar = conditions.Split("###");
            conditions = string.Empty;

            for (int i = 0; i < ar.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(ar[i]) == false)
                {
                    if (i != 0) conditions += " and ";
                    conditions += ar[i];
                }
            }

            return conditions;
        }

        public int CountOfConditions(JToken token)
        {
            int count = 0;
            try
            {
                foreach (var child in token.Children().Select((value, index) => (value, index)))
                {
                    var v = child.value;
                    var i = child.index;

                    if (v.Type == JTokenType.Array)
                    {
                        count++;
                    }
                    else if (v.Type == JTokenType.String && string.Compare("and", v.TryString(), StringComparison.CurrentCultureIgnoreCase) != 0)
                    {
                        count = 1;
                        break;
                    }
                }
            }
            catch (Exception e)
            {
            }

            return count;
        }

        public string BuildConditions(string tableName, string selector, string sOperator, string value, JTokenType jType)
        {
            string conditions = string.Empty;
            
            if (!string.IsNullOrWhiteSpace(selector) &&
                !string.IsNullOrWhiteSpace(sOperator) && jType == JTokenType.Null) // value is Null
            {
                selector = TryORM(tableName, sOperator, selector);
                if (string.Compare(sOperator, "=", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} is Null";
                if (string.Compare(sOperator, "<>", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} is Not Null";
                return conditions;
            }

            if (string.IsNullOrWhiteSpace(selector) ||
                            string.IsNullOrWhiteSpace(sOperator) ||
                            string.IsNullOrWhiteSpace(value)) return conditions;

            if (jType == JTokenType.String)    // value is string
            {
                selector = TryORM(tableName, sOperator, selector);
                if (string.Compare(sOperator, "contains", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} ILIKE '%{value}%' ###";
                if (string.Compare(sOperator, "notcontains", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} NOT ILIKE '%{value}%' ###";
                if (string.Compare(sOperator, "startswith", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} ILIKE '{value}%' ###";
                if (string.Compare(sOperator, "endswith", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} ILIKE '%{value}' ###";
                if (string.Compare(sOperator, "=", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} = '{value}' ###";
                if (string.Compare(sOperator, "<>", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} <> '{value}' ###";
            }
            else if (jType == JTokenType.Integer) // value is number
            {
                selector = TryORM(tableName, sOperator, selector);
                if (string.Compare(sOperator, "=", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} = {value} ###";
                if (string.Compare(sOperator, "<>", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} <> {value} ###";
                if (string.Compare(sOperator, ">", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} > {value} ###";
                if (string.Compare(sOperator, "<", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} < {value} ###";
                if (string.Compare(sOperator, ">=", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} >= {value} ###";
                if (string.Compare(sOperator, "<=", StringComparison.CurrentCultureIgnoreCase) == 0) conditions += $"{selector} <= {value} ###";
            }
            
            return conditions;
        }

        public string TryORM(string tableName, string sOperator, string s)
        {
            if (string.Compare(tableName, "order_history", StringComparison.CurrentCultureIgnoreCase) == 0)
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
                
                if (string.Compare(s, "timeLoadStarted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_load_started";
                if (string.Compare(s, "timeLoadCompleted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_load_completed";
                if (string.Compare(s, "timeUnloadStarted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_unload_started";
                if (string.Compare(s, "timeUnloadCompleted", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_unload_completed";
                
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
                
            }
            else if (string.Compare(tableName, "vehicle_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
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
                if (string.Compare(s, "logicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "logical_id";
                if (string.Compare(s, "distanceTotal", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_total";
                if (string.Compare(s, "runtimeTotal", StringComparison.CurrentCultureIgnoreCase) == 0) return "runtime_total";
                if (string.Compare(s, "distance", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance";
                if (string.Compare(s, "runtime", StringComparison.CurrentCultureIgnoreCase) == 0) return "runtime";
                if (string.Compare(s, "distanceRange", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_range";
                if (string.Compare(s, "runtimeRange", StringComparison.CurrentCultureIgnoreCase) == 0) return "runtime_range";
                if (string.Compare(s, "pmTime", StringComparison.CurrentCultureIgnoreCase) == 0) return "pm_time";
                if (string.Compare(s, "pmUser", StringComparison.CurrentCultureIgnoreCase) == 0) return "pm_user";
                if (string.Compare(s, "pmNote", StringComparison.CurrentCultureIgnoreCase) == 0) return "pm_note";
            }
            else if (string.Compare(tableName, "alarm_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "vehicleLogicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "vehicle_logical_id";
                if (string.Compare(s, "description", StringComparison.CurrentCultureIgnoreCase) == 0) return "description";
                if (string.Compare(s, "level", StringComparison.CurrentCultureIgnoreCase) == 0) return "level";
                if (string.Compare(s, "errorCode", StringComparison.CurrentCultureIgnoreCase) == 0) return "error_code";
                if (string.Compare(s, "cause", StringComparison.CurrentCultureIgnoreCase) == 0) return "cause";
                if (string.Compare(s, "cleared", StringComparison.CurrentCultureIgnoreCase) == 0) return "cleared";
                if (string.Compare(s, "time", StringComparison.CurrentCultureIgnoreCase) == 0) return "time";
                if (string.Compare(s, "timeResolved", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_resolved";
                if (string.Compare(s, "age", StringComparison.CurrentCultureIgnoreCase) == 0) return "age";
                if (string.Compare(s, "current", StringComparison.CurrentCultureIgnoreCase) == 0) return "current";
                if (string.Compare(s, "physicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "physical_id";
                if (string.Compare(s, "ackTime", StringComparison.CurrentCultureIgnoreCase) == 0) return "ack_time";
                if (string.Compare(s, "ackBy", StringComparison.CurrentCultureIgnoreCase) == 0) return "ack_by";
                if (string.Compare(s, "state", StringComparison.CurrentCultureIgnoreCase) == 0) return "state";
            }
            else if (string.Compare(tableName, "warning_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
 
            }
            else if (string.Compare(tableName, "nack_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "request", StringComparison.CurrentCultureIgnoreCase) == 0) return "Request";
                if (string.Compare(s, "rcmd", StringComparison.CurrentCultureIgnoreCase) == 0) return "Rcmd";
                if (string.Compare(s, "commandID", StringComparison.CurrentCultureIgnoreCase) == 0) return "CommandID";
                if (string.Compare(s, "modifiedTime", StringComparison.CurrentCultureIgnoreCase) == 0) return "ModifiedTime";
                if (string.Compare(s, "origin", StringComparison.CurrentCultureIgnoreCase) == 0) return "Origin";
                if (string.Compare(s, "sourceName", StringComparison.CurrentCultureIgnoreCase) == 0) return "SourceName";
                if (string.Compare(s, "destName", StringComparison.CurrentCultureIgnoreCase) == 0) return "DestName";
                if (string.Compare(s, "carrierID", StringComparison.CurrentCultureIgnoreCase) == 0) return "CarrierID";
                if (string.Compare(s, "carrierLoc", StringComparison.CurrentCultureIgnoreCase) == 0) return "CarrierLoc";
                if (string.Compare(s, "nack", StringComparison.CurrentCultureIgnoreCase) == 0) return "Nack";
                if (string.Compare(s, "nackReason", StringComparison.CurrentCultureIgnoreCase) == 0) return "NackReason";
                if (string.Compare(s, "nackParam", StringComparison.CurrentCultureIgnoreCase) == 0) return "NackParam";
            }
            else if (string.Compare(tableName, "alerts", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "id", StringComparison.CurrentCultureIgnoreCase) == 0) return "id";
                if (string.Compare(s, "time", StringComparison.CurrentCultureIgnoreCase) == 0) return "time";
                if (string.Compare(s, "level", StringComparison.CurrentCultureIgnoreCase) == 0) return "level";
                if (string.Compare(s, "tag", StringComparison.CurrentCultureIgnoreCase) == 0) return "tag";
                if (string.Compare(s, "message", StringComparison.CurrentCultureIgnoreCase) == 0) return "message";
                if (string.Compare(s, "ackTime", StringComparison.CurrentCultureIgnoreCase) == 0) return "ack_time";
                if (string.Compare(s, "ackBy", StringComparison.CurrentCultureIgnoreCase) == 0) return "ack_by";
            }
            return s;
        }
        
    }
}