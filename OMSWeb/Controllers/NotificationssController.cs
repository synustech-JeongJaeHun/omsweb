using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
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

        public NotificationsController(NotificationsService notificationsService)
        {
            this._notificationSvc = notificationsService;
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
            return DataSourceLoader.Load(_notificationSvc.GetAlerts(), loadOptions);
        }

        [HttpGet("alarms")]
        public object GetAlarms(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_notificationSvc.GetAlarms(), loadOptions);
        }

        [HttpPost("addannotation")]
        public object AddAnnotation(AnnotationDto annotationForm)
        {
            return this._notificationSvc.AddAnnotation(annotationForm);
        }

        [HttpGet("vehicle-errors")]
        public object GetVehicleErrors(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_notificationSvc.GetVehicleErrors(), loadOptions);
        }
    }
}