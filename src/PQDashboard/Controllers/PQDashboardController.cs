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

        #endregion

    }
}