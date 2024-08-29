using System.Collections.Generic;
using System;
using System.Linq;
using OMSWeb.Models;
using OMSWeb.Repositories;
using System.Threading.Tasks;
using System.Threading;
using OMSWeb.Models.Tracks;
using OMSWeb.Logger;

#nullable enable
namespace OMSWeb.Services
{
    public static class ReportServiceShared
    {
        public static string[] GetSubsection(string? section, string? pageType = "normaltr")
        {
            if (pageType == "alarm") {
                return new[] { "vehicle", "alarm", "point" };
            } else {
                switch (section)
                {
                    case "vehicle":
                    case "source":
                    case "dest":
                    case "slot":
                        return new[] { "vehicle", "source", "dest" };
                    default:
                        return new[] { "vehicle", "source", "dest" };
                };
            }

        }
    }
    public class ReportService
    {
        private readonly ReportRepository _reportRepo;
        private readonly ReportNormaltrRepository _reportNormaltrRepository;
        private readonly ReportAbnormaltrRepository _reportAbnormaltrRepository;
        private readonly ReportAlarmRepository _reportAlarmRepository;
        private readonly ReportTrendReposity _reportTrendRepository;

        private readonly Timer timer_trend_update;
        private readonly Timer timer_zcu_update;
        private object g_delivery_time;
        private object g_vehicles;
        private object g_utilization = 0;
        private object g_zcus;
        
        private SystemsService _systemSvc;

        public ReportService(
                ReportRepository reportRepository,
                ReportNormaltrRepository reportNormaltrRepository,
                ReportAbnormaltrRepository reportAbnormaltrRepository,
                ReportAlarmRepository reportAlarmRepository,
                ReportTrendReposity reportTrendReposity,
                SystemsService systemSvc
        )
        {
            this._systemSvc = systemSvc;
            
            _reportRepo = reportRepository;
            _reportNormaltrRepository = reportNormaltrRepository;
            _reportAbnormaltrRepository = reportAbnormaltrRepository;
            _reportAlarmRepository = reportAlarmRepository;
            _reportTrendRepository = reportTrendReposity;

            timerCallback(new Object());
            timer_trend_update = new Timer(timerCallback);
            timer_trend_update.Change(0, 8000);

            int zcuInterval = this._systemSvc.GetClientSettings().ZcuStatusIntervalSec;

            timerZcu(new Object());
            if (zcuInterval > 0)
            {
                timer_zcu_update = new Timer(timerZcu);
                timer_zcu_update.Change(0, zcuInterval*1000);
            }
            
        }

        public object QueryLabels() => _reportRepo.QueryLabels();

        public async Task<object> QueryNormaltrStatsBetween(string start, string end, object subfilter)
        {
            var aggregatedByTotalTimeSpan =
                _reportNormaltrRepository.QueryOrdersStatsAggregatedByTotalTimeSpan(start, end, subfilter);
            var aggregatedByEachTimeSpans =
                _reportNormaltrRepository.QueryOrdersStatsAggregatedByEachTimeSpans(start, end, subfilter);

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

        public async Task<object> QueryNormaltrChartsBetween(string section, string selectedItem, string start, string end, object subfilter)
        {
            var queryDuration = _reportNormaltrRepository.BuildQueryDuration(section, start, end, subfilter);
            var sectionList = ReportServiceShared.GetSubsection(section);

            var duration = await queryDuration(section, selectedItem);
            var others = await _reportNormaltrRepository.QuerySections(section, selectedItem, start, end, subfilter);
            
            var hours = await _reportNormaltrRepository.QueryHours(section, selectedItem, start, end, subfilter);

            var data = new Dictionary<string, dynamic[]>();
            data.Add("duration", duration);
            data.Add("hours", hours);
            sectionList.Zip(others).ToList().ForEach(tuple => data.Add(tuple.First, tuple.Second));

            return data;
        }

        public async Task<object> QueryAlarmStatsBetween(string start, string end, object subfilter)
        {
            var aggregatedByTotalTimeSpan =
                _reportAlarmRepository.QueryAlarmsStatsAggregatedByTotalTimeSpan(start, end, subfilter);
            var aggregatedByEachTimeSpans =
                _reportAlarmRepository.QueryAlarmsStatsAggregatedByEachTimeSpans(start, end, subfilter);

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

        public async Task<object> QueryAlarmChartsBetween(string section, string selectedItem, string start, string end, object subfilter)
        {
            var queryDuration = _reportAlarmRepository.BuildQueryDuration(section, start, end, subfilter);
            var sectionList = ReportServiceShared.GetSubsection(section, "alarm");

            var duration = await queryDuration(section, selectedItem);
            var others = await _reportAlarmRepository.QuerySections(section, selectedItem, start, end, subfilter);
            
            var hours = await _reportAlarmRepository.QueryHours(section, selectedItem, start, end, subfilter);

            var data = new Dictionary<string, dynamic[]>();
            data.Add("duration", duration);
            data.Add("hours", hours);
            sectionList.Zip(others).ToList().ForEach(tuple => data.Add(tuple.First, tuple.Second));

            return data;
        }

        public async Task<object> QueryAbnormaltrStatsBetween(string start, string end, object subfilter, string[] blacklistIds)
        {
            return await _reportAbnormaltrRepository.QueryStatsAggregatedByTotalTimeSpan(start, end, subfilter, blacklistIds);
        }

        public async Task<object> QueryAbnormaltrChartsBetween(string section, string selectedItem, string start, string end, object subfilter)
        {
            var queryDuration = _reportAbnormaltrRepository.BuildQueryDuration(section, start, end, subfilter);
            var sectionList = ReportServiceShared.GetSubsection(section);

            var duration = await queryDuration(section, selectedItem);
            var others = await _reportAbnormaltrRepository.QuerySections(section, selectedItem, start, end, subfilter);

            var data = new Dictionary<string, dynamic[]>();
            data.Add("duration", duration);
            sectionList.Zip(others).ToList().ForEach(tuple => data.Add(tuple.First, tuple.Second));

            return data;
        }

        private async void timerCallback(Object state)
        {
            if(this._systemSvc.GetClientSettings().KpiEnabled)
                await PrepareKpi();
        }
        
        private async void timerZcu(Object state)
        {
            if(this._systemSvc.GetClientSettings().ZcuStatusIntervalSec>0)
                await PrepareZcu();
        }

        public async Task PrepareKpi()
        {
            try
            {
                var createOrder10m = _reportTrendRepository.CreateOrder10m();
                var deliveryTimeTask = _reportTrendRepository.QueryDeliveryTime();
                var vehiclesTask = _reportTrendRepository.QueryVehicles();
                var utilizationTask = _reportTrendRepository.QueryUtilization();

                await Task.WhenAll(new Task[] {
                    createOrder10m,
                    deliveryTimeTask,
                    vehiclesTask,
                    utilizationTask,
                });

                var delivery_time = await deliveryTimeTask;
                var vehicles = await vehiclesTask;
                var utilization = await utilizationTask;


                g_delivery_time = delivery_time;
                g_vehicles = vehicles;
                g_utilization = utilization;

            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception : {e.Message}");
            }
        }
        
        public async Task PrepareZcu()
        {
            try
            {
                var zcus = _reportTrendRepository.QueryZcu();
                await Task.WhenAll(new Task[] {
                    zcus
                });
                g_zcus = await zcus;
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception : {e.Message}");
            }
        }
   
        public async Task<dynamic> QueryTrend()
        {
            if (!this._systemSvc.GetClientSettings().KpiEnabled)
            {
                await PrepareKpi();
            }
            var waitTimeTask = _reportTrendRepository.QueryWaitTime();
            var transferTimeTask = _reportTrendRepository.QueryTransferTime();
            var assignTimeTask = _reportTrendRepository.QueryAssignTime();
            var numberOfOrderRequestTask = _reportTrendRepository.QueryNumberOfOrderRequest();
            var loadingUnLoadingTask = _reportTrendRepository.QueryLoadingUnLoading();
            var rangeTask = _reportTrendRepository.QueryRange();
            var idleTask = _reportTrendRepository.QueryIdle();

            await Task.WhenAll(new Task[] {
                waitTimeTask,
                transferTimeTask,
                assignTimeTask,
                numberOfOrderRequestTask,
                loadingUnLoadingTask,
                rangeTask,
                idleTask
            });

            var delivery_time = g_delivery_time;
            var wait_time = await waitTimeTask;
            var transfer_time = await transferTimeTask;
            var assign_time = await assignTimeTask;
            var number_of_order_request = await numberOfOrderRequestTask;
            var vehicles = g_vehicles;
            var loading_unloading = await loadingUnLoadingTask;
            var range = await rangeTask;
            var utilization = g_utilization;
            var idle = await idleTask;

            return new
            {
                delivery_time,
                wait_time,
                transfer_time,
                assign_time,
                number_of_order_request,
                vehicles,
                loading_unloading,
                range,
                utilization,
                idle
            };
        }
        
        public async Task<dynamic> QueryKpi()
        {
            var delivery_time = g_delivery_time;
            var vehicles = g_vehicles;
            var utilization = g_utilization;

            return new
            {
                delivery_time,
                vehicles,
                utilization,
            };
        }
        
        public async Task<dynamic> QueryZcu()
        {
            return g_zcus;
        }

        public async Task<object> QueryTrendUtilization()
         => await _reportTrendRepository.QueryTrendUtilization();

        public async Task<object> QueryTrendDeliveryTime()
         => await _reportTrendRepository.QueryTrendDeliveryTime();
    }
}