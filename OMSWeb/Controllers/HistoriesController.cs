using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            return DataSourceLoader.Load(_historySvc.QueryOrders(), loadOptions);
        }

        [HttpGet("vehicles")]
        public object GetVehicles(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_historySvc.QueryVehicles(), loadOptions);
        }

        [HttpGet("alarms")]
        public object GetAlarms(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_historySvc.QueryAlarms(), loadOptions);
        }

        [HttpGet("alerts")]
        public object GetAlerts(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_historySvc.QueryAlerts(), loadOptions);
        }
    }
}