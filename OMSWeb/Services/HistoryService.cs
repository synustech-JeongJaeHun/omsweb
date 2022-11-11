using System;
using System.Globalization;
using System.Linq;
using System.Xml.Linq;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.Extensions.Primitives;
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

        public int QueryOrdersCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryOrdersCount(from, to);
        }

        public IQueryable<OrderEntity> QueryOrders(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            return this._repo.QueryOrders(from, to, skip, take, condition, sort);
        }

        public int QueryVehiclesCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryVehiclesCount(from, to);
        }

        public IQueryable<VehicleHistoryEntity> QueryVehicles(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            return this._repo.QueryVehicles(from, to, skip, take, condition, sort);
        }

        public int QueryAlarmsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryAlarmsCount(from, to);
        }

        public IQueryable<AlarmHistory> QueryAlarms(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            return this._repo.QueryAlarms(from, to, skip, take, condition, sort);
        }

        public int QueryAlertsCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
             return this._repo.QueryAlertsCount(from, to);
        }

        public IQueryable<AlertEntity> QueryAlerts(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
             return this._repo.QueryAlerts(from, to, skip, take, condition, sort);
        }

        public int QueryNacksCount(DateTimeOffset from, DateTimeOffset to, int skip, int take)
        {
            return this._repo.QueryNacksCount(from, to);
        }

        public IQueryable<NackHistoryEntity> QueryNacks(DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort)
        {
            return this._repo.QueryNacks(from, to, skip, take, condition, sort);
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

        public (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort) GetLoadFilters2(DataSourceLoadOptions loadOptions)
        {
            DateTimeOffset from = new DateTimeOffset();
            DateTimeOffset to = new DateTimeOffset();
            int skip = 0;
            int take = 0;
            string condition = string.Empty;
            string sort = string.Empty;

            try
            {
                if (loadOptions.Filter?.Count == 3)
                {
                    JToken token0 = JToken.FromObject(loadOptions.Filter[0]);
                    JToken token2 = JToken.FromObject(loadOptions.Filter[2]);

                    if (token0.Children().Count() == 1 && token2.Children().Count() == 1)
                    {
                        //return GetLoadFilters(loadOptions);
                    }
                    else
                    {
                        foreach (var child0 in token0.Children())
                        {
                        }


                        //return GetLoadFilters(loadOptions);
                    }
                }


                    foreach (var filter in loadOptions.Filter)  
                {
                    JToken token = JToken.FromObject(filter);
                    if (token == null || token.Type != JTokenType.Array) continue;
                    
                    foreach (var child in token.Children())
                    {
                        if (child == null) continue;

                        int idx = 0;
                        if (token.Type == JTokenType.Array)
                        {
                            foreach (var child2 in child.Children())
                            {
                                switch (idx)
                                {
                                    case 0: child.ToString(); break;
                                    case 1: child.ToString(); break;
                                    case 2: child.ToString(); break;
                                }
                                idx++;
                            }
                        }
                    }
                    
                }
 
            }
            catch (Exception e)
            {
            }

            return (from, to, skip, take, condition, sort);
        }


        public (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort) 
            GetLoadFilters(DataSourceLoadOptions loadOptions, string tableName)
        {
            DateTimeOffset from = new DateTimeOffset();
            DateTimeOffset to = new DateTimeOffset();
            int skip = 0;
            int take = 0;
            string condition = string.Empty;
            string sort = string.Empty;

            //GetLoadFilters2(loadOptions);

            try
            {
                if (loadOptions.Filter?.Count == 3)
                {

                    //String s = loadOptions.Filter[0].TryString();
                    //JToken token = JToken.Parse(s);
                    //Traverse("", token);
                    
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

                skip = loadOptions.Skip;
                take = loadOptions.Take;

                if (loadOptions.Sort != null && loadOptions.Sort?.Count() > 0)
                {
                    SortingInfo sortingInfo = loadOptions.Sort[0];

                    string selector = TryORM(tableName, sortingInfo.Selector);
                    if (string.IsNullOrWhiteSpace(selector) == false)
                    {
                        sort += $" {selector} ";
                        sort += sortingInfo.Desc ? "DESC" : "ASC";
                    }
                }
            }
            catch (Exception e)
            {
            }

            return (from, to, skip, take, condition, sort);
        }

        public string TryORM(string tableName, string s)
        {
            if (string.Compare(tableName, "order_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "logicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "logical_id";
                if (string.Compare(s, "historySourceId", StringComparison.CurrentCultureIgnoreCase) == 0) return "history_source_id";
                if (string.Compare(s, "origin", StringComparison.CurrentCultureIgnoreCase) == 0) return "order_origin";
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
                if (string.Compare(s, "age", StringComparison.CurrentCultureIgnoreCase) == 0) return "age";
                if (string.Compare(s, "unloadRetryCnt", StringComparison.CurrentCultureIgnoreCase) == 0) return "unload_retry_cnt";
            }
            else if (string.Compare(tableName, "vehicle_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "historySourceId", StringComparison.CurrentCultureIgnoreCase) == 0) return "history_source_id";
                if (string.Compare(s, "logicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "logical_id";
                if (string.Compare(s, "distanceTotal", StringComparison.CurrentCultureIgnoreCase) == 0) return "distance_total";
                if (string.Compare(s, "runtimeTotal", StringComparison.CurrentCultureIgnoreCase) == 0) return "runtime_total";
            }
            if (string.Compare(tableName, "alarm_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                if (string.Compare(s, "vehicleLogicalId", StringComparison.CurrentCultureIgnoreCase) == 0) return "logical_id";
                if (string.Compare(s, "description", StringComparison.CurrentCultureIgnoreCase) == 0) return "description";
                if (string.Compare(s, "level", StringComparison.CurrentCultureIgnoreCase) == 0) return "level";
                if (string.Compare(s, "errorCode", StringComparison.CurrentCultureIgnoreCase) == 0) return "error_code";
                if (string.Compare(s, "cause", StringComparison.CurrentCultureIgnoreCase) == 0) return "cause";
                if (string.Compare(s, "cleared", StringComparison.CurrentCultureIgnoreCase) == 0) return "cleared";
                if (string.Compare(s, "time", StringComparison.CurrentCultureIgnoreCase) == 0) return "time";
                if (string.Compare(s, "timeResolved", StringComparison.CurrentCultureIgnoreCase) == 0) return "time_resolved";
                if (string.Compare(s, "age", StringComparison.CurrentCultureIgnoreCase) == 0) return "age";
                if (string.Compare(s, "current", StringComparison.CurrentCultureIgnoreCase) == 0) return "current";
            }
            else if (string.Compare(tableName, "warning_history", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
 
            }
            else if (string.Compare(tableName, "nak_history", StringComparison.CurrentCultureIgnoreCase) == 0)
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
            return s;
        }

        public void Traverse(string name, JToken j)
        {
            foreach (JToken token in j.AsJEnumerable())
            {
                if (token.Type == JTokenType.Object)
                {
                    foreach (var pair in token as JObject)
                    {
                        string name_ = pair.Key;
                        JToken child = pair.Value;
                        Traverse(name, child);
                    }
                }
                else if (token.Type == JTokenType.Array) //an array property found 
                {
                    foreach (var child in token.Children())
                        Traverse(((JProperty)j).Name, child);
                }
                else if (token.Type == JTokenType.Property)
                {
                    var property = token as JProperty; //current level property
                    Traverse(name, (JContainer)token);
                }
                else //current level property name & value
                {
                    var nm = "";
                    var t = "";
                    if (j is JProperty)
                    {
                        nm = ((JProperty)j).Name;
                        t = Convert.ToString(((JProperty)j).Value);
                    }
                    t = Convert.ToString(token);
                }
            }
        }
    }
}