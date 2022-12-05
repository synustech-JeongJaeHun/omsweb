using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;
using OMSWeb.Services;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using OMSWeb.Filters;
using OMSWeb.Models;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ReportService _reportSvc;
        private readonly ComputerPerformanceService _computerPerformanceService;

        public ReportController(
            ReportService reportSvc,
            ComputerPerformanceService computerPerformanceService
        )
        {
            this._reportSvc = reportSvc;
            this._computerPerformanceService = computerPerformanceService;
        }

        [HttpGet("labels")]
        public object GetLabels()
        {
            return _reportSvc.QueryLabels();
        }

        [HttpPost("stats")]
        public async Task<ActionResult<object>> GetStats([FromBody] ReportRequestStats requestBody)
        {
            var firstDay = new DateTime(DateTime.Now.Year, 1, 1).ToString("yyyy-MM-dd");
            var lastDay = DateTime.Now.ToString("yyyy-MM-dd");

            return requestBody.Variant switch
            {
                "normaltr" => await _reportSvc.QueryNormaltrStatsBetween(requestBody.Start, requestBody.End, requestBody.Subfilter),
                "alarm" => await _reportSvc.QueryAlarmStatsBetween(firstDay, lastDay, requestBody.Subfilter),
                "abnormaltr" => await _reportSvc.QueryAbnormaltrStatsBetween(firstDay, lastDay, requestBody.Subfilter, requestBody.BlacklistIds),
                _ => BadRequest()
            };
        }

        [HttpPost("charts")]
        public async Task<object> GetCharts([FromBody] ReportRequestCharts requestBody)
        {
            return requestBody.Variant switch
            {
                "normaltr" => await _reportSvc.QueryNormaltrChartsBetween(
                    requestBody.Section,
                    requestBody.Selected_Item,
                    requestBody.Start,
                    requestBody.End, 
                    requestBody.Subfilter 
                ),
                "alarm" => await _reportSvc.QueryAlarmChartsBetween(
                    requestBody.Section,
                    requestBody.Selected_Item,
                    requestBody.Start,
                    requestBody.End,
                    requestBody.Subfilter
                ),
                "abnormaltr" => await _reportSvc.QueryAbnormaltrChartsBetween(
                    requestBody.Section,
                    requestBody.Selected_Item,
                    requestBody.Start,
                    requestBody.End,
                    requestBody.Subfilter
                ),
                _ => BadRequest()
            };
        }

        [HttpGet("trend")]
        public async Task<object> GetTrend()
        {
            var trend = await _reportSvc.QueryTrend();
            var cpu = _computerPerformanceService.getCurrentCpuNameAndUsage();
            var memory = _computerPerformanceService.getRAMInformation();
            return new
            {
                delivery_time = trend.delivery_time,
                wait_time = trend.wait_time,
                transfer_time = trend.transfer_time,
                assign_time = trend.assign_time,
                number_of_order_request = trend.number_of_order_request,
                vehicles = trend.vehicles,
                loading_unloading = trend.loading_unloading,
                range = trend.range,
                utilization = trend.utilization,
                cpu,
                memory
            };
        }

        [HttpGet("trend/utilization")]
        public async Task<object> GetTrendUtilization()
        {
            return await _reportSvc.QueryTrendUtilization();
        }

        [HttpGet("trend/delivery-time")]
        public async Task<object> GetTrendDeliveryTime()
        {
            return await _reportSvc.QueryTrendDeliveryTime();
        }
    }
}