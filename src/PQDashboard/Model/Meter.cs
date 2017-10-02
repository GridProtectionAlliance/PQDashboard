using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("Meter")]
    public class Meter
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string AssetKey { get; set; }
        public int MeterLocationID { get; set; }
        public string Name { get; set; }
        public string Alias { get; set; }
        public string ShortName { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string TimeZone { get; set; }
        public string Description { get; set; }
    }
}