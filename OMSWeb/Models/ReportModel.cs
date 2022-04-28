namespace OMSWeb.Models
{
    public class ReportLabel
    {
        public string Id { get; set; }
        public string Label { get; set; }
    }

    public class ReportRequestStats
    {
        public string Variant { get; set; }
    }

    public class ReportRequestCharts
    {
        // normaltr, abnormaltr, alarm
        public string Variant { get; set; }
        // overview, duration, vehicle, source, dest
        public string Section { get; set; }
        // duration일 경우 1월, 2월 | 나머지는 vehicle명, source명, dest명
        public string Selected_Item { get; set; } = "";
        // '2022-03-15' 시작일
        public string Start { get; set; }
        // '2022-03-16' 종료일
        public string End { get; set; }
    }
}