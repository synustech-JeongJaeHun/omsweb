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

        public ReportController(ReportService reportSvc)
        {
            this._reportSvc = reportSvc;
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
                "normaltr" => await _reportSvc.QueryNormaltrStatsBetween(firstDay, lastDay),
                "alarm" => await _reportSvc.QueryAlarmStatsBetween(firstDay, lastDay),
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
                    requestBody.End
                ),
                "alarm" => await _reportSvc.QueryAlarmChartsBetween(
                    requestBody.Section,
                    requestBody.Selected_Item,
                    requestBody.Start,
                    requestBody.End
                ),
                _ => BadRequest()
            };
        }
    }
}