using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("Event")]
    public class Event
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int FileGroupID { get; set; }
        public int MeterID { get; set; }
        public int LineID { get; set; }
        public int EventTypeID { get; set; }
        public int EventDataID { get; set; }
        public string Name { get; set; }
        public string Alias { get; set; }
        public string ShortName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Samples { get; set; }
        public int TimeZoneOffset { get; set; }
        public int SamplesPerSecond { get; set; }
        public int SamplesPerCycle { get; set; }
        public string Description { get; set; }
        public string UpdatedBy { get; set; }
    }

    [TableName("Event")]
    public class EventIDs
    {
        public int ID { get; set; }
    }
    [TableName("EventView")]
    public class EventForDate: EventView { }

    [TableName("EventView")]
    public class EventForDay : EventView { }

    [TableName("EventView")]
    public class EventView
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int FileGroupID { get; set; }
        public int MeterID { get; set; }
        public int LineID { get; set; }
        public int EventTypeID { get; set; }
        public int EventDataID { get; set; }
        public string Name { get; set; }
        public string Alias { get; set; }
        public string ShortName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Samples { get; set; }
        public int TimeZoneOffset { get; set; }
        public int SamplesPerSecond { get; set; }
        public int SamplesPerCycle { get; set; }
        public string Description { get; set; }
        [Searchable]
        public string LineName { get; set; }
        [Searchable]
        public string MeterName { get; set; }
        public string StationName { get; set; }
        public double Length { get; set; }
        [Searchable]
        public string EventTypeName { get; set; }
    }
}