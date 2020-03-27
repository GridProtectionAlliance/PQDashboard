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
//  08/22/2019 - Christoph Lackner
//       Added TCE Filter.
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
    [RoutePrefix("api/PQDashboard")]
    public class PQDashboardController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #endregion

        #region [ Constructors ]
        public PQDashboardController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static PQDashboardController()
        {
            s_memoryCache = new MemoryCache("PQDashboard");
        }
        #endregion

        #region [ Methods ]

        #region [ Event Search Page ]

        public class EventSearchPostData {
            public bool dfr { get; set; }
            public bool pqMeter { get; set; }
            public bool g200 { get; set; }
            public bool one00to200 { get; set; }
            public bool thirty5to100 { get; set; }
            public bool oneTo35 { get; set; }
            public bool l1 { get; set; }
            public bool faults { get; set; }
            public bool sags { get; set; }
            public bool swells { get; set; }
            public bool interruptions { get; set; }
            public bool breakerOps { get; set; }
            public bool transients { get; set; }
            public bool relayTCE { get; set; }
            public bool others { get; set; }
            public string date { get; set; }
            public string time { get; set; }
            public int windowSize { get; set; }
            public int timeWindowUnits { get; set; }
            public string make { get; set; }
            public string model { get; set; }
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

        [Route("GetEventSearchData"),HttpPost]
        public DataTable GetEventSearchData(EventSearchPostData postData)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DateTime dateTime = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();
                List<string> eventTypes = new List<string>();

                if (postData.faults)
                    eventTypes.Add(" ((EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) = 0)  OR (EventType.Name  = 'RecloseIntoFault'))");
                if (postData.breakerOps)
                    eventTypes.Add("((EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) > 0) OR (EventType.Name  = 'BreakerOpen'))");
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
                if(postData.relayTCE)
                    eventTypes.Add("(SELECT COUNT(RelayPerformance.ID) FROM RelayPerformance WHERE RelayPerformance.EventID = Event.ID) > 0");
                if (!eventTypes.Any())
                    eventTypes.Add("EventType.Name  = ''");

                string eventTypeRestriction = $"({string.Join(" OR ", eventTypes)})";

                List<string> voltageClasses = new List<string>();

                if (postData.g200)
                    voltageClasses.Add(" Line.VoltageKV > 200 ");
                if (postData.one00to200)
                    voltageClasses.Add(" (Line.VoltageKV > 100 AND Line.VoltageKV <= 200) ");
                if (postData.thirty5to100)
                    voltageClasses.Add(" (Line.VoltageKV > 35 AND Line.VoltageKV <= 100) ");
                if (postData.oneTo35)
                    voltageClasses.Add(" (Line.VoltageKV > 1 AND Line.VoltageKV <= 35) ");
                if (postData.l1)
                    voltageClasses.Add(" Line.VoltageKV <= 1 ");
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

                string meterMakeRestriction = $"";
                if(postData.make != "All" && postData.model != "All")
                    meterMakeRestriction = $" AND Meter.Make = '{postData.make}' AND Meter.Model = '{postData.model}' ";
                else if (postData.make != "All")
                    meterMakeRestriction = $" AND Meter.Make = '{postData.make}'  ";

                string query = @" 

                    SELECT
                        Event.ID as EventID,
	                    MeterLine.LineName as AssetName,
	                    'Line' as AssetType,
	                    Line.VoltageKV as VoltageClass,
	                    EventType.Name as EventType,
	                    Event.StartTime as FileStartTime,
	                    (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) as BreakerOperation,
                        (SELECT COUNT(Channel.ID) FROM Channel LEFT JOIN MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID WHERE MeasurementType.Name = 'TripCoilCurrent' AND Channel.LineID = Line.ID ) as TripCoilCount
                    FROM
	                    Event JOIN
	                    MeterLine ON Event.MeterID = MeterLine.MeterID AND Event.LineID = MeterLine.LineID JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Line ON Event.LineID = Line.ID JOIN
                        Meter ON Event.MeterID = Meter.ID
                    WHERE
                        Event.StartTime BETWEEN DATEADD(" + timeWindowUnits + @", " + (-1*postData.windowSize).ToString() + @", {0}) AND
                                                DATEADD(" + timeWindowUnits + @", " + (postData.windowSize).ToString() + @", {0}) AND
                    " + eventTypeRestriction + @" AND
                    " + voltageClassRestriction + @" AND
                    " + meterTypeRestriction + meterMakeRestriction + @" 
                ";

                DataTable table = connection.RetrieveData(query, dateTime) ;

                return table;               
            }

        }

        [Route("GetEventSearchAssetVoltageDisturbances"),HttpGet]
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

        [Route("GetEventSearchFaultSegments"),HttpGet]
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

        [Route("GetEventSearchHistory"),HttpGet]
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


        [Route("GetEventSearchMeterMakes"), HttpGet]
        public IHttpActionResult GetEventSearchMeterMakes()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Make FROM Meter");

                return Ok(table.Select().Select(x => x["Make"].ToString()));
            }

        }

        [Route("GetEventSearchMeterModels/{make}"), HttpGet]
        public IHttpActionResult GetEventSearchMeterModels(string make)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Model FROM Meter WHERE Make = {0}", make);

                return Ok(table.Select().Select(x => x["Model"].ToString()));
            }

        }



        #endregion

        #region [ Old Main Dashboard ]

        public class DetailtsForSitesForm {
            public string siteId { get; set; }
            public string targetDate { get; set; }
            public string userName { get; set; }
            public string tab { get; set; }
            public string colorScale { get; set; }
            public string context { get; set; }
        }

        [Route("GetDetailsForSites"),HttpPost]
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

        [Route("GetDataForPeriod"),HttpPost]
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

        [Route("GetVoltageMagnitudeData"),HttpPost]
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

        [Route("GetNotesForEvent"),HttpGet]
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

        [Route("SaveNoteForEvent"),HttpPost]
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

        [Route("RemoveEventNote"),HttpPost]
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
        [Route("GetTrendingDataForPeriod"),HttpPost]
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

        [Route("GetCurves"),HttpGet]
        public IEnumerable<WorkbenchVoltageCurveView> GetCurves()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                return new TableOperations<WorkbenchVoltageCurveView>(connection).QueryRecords("ID, LoadOrder");
            }
        }

        public class MetersForm {
            public int deviceFilter { get; set; }
            public string userName { get; set; }
        }


        public class AssetGroupWithSubIDs: AssetGroup {
            public List<int> SubID { get; set; }
        }
        public class GetMetersReturn
        {
            public IEnumerable<Meter> Meters { get; set; }
            public List<AssetGroupWithSubIDs> AssetGroups { get; set; }
            public int? ParentAssetGroupID { get; set; }
        }

        [Route("GetMeters"), HttpPost]
        public GetMetersReturn GetMeters(MetersForm form)
        {
            GetMetersReturn data = new GetMetersReturn();
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                data.ParentAssetGroupID = connection.ExecuteScalar<int?>("SELECT TOP 1 ParentAssetGroupID FROM AssetGroupAssetGroup where ChildAssetGroupID = {0}", form.deviceFilter);
                data.Meters = new TableOperations<Meter>(connection).QueryRecordsWhere("ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID = {0})", form.deviceFilter);
                var assetGroups = new TableOperations<AssetGroup>(connection).QueryRecordsWhere("ID IN (SELECT ChildAssetGroupID FROM AssetGroupAssetGroup WHERE ParentAssetGroupID = {0})", form.deviceFilter);

                data.AssetGroups = new List<AssetGroupWithSubIDs>();
                foreach(var assetGroup in assetGroups)
                {
                    AssetGroupWithSubIDs record = new AssetGroupWithSubIDs() {
                        ID = assetGroup.ID, Name = assetGroup.Name, SubID = new List<int>()
                    };

                    DataTable tbl = connection.RetrieveData("SELECT ID FROM RecursiveMeterSearch({0})", assetGroup.ID);

                    record.SubID = tbl.Select().Select(x => int.Parse(x["ID"].ToString())).ToList();
                    data.AssetGroups.Add(record);
                }
                return data;
            }
        }
        #endregion

        #region [ Settings View ]
        [Route("ResetDefaultSettings"),HttpGet]
        public void ResetDefaultSettings()
        {
            string user = UserInfo.UserNameToSID(User.Identity.Name);
            using(DataContext dataContext = new DataContext("systemSettings"))
            {
                dataContext.Table<UserDashSettings>().DeleteRecord(new RecordRestriction("UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", user));
            }
        }

        public class UpdateDashSettingsForm {
            public int ID { get; set; }
            public string Name { get; set; }
            public string Value { get; set; }
            public bool Enabled { get; set; }
            public string UserId { get; set; }
        }
        [Route("UpdateDashSettings"),HttpPost]
        public void UpdateDashSettings(UpdateDashSettingsForm form)
        {
            using (DataContext dataContext = new DataContext("systemSettings")) {
                TableOperations<DashSettings> dashSettingsTable = dataContext.Table<DashSettings>();
                TableOperations<UserDashSettings> userDashSettingsTable = dataContext.Table<UserDashSettings>();

                Guid userAccountID = dataContext.Connection.ExecuteScalar<Guid>("SELECT ID FROM UserAccount WHERE Name = {0}", form.UserId);
                DashSettings globalSetting = dashSettingsTable.QueryRecordWhere("ID = {0}", form.ID);
                UserDashSettings userSetting;

                if (form.Name.StartsWith("System."))
                    userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1}", userAccountID, form.Name);
                else if (form.Name.EndsWith("Colors"))
                    userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1} AND Value LIKE {2}", userAccountID, form.Name, form.Value.Split(',')[0] + "%");
                else
                    userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1} AND Value = {2}", userAccountID, form.Name, form.Value);

                if (userSetting == null)
                {
                    userSetting = new UserDashSettings();
                    userSetting.UserAccountID = userAccountID;
                    userSetting.Name = form.Name;
                }

                userSetting.Value = form.Value;
                userSetting.Enabled = form.Enabled;

                if ((userSetting.Enabled != globalSetting.Enabled) || (userSetting.Value != globalSetting.Value))
                    dataContext.Table<UserDashSettings>().AddNewOrUpdateRecord(userSetting);
                else
                    dataContext.Table<UserDashSettings>().DeleteRecord(new RecordRestriction("ID = {0}", userSetting.ID));

            }
        }

        #endregion
        #endregion

    }
}