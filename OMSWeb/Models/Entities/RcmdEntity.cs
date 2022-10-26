using System;

namespace OMSWeb.Models.Entities
{
    public class RcmdEntity : IIntId
    {
        public int Id { get; set; }
        public string Rcmd { get; set; }
        public string Request { get; set; }
        public string CommandID { get; set; }
        public DateTime ModifiedTime { get; set; }
        public string Origin { get; set; }
        public string SourceName { get; set; }
        public string DestName { get; set; }
        public string CarrierID { get; set; }
        public string NewCarrierID { get; set; }
        public string CarrierLoc { get; set; }
        public int Nack { get; set; }
        public string NackReason { get; set; }
        public string NackParam { get; set; }
    }

    public class RcmdHistoryEntity : RcmdEntity
    {

    }

    public class NackHistoryEntity : RcmdEntity
    {
        
    }
}