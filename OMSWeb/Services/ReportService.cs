using System;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
    public class ReportService
    {
        private readonly ReportRepository _repo;

        public ReportService(ReportRepository repo)
        {
            _repo = repo;
        }

        public IQueryable<ReportTranNormal> QueryReportTranNormal()
        {
            return _repo.QueryReportTranNormal();
        }
        public IQueryable<ReportTranNormal> QueryReportTranNormal(DateTime start, DateTime end)
        {
            return _repo.QueryReportTranNormal(start, end);
        }
        public IQueryable<ReportTranAbnormal> QueryReportTranAbnormal()
        {
            return _repo.QueryReportTranAbnormal();
        }
        public IQueryable<ReportAlarms> QueryReportAlarms()
        {
            return _repo.QueryReportAlarms();
        }
    }
}