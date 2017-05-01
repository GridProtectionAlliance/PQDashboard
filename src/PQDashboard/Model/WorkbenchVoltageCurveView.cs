using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;
using GSF.ComponentModel.DataAnnotations;

namespace PQDashboard.Model
{
    [PrimaryLabel("Name")]
    [TableName("WorkbenchVoltageCurveView")]
    public class WorkbenchVoltageCurveView
    {
        public int ID { get; set; }
        public string Name { get; set; }

        [PrimaryKey(true)]
        public int CurvePointID { get; set; }

        public double PerUnitMagnitude { get; set; }
        public double DurationSeconds { get; set; }
        public int LoadOrder { get; set; }
        public bool Visible { get; set; }
    }
}