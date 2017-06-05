using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    public class FaultNote
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int FaultSummaryID { get; set; }
        public string Note { get; set; }
        public Guid UserAccountID { get; set; }
        public DateTime TimeStamp { get; set; }
    }

    public class EventNote
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int EventID { get; set; }
        public string Note { get; set; }
        public string UserAccount { get; set; }
        public DateTime TimeStamp { get; set; }
    }

}