using System;
using System.Linq;

#nullable enable

namespace OMSWeb.Repositories
{
    public static class ReportRepositoryShared
    {
        public static string? GetColumnFromDic(string? key) => key switch
        {
            "vehicle" => "vehicle_id",
            "source" => "location_pickup",
            "dest" => "location_dropoff",
            "alarm" => "error_code",
            "segment" => "current",
            _ => null
        };

        public static string? GetNameFromDic(string? key) => key switch
        {
            "vehicle" => "vehicle",
            "source" => "source",
            "dest" => "dest",
            "alarm" => "alarm",
            "segment" => "segment",
            _ => null
        };

        public static string? GetName(string? key)
        {
            switch (key)
            {
                case "source":
                case "dest":
                    var column = GetColumnFromDic(key);
                    return $@"
                       (
                            CASE
                                WHEN SUBSTRING({GetColumnFromDic(key)}, 1, 1) = 's'
                                THEN (
                                    SELECT logical_id FROM stations WHERE id = CAST(substring({GetColumnFromDic(key)}, 2) AS numeric)
                                )
                                WHEN SUBSTRING({GetColumnFromDic(key)}, 1, 1) = 'b'
                                THEN (
                                    SELECT logical_id FROM buffers WHERE id = CAST(substring({GetColumnFromDic(key)}, 2) AS numeric)
                                )
                            END
                        )
                       ";
                case "vehicle":
                    return @"
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

        public static DateTime EndOfMonth(DateTime dateTime)
            => new DateTime(dateTime.Year, dateTime.Month, DateTime.DaysInMonth(dateTime.Year, dateTime.Month));
        public static DateTime StartOfMonth(DateTime dateTime)
            => new DateTime(dateTime.Year, dateTime.Month, 1);

        public static string[][] GetDurationStr(string _start, string _end)
        {
            var start = DateTime.Parse(_start);
            var end = DateTime.Parse(_end);

            int getDiffMonth(DateTime start, DateTime end) => (end.Year * 12 + end.Month) - (start.Year * 12 + start.Month);
            string[] makeDateForms(DateTime[] days) => days.Select(d => d.ToString("yyyy-MM-dd")).ToArray();

            var monthDiff = getDiffMonth(start, end);
            var sameMonth = start.Month == end.Month;

            if (sameMonth)
            {
                return new[] { makeDateForms(new[] { start, end }) };
            }

            if (monthDiff < 2)
            {
                var firstMon = new[] { start, EndOfMonth(start) };
                var endMon = new[] { StartOfMonth(end), end };
                return new[] { makeDateForms(firstMon), makeDateForms(endMon) };
            }

            if (sameMonth)
            {
                return new[] { makeDateForms(new[] { start, end }) };
            }

            if (monthDiff < 2)
            {
                var firstMon = new[] { start, EndOfMonth(start) };
                var endMon = new[] { StartOfMonth(end), end };
                return new[] { makeDateForms(firstMon), makeDateForms(endMon) };
            }

            // 2개월 이상 차이 나는 경우
            var mList = Enumerable.Range(start.Month + 1, monthDiff)
                .Select(m => (start.Month + m) % 12 + 1)
                .Prepend(start.Month).ToArray();
            return mList.Select((mon, idx) =>
            {
                if (idx == 0)
                {
                    return makeDateForms(new[] { start, EndOfMonth(start) });
                }
                else if (idx == mList.Length - 1)
                {
                    return makeDateForms(new[] { EndOfMonth(end), end });
                }
                else
                {
                    var startCopy = start;
                    var temp = startCopy.AddMonths(idx);
                    return makeDateForms(new[] { StartOfMonth(temp), EndOfMonth(temp) });
                }
            }).ToArray();
        }

        public static (string label, string startStr, string endStr) GetDurationLabel(string[] arr)
        {
            var start = DateTime.Parse(arr[0]);
            var end = DateTime.Parse(arr[1]);

            var month = start.ToString("M월");
            var startDay = start.Day.ToString();
            var endDay = end.Day.ToString();
            var isSameStart = StartOfMonth(start).Day == start.Day;
            var isSameEnd = EndOfMonth(end).Day == end.Day;
            var label = isSameStart && isSameEnd ? month : $"{month}({startDay}~{endDay})";

            return (label, arr[0], arr[1]);
        }
    }
}