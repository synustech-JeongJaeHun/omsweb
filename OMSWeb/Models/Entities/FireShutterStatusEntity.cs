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

    }
}