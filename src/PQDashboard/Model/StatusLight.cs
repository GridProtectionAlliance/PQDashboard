using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PQDashboard.Model
{
    public class StatusLight
    {
        public string DeviceAcronym { get; set; }
        public DateTime Timestamp { get; set; }
        public bool GoodData { get; set; }
    }
}
