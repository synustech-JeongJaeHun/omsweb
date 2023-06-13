using System;

namespace OMSWeb.Models.Entities
{
    public class FireShutterStatusEntity
    {
        public int Id { get; set; }

        public string logicalId { get; set; }

        public string segments { get; set; }

        public int status { get; set; }

        public string statusMsg { get; set; }
        
        public string user { get; set; }
        public string note { get; set; }
        public int fireDetect { get; set; }
        public int open { get; set; }
    }
}