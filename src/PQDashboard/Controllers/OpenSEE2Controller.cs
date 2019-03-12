//******************************************************************************************************
//  OpenSEE2Controller.cs - Gbtc
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
using GSF.Security;
using GSF.Web;
using GSF.Web.Model;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Web.Http;

namespace OpenSEE.Controller
{
    public class OpenSEE2Controller : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);
        private readonly DataContext m_dataContext;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="MainController"/>.
        /// </summary>
        public OpenSEE2Controller()
        {
            // Establish data context for the view
            m_dataContext = new DataContext(exceptionHandler: PQDashboard.MvcApplication.LogException);
        }

        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static OpenSEE2Controller()
        {
            s_memoryCache = new MemoryCache("openSEE2");
        }
        #endregion


        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="OpenSEEController"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                        m_dataContext?.Dispose();
                }
                finally
                {
                    m_disposed = true;          // Prevent duplicate dispose.
                    base.Dispose(disposing);    // Call base class Dispose().
                }
            }
        }

        [HttpGet]
        public JsonReturn GetData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);
            int calcCycle = m_dataContext.Connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
            double systemFrequency = m_dataContext.Connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;

            string type = query["type"];
            string dataType = query["dataType"];

            DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
            DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);
            int pixels = int.Parse(query["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID, StartTime from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3}", ToDateTime2(m_dataContext.Connection, endTime), ToDateTime2(m_dataContext.Connection, startTime), evt.MeterID, evt.LineID);
            foreach (DataRow row in table.Rows)
            {
                int eventID = row.ConvertField<int>("ID");
                DateTime eventStartTime = row.ConvertField<DateTime>("StartTime");
                Dictionary<string, FlotSeries> temp;

                if (dataType == "Time")
                    temp = QueryEventData(eventID, eventStartTime, meter, type);
                else
                    temp = QueryFrequencyData(eventID, eventStartTime, meter, type);

                foreach (string key in temp.Keys)
                {
                    if (temp[key].MeasurementType == type)
                    {
                        if (dict.ContainsKey(key))
                            dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                        else
                            dict.Add(key, temp[key]);
                    }
                }
            }
            if (dict.Count == 0) return null;

            double calcTime = (calcCycle >= 0 ? dict.First().Value.DataPoints[calcCycle][0] : 0);

            List<FlotSeries> returnList = new List<FlotSeries>();
            foreach (string key in dict.Keys)
            {
                FlotSeries series = new FlotSeries();
                series = dict[key];
                series.DataPoints = Downsample(dict[key].DataPoints.OrderBy(x => x[0]).ToList(), pixels, new Range<DateTime>(startTime, endTime));
                returnList.Add(series);
            }
            JsonReturn returnDict = new JsonReturn();
            returnDict.StartDate = evt.StartTime;
            returnDict.EndDate = evt.EndTime;
            returnDict.Data = returnList;
            returnDict.CalculationTime = calcTime;
            returnDict.CalculationEnd = calcTime + 1000 / systemFrequency;

            return returnDict;

        }

        [HttpGet]
        public JsonReturn GetFaultDistanceData()
        {
            Dictionary<string, string> query = Request.QueryParameters();

            int eventId = int.Parse(query["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime epoch = new DateTime(1970, 1, 1);
            DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
            DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);
            int pixels = int.Parse(query["pixels"]);
            DataTable table;

            int calcCycle = m_dataContext.Connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("SELECT ID FROM FaultCurve WHERE EventID IN (SELECT ID FROM Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3})", ToDateTime2(m_dataContext.Connection, endTime), ToDateTime2(m_dataContext.Connection, startTime), evt.MeterID, evt.LineID);
            foreach (DataRow row in table.Rows)
            {
                KeyValuePair<string, FlotSeries> temp = QueryFaultDistanceData(int.Parse(row["ID"].ToString()), meter);
                if (dict.ContainsKey(temp.Key))
                    dict[temp.Key].DataPoints = dict[temp.Key].DataPoints.Concat(temp.Value.DataPoints).ToList();
                else
                    dict.Add(temp.Key, temp.Value);
            }

            if (dict.Count == 0) return null;
            double calcTime = (calcCycle >= 0 ? dict.First().Value.DataPoints[calcCycle][0] : 0);

            List<FlotSeries> returnList = new List<FlotSeries>();
            foreach (string key in dict.Keys)
            {
                FlotSeries series = new FlotSeries();
                series = dict[key];
                series.DataPoints = Downsample(dict[key].DataPoints.Where(x => !double.IsNaN(x[1])).OrderBy(x => x[0]).ToList(), pixels, new Range<DateTime>(startTime, endTime));
                returnList.Add(series);
            }
            JsonReturn returnDict = new JsonReturn();
            returnDict.StartDate = evt.StartTime;
            returnDict.EndDate = evt.EndTime;
            returnDict.Data = returnList;
            returnDict.CalculationTime = calcTime;

            return returnDict;
        }

        [HttpGet]
        public JsonReturn GetBreakerData()
        {
            Dictionary<string, string> query = Request.QueryParameters();

            int eventId = int.Parse(query["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime epoch = new DateTime(1970, 1, 1);
            DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
            DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);
            int pixels = int.Parse(query["pixels"]);
            DataTable table;

            int calcCycle = m_dataContext.Connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3}", ToDateTime2(m_dataContext.Connection, endTime), ToDateTime2(m_dataContext.Connection, startTime), evt.MeterID, evt.LineID);
            foreach (DataRow row in table.Rows)
            {
                Dictionary<string, FlotSeries> temp = QueryBreakerData(int.Parse(row["ID"].ToString()), meter);
                foreach (string key in temp.Keys)
                {
                    if (dict.ContainsKey(key))
                        dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                    else
                        dict.Add(key, temp[key]);
                }
            }

            if (dict.Count == 0) return null;
            double calcTime = (calcCycle >= 0 ? dict.First().Value.DataPoints[calcCycle][0] : 0);

            List<FlotSeries> returnList = new List<FlotSeries>();
            foreach (string key in dict.Keys)
            {
                FlotSeries series = new FlotSeries();
                series = dict[key];
                series.DataPoints = Downsample(dict[key].DataPoints.Where(x => !double.IsNaN(x[1])).OrderBy(x => x[0]).ToList(), pixels, new Range<DateTime>(startTime, endTime));
                returnList.Add(series);
            }
            JsonReturn returnDict = new JsonReturn();
            returnDict.StartDate = evt.StartTime;
            returnDict.EndDate = evt.EndTime;
            returnDict.Data = returnList;
            returnDict.CalculationTime = calcTime;

            return returnDict;

        }

        [HttpGet]
        public Dictionary<string, dynamic> GetHeaderData() {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);
            string breakerOperationID = (query.ContainsKey("breakeroperation") ? query["breakeroperation"] : "-1");

            const string NextBackForSystem = "GetPreviousAndNextEventIdsForSystem";
            const string NextBackForStation = "GetPreviousAndNextEventIdsForMeterLocation";
            const string NextBackForMeter = "GetPreviousAndNextEventIdsForMeter";
            const string NextBackForLine = "GetPreviousAndNextEventIdsForLine";

            Dictionary<string, Tuple<EventView, EventView>> nextBackLookup = new Dictionary<string, Tuple<EventView, EventView>>()
            {
                { NextBackForSystem, Tuple.Create((EventView)null, (EventView)null) },
                { NextBackForStation, Tuple.Create((EventView)null, (EventView)null) },
                { NextBackForMeter, Tuple.Create((EventView)null, (EventView)null) },
                { NextBackForLine, Tuple.Create((EventView)null, (EventView)null) }
            };

            Dictionary<string, dynamic> returnDict = new Dictionary<string, dynamic>();

            EventView theEvent = m_dataContext.Table<EventView>().QueryRecordWhere("ID = {0}", eventId);

            returnDict.Add("postedSystemFrequency", m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? "60.0");
            returnDict.Add("postedStationName", theEvent.StationName);
            returnDict.Add("postedMeterId", theEvent.MeterID.ToString());
            returnDict.Add("postedMeterName", theEvent.MeterName);
            returnDict.Add("postedLineName", theEvent.LineName);
            returnDict.Add("postedLineLength", theEvent.Length.ToString());

            returnDict.Add("postedEventName", theEvent.EventTypeName);
            returnDict.Add("postedEventDate", theEvent.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));
            returnDict.Add("postedDate", theEvent.StartTime.ToShortDateString());
            returnDict.Add("postedEventMilliseconds", theEvent.StartTime.Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString());

            returnDict.Add("xdaInstance", m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.XDAInstance'"));

            using (IDbCommand cmd = m_dataContext.Connection.Connection.CreateCommand())
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@EventID", eventId));
                cmd.CommandTimeout = 300;

                foreach (string procedure in nextBackLookup.Keys.ToList())
                {
                    EventView back = null;
                    EventView next = null;
                    int backID = -1;
                    int nextID = -1;

                    cmd.CommandText = procedure;

                    using (IDataReader rdr = cmd.ExecuteReader())
                    {
                        rdr.Read();

                        if (!rdr.IsDBNull(0))
                        {
                            backID = rdr.GetInt32(0);
                        }

                        if (!rdr.IsDBNull(1))
                        {
                            nextID = rdr.GetInt32(1);
                        }
                    }

                    back = m_dataContext.Table<EventView>().QueryRecordWhere("ID = {0}", backID);
                    next = m_dataContext.Table<EventView>().QueryRecordWhere("ID = {0}", nextID);
                    nextBackLookup[procedure] = Tuple.Create(back, next);
                }
            }

            returnDict.Add("nextBackLookup", nextBackLookup);

            if (new List<string>() { "Fault", "RecloseIntoFault" }.Contains(returnDict["postedEventName"]))
            {
                const string SagDepthQuery =
                    "SELECT TOP 1 " +
                    "    (1 - PerUnitMagnitude) * 100 " +
                    "FROM " +
                    "    FaultSummary JOIN " +
                    "    Disturbance ON " +
                    "         Disturbance.EventID = FaultSummary.EventID AND " +
                    "         Disturbance.StartTime <= dbo.AdjustDateTime2(FaultSummary.Inception, FaultSummary.DurationSeconds) AND " +
                    "         Disturbance.EndTime >= FaultSummary.Inception JOIN " +
                    "    EventType ON " +
                    "        Disturbance.EventTypeID = EventType.ID AND " +
                    "        EventType.Name = 'Sag' JOIN " +
                    "    Phase ON " +
                    "        Disturbance.PhaseID = Phase.ID AND " +
                    "        Phase.Name = 'Worst' " +
                    "WHERE FaultSummary.ID = {0} " +
                    "ORDER BY PerUnitMagnitude";

                FaultSummary thesummary = m_dataContext.Table<FaultSummary>().QueryRecordsWhere("EventID = {0} AND IsSelectedAlgorithm = 1", theEvent.ID).OrderBy(row => row.IsSuppressed).ThenBy(row => row.Inception).FirstOrDefault();
                double sagDepth = m_dataContext.Connection.ExecuteScalar<double>(SagDepthQuery, thesummary.ID);

                if ((object)thesummary != null)
                {
                    returnDict.Add("postedStartTime", thesummary.Inception.TimeOfDay.ToString());
                    returnDict.Add("postedPhase", thesummary.FaultType);
                    returnDict.Add("postedDurationPeriod", thesummary.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");
                    returnDict.Add("postedMagnitude", thesummary.CurrentMagnitude.ToString("####.#", CultureInfo.InvariantCulture) + " Amps (RMS)");
                    returnDict.Add("postedSagDepth", sagDepth.ToString("####.#", CultureInfo.InvariantCulture) + "%");
                    returnDict.Add("postedCalculationCycle", thesummary.CalculationCycle.ToString());
                }
            }
            else if (new List<string>() { "Sag", "Swell" }.Contains(returnDict["postedEventName"]))
            {
                openXDA.Model.Disturbance disturbance = m_dataContext.Table<openXDA.Model.Disturbance>().QueryRecordsWhere("EventID = {0}", theEvent.ID).Where(row => row.EventTypeID == theEvent.EventTypeID).OrderBy(row => row.StartTime).FirstOrDefault();

                if ((object)disturbance != null)
                {
                    returnDict.Add("postedStartTime", disturbance.StartTime.TimeOfDay.ToString());
                    returnDict.Add("postedPhase", m_dataContext.Table<Phase>().QueryRecordWhere("ID = {0}", disturbance.PhaseID).Name);
                    returnDict.Add("postedDurationPeriod", disturbance.DurationCycles.ToString("##.##", CultureInfo.InvariantCulture) + " cycles");

                    if (disturbance.PerUnitMagnitude != -1.0e308)
                    {
                        returnDict.Add("postedMagnitude", disturbance.PerUnitMagnitude.ToString("N3", CultureInfo.InvariantCulture) + " pu (RMS)");
                    }
                }
            }

            if (breakerOperationID != "")
            {
                int id;

                if (int.TryParse(breakerOperationID, out id))
                {
                    BreakerOperation breakerRow = m_dataContext.Table<BreakerOperation>().QueryRecordWhere("ID = {0}", id);

                    if ((object)breakerRow != null)
                    {
                        returnDict.Add("postedBreakerNumber", breakerRow.BreakerNumber);
                        returnDict.Add("postedBreakerPhase", m_dataContext.Table<Phase>().QueryRecordWhere("ID = {0}", breakerRow.PhaseID).Name);
                        returnDict.Add("postedBreakerTiming", breakerRow.BreakerTiming.ToString());
                        returnDict.Add("postedBreakerSpeed", breakerRow.BreakerSpeed.ToString());
                        returnDict.Add("postedBreakerOperation", m_dataContext.Connection.ExecuteScalar("SELECT Name FROM BreakerOperationType WHERE ID = {0}", breakerRow.BreakerOperationTypeID).ToString());
                    }
                }
            }


            return returnDict;
        }

        [HttpGet]
        public Dictionary<string, string> GetScalarStats() {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable dataTable = connection.RetrieveData("SELECT * FROM OpenSEEScalarStatView WHERE EventID = {0}", eventId);
                if (dataTable.Rows.Count == 0) return new Dictionary<string, string>();

                DataRow row = dataTable.AsEnumerable().First();
                return row.Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName, c=> row[c].ToString());

            }
        }

        [HttpGet]
        public DataTable GetHarmonics()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventId = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable dataTable = connection.RetrieveData(@"
                    SELECT 
                        MeasurementType.Name + ' ' + Phase.Name as Channel, 
                        SpectralData 
                    FROM 
                        SnapshotHarmonics JOIN 
                        Channel ON Channel.ID = SnapshotHarmonics.ChannelID JOIN
                        MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN
                        Phase ON Channel.PhaseID = Phase.ID
                        WHERE EventID = {0}", eventId);

                return dataTable;

            }
        }
        [HttpGet]
        public DataTable GetTimeCorrelatedSags()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                const string SQL =
                    "SELECT DISTINCT " +
                    "    Event.ID AS EventID, " +
                    "    EventType.Name AS EventType, " +
                    "    Event.StartTime, " +
                    "    Meter.Name AS MeterName, " +
                    "    MeterLine.LineName " +
                    "FROM " +
                    "    Disturbance JOIN " +
                    "    EventType DisturbanceType ON Disturbance.EventTypeID = DisturbanceType.ID JOIN " +
                    "    Event ON Disturbance.EventID = Event.ID JOIN " +
                    "    EventType ON Event.EventTypeID = EventType.ID JOIN " +
                    "    Meter ON Event.MeterID = Meter.ID JOIN " +
                    "    MeterLine ON " +
                    "        Event.MeterID = MeterLine.MeterID AND " +
                    "        Event.LineID = MeterLine.LineID " +
                    "WHERE " +
                    "    DisturbanceType.Name = 'Sag' AND " +
                    "    Disturbance.StartTime <= {1} AND " +
                    "    Disturbance.EndTime >= {0} " +
                    "ORDER BY " +
                    "    Event.StartTime, " +
                    "    Meter.Name, " +
                    "    MeterLine.LineName";

                double timeTolerance = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'TimeTolerance'");
                DateTime startTime = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);
                DateTime endTime = connection.ExecuteScalar<DateTime>("SELECT EndTime FROM Event WHERE ID = {0}", eventID);
                DateTime adjustedStartTime = startTime.AddSeconds(-timeTolerance);
                DateTime adjustedEndTime = endTime.AddSeconds(timeTolerance);
                DataTable dataTable = connection.RetrieveData(SQL, adjustedStartTime, adjustedEndTime);
                return dataTable;
            }
        }
        #endregion

        #region [ OpenSEE Table Operations ]

        public class JsonReturn
        {
            public DateTime StartDate;
            public DateTime EndDate;
            public double CalculationTime;
            public double CalculationEnd;
            public List<FlotSeries> Data;
        }

        public class FlotSeries
        {
            public int ChannelID;
            public string ChannelName;
            public string ChannelDescription;
            public string MeasurementType;
            public string MeasurementCharacteristic;
            public string Phase;
            public string SeriesType;
            public string ChartLabel;
            public List<double[]> DataPoints = new List<double[]>();
        }

        private Dictionary<string, FlotSeries> QueryEventData(int eventID, DateTime startTime, Meter meter, string type)
        {
            string target = $"DataGroup-{eventID}-{startTime.Ticks}-{type}";
            DataGroup dataGroup = (DataGroup)s_memoryCache.Get(target);

            if (dataGroup == null)
            {
                byte[] timeDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
                dataGroup = ToDataGroup(meter, timeDomainData);
                s_memoryCache.Add(target, dataGroup, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(10.0D) });
            }

            return GetDataLookup(dataGroup, type);
        }

        private Dictionary<string, FlotSeries> QueryFrequencyData(int eventID, DateTime startTime, Meter meter, string type)
        {
            string target = $"VICycleDataGroup-{eventID}-{startTime.Ticks}-{type}";
            VICycleDataGroup vICycleDataGroup = (VICycleDataGroup)s_memoryCache.Get(target);

            if (vICycleDataGroup == null)
            {
                byte[] frequencyDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
                DataGroup dataGroup = ToDataGroup(meter, frequencyDomainData);
                double freq = m_dataContext.Connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0D;
                vICycleDataGroup = Transform.ToVICycleDataGroup(new VIDataGroup(dataGroup), 60);
                s_memoryCache.Add(target, vICycleDataGroup, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(10.0D) });
            }

            return GetFrequencyDataLookup(vICycleDataGroup, type);
        }

        private KeyValuePair<string, FlotSeries> QueryFaultDistanceData(int faultCurveID, Meter meter)
        {

            FaultCurve faultCurve = m_dataContext.Table<FaultCurve>().QueryRecordWhere("ID = {0}", faultCurveID);
            DataGroup dataGroup = ToDataGroup(meter, faultCurve.Data);
            FlotSeries flotSeries = new FlotSeries()
            {
                ChannelID = 0,
                ChannelName = faultCurve.Algorithm,
                ChannelDescription = faultCurve.Algorithm,
                MeasurementCharacteristic = "FaultCurve",
                MeasurementType = "FaultCurve",
                Phase = "None",
                SeriesType = "None",
                DataPoints = dataGroup.DataSeries[0].DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                ChartLabel = faultCurve.Algorithm

            };
            return new KeyValuePair<string, FlotSeries>(faultCurve.Algorithm, flotSeries);
        }

        private Dictionary<string, FlotSeries> QueryBreakerData(int eventID, Meter meter)
        {
            byte[] timeDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
            DataGroup dataGroup = ToDataGroup(meter, timeDomainData);
            return GetBreakerLookup(dataGroup);
        }


        private DataGroup ToDataGroup(Meter meter, byte[] data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            return dataGroup;
        }


        private Dictionary<string, FlotSeries> GetDataLookup(DataGroup dataGroup, string type)
        {
            Dictionary<string, FlotSeries> dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type).ToDictionary(ds => GetChartLabel(ds.SeriesInfo.Channel), ds => new FlotSeries()
            {
                ChannelID = ds.SeriesInfo.Channel.ID,
                ChannelName = ds.SeriesInfo.Channel.Name,
                ChannelDescription = ds.SeriesInfo.Channel.Description,
                MeasurementCharacteristic = ds.SeriesInfo.Channel.MeasurementCharacteristic.Name,
                MeasurementType = ds.SeriesInfo.Channel.MeasurementType.Name,
                Phase = ds.SeriesInfo.Channel.Phase.Name,
                SeriesType = ds.SeriesInfo.Channel.MeasurementType.Name,
                DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                ChartLabel = GetChartLabel(ds.SeriesInfo.Channel)

            });

            return dataLookup;
        }

        private Dictionary<string, FlotSeries> GetBreakerLookup(DataGroup dataGroup)
        {
            //Dictionary<string, FlotSeries> dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital" && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "BreakerStatus" || ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "TCE")).ToDictionary(ds => ds.SeriesInfo.Channel.Name, ds => new FlotSeries()
                Dictionary<string, FlotSeries> dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital").ToDictionary(ds => ds.SeriesInfo.Channel.Name, ds => new FlotSeries()
                {
                    ChannelID = ds.SeriesInfo.Channel.ID,
                ChannelName = ds.SeriesInfo.Channel.Name,
                ChannelDescription = ds.SeriesInfo.Channel.Description,
                MeasurementCharacteristic = ds.SeriesInfo.Channel.MeasurementCharacteristic.Name,
                MeasurementType = ds.SeriesInfo.Channel.MeasurementType.Name,
                Phase = ds.SeriesInfo.Channel.Phase.Name,
                SeriesType = ds.SeriesInfo.Channel.MeasurementType.Name,
                DataPoints = ds.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                ChartLabel = ds.SeriesInfo.Channel.Description

            });

            return dataLookup;
        }



        private Dictionary<string, FlotSeries> GetFrequencyDataLookup(VICycleDataGroup vICycleDataGroup, string type)
        {
            IEnumerable<string> names = vICycleDataGroup.CycleDataGroups.Where(ds => ds.RMS.SeriesInfo.Channel.MeasurementType.Name == type).Select(ds => ds.RMS.SeriesInfo.Channel.Phase.Name);
            Dictionary<string, FlotSeries> dataLookup = new Dictionary<string, FlotSeries>();
            foreach (CycleDataGroup cdg in vICycleDataGroup.CycleDataGroups.Where(ds => ds.RMS.SeriesInfo.Channel.MeasurementType.Name == type))
            {

                FlotSeries flotSeriesRMS = new FlotSeries
                {
                    ChannelID = cdg.RMS.SeriesInfo.Channel.ID,
                    ChannelName = cdg.RMS.SeriesInfo.Channel.Name,
                    ChannelDescription = cdg.RMS.SeriesInfo.Channel.Description,
                    MeasurementCharacteristic = cdg.RMS.SeriesInfo.Channel.MeasurementCharacteristic.Name,
                    MeasurementType = cdg.RMS.SeriesInfo.Channel.MeasurementType.Name,
                    Phase = cdg.RMS.SeriesInfo.Channel.Phase.Name,
                    SeriesType = cdg.RMS.SeriesInfo.Channel.MeasurementType.Name,
                    DataPoints = cdg.RMS.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.RMS.SeriesInfo.Channel, "RMS")
                };
                dataLookup.Add(flotSeriesRMS.ChartLabel, flotSeriesRMS);

                FlotSeries flotSeriesWaveAmp = new FlotSeries
                {
                    ChannelID = cdg.Peak.SeriesInfo.Channel.ID,
                    ChannelName = cdg.Peak.SeriesInfo.Channel.Name,
                    ChannelDescription = cdg.Peak.SeriesInfo.Channel.Description,
                    MeasurementCharacteristic = cdg.Peak.SeriesInfo.Channel.MeasurementCharacteristic.Name,
                    MeasurementType = cdg.Peak.SeriesInfo.Channel.MeasurementType.Name,
                    Phase = cdg.Peak.SeriesInfo.Channel.Phase.Name,
                    SeriesType = cdg.Peak.SeriesInfo.Channel.MeasurementType.Name,
                    DataPoints = cdg.Peak.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Peak.SeriesInfo.Channel, "Amplitude")
                };
                dataLookup.Add(flotSeriesWaveAmp.ChartLabel, flotSeriesWaveAmp);

                FlotSeries flotSeriesPolarAngle = new FlotSeries
                {
                    ChannelID = cdg.Phase.SeriesInfo.Channel.ID,
                    ChannelName = cdg.Phase.SeriesInfo.Channel.Name,
                    ChannelDescription = cdg.Phase.SeriesInfo.Channel.Description,
                    MeasurementCharacteristic = cdg.Phase.SeriesInfo.Channel.MeasurementCharacteristic.Name,
                    MeasurementType = cdg.Phase.SeriesInfo.Channel.MeasurementType.Name,
                    Phase = cdg.Phase.SeriesInfo.Channel.Phase.Name,
                    SeriesType = cdg.Phase.SeriesInfo.Channel.MeasurementType.Name,
                    DataPoints = cdg.Phase.Multiply(180.0D / Math.PI).DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
                    ChartLabel = GetChartLabel(cdg.Phase.SeriesInfo.Channel, "Phase")
                };
                dataLookup.Add(flotSeriesPolarAngle.ChartLabel, flotSeriesPolarAngle);

            }

            return dataLookup;
        }

        private ChannelDetail GetChannel(int seriesID)
        {
            return m_dataContext.Table<ChannelDetail>().QueryRecordWhere("ID = (SELECT ChannelID FROM Series WHERE ID = {0})", seriesID);
        }

        private string GetChartLabel(openXDA.Model.Channel channel, string type = null)
        {

            if (channel.MeasurementType.Name == "Voltage" && type == null)
                return "V" + channel.Phase.Name;
            else if (channel.MeasurementType.Name == "Current" && type == null)
                return "I" + channel.Phase.Name;
            else if (channel.MeasurementType.Name == "Voltage")
                return "V" + channel.Phase.Name + " " + type;
            else if (channel.MeasurementType.Name == "Current")
                return "I" + channel.Phase.Name + " " + type;

            return null;
        }
        private List<double[]> Downsample(List<double[]> series, int maxSampleCount, Range<DateTime> range)
        {
            List<double[]> data = new List<double[]>();
            DateTime epoch = new DateTime(1970, 1, 1);
            double startTime = range.Start.Subtract(epoch).TotalMilliseconds;
            double endTime = range.End.Subtract(epoch).TotalMilliseconds;
            int step = (int)(endTime * 1000 - startTime * 1000) / maxSampleCount;
            if (step < 1)
                step = 1;

            series = series.Where(x => x[0] >= startTime && x[0] <= endTime).ToList();

            int index = 0;

            for (double n = startTime * 1000; n <= endTime * 1000; n += 2 * step)
            {
                double[] min = null;
                double[] max = null;

                while (index < series.Count && series[index][0] * 1000 < n + 2 * step)
                {
                    if (min == null || min[1] > series[index][1])
                        min = series[index];

                    if (max == null || max[1] <= series[index][1])
                        max = series[index];

                    ++index;
                }

                if (min != null)
                {
                    if (min[0] < max[0])
                    {
                        data.Add(min);
                        data.Add(max);
                    }
                    else if (min[0] > max[0])
                    {
                        data.Add(max);
                        data.Add(min);
                    }
                    else
                    {
                        data.Add(min);
                    }
                }
            }

            return data;

        }

        private IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
        {
            using (IDbCommand command = connection.Connection.CreateCommand())
            {
                IDbDataParameter parameter = command.CreateParameter();
                parameter.DbType = DbType.DateTime2;
                parameter.Value = dateTime;
                return parameter;
            }
        }
        #endregion

        #region [ Note Management ]
        [HttpGet]
        public DataTable GetNotes()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                const string SQL = "SELECT * FROM EventNote WHERE EventID = {0}";

                DataTable dataTable = connection.RetrieveData(SQL, eventID);
                return dataTable;
            }


        }

        public class FormData {
            public int? ID { get; set; }
            public int EventID { get; set; }
            public string Note { get; set; }
        }

        [HttpPost]
        public IHttpActionResult AddNote(FormData note) {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;

            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new EventNote()
                    {
                        EventID = note.EventID,
                        Note = note.Note,
                        UserAccount = User.Identity.Name,
                        Timestamp = DateTime.Now
                    };

                    new TableOperations<EventNote>(connection).AddNewRecord(record);

                    result = Ok(record);

                }
            }
            catch(Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        [HttpDelete]
        public IHttpActionResult DeleteNote(FormData note) {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);
                    new TableOperations<EventNote>(connection).DeleteRecord(record);
                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;

        }

        [HttpPatch]
        public IHttpActionResult UpdateNote(FormData note) {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);

                    record.Note = note.Note;
                    record.UserAccount = User.Identity.Name;
                    record.Timestamp = DateTime.Now;
                    

                    new TableOperations<EventNote>(connection).UpdateRecord(record);

                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        #endregion

        #region [ Security ]

        private IHttpActionResult ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            ISecurityProvider securityProvider = SecurityProviderUtility.CreateProvider(username);
            securityProvider.PassthroughPrincipal = User;

            if (!securityProvider.Authenticate())
                return StatusCode(HttpStatusCode.Forbidden);

            SecurityIdentity approverIdentity = new SecurityIdentity(securityProvider);
            SecurityPrincipal approverPrincipal = new SecurityPrincipal(approverIdentity);

            if (!approverPrincipal.IsInRole("Administrator"))
                return StatusCode(HttpStatusCode.Forbidden);

            return null;
        }
        #endregion

    }
}