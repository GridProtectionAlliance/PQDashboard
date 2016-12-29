using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("MeterLocationsEventView")]
    public class MeterLocationsEventView
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string Name { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public int Event_Count { get; set; }
        public int Interruption { get; set; }
        public int Fault { get; set; }
        public int Sag { get; set; }
        public int Transient { get; set; }
        public int Swell { get; set; }
        public int Other { get; set; }
    }
}