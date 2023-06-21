using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Data.ResponseModel;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationsService _notificationSvc;
        private readonly HistoryService _historySvc;

        public NotificationsController(NotificationsService notificationsService, HistoryService historyService)
        {
            this._notificationSvc = notificationsService;
            this._historySvc = historyService;
        }

        [HttpGet("alert-count")]
        public ActionResult<NotificationCountModel> AlertCount()
        {
            return this._notificationSvc.GetAlertCount();
        }

        [HttpGet("alarm-count")]
        public ActionResult<NotificationCountModel> AlarmCount()
        {
            return this._notificationSvc.GetAlarmCount();
        }

        [HttpGet("alerts")]
        public object GetAlerts(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (int skip, int take, string condition, string sort) = _notificationSvc.GetLoadFilters(loadOptions, @"alerts");
                int totalCount = _notificationSvc.QueryAlertsCount(condition);
                loadOptions.Skip = 0;
                //loadOptions.Filter = null;

                LoadResult loadResult = DataSourceLoader.Load(_notificationSvc.QueryAlerts(skip, take, condition, sort), loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
                //return DataSourceLoader.Load(_notificationSvc.GetAlerts(), loadOptions);
            }
            catch (Exception e)
            { }

            return null;
        }

        [HttpGet("alarms")]
        public object GetAlarms(DataSourceLoadOptions loadOptions)
        {
            try
            {
                return DataSourceLoader.Load(_notificationSvc.GetAlarms(), loadOptions);
            }
            catch (Exception e)
            { }

            return null;
        }

        [HttpPost("addannotation")]
        public object AddAnnotation(AnnotationDto annotationForm)
        {
            return this._notificationSvc.AddAnnotation(annotationForm);
        }

        [HttpGet("vehicle-errors")]
        public object GetVehicleErrors(DataSourceLoadOptions loadOptions)
        {
            try
            {
                return DataSourceLoader.Load(_notificationSvc.GetVehicleErrors(), loadOptions);
            }
            catch (Exception e)
            { }

            return null;
        }
    }
}