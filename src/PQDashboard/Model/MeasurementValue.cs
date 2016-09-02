using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PQDashboard.Model
{
    public class MeasurementValue
    {
        public Double Timestamp { get; set; }
        public Double Value { get; set; }
        public Guid ID { get; set; }
    }
}
