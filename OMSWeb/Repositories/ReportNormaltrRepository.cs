using System.Collections.Generic;
using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;
using System.Threading.Tasks;
using System.Text.RegularExpressions;


using static OMSWeb.Services.ReportServiceShared;
using static OMSWeb.Repositories.ReportRepositoryShared;

#nullable enable

namespace OMSWeb.Repositories
{
    public class ReportNormaltrRepository : DataAccess
    {
        public ReportNormaltrRepository(IConfiguration configuration) : base(configuration) { }

        private readonly string _avgEpochPerHour = @"COALESCE(round(extract(epoch from avg(time_completed - time_created))), 0)";

        public async Task<(int Min, int Max, int Devn, int Avg, int Total)> QueryOrdersStatsAggregatedByTotalTimeSpan(string start, string end, object subfilter)
        {
            (int Min, int Max, int Devn, int Avg, int Total) result;
            using (var conn = ConnectTrack())
            {
                var sql = $@"
               		SELECT
                        EXTRACT(EPOCH FROM min(calctime))::int as min,
                        EXTRACT(EPOCH FROM max(calctime))::int as max,
                        EXTRACT(EPOCH FROM (max(calctime) - min(calctime)))::int as devn,
                        EXTRACT(EPOCH FROM avg(calctime))::int as avg,
                        count(*)::int as total
                    FROM (
                        SELECT
                            time_completed - time_created as calctime
                        from order_completed
                        WHERE time_completed IS NOT NULL
                            AND time_completed::DATE BETWEEN '{start}' AND '{end}' {GetSubfilter(subfilter)}
                    ) AS a
                ";
                result = await conn.QueryFirstAsync<(int Min, int Max, int Devn, int Avg, int Total)>(sql);
            }
            return result;
        }
        public async Task<(float Hours, float Daily, float Weekly, float Monthly, float Ph, float Yearly)> QueryOrdersStatsAggregatedByEachTimeSpans(string start, string end, object subfilter)
        {
            (float Hours, float Daily, float Weekly, float Monthly, float Ph, float Yearly) result;
            var _end = start == end ? getEndtime(end): end;

            using (var conn = ConnectTrack())
            {
                var sql = $@"
                    select 
                        hourly as hours,
                        trunc((hourly * 24), 2) as daily,
                        trunc((hourly * 24 * 7), 2) as weekly,
                        trunc((hourly * 24 * 30), 2) as monthly,
                        trunc(hourly, 2) as ph,
                        trunc((hourly * 24 * 365), 2) as yearly
                    from (
                        select 
                        (count(*) / (extract( EPOCH from ('{_end}'::timestamp - '{start}'::timestamp))/3600))::decimal as hourly
                        from order_completed
                        where time_completed is not null and
                        time_completed::date between '{start}' and '{_end}' {GetSubfilter(subfilter)}
                    ) temp
                ";

                result = await conn.QueryFirstAsync<(float Hours, float Daily, float Weekly, float Monthly, float Ph, float Yearly)>(sql);
            }
            return result;
        }

        public Func<string, string, Task<dynamic[]>> BuildQueryDuration(string section, string start, string end, object subfilter)
            => async (subsection, value) =>
            {
                async Task<dynamic[]> getDurationByDay(string? subsection, string value, string startStr, string endStr)
                {
                    dynamic[] result;

                    using (var conn = ConnectTrack())
                    {
                        var sql = $@"
                                SELECT
                                TO_CHAR(days, 'YYYY-MM-DD') as label,
                                (
                                    SELECT
                                    {_avgEpochPerHour}
                                    from order_completed
                                    WHERE time_completed is not null and time_completed::DATE BETWEEN days AND days {SubFilter(subsection, value)} {GetSubfilter(subfilter)}
                                ) AS avg,
                                (
                                    SELECT count(*)
                                    from order_completed
                                    WHERE time_completed is not null and time_completed::DATE BETWEEN days AND days {SubFilter(subsection, value)} {GetSubfilter(subfilter)}
                                )::int
                                FROM GENERATE_SERIES('{startStr}'::DATE, '{endStr}'::DATE, '1 days') days
                                ";
                        result = (await conn.QueryAsync(sql)).ToArray();
                    }
                    return result;
                }

                async Task<dynamic[]> getDurationByMonth(string subsection, string value)
                {
                    var durationList = GetDurationStr(start, end);

                    string queryStr(string[] arr)
                    {
                        var (label, startStr, endStr) = GetDurationLabel(arr);
                        var _filter = GetFilter(section, startStr, endStr);

                        return $@"
                            select
                            '{label}' as label,
                            count(*)::int,
                            {_avgEpochPerHour} as avg,
                            '{startStr}' as start_day,
                            '{endStr}' as end_day
                            from order_completed
                            where time_completed is not null and {_filter(subsection, value)} {GetSubfilter(subfilter)}
                        ";
                    }

                    var queryTaskList = durationList.Select(async (startEnd) =>
                    {
                        using var conn = ConnectTrack();
                        var ret = queryStr(startEnd);
                        return await conn.QueryFirstAsync(ret);
                    });


                    return (await Task.WhenAll(queryTaskList)).ToArray();
                }


                if (section == "duration")
                {
                    var strs = value.Split("_");
                    var startStr = strs[0];
                    var endStr = strs[1];
                    return await getDurationByDay(subsection, "", startStr, endStr);
                }

                return await getDurationByMonth(subsection, value);
            };

        public async Task<dynamic[]> QuerySections(string section, string selectedItem, string start, string end, object subfilter)
        {
            var filter = GetFilter(section, start, end);
            var sectionList = GetSubsection(section);

            async Task<dynamic[]> Query(string key, string subsection = "", string value = "")
            {
                dynamic[] result;
                using (var conn = ConnectTrack())
                {
                    var sql = $@"
                        SELECT
                        {GetColumnFromDic(key)} AS id,
                        {GetName(key)} as label,
                        COUNT(*)::int AS count,
                        {_avgEpochPerHour} as avg
                        from order_completed
			            WHERE time_completed is not null and {filter(subsection, value)} {GetSubfilter(subfilter)}
                        GROUP BY {GetColumnFromDic(key)}
                        ORDER BY label asc
                    ";

                    result = (await conn.QueryAsync(sql)).ToArray();
                }
                return result;
            }

            var queryTaskList = sectionList.Select(async (key) => await Query(key, section, selectedItem));
            return await Task.WhenAll(queryTaskList);
        }

        private Func<string, string, string> GetFilter(string? section, string start, string end) =>
            (key, value) =>
            {
                switch (section)
                {
                    case "overview":
                        return $"time_completed::DATE BETWEEN '{start}' AND '{end}'";
                    case "duration":
                        var strs = value.Split("_");
                        var startStr = strs[0];
                        var endStr = strs[1];
                        return $"time_completed::DATE BETWEEN '{startStr}' AND '{endStr}'";
                    default:
                        return $"time_completed::DATE BETWEEN '{start}' AND '{end}'{SubFilter(key, value)}";
                }
            };

        private string GetSubfilter(dynamic subfilter) {
            string GetString(string section) {
                var item = subfilter.GetValue(section);
                var count = item.Count;
                string value = item.ToString();
                string cleanedValue = value.Replace(System.Environment.NewLine, String.Empty);
                string arr = section != "vehicle" ? cleanedValue.Replace("\"", "'") : cleanedValue;
                return count == 0 ? "in (null)": $@"= any (array{arr})";
            };

            if ( subfilter == null )
            {
                return "";
            } else {
                var sql = $@" and vehicle_id {GetString("vehicle")} 
                and location_pickup {GetString("source")} 
                and location_dropoff {GetString("dest")}";
                return sql;
            }
        }

        private string SubFilter(string? key, string value) => key switch
        {
            "overview" => "",
            "duration" => "",
            _ => !string.IsNullOrEmpty(value) ? $" AND {GetColumnFromDic(key)} = '{value}'" : ""
        };

        private string getEndtime(string endDay) {
            DateTime now = DateTime.Now;
            string nowDay = now.ToString("yyyy-MM-dd");

            if (endDay == nowDay) {
                return now.ToString("yyyy-MM-dd hh:mm");
            }

            DateTime oDate = DateTime.Parse(endDay);
            return oDate.ToString("yyyy-MM-dd 23:59");
        }
    }
}