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

        /// <summary>
        /// Alert의 갯수
        /// </summary>
        /// <remarks>
        /// 'ack_time'이 null인 
        /// </remarks>
        /// <returns>level 0,1,2 각각의 합계</returns>
        [HttpGet("alert-count")]
        public ActionResult<NotificationCountModel> AlertCount()
        {
            return this._notificationSvc.GetAlertCount();
        }

        /// <summary>
        /// Alarrm 갯수
        /// </summary>
        /// <remarks>
        /// 에러코드가 존재하는 미처리(ack_time, time_resolved) 된 알람갯수?
        /// </remarks>
        /// <returns>level 0,1,2,unknown 각각의 합계</returns>
        [HttpGet("alarm-count")]
        public ActionResult<NotificationCountModel> AlarmCount()
        {
            return this._notificationSvc.GetAlarmCount();
        }


        /// <summary>
        /// Alert 리스트
        /// </summary>
        /// <remarks>
        /// DevExtreme 컴포넌트에 데이터로드를 위한
        /// </remarks>
        /// <param name="loadOptions"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Alarm 리스트
        /// </summary>
        /// <remarks>DevExtreme 컴포넌트에 데이터로드를 위한</remarks>
        /// <param name="loadOptions"></param>
        /// <returns></returns>
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

        /// <summary>
        /// ************Annotation 확인필요.
        /// </summary>
        /// <param name="annotationForm"></param>
        /// <returns></returns>
        [HttpPost("addannotation")]
        public object AddAnnotation(AnnotationDto annotationForm)
        {
            return this._notificationSvc.AddAnnotation(annotationForm);
        }


        /// <summary>
        /// Vehicle 에러 리스트
        /// </summary>
        /// <remarks>DevExtreme 컴포넌트에 데이터로드를 위한</remarks>
        /// <param name="loadOptions"></param>
        /// <returns></returns>
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