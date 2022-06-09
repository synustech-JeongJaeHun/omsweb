using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb.Models.Entities
{
    public class SettingModeEntity
    {
        public int home_mode { get; set; }
        public int chain_manual_command_disabled { get; set; }
    }
}