using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("DashSettings")]
    public class DashSettings
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public bool Enabled { get; set; }

    }

    [TableName("USerDashSettings")]
    public class UserDashSettings: DashSettings
    {
        [Label("User Account")]
        public Guid UserAccountID { get; set; }
    }
}