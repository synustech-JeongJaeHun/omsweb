using System;

namespace OMSWeb.Models.Entities
{
    public class AlertEntity
    {
        public int Id { get; set; }
        public DateTime Time { get; set; }
        public int Level { get; set; }
        public string Tag { get; set; }
        public string Message { get; set; }
        public DateTime? AckTime { get; set; }
        public string AckBy { get; set; }
        public int RowIndex { get; set; }
    }

    public class AlertHistory : AlertEntity
    {
  
    }
}
