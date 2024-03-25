using System;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Newtonsoft.Json.Linq;
using OMSWeb.Logger;

namespace OMSWeb.Services
{
    public class NotificationsService
    {
        private readonly AlarmRepository _alarmRepo;
        private readonly AlertRepository _alertRepo;
        private readonly HistoryService _historySvc;

        public NotificationsService(AlarmRepository alarm, AlertRepository alert,HistoryService historyService)
        {
            this._alarmRepo = alarm;
            this._alertRepo = alert;
            this._historySvc = historyService;
        }

        public NotificationCountModel GetAlarmCount()
        {
            return this._alarmRepo.GetCount();
        }

        public NotificationCountModel GetAlertCount()
        {
            return this._alertRepo.GetCount();
        }

        public IQueryable<AlertHistory> GetAlerts()
        {
            return this._alertRepo.GetAlerts();
        }

        public IQueryable<AlarmHistory> GetAlarms()
        {
            return this._alarmRepo.GetAlarms();
        }

        public int AddAnnotation(AnnotationDto annotation)
        {
            return this._alarmRepo.AddAnnotation(annotation);
        }

        public IQueryable<VehicleError> GetVehicleErrors()
        {
            return this._alarmRepo.GetVehicleErrors();
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

                    string selector = this._historySvc.TryORM(tableName, "", sortingInfo.Selector);
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
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception", e.Message);
            }

            return (skip, take, condition, sort);
        }
        
        public int QueryAlertsCount(string condition)
        {
            return this._alertRepo.QueryAlertsCount(condition);
        }
        
        public IQueryable<AlertEntity> QueryAlerts(int skip, int take, string condition, string sort)
        {
            return this._alertRepo.QueryAlerts(skip, take, condition, sort);
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
    }
}