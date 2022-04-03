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

        [HttpGet("report/tran/normal/{start}/{end}")]
        //public object GetReportTranNormal(DataSourceLoadOptions loadOptions)
        public object GetReportTranNormal([FromRoute] string start, [FromRoute] string end, DataSourceLoadOptions loadOptions)
        {
            //return DataSourceLoader.Load(_reportSvc.QueryReportTranNormal(), loadOptions);
            Console.WriteLine($"## Get Report Trans time >> {start} ~ {end}");
            return DataSourceLoader.Load(_reportSvc.QueryReportTranNormal(DateTime.Parse(start), DateTime.Parse(end)), loadOptions);
        }


        [HttpGet("report/tran/abnormal/{start}/{end}")]
        public object GetReportTranAbnormal(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_reportSvc.QueryReportTranAbnormal(), loadOptions);
        }

        [HttpGet("report/alarms/{start}/{end}")]
        public object GetReportAlarms(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_reportSvc.QueryReportAlarms(), loadOptions);
        }

    }
}