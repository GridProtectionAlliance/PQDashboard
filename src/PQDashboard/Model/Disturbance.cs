using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    public class Disturbance
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int EventID { get; set; }
        public int EventTypeID { get; set; }
        public int PhaseID { get; set; }
        public float Magnitude { get; set; }
        public float PerUnitMagnitude { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public float DurationSeconds { get; set; }
        public float DurationCycles { get; set; }
        public int StartIndex { get; set; }
        public int EndIndex { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class DisturbanceView
    {
        [PrimaryKey(true)]
        [Searchable]
        public int ID { get; set; }
        [Searchable]
        public int EventID { get; set; }
        public int EventTypeID { get; set; }
        public int PhaseID { get; set; }
        public float Magnitude { get; set; }
        public float PerUnitMagnitude { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public float DurationSeconds { get; set; }
        public float DurationCycles { get; set; }
        public int StartIndex { get; set; }
        public int EndIndex { get; set; }
        public int MeterID { get; set; }
        public int LineID { get; set; }
        public int? SeverityCode { get; set; }
        [Searchable]
        public string MeterName { get; set; }
        public string PhaseName { get; set; }

    }

    public class DisturbancesForDay : DisturbanceView { }

    [TableName("DisturbanceView")]
    public class DisturbancesForMeter : DisturbanceView { }
}