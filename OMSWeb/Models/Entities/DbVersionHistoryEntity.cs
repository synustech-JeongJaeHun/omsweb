using System;

namespace OMSWeb.Models.Entities
{
    public class DbVersionHistoryEntity
    {
        public string DbName { get; set; }
        public int DbVersion { get; set; }
        public string SrcMapFile { get; set; }
        public DateTime TimeModified { get; set; }
        public string Contents { get; set; }
        public int Id { get; set; }
        public DateTime HistoryChangeTime { get; set; }
        public string HistoryChangeType { get; set; }
        public int HistorySourceId { get; set; }
    }
}