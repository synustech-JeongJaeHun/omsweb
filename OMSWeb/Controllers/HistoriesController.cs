using System;
using System.Collections;
using System.IO.Pipelines;
using System.Linq;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Data.ResponseModel;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Logger;
using OMSWeb.Models.Entities;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoriesController : ControllerBase
    {
        private readonly HistoryService _historySvc;
        private readonly UserService _userSvc;

        private const String USER_ID = "userId";
        public HistoriesController(HistoryService historyService, UserService userService)
        {
            this._historySvc = historyService;
            this._userSvc = userService;
        }

        [HttpGet("orders")]
        public object GetOrders(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) = _historySvc.GetLoadFilters(loadOptions, @"order_history");

                String loginId = "unknown";
                if (Request.Headers.TryGetValue("Authorization", out var jwt))
                {
                    loginId = _userSvc.DecodeJwt(jwt, USER_ID);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-transfers");
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take} group={group}, login_id={loginId}");

                int totalCount = _historySvc.QueryOrdersCount(from, to, skip, take, condition);
                loadOptions.Skip = 0;

                IQueryable<OrderHistoryEntity> result =
                    _historySvc.QueryOrders(from, to, skip, take, condition, sort, group);

                if (!String.IsNullOrWhiteSpace(group))
                {
                    SortingInfo sortingInfo = new SortingInfo(){ Selector = "vehicleId", Desc = true};
                    loadOptions.Sort = new[] { sortingInfo };
                    loadOptions.RequireTotalCount = true;
                }
                LoadResult loadResult = DataSourceLoader.Load(result, loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
            }
            catch (Exception e)
            {
                Console.WriteLine($"[Exception] e");
            }
 
            return null;
        }

        [HttpGet("vehicles")]
        public object GetVehicles(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) = _historySvc.GetLoadFilters(loadOptions, @"vehicle_history");

                String loginId = "unknown";
                if (Request.Headers.TryGetValue("Authorization", out var jwt))
                {
                    loginId = _userSvc.DecodeJwt(jwt, USER_ID);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-vehicles");
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take} group={group}, login_id={loginId} ");

                int totalCount = _historySvc.QueryVehiclesCount(from, to, skip, take, condition);
                loadOptions.Skip = 0;
                //loadOptions.Filter = null;


                LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryVehicles(from, to, skip, take, condition, sort, group), loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
            }
            catch (Exception e)
            {
            }

            return null;
        }

        [HttpGet("alarms")]
        public object GetAlarms(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) = _historySvc.GetLoadFilters(loadOptions, @"alarm_history");

                String loginId = "unknown";
                if (Request.Headers.TryGetValue("Authorization", out var jwt))
                {
                    loginId = _userSvc.DecodeJwt(jwt, USER_ID);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-alarms");
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take} group={group}, login_id={loginId}");

                int totalCount = _historySvc.QueryAlarmsCount(from, to, skip, take, condition);
                loadOptions.Skip = 0;
                //loadOptions.Filter = null;

                LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryAlarms(from, to, skip, take, condition, sort, group), loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
            }
            catch (Exception e)
            {
            }

            return null;
        }

        [HttpGet("alerts")]
        public object GetAlerts(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) = _historySvc.GetLoadFilters(loadOptions, @"alert_history");

                String loginId = "unknown";
                if (Request.Headers.TryGetValue("Authorization", out var jwt))
                {
                    loginId = _userSvc.DecodeJwt(jwt, USER_ID);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-warnings");
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take} group={group}, login_id={loginId}");

                int totalCount = _historySvc.QueryAlertsCount(from, to, skip, take, condition);
                loadOptions.Skip = 0;
                loadOptions.Filter = null;
                LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryAlerts(from, to, skip, take, condition, sort, group), loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
            }
            catch (Exception e)
            {
            }

            return null;
        }

        [HttpGet("nacks")]
        public object GetNacks(DataSourceLoadOptions loadOptions)
        {
            try
            {
                (DateTimeOffset from, DateTimeOffset to, int skip, int take, string condition, string sort, string group) = _historySvc.GetLoadFilters(loadOptions, @"nack_history");

                String loginId = "unknown";
                if (Request.Headers.TryGetValue("Authorization", out var jwt))
                {
                    loginId = _userSvc.DecodeJwt(jwt, USER_ID);
                }

                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-nacks");
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take} group={group}, login_id={loginId}");

                int totalCount = _historySvc.QueryNacksCount(from, to, skip, take, condition);
                loadOptions.Skip = 0;
                //loadOptions.Filter = null;

                LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryNacks(from, to, skip, take, condition, sort, group), loadOptions);
                loadResult.totalCount = totalCount;

                return loadResult;
            }
            catch (Exception e)
            {
            }

            return null;
        }
    }
}