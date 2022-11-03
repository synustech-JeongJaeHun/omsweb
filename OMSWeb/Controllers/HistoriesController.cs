using System;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Data.ResponseModel;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Logger;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoriesController : ControllerBase
    {
        private readonly HistoryService _historySvc;
        public HistoriesController(HistoryService historyService)
        {
            this._historySvc = historyService;
        }

        [HttpGet("orders")]
        public object GetOrders(DataSourceLoadOptions loadOptions)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-transfers");

            (DateTimeOffset from, DateTimeOffset to, int skip, int take) = _historySvc.GetLoadFilters(loadOptions);
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take}");

            int totalCount = _historySvc.QueryOrdersCount(from, to, skip, take);
            loadOptions.Skip = 0;

            LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryOrders(from, to, skip, take), loadOptions);
            loadResult.totalCount = totalCount;

            return loadResult;
        }

        [HttpGet("vehicles")]
        public object GetVehicles(DataSourceLoadOptions loadOptions)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-vehicles");

            (DateTimeOffset from, DateTimeOffset to, int skip, int take) = _historySvc.GetLoadFilters(loadOptions);
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take}");

            int totalCount = _historySvc.QueryVehiclesCount(from, to, skip, take);
            loadOptions.Skip = 0;

            LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryVehicles(from, to, skip, take), loadOptions);
            loadResult.totalCount = totalCount;

            return loadResult;
        }

        [HttpGet("alarms")]
        public object GetAlarms(DataSourceLoadOptions loadOptions)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-alarms");

            (DateTimeOffset from, DateTimeOffset to, int skip, int take) = _historySvc.GetLoadFilters(loadOptions);
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take}");

            int totalCount = _historySvc.QueryAlarmsCount(from, to, skip, take);
            loadOptions.Skip = 0;

            LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryAlarms(from, to, skip, take), loadOptions);
            loadResult.totalCount = totalCount;

            return loadResult;
        }

        [HttpGet("alerts")]
        public object GetAlerts(DataSourceLoadOptions loadOptions)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-warnings");

            (DateTimeOffset from, DateTimeOffset to, int skip, int take) = _historySvc.GetLoadFilters(loadOptions);
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take}");

            int totalCount = _historySvc.QueryAlertsCount(from, to, skip, take);
            loadOptions.Skip = 0;

            LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryAlerts(from, to, skip, take), loadOptions);
            loadResult.totalCount = totalCount;

            return loadResult;
        }

        [HttpGet("nacks")]
        public object GetNacks(DataSourceLoadOptions loadOptions)
        {
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"ACTION: history-nacks");

            (DateTimeOffset from, DateTimeOffset to, int skip, int take) = _historySvc.GetLoadFilters(loadOptions);
            Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"PACKET: from={from} to={to} skip={skip} take={take}");

            int totalCount = _historySvc.QueryNacksCount(from, to, skip, take);
            loadOptions.Skip = 0;

            LoadResult loadResult = DataSourceLoader.Load(_historySvc.QueryNacks(from, to, skip, take), loadOptions);
            loadResult.totalCount = totalCount;

            return loadResult;
        }
    }
}