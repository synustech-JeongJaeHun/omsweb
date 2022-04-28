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
    public class ReportNormaltrRepository : DataAccess
    {
        public ReportNormaltrRepository(IConfiguration configuration) : base(configuration) { }

        private readonly string _avgEpochPerHour = @"
            COALESCE(
                TRUNC(
                    (extract(epoch from avg(time_completed - time_created)) / 3600)::numeric, 2
                )::float,
                0
            )";

        public async Task<(int Min, int Max, int Devn, int Avg, int Total)> QueryOrdersStatsAggregatedByTotalTimeSpan(string start, string end)
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
                        FROM orders
                        WHERE time_completed IS NOT NULL
                            AND time_completed::DATE BETWEEN '{start}' AND '{end}'
                    ) AS a
                ";

                result = await conn.QueryFirstAsync<(int Min, int Max, int Devn, int Avg, int Total)>(sql);
            }
            return result;
        }
        public async Task<(int Days, int Weeks, int Months, int Hours, int Daily, int Weekly, int Monthly, int Ph, int Yearly)> QueryOrdersStatsAggregatedByEachTimeSpans(string start, string end)
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
                            ELSE total / hours
                        END::int AS ph,
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
                                FROM orders oh
                                WHERE time_completed IS NOT NULL
                                    AND time_completed::DATE BETWEEN '{start}' AND '{end}'
                            ) AS total
                            FROM
                            (
                                SELECT
                                (
                                    SELECT
                                    time_completed
                                    FROM orders
                                    WHERE time_completed IS NOT NULL
                                    AND time_completed::DATE BETWEEN '{start}' AND '{end}'
                                    ORDER BY time_completed ASC
                                    LIMIT 1
                                ) AS first,
                                (
                                    SELECT
                                    time_completed
                                    FROM orders
                                    WHERE time_completed IS NOT NULL
                                    AND time_completed::DATE BETWEEN '{start}' AND '{end}'
                                    ORDER BY time_completed DESC
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
                                    FROM orders oh
                                    WHERE
                                        time_completed::DATE BETWEEN days AND days
                                        {SubFilter(subsection, value)}
                                ) AS avg,
                                (
                                    SELECT count(*)
                                    FROM orders oh
                                    WHERE
                                        time_completed::DATE BETWEEN days AND days
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
                        return $@"
                            select
                            '{label}' as label,
                            count(*)::int,
                            {_avgEpochPerHour} as avg,
                            '{startStr}' as start_day,
                            '{endStr}' as end_day
                            from orders
                            where time_completed::date between '{startStr}' and '{endStr}'
                            {filter(subsection, value)}
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
                        FROM orders
                        WHERE
                            time_completed IS NOT NULL
                            {filter(subsection, value)}
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
                        return $" AND time_completed BETWEEN '{start}' AND '{end}'";
                    case "duration":
                        var strs = value.Split("_");
                        var startStr = strs[0];
                        var endStr = strs[1];
                        return $" AND time_completed::DATE BETWEEN '{startStr}' AND '{endStr}'";
                    default:
                        return $" AND time_completed::DATE BETWEEN '{start}' AND '{end}'{SubFilter(key, value)}";
                }
            };

        private string SubFilter(string? key, string value) => key switch
        {
            "overview" => "",
            "duration" => "",
            _ => !string.IsNullOrEmpty(value) ? $" AND {GetColumnFromDic(key)} = '{value}'" : ""
        };
    }
}