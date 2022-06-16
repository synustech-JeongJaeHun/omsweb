using System.Collections.Generic;
using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;
using System.Threading.Tasks;

using static OMSWeb.Services.ReportServiceShared;
using static OMSWeb.Repositories.ReportRepositoryShared;

#nullable enable

namespace OMSWeb.Repositories
{
    public class ReportAlarmRepository : DataAccess
    {
        public ReportAlarmRepository(IConfiguration configuration) : base(configuration) { }

        private readonly string _avgEpochPerHour = @"
            COALESCE(
                TRUNC(
                    (extract(epoch from avg(time_resolved - time)) / 3600)::numeric, 2
                )::float,
                0
            )
            ";

        public async Task<(int Min, int Max, int Devn, int Avg, int Total)> QueryAlarmsStatsAggregatedByTotalTimeSpan(string start, string end)
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
                            time_resolved - time as calctime
                        FROM vehicle_alarms
                        WHERE time::DATE BETWEEN '{start}' AND '{end}'
                    ) AS a
                ";

                result = await conn.QueryFirstAsync<(int Min, int Max, int Devn, int Avg, int Total)>(sql);
            }
            return result;
        }

        public async Task<(int Days, int Weeks, int Months, int Hours, int Daily, int Weekly, int Monthly, int Ph, int Yearly)> QueryAlarmsStatsAggregatedByEachTimeSpans(string start, string end)
        {
            (int Days, int Weeks, int Months, int Hours,
                           int Daily, int Weekly, int Monthly, int Ph, int Yearly) result;

            using (var conn = ConnectTrack())
            {
                var sql = $@"
                	SELECT
                        days,
                        weeks,
                        months,
                        hours,
                        CASE
                            WHEN days = 0 THEN total
                            ELSE total / days
                        END::int AS daily,
                        CASE
                            WHEN weeks = 0 THEN total
                            ELSE total / weeks
                        END::int AS weekly,
                        CASE
                            WHEN months = 0 THEN total
                            ELSE total / months
                        END::int AS monthly,
                        CASE
                            WHEN hours = 0 THEN total
                            ELSE round( total::numeric / hours::numeric, 2 )
                        END::float AS ph,
                        total::int as yearly
                        FROM
                        (
                            SELECT
                            (EXTRACT(days FROM last - first))::int AS days,
                            (Ceil(EXTRACT(days FROM last - first) / 7))::int AS weeks,
                            DATE_PART('month', AGE(last, first)) AS months,
                            (EXTRACT(EPOCH FROM last - first)/3600)::int AS hours,
                            (
                                SELECT
                                    count(*)
                                FROM vehicle_alarms va
                                WHERE time_resolved::DATE BETWEEN '{start}' AND '{end}'
                            ) AS total
                            FROM
                            (
                                SELECT
                                (
                                    SELECT
                                    time
                                    FROM vehicle_alarms va
                                    WHERE time_resolved::DATE BETWEEN '{start}' AND '{end}'
                                    ORDER BY time ASC
                                    LIMIT 1
                                ) AS first,
                                (
                                    SELECT
                                    time
                                    FROM vehicle_alarms va
                                    WHERE time_resolved::DATE BETWEEN '{start}' AND '{end}'
                                    ORDER BY time DESC
                                    LIMIT 1
                                ) AS last
                            ) AS temp
                        ) AS base
                ";

                result = await conn.QueryFirstAsync<(int Days, int Weeks, int Months, int Hours, int Daily, int Weekly, int Monthly, int Ph, int Yearly)>(sql);
            }
            return result;
        }

        public Func<string, string, Task<dynamic[]>> BuildQueryDuration(string section, string start, string end)
            => async (subsection, value) =>
            {
                var filter = GetFilter(section, start, end);

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
                                    FROM vehicle_alarms
                                    WHERE
                                        time_resolved::DATE BETWEEN days AND days
                                        {SubFilter(subsection, value)}
                                ) AS avg,
                                (
                                    SELECT count(*)
                                    FROM vehicle_alarms
                                    WHERE
                                        time_resolved::DATE BETWEEN days AND days
                                        {SubFilter(subsection, value)}
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
                            from vehicle_alarms
                            where
                                time_resolved::date between '{startStr}' and '{endStr}' and
                                {_filter(subsection, value)}
                        ";
                    }

                    var queryTaskList = durationList.Select(async (startEnd) =>
                    {
                        using var conn = ConnectTrack();
                        return await conn.QueryFirstAsync(queryStr(startEnd));
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

        public async Task<dynamic[]> QuerySections(string section, string selectedItem, string start, string end)
        {
            var filter = GetFilter(section, start, end);
            var sectionList = GetSubsection(section, "alarm");
            // var sectionList = new[] { "vehicle", "alarm", "segment" };

            async Task<dynamic[]> Query(string key, string subsection = "", string value = "")
            {
                dynamic[] result;
                using (var conn = ConnectTrack())
                {
                    var sql = $@"
                        select
                        {this.GetName(key)} as label,
                        count(*)::int,
                        {_avgEpochPerHour} as avg
                        from vehicle_alarms
                        where {filter(subsection, value)} and {GetColumnFromDic(key)} is not null
                        group by {GetColumnFromDic(key)}
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
                        return $" time_resolved::DATE BETWEEN '{start}' AND '{end}' ";
                    case "duration":
                        var strs = value.Split("_");
                        var startStr = strs[0];
                        var endStr = strs[1];
                        return $" time_resolved::DATE BETWEEN '{startStr}' AND '{endStr}' ";
                    default:
                        return $@" 
                            time_resolved::DATE BETWEEN '{start}' AND '{end}'
                            {SubFilter(key, value)}
                        ";
                }
            };

        private string SubFilter(string? key, string value) => key switch
        {
            "overview" => "",
            "duration" => "",
            _ => !string.IsNullOrEmpty(value) ? $" AND {GetColumnFromDic(key)} = '{value}'" : ""
        };

        private string? GetName(string? key)
        {
            switch (key)
            {
                case "source":
                case "dest":
                    return $@"
                    (
                        CASE
                            WHEN SUBSTRING({GetNameFromDic(key)}, 1, 1) = 's'
                            THEN(
                                SELECT logical_id FROM stations WHERE id = CAST(substring({GetNameFromDic(key)}, 2) AS numeric)
                            )
                            WHEN SUBSTRING({GetNameFromDic(key)}, 1, 1) = 'b'
                            THEN(
                                SELECT logical_id FROM buffers WHERE id = CAST(substring({GetNameFromDic(key)}, 2) AS numeric)
                            )
                        END
                    )
                    ";
                case "alarm":
                    return $@"
                    (
                        select description
                        from vehicle_errors
                        where id = error_code
                    )
                    ";
                case "segment":
                    return $@"
                    (
                        select logical_id
                        from segments
                        where start_point = current::int
                        limit 1
                    )
                    ";
                case "vehicle":
                    return $@"
                        (
                            SELECT logical_id
                            FROM vehicles
                            WHERE id = vehicle_id
                        )
                        ";
                default:
                    return null;
            }
        }
    }
}