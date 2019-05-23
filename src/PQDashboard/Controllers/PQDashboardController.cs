//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
using FaultData.DataAnalysis;
using GSF;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.NumericalAnalysis;
using GSF.Security;
using GSF.Web;
using GSF.Web.Model;
using MathNet.Numerics.IntegralTransforms;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace PQDashboard.Controllers
{
    public class PQDashboardController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static PQDashboardController()
        {
            s_memoryCache = new MemoryCache("PQDashboard");
        }
        #endregion

        #region [ Methods ]

        #region [ Meter Activity Page ]
        [HttpGet]
        public DataTable GetMostActiveMeterActivityData()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int numberOfResults = int.Parse(query["numresults"]);
                string column = query["column"];
                switch (column)
                {
                    case "24Hours": column = "24Hours"; break;
                    case "7Days": column = "7Days"; break;
                    case "30Days": column = "30Days"; break;
                    default: column = "AssetKey"; break;
                }

                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                    DECLARE @startTime DateTime2 = GetDate();

                    with cte as (
                    SELECT	Meter.AssetKey, 
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS Events24Hours,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-1,@StartTime)) AS FileGroups24Hours,
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime))  AS Events7Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-7,@StartTime)) AS FileGroups7Days,                                                       
		                    (SELECT COUNT(ID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime)) AS Events30Days,
		                    (SELECT COUNT(DISTINCT FileGroupID) FROM Event WHERE Event.MeterID = Meter.ID AND StartTime <= @StartTime AND StartTime >= DATEADD(DAY,-30,@StartTime))AS FileGroups30Days,                                                     
                            (SELECT TOP 1 ID FROM Event WHERE MeterID = Meter.ID AND StartTime <= @StartTime ORDER BY StartTime, ID) AS FirstEventID
                    FROM	
	                    Meter
                    )
                    SELECT TOP " + numberOfResults + @"
	                    AssetKey, 
	                    Cast(FileGroups24Hours as varchar(max)) + ' ( ' +Cast(Events24Hours as varchar(max)) + ' )' as [24Hours],
	                    Cast(FileGroups7Days as varchar(max)) + ' ( ' +Cast(Events7Days as varchar(max)) + ' )' as [7Days],
	                    Cast(FileGroups30Days as varchar(max)) + ' ( ' +Cast(FileGroups7Days as varchar(max)) + ' )' as [30Days]
                    FROM cte
                    ORDER BY FileGroups" + column + " DESC";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }
        #endregion

        #region [ Event Search Page ]

        public class EventSearchPostData {
            public bool dfr { get; set; }
            public bool pqMeter { get; set; }
            public bool g500 { get; set; }
            public bool one62to500 { get; set; }
            public bool seventyTo161 { get; set; }
            public bool l70 { get; set; }
            public bool faults { get; set; }
            public bool sags { get; set; }
            public bool swells { get; set; }
            public bool interruptions { get; set; }
            public bool breakerOps { get; set; }
            public bool transients { get; set; }
            public bool others { get; set; }
            public string date { get; set; }
            public string time { get; set; }
            public int windowSize { get; set; }
            public int timeWindowUnits { get; set; }

        }

        enum TimeWindowUnits {
            Millisecond,
            Second,
            Minute,
            Hour,
            Day,
            Week,
            Month,
            Year
        }

        [HttpPost]
        public DataTable GetEventSearchData(EventSearchPostData postData)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DateTime dateTime = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();
                List<string> eventTypes = new List<string>();

                if (postData.faults)
                    eventTypes.Add(" (EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) = 0) ");
                if (postData.breakerOps)
                    eventTypes.Add(" (EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) > 0) ");
                if (postData.sags)
                    eventTypes.Add("EventType.Name  = 'Sag'");
                if (postData.swells)
                    eventTypes.Add("EventType.Name  = 'Swell'");
                if (postData.interruptions)
                    eventTypes.Add("EventType.Name  = 'Interruption'");
                if (postData.transients)
                    eventTypes.Add("EventType.Name  = 'Transient'");
                if (postData.others)
                    eventTypes.Add("EventType.Name  = 'Other'");
                if (!eventTypes.Any())
                    eventTypes.Add("EventType.Name  = ''");

                string eventTypeRestriction = $"({string.Join(" OR ", eventTypes)})";

                List<string> voltageClasses = new List<string>();

                if (postData.g500)
                    voltageClasses.Add(" Line.VoltageKV > 500 ");
                if (postData.one62to500)
                    voltageClasses.Add(" (Line.VoltageKV > 161 AND Line.VoltageKV <= 500) ");
                if (postData.seventyTo161)
                    voltageClasses.Add(" (Line.VoltageKV >= 70 AND Line.VoltageKV <= 161) ");
                if (postData.l70)
                    voltageClasses.Add(" Line.VoltageKV < 70 ");
                if (!voltageClasses.Any())
                    voltageClasses.Add(" Line.VoltageKV = -1234567 ");

                string voltageClassRestriction = $"({string.Join(" OR ", voltageClasses)})";

                List<string> meterType = new List<string>();

                if (postData.dfr)
                    meterType.Add(" (SELECT COUNT(LineID) FROM MeterLine as ml WHERE event.MeterID = ml.MeterID) > 1 ");
                if (postData.pqMeter)
                    meterType.Add(" (SELECT COUNT(LineID) FROM MeterLine as ml WHERE event.MeterID = ml.MeterID) = 1 ");
                if (!meterType.Any())
                    meterType.Add(" (SELECT COUNT(LineID) FROM MeterLine as ml WHERE event.MeterID = ml.MeterID) < 1 ");

                string meterTypeRestriction = $"({string.Join(" OR ", meterType)})";

                string query = @" 

                    SELECT
                        Event.ID as EventID,
	                    MeterLine.LineName as AssetName,
	                    'Line' as AssetType,
	                    Line.VoltageKV as VoltageClass,
	                    EventType.Name as EventType,
	                    Event.StartTime as FileStartTime,
	                    (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) as BreakerOperation
                    FROM
	                    Event JOIN
	                    MeterLine ON Event.MeterID = MeterLine.MeterID AND Event.LineID = MeterLine.LineID JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Line ON Event.LineID = Line.ID
                    WHERE
                        Event.StartTime BETWEEN DATEADD(" + timeWindowUnits + @", " + (-1*postData.windowSize).ToString() + @", {0}) AND
                                                DATEADD(" + timeWindowUnits + @", " + (postData.windowSize).ToString() + @", {0}) AND
                    " + eventTypeRestriction + @" AND
                    " + voltageClassRestriction + @" AND
                    " + meterTypeRestriction + @"
                ";

                DataTable table = connection.RetrieveData(query, dateTime) ;

                return table;               
            }

        }

        [HttpGet]
        public DataTable GetEventSearchAssetVoltageDisturbances()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT 
	                    EventType.Name as EventType,
	                    Phase.Name as Phase,
	                    Disturbance.PerUnitMagnitude,
	                    Disturbance.DurationSeconds,
	                    Disturbance.StartTime
                    FROM 
	                    Disturbance JOIN
	                    Phase ON Disturbance.PhaseID = Phase.ID JOIN
	                    EventType ON Disturbance.EventTypeID = EventType.ID
                    WHERE
	                    Phase.Name != 'WORST' AND  
	                    eventid = {0}"
                        , eventID
                    );

                return table;
            }

        }

        [HttpGet]
        public DataTable GetEventSearchFaultSegments()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT
	                    SegmentType.Name as SegmentType, 
	                    FaultSegment.StartTime,
	                    FaultSegment.EndTime
                    FROM
	                    FaultSegment JOIN
	                    SegmentType ON FaultSegment.SegmentTypeID = SegmentType.ID	                    
                    WHERE
                        eventid = {0} AND
                        SegmentType.Name != 'Fault'"
                        , eventID
                    );

                return table;
            }

        }

        [HttpGet]
        public DataTable GetEventSearchHistory()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT
	                    EventType.Name as EventType,
	                    Event.StartTime,
	                    Event.ID
                    FROM
	                    Event JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Event as OrgEvt ON Event.MeterID = OrgEvt.MeterID AND Event.LineID = OrgEvt.LineID AND Event.ID != OrgEvt.ID
                    WHERE 
	                    OrgEvt.ID = {0}"
                    , eventID);

                return table;
            }

        }





        #endregion

        #region [ Old Main Dashboard ]
        #endregion

        public class DetailtsForSitesForm {
            public string siteId { get; set; }
            public string targetDate { get; set; }
            public string userName { get; set; }
            public string tab { get; set; }
            public string colorScale { get; set; }
            public string context { get; set; }
        }

        [HttpPost]
        public DataTable GetDetailsForSites(DetailtsForSitesForm form)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart'"));
                List<UserDashSettings> userDashSettings = new TableOperations<UserDashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", form.userName)).ToList();
                DateTime date = DateTime.Parse(form.targetDate).ToUniversalTime();
                Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                foreach (DashSettings setting in dashSettings)
                {
                    var index = userDashSettings.IndexOf(x => x.Name == setting.Name && x.Value == setting.Value);
                    if (index >= 0)
                    {
                        setting.Enabled = userDashSettings[index].Enabled;
                    }

                    if (!disabledFileds.ContainsKey(setting.Value))
                        disabledFileds.Add(setting.Value, setting.Enabled);

                }

                string thedata = "";
                DataTable table = new DataTable();


                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = "dbo.selectSites" + form.tab + "DetailsByDate";
                    sc.CommandType = CommandType.StoredProcedure;
                    IDbDataParameter eventDateFrom = sc.CreateParameter();
                    eventDateFrom.ParameterName = "@EventDate";
                    eventDateFrom.Value = date;
                    sc.Parameters.Add(eventDateFrom);
                    IDbDataParameter param3 = sc.CreateParameter();
                    param3.ParameterName = "@meterID";
                    param3.Value = form.siteId;
                    IDbDataParameter param4 = sc.CreateParameter();
                    param4.ParameterName = "@username";
                    param4.Value = form.userName;
                    sc.Parameters.Add(param3);
                    sc.Parameters.Add(param4);

                    // Use next two fields only on Event based tabs that allow context picking.
                    List<string> tabList = new List<string> { "Events", "Disturbances", "Faults", "Breakers", "Extensions" };
                    if (tabList.Contains(form.tab))
                    {
                        IDbDataParameter param5 = sc.CreateParameter();
                        param5.ParameterName = "@context";
                        param5.Value = form.context;
                        sc.Parameters.Add(param5);
                    }
                    else if (form.tab == "TrendingData")
                    {
                        IDbDataParameter param5 = sc.CreateParameter();
                        param5.ParameterName = "@colorScaleName";
                        param5.Value = form.colorScale;
                        sc.Parameters.Add(param5);
                    }
                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);
                }


                List<string> skipColumns;
                if (form.tab == "Events" || form.tab == "Disturbances") skipColumns = new List<string>() { "EventID", "MeterID", "Site" };
                else skipColumns = table.Columns.Cast<DataColumn>().Select(x => x.ColumnName).ToList();


                List<string> columnsToRemove = new List<string>();
                foreach (DataColumn column in table.Columns)
                {
                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                    {
                        disabledFileds.Add(column.ColumnName, true);
                        new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "Chart", column.ColumnName, true);
                    }


                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds[column.ColumnName])
                    {
                        columnsToRemove.Add(column.ColumnName);
                    }

                }
                foreach (string columnName in columnsToRemove)
                {
                    table.Columns.Remove(columnName);
                }


                return table;

            }

        }

        public class EventSet
        {
            public DateTime StartDate;
            public DateTime EndDate;
            public class EventDetail
            {
                public string Name;
                public List<Tuple<DateTime, int>> Data;
                public string Color;
                public EventDetail()
                {
                    Data = new List<Tuple<DateTime, int>>();
                }
            }
            public List<EventDetail> Types;

            public EventSet()
            {
                Types = new List<EventDetail>();
            }
        }

        public class DataForPeriodForm {
            public string siteID { get; set; }
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            public string userName { get; set; }
            public string tab { get; set; }
            public string context { get; set; }
        }

        [HttpPost]
        public EventSet GetDataForPeriod(DataForPeriodForm form)
        {
            EventSet eventSet = new EventSet();
            string contextWord = "";
            if (form.context == "day")
            {
                eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                eventSet.EndDate = eventSet.StartDate.AddDays(1).AddSeconds(-1);
                contextWord = "Hour";
            }
            else if (form.context == "hour")
            {
                eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                eventSet.EndDate = eventSet.StartDate.AddHours(1).AddSeconds(-1);
                contextWord = "Minute";
            }
            else if (form.context == "minute" || form.context == "second")
            {
                eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                eventSet.EndDate = eventSet.StartDate.AddMinutes(1).AddSeconds(-1);
                contextWord = "Seconds";
            }
            else
            {
                eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                eventSet.EndDate = DateTime.Parse(form.targetDateTo).ToUniversalTime();
                contextWord = "DateRange";
            }
            Dictionary<string, string> colors = new Dictionary<string, string>();
            Random r = new Random(DateTime.UtcNow.Millisecond);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart'"));
                List<UserDashSettings> userDashSettings = new TableOperations<UserDashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", form.userName)).ToList();

                Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                foreach (DashSettings setting in dashSettings)
                {
                    var index = userDashSettings.IndexOf(x => x.Name == setting.Name && x.Value == setting.Value);
                    if (index >= 0)
                    {
                        setting.Enabled = userDashSettings[index].Enabled;
                    }

                    if (!disabledFileds.ContainsKey(setting.Value))
                        disabledFileds.Add(setting.Value, setting.Enabled);

                }

                IEnumerable<DashSettings> colorSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "ChartColors' AND Enabled = 1"));
                List<UserDashSettings> userColorSettings = new TableOperations<UserDashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "ChartColors' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", form.userName)).ToList();

                foreach (var color in colorSettings)
                {
                    var index = userColorSettings.IndexOf(x => x.Name == color.Name && x.Value.Split(',')?[0] == color.Value.Split(',')?[0]);
                    if (index >= 0)
                    {
                        color.Value = userColorSettings[index].Value;
                    }

                    if (colors.ContainsKey(color.Value.Split(',')[0]))
                        colors[color.Value.Split(',')[0]] = color.Value.Split(',')[1];
                    else
                        colors.Add(color.Value.Split(',')[0], color.Value.Split(',')[1]);
                }

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = "dbo.select" + form.tab + "ForMeterIDbyDateRange";
                    sc.CommandType = CommandType.StoredProcedure;
                    IDbDataParameter eventDateFrom = sc.CreateParameter();
                    eventDateFrom.ParameterName = "@EventDateFrom";
                    eventDateFrom.Value = eventSet.StartDate;
                    IDbDataParameter eventDateTo = sc.CreateParameter();
                    eventDateTo.ParameterName = "@EventDateTo";
                    eventDateTo.Value = eventSet.EndDate;
                    sc.Parameters.Add(eventDateFrom);
                    sc.Parameters.Add(eventDateTo);
                    IDbDataParameter param3 = sc.CreateParameter();
                    param3.ParameterName = "@MeterID";
                    param3.Value = form.siteID;
                    IDbDataParameter param4 = sc.CreateParameter();
                    param4.ParameterName = "@username";
                    param4.Value = form.userName;
                    sc.Parameters.Add(param3);
                    sc.Parameters.Add(param4);

                    // Use next two fields only on Event based tabs that allow context picking.
                    List<string> tabList = new List<string> { "Events", "Disturbances", "Faults", "Breakers", "Extensions" };
                    if (tabList.Contains(form.tab))
                    {
                        IDbDataParameter param5 = sc.CreateParameter();
                        param5.ParameterName = "@context";
                        param5.Value = form.context;
                        sc.Parameters.Add(param5);
                    }

                    IDataReader rdr = sc.ExecuteReader();
                    DataTable table = new DataTable();
                    table.Load(rdr);

                    try
                    {
                        foreach (DataRow row in table.Rows)
                        {
                            foreach (DataColumn column in table.Columns)
                            {
                                if (column.ColumnName != "thedate" && !disabledFileds.ContainsKey(column.ColumnName))
                                {
                                    disabledFileds.Add(column.ColumnName, true);
                                    new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "Chart", column.ColumnName, true);
                                }

                                if (column.ColumnName != "thedate" && disabledFileds[column.ColumnName])
                                {
                                    if (eventSet.Types.All(x => x.Name != column.ColumnName))
                                    {
                                        eventSet.Types.Add(new EventSet.EventDetail());
                                        eventSet.Types[eventSet.Types.Count - 1].Name = column.ColumnName;
                                        if (colors.ContainsKey(column.ColumnName))
                                            eventSet.Types[eventSet.Types.Count - 1].Color = colors[column.ColumnName];
                                        else
                                        {
                                            eventSet.Types[eventSet.Types.Count - 1].Color = "#" + r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                                            new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "ChartColors", column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color, true);
                                        }
                                    }
                                    eventSet.Types[eventSet.Types.IndexOf(x => x.Name == column.ColumnName)].Data.Add(Tuple.Create(Convert.ToDateTime(row["thedate"]), Convert.ToInt32(row[column.ColumnName])));
                                }
                            }
                        }

                        if (!eventSet.Types.Any())
                        {
                            foreach (DataColumn column in table.Columns)
                            {
                                if (column.ColumnName != "thedate" && !disabledFileds.ContainsKey(column.ColumnName))
                                {
                                    disabledFileds.Add(column.ColumnName, true);
                                    new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "Chart", column.ColumnName, true);
                                }

                                if (column.ColumnName != "thedate" && disabledFileds[column.ColumnName])
                                {
                                    if (eventSet.Types.All(x => x.Name != column.ColumnName))
                                    {
                                        eventSet.Types.Add(new EventSet.EventDetail());
                                        eventSet.Types[eventSet.Types.Count - 1].Name = column.ColumnName;
                                        if (colors.ContainsKey(column.ColumnName))
                                            eventSet.Types[eventSet.Types.Count - 1].Color = colors[column.ColumnName];
                                        else
                                        {
                                            eventSet.Types[eventSet.Types.Count - 1].Color = "#" + r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                                            new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "ChartColors", column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color, true);
                                        }
                                    }
                                }
                            }

                        }

                    }
                    finally
                    {
                        if (!rdr.IsClosed)
                        {
                            rdr.Close();
                        }
                    }
                }
                return eventSet;

            }
        }

        public class MagDurData
        {
            public int EventID { get; set; }
            public double DurationSeconds { get; set; }
            public double PerUnitMagnitude { get; set; }
        }

        public class VoltageMagnitudeDataForm {
            public string meterIds { get; set; }
            public string startDate { get; set; }
            public string endDate { get; set; }
            public string context { get; set; }
        }

        [HttpPost]
        public IEnumerable<MagDurData> GetVoltageMagnitudeData(VoltageMagnitudeDataForm form)
        {

            DateTime beginDate;
            DateTime finishDate;
            if (form.context == "day")
            {
                beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                finishDate = beginDate.AddDays(1).AddSeconds(-1);
            }
            else if (form.context == "hour")
            {
                beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                finishDate = beginDate.AddHours(1).AddSeconds(-1);
            }
            else if (form.context == "minute")
            {
                beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                finishDate = beginDate.AddMinutes(1).AddSeconds(-1);
            }
            else
            {
                beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                finishDate = DateTime.Parse(form.endDate).ToUniversalTime();
            }

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                DataTable table = connection.RetrieveData(
                @" SELECT Disturbance.EventID, 
                          Disturbance.DurationSeconds,
                          Disturbance.PerUnitMagnitude
                  FROM Disturbance JOIN 
                       Event ON Event.ID = Disturbance.EventID JOIN
			           DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
			           Phase ON Phase.ID = Disturbance.PhaseID JOIN
			           VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID	               
                 WHERE PhaseID IN (SELECT ID FROM Phase WHERE Name = 'Worst') AND
			           VoltageEnvelope.Name = COALESCE((SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope'), 'ITIC') AND 
                       (Event.MeterID IN (Select * FROM String_To_Int_Table({0},','))) AND
                       Event.StartTime >= {1} AND Event.StartTime <= {2}  ", form.meterIds, beginDate, finishDate);
                return table.Select().Select(row => new MagDurData()
                {
                    EventID = int.Parse(row["EventID"].ToString()),
                    DurationSeconds = double.Parse(row["DurationSeconds"].ToString()),
                    PerUnitMagnitude = double.Parse(row["PerUnitMagnitude"].ToString())
                });

            }
        }

        [HttpGet]
        public IEnumerable<EventNote> GetNotesForEvent()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int id = int.Parse(query["id"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                return new TableOperations<EventNote>(connection).QueryRecords(restriction: new RecordRestriction("EventID = {0}", id));
            }
        }

        public class NoteForEventForm
        {
            public int id { get; set; }
            public string note { get; set; }
            public string userId { get; set; }

        }

        [HttpPost]
        public void SaveNoteForEvent(NoteForEventForm form)
        {
            if (form.note.Trim().Length > 0)
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    new TableOperations<EventNote>(connection).AddNewRecord(new EventNote()
                    {
                        EventID = form.id,
                        Note = form.note,
                        UserAccount = form.userId,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
        }

        [HttpPost]
        public void RemoveEventNote(NoteForEventForm form)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                new TableOperations<EventNote>(connection).DeleteRecord(restriction: new RecordRestriction("ID = {0}", form.id));
            }
        }


        public class TrendingData
        {
            public string Date;
            public double Minimum;
            public double Maximum;
            public double Average;
        }

        public class TrendingDataForPeriodForm {
            public string siteID { get; set; }
            public string colorScale { get; set; }
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            public string userName { get; set; }
        }
        [HttpPost]
        public List<TrendingData> GetTrendingDataForPeriod(TrendingDataForPeriodForm form)
        {
            List<TrendingData> eventSet = new List<TrendingData>();
            DateTime thedatefrom = DateTime.Parse(form.targetDateFrom);
            DateTime thedateto = DateTime.Parse(form.targetDateTo);

            int duration = thedateto.Subtract(thedatefrom).Days + 1;
            using(AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (IDbCommand sc = connection.Connection.CreateCommand())
            {
                sc.CommandText = "dbo.selectTrendingDataByChannelByDate";
                sc.CommandType = CommandType.StoredProcedure;
                IDbDataParameter param1 = sc.CreateParameter();
                param1.ParameterName = "@StartDate";
                param1.Value = form.targetDateFrom;
                IDbDataParameter param2 = sc.CreateParameter();
                param2.ParameterName = "@EndDate";
                param2.Value = form.targetDateTo;
                IDbDataParameter param3 = sc.CreateParameter();
                param3.ParameterName = "@MeterID";
                param3.Value = form.siteID;
                IDbDataParameter param4 = sc.CreateParameter();
                param4.ParameterName = "@username";
                param4.Value = form.userName;
                IDbDataParameter param5 = sc.CreateParameter();
                param5.ParameterName = "@colorScale";
                param5.Value = form.colorScale;


                sc.Parameters.Add(param1);
                sc.Parameters.Add(param2);
                sc.Parameters.Add(param3);
                sc.Parameters.Add(param4);
                sc.Parameters.Add(param5);

                IDataReader rdr = sc.ExecuteReader();
                try
                {
                    while (rdr.Read())
                    {
                        TrendingData td = new TrendingData();
                        td.Date = Convert.ToString(rdr["Date"]);
                        td.Maximum = Convert.ToDouble(rdr["Maximum"]);
                        td.Minimum = Convert.ToDouble(rdr["Minimum"]);
                        td.Average = Convert.ToDouble(rdr["Average"]);

                        eventSet.Add(td);
                    }
                }
                finally
                {
                    if (!rdr.IsClosed)
                    {
                        rdr.Close();
                    }
                }
            }

            return (eventSet);
        }

        [HttpGet]
        public IEnumerable<WorkbenchVoltageCurveView> GetCurves()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                return new TableOperations<WorkbenchVoltageCurveView>(connection).QueryRecords("ID, LoadOrder");
            }
        }

        public class MeterLocations
        {
            public DataTable Data;
            public Dictionary<string, string> Colors;
        }

        public class MeterLocationsForm {
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            public string meterIds { get; set; }
            public string tab { get; set; }
            public string userName { get; set; }
            public string context { get; set; }
        }

        [HttpPost]
        public MeterLocations GetMeterLocations(MeterLocationsForm form)
        {
            MeterLocations meters = new MeterLocations();
            DataTable table = new DataTable();

            Dictionary<string, string> colors = new Dictionary<string, string>();

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart'"));
                List<UserDashSettings> userDashSettings = new TableOperations<UserDashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", form.userName)).ToList();

                Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                foreach (DashSettings setting in dashSettings)
                {
                    var index = userDashSettings.IndexOf(x => x.Name == setting.Name && x.Value == setting.Value);
                    if (index >= 0)
                    {
                        setting.Enabled = userDashSettings[index].Enabled;
                    }

                    if (!disabledFileds.ContainsKey(setting.Value))
                        disabledFileds.Add(setting.Value, setting.Enabled);

                }

                IEnumerable<DashSettings> colorSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "ChartColors' AND Enabled = 1"));
                List<UserDashSettings> userColorSettings = new TableOperations<UserDashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + form.tab + "ChartColors' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", form.userName)).ToList();

                foreach (var color in colorSettings)
                {
                    var index = userColorSettings.IndexOf(x => x.Name == color.Name && x.Value.Split(',')?[0] == color.Value.Split(',')?[0]);
                    if (index >= 0)
                    {
                        color.Value = userColorSettings[index].Value;
                    }

                    if (colors.ContainsKey(color.Value.Split(',')[0]))
                        colors[color.Value.Split(',')[0]] = color.Value.Split(',')[1];
                    else
                        colors.Add(color.Value.Split(',')[0], color.Value.Split(',')[1]);
                }
                DateTime startDate;
                DateTime endDate;

                if (form.context == "day")
                {
                    startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    endDate = startDate.AddDays(1).AddSeconds(-1);
                }
                else if (form.context == "hour")
                {
                    startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    endDate = startDate.AddHours(1).AddSeconds(-1);
                }
                else if (form.context == "minute")
                {
                    startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    endDate = startDate.AddMinutes(1).AddSeconds(-1);
                }
                else if (form.context == "second")
                {
                    startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    endDate = startDate.AddSeconds(1).AddMilliseconds(-1);
                }
                else
                {
                    startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    endDate = DateTime.Parse(form.targetDateTo).ToUniversalTime();
                }

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = "dbo.selectMeterLocations" + form.tab;
                    sc.CommandType = CommandType.StoredProcedure;
                    IDbDataParameter eventDateFrom = sc.CreateParameter();
                    eventDateFrom.ParameterName = "@EventDateFrom";
                    eventDateFrom.Value = startDate;
                    IDbDataParameter eventDateTo = sc.CreateParameter();
                    eventDateTo.ParameterName = "@EventDateTo";
                    eventDateTo.Value = endDate;
                    sc.Parameters.Add(eventDateFrom);
                    sc.Parameters.Add(eventDateTo);
                    IDbDataParameter param3 = sc.CreateParameter();
                    param3.ParameterName = "@meterIds";
                    param3.Value = form.meterIds;
                    sc.Parameters.Add(param3);
                    sc.CommandTimeout = 60;

                    // Use next two fields only on Event based tabs that allow context picking.
                    List<string> tabList = new List<string> { "Events", "Disturbances", "Faults", "Breakers", "Extensions" };
                    if (tabList.Contains(form.tab))
                    {
                        IDbDataParameter param4 = sc.CreateParameter();
                        param4.ParameterName = "@username";
                        param4.Value = form.userName;
                        IDbDataParameter param5 = sc.CreateParameter();
                        param5.ParameterName = "@context";
                        param5.Value = form.context;
                        sc.Parameters.Add(param4);
                        sc.Parameters.Add(param5);
                    }

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);
                }

                List<string> skipColumns = new List<string>() { "ID", "Name", "Longitude", "Latitude", "Count", "ExpectedPoints", "GoodPoints", "LatchedPoints", "UnreasonablePoints", "NoncongruentPoints", "DuplicatePoints" };
                List<string> columnsToRemove = new List<string>();
                foreach (DataColumn column in table.Columns)
                {
                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                    {
                        disabledFileds.Add(column.ColumnName, true);
                        new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "Chart", column.ColumnName, true);
                    }

                    if (!skipColumns.Contains(column.ColumnName) && !colors.ContainsKey(column.ColumnName))
                    {
                        Random r = new Random(DateTime.UtcNow.Millisecond);
                        string color = r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                        colors.Add(column.ColumnName, color);
                        new TableOperations<DashSettings>(connection).GetOrAdd(form.tab + "ChartColors", column.ColumnName + "," + color, true);
                    }


                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds[column.ColumnName])
                    {
                        columnsToRemove.Add(column.ColumnName);
                    }

                }
                foreach (string columnName in columnsToRemove)
                {
                    table.Columns.Remove(columnName);
                }

                meters.Colors = colors;
                meters.Data = table;
                return meters;

            }
        }

        [HttpPost]
        public ContourInfo GetLocationsTrendingData(ContourQuery contourQuery)
        {
            List<TrendingDataLocation> locations = new List<TrendingDataLocation>();
            DataTable colorScale;

            using (AdoDataConnection conn = new AdoDataConnection("systemSettings"))
            using (IDbCommand cmd = conn.Connection.CreateCommand())
            {

                cmd.Parameters.Add(new SqlParameter("@EventDateFrom", contourQuery.GetStartDate()));
                cmd.Parameters.Add(new SqlParameter("@EventDateTo", contourQuery.GetEndDate()));
                cmd.Parameters.Add(new SqlParameter("@colorScaleName", contourQuery.ColorScaleName));
                cmd.Parameters.Add(new SqlParameter("@meterIds", contourQuery.MeterIds));
                cmd.CommandText = "dbo.selectMeterLocationsTrendingData";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;

                using (IDataReader rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        TrendingDataLocation ourStatus = new TrendingDataLocation();
                        ourStatus.Latitude = (double)rdr["Latitude"];
                        ourStatus.Longitude = (double)rdr["Longitude"];
                        ourStatus.Name = (string)rdr["Name"];
                        ourStatus.Average = (rdr.IsDBNull(rdr.GetOrdinal("Average")) ? (double?)null : (double)rdr["Average"]);
                        ourStatus.Maximum = (rdr.IsDBNull(rdr.GetOrdinal("Maximum")) ? (double?)null : (double)rdr["Maximum"]);
                        ourStatus.Minimum = (rdr.IsDBNull(rdr.GetOrdinal("Minimum")) ? (double?)null : (double)rdr["Minimum"]);
                        ourStatus.ID = (int)rdr["id"];
                        ourStatus.Data.Add(ourStatus.Average);
                        ourStatus.Data.Add(ourStatus.Maximum);
                        ourStatus.Data.Add(ourStatus.Minimum);
                        locations.Add(ourStatus);
                    }
                }

                string query =
                    "SELECT " +
                    "    ContourColorScalePoint.Value, " +
                    "    ContourColorScalePoint.Color " +
                    "FROM " +
                    "    ContourColorScale JOIN " +
                    "    ContourColorScalePoint ON ContourColorScalePoint.ContourColorScaleID = ContourColorScale.ID " +
                    "WHERE ContourColorScale.Name = {0} " +
                    "ORDER BY ContourColorScalePoint.OrderID";

                colorScale = conn.RetrieveData(query, contourQuery.ColorScaleName);
            }

            double[] colorDomain = colorScale
                .Select()
                .Select(row => row.ConvertField<double>("Value"))
                .ToArray();

            double[] colorRange = colorScale
                .Select()
                .Select(row => (double)(uint)row.ConvertField<int>("Color"))
                .ToArray();

            return new ContourInfo()
            {
                Locations = locations,
                ColorDomain = colorDomain,
                ColorRange = colorRange,
                DateTo = contourQuery.EndDate,
                DateFrom = contourQuery.StartDate
            };
        }

        public class MeterLocationsHeatmapForm
        {
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            public string meterIds { get; set; }
            public string type { get; set; }
        }


        [HttpPost]
        public MeterLocations GetLocationsHeatmap(MeterLocationsHeatmapForm form)
        {
            MeterLocations meters = new MeterLocations();
            DataTable table = new DataTable();

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            using (IDbCommand sc = connection.Connection.CreateCommand())
            {
                sc.CommandText = "dbo.selectMeterLocations" + form.type;
                sc.CommandType = CommandType.StoredProcedure;
                IDbDataParameter eventDateFrom = sc.CreateParameter();
                eventDateFrom.ParameterName = "@EventDateFrom";
                eventDateFrom.Value = form.targetDateFrom;
                IDbDataParameter eventDateTo = sc.CreateParameter();
                eventDateTo.ParameterName = "@EventDateTo";
                eventDateTo.Value = form.targetDateTo;
                sc.Parameters.Add(eventDateFrom);
                sc.Parameters.Add(eventDateTo);
                IDbDataParameter param3 = sc.CreateParameter();
                param3.ParameterName = "@meterIds";
                param3.Value = form.meterIds;
                sc.Parameters.Add(param3);

                IDataReader rdr = sc.ExecuteReader();
                table.Load(rdr);
            }
            meters.Colors = null;
            meters.Data = table;

            return meters;
        }

        public class MetersForm {
            public int deviceFilter { get; set; }
            public string userName { get; set; }
        }

        [HttpPost]
        public DataTable GetMeters(MetersForm form)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                return connection.RetrieveData("SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID = {0})", form.deviceFilter);
                //AssetGroup df = new TableOperations<AssetGroup>(connection).QueryRecordWhere("ID = {0}", form.deviceFilter);
                //DataTable table;

                //try
                //{
                //    string filterExpression = null;
                //    if (df == null)
                //    {
                //        table = connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID IN (SELECT AssetGroupID FROM UserAccountAssetGroup WHERE UserAccountID =  (SELECT ID FROM UserAccount WHERE Name = '{form.userName}')))");
                //        return table;
                //    }

                //    if (df.AssetGroupID == 0)
                //        table = connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID IN (SELECT AssetGroupID FROM UserAccountAssetGroup WHERE UserAccountID = (SELECT ID FROM UserAccount WHERE Name = '{df.UserAccount}')))");
                //    else
                //        table = connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID = {df.AssetGroupID})");

                //    if (df.FilterExpression != "")
                //    {
                //        DataRow[] rows = table.Select(df.FilterExpression);

                //        if (rows.Length == 0)
                //            return new DataTable();

                //        return rows.CopyToDataTable();
                //    }
                //}
                //catch (Exception)
                //{
                //    return new DataTable();
                //}

                //return table;

            }
        }




        #endregion

    }
}