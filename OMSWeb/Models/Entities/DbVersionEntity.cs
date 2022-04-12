using System;

namespace OMSWeb.Models.Entities
{
    public class DbVersionEntity
    {
        public string DbName { get; set; }
        public int DbVersion { get; set; }
        public string SrcMapFile { get; set; }
    }
}