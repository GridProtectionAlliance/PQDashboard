using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    public class MeterActivity: Meter
    {
        [PrimaryKey(true)]
        public int Events24Hours { get; set; }
        public int FileGroups24Hours { get; set; }

        public int Events7Days { get; set; }
        public int FileGroups7Days { get; set; }

        public int Events30Days { get; set; }
        public int FileGroups30Days { get; set; }

        public int Events90Days { get; set; }
        public int FileGroups90Days { get; set; }

        public int Events180Days { get; set; }
        public int FileGroups180Days { get; set; }

        public int FirstEventID { get; set; }
    }
}