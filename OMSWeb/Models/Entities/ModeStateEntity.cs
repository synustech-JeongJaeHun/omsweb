using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
    public class ModeStateEntity
    {
        public int comm_state { get; set; }
        public int control_state { get; set; }
        public int on_offline_state { get; set; }
        public int tsc_state { get; set; }
        public int pm_state { get; set; }
        public int ai_mode { get; set; }
    }
}