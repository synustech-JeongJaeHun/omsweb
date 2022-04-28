using System.Collections.Generic;
using System;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;
using System.Threading.Tasks;

#nullable enable
namespace OMSWeb.Services
{
    public static class ReportServiceShared
    {
        public static string[] GetSubsection(string? section)
        {
            switch (section)
            {
                case "vehicle":
                case "source":
                case "dest":
                    return new[] { "vehicle", "source", "dest" };
                default:
                    return new[] { "vehicle", "source", "dest" };
            };
        }
    }
    public class ReportService
    {
        private readonly ReportRepository _reportRepo;
        private readonly ReportNormaltrRepository _reportNormaltrRepository;
        private readonly ReportAlarmRepository _reportAlarmRepository;

        public ReportService(
                ReportRepository reportRepository,
                ReportNormaltrRepository reportNormaltrRepository,
                ReportAlarmRepository reportAlarmRepository
        )
        {
            _reportRepo = reportRepository;
            _reportNormaltrRepository = reportNormaltrRepository;
            _reportAlarmRepository = reportAlarmRepository;
        }

        public object QueryLabels() => _reportRepo.QueryLabels();

        public async Task<object> QueryNormaltrStatsBetween(string start, string end)
        {
            var aggregatedByTotalTimeSpan =
                _reportNormaltrRepository.QueryOrdersStatsAggregatedByTotalTimeSpan(start, end);
            var aggregatedByEachTimeSpans =
                _reportNormaltrRepository.QueryOrdersStatsAggregatedByEachTimeSpans(start, end);

            await Task.WhenAll(new Task[] { aggregatedByTotalTimeSpan, aggregatedByEachTimeSpans });

            var statsByTotalTimeSpan = await aggregatedByTotalTimeSpan;
            var statsByEachTimeSpans = await aggregatedByEachTimeSpans;

            return new
            {
                Total = statsByTotalTimeSpan.Total,
                Time = new
                {
                    Avg = statsByTotalTimeSpan.Avg,
                    Min = statsByTotalTimeSpan.Min,
                    Max = statsByTotalTimeSpan.Max,
                    Devn = statsByTotalTimeSpan.Devn
                },
                Avg = new
                {
                    Ph = statsByEachTimeSpans.Ph,
                    Daily = statsByEachTimeSpans.Daily,
                    Weekly = statsByEachTimeSpans.Weekly,
                    Monthly = statsByEachTimeSpans.Monthly,
                    Yearly = statsByEachTimeSpans.Yearly
                }
            };
        }

        public async Task<object> QueryNormaltrChartsBetween(string section, string selectedItem, string start, string end)
        {
            var queryDuration = _reportNormaltrRepository.BuildQueryDuration(section, start, end);
            var sectionList = ReportServiceShared.GetSubsection(section);

            var duration = await queryDuration(section, selectedItem);
            var others = await _reportNormaltrRepository.QuerySections(section, selectedItem, start, end);

            var data = new Dictionary<string, dynamic[]>();
            data.Add("duration", duration);
            sectionList.Zip(others).ToList().ForEach(tuple => data.Add(tuple.First, tuple.Second));

            return data;
        }

        public async Task<object> QueryAlarmStatsBetween(string start, string end)
        {
            var aggregatedByTotalTimeSpan =
                _reportAlarmRepository.QueryAlarmsStatsAggregatedByTotalTimeSpan(start, end);
            var aggregatedByEachTimeSpans =
                _reportAlarmRepository.QueryAlarmsStatsAggregatedByEachTimeSpans(start, end);

            await Task.WhenAll(new Task[] { aggregatedByTotalTimeSpan, aggregatedByEachTimeSpans });

            var statsByTotalTimeSpan = await aggregatedByTotalTimeSpan;
            var statsByEachTimeSpans = await aggregatedByEachTimeSpans;

            return new
            {
                Total = statsByTotalTimeSpan.Total,
                Time = new
                {
                    Avg = statsByTotalTimeSpan.Avg,
                    Min = statsByTotalTimeSpan.Min,
                    Max = statsByTotalTimeSpan.Max,
                    Devn = statsByTotalTimeSpan.Devn
                },
                Avg = new
                {
                    Ph = statsByEachTimeSpans.Ph,
                    Daily = statsByEachTimeSpans.Daily,
                    Weekly = statsByEachTimeSpans.Weekly,
                    Monthly = statsByEachTimeSpans.Monthly,
                    Yearly = statsByEachTimeSpans.Yearly
                }
            };
        }

        public async Task<object> QueryAlarmChartsBetween(string section, string selectedItem, string start, string end)
        {
            var queryDuration = _reportAlarmRepository.BuildQueryDuration(section, start, end);
            var sectionList = ReportServiceShared.GetSubsection(section);

            var duration = await queryDuration(section, selectedItem);
            var others = await _reportAlarmRepository.QuerySections(section, selectedItem, start, end);

            var data = new Dictionary<string, dynamic[]>();
            data.Add("duration", duration);
            sectionList.Zip(others).ToList().ForEach(tuple => data.Add(tuple.First, tuple.Second));

            return data;
        }
    }
}