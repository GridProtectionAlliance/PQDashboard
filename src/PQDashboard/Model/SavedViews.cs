using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    public class SavedViews
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string Name { get; set; }
        public string UserAccount { get; set; }
        public int DateRange { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string Tab { get; set;}
        public int DeviceFilterID { get; set; }
        public string MapGrid { get; set; }
        public bool IsDefault { get; set; }
    }
}