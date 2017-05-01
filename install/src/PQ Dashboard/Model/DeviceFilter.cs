using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    public class DeviceFilter
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string UserAccount { get; set; }
        public string Name { get; set; }
        public string FilterExpression { get; set; }
        public int MeterGroupID { get; set; }
    }
}