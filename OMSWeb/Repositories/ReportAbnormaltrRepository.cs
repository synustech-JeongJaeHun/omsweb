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
    public class ReportAbnormaltrRepository : DataAccess
    {
        public ReportAbnormaltrRepository(IConfiguration configuration) : base(configuration) { }

        public async Task<object> QueryStatsAggregatedByTotalTimeSpan(string start, string end)
        {
            (int Days, int Weeks, int Months, int Hours, int Daily, int Weekly, int Monthly, int Ph, int Yearly, int Total) result;
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
                        total::int as yearly,
                    total::int
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
                            FROM total_all_orders oh
                            WHERE time_aborted IS NOT NULL
                                AND time_modified::DATE BETWEEN '{start}' AND '{end}'
                        ) AS total
                        FROM
                        (
                            SELECT
                            (
                                SELECT
                                time_modified
                                FROM total_all_orders
                                WHERE time_modified::DATE BETWEEN '{start}' AND '{end}'
                                ORDER BY time_modified ASC
                                LIMIT 1
                            ) AS first,
                            (
                                SELECT
                                time_modified
                                FROM total_all_orders
                                WHERE time_modified::DATE BETWEEN '{start}' AND '{end}'
                                ORDER BY time_modified DESC
                                LIMIT 1
                            ) AS last
                        ) AS temp
                    ) AS base
                ";

                result = await conn.QueryFirstAsync<(int Days, int Weeks, int Months, int Hours, int Daily, int Weekly, int Monthly, int Ph, int Yearly, int Total)>(sql);
            }
            return new
            {
                Total = result.Total,
                Avg = new
                {
                    Ph = result.Ph,
                    Daily = result.Daily,
                    Weekly = result.Weekly,
                    Monthly = result.Monthly,
                    Yearly = result.Yearly
                }
            };
        }

        private string SubFilter(string? key, string value) => key switch
        {
            "overview" => "",
            "duration" => "",
            _ => !string.IsNullOrEmpty(value) ? $" AND {GetColumnFromDic(key)} = '{value}'" : ""
        };

        private Func<string, string, string> GetFilter(string? section, string start, string end) =>
            (key, value) =>
            {
                switch (section)
                {
                    case "overview":
                        return $"time_aborted::DATE BETWEEN '{start}' AND '{end}'";
                    case "duration":
                        var strs = value.Split("_");
                        var startStr = strs[0];
                        var endStr = strs[1];
                        return $"time_aborted::DATE BETWEEN '{startStr}' AND '{endStr}'";
                    default:
                        return $"time_aborted::DATE BETWEEN '{start}' AND '{end}'{SubFilter(key, value)}";
                }
            };

        public Func<string, string, Task<dynamic[]>> BuildQueryDuration(string section, string start, string end)
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
                        count(*)::int as failureAmount,
                        0 as dest,
                        0 as source,
                        count(*)::int as abort,
                        0 as cancel
                                FROM total_orders oh
                                WHERE
                        time_aborted is not null and
                                    time_aborted::DATE BETWEEN days AND days
                                    {SubFilter(subsection, value)}
                            )
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
                            count(*)::int as failureAmount,
                    0 as dest,
                    0 as source,
                    count(*)::int as abort,
                    0 as cancel
                            from total_orders
                            where time_aborted is not null and {_filter(subsection, value)}
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
                        count(*)::int as failureAmount,
                0 as dest,
                0 as source,
                count(*)::int as abort,
                0 as cancel
                        FROM total_orders
                        WHERE time_aborted is not null and {filter(subsection, value)}
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
    }
}