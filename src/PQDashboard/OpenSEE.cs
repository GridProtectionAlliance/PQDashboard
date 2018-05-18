//******************************************************************************************************
//  OpenSEE.cs - Gbtc
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
//  05/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Web.Model;
using Microsoft.AspNet.SignalR;
using openXDA.Model;
using PQDashboard.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.Caching;
using System.Web;

namespace PQDashboard
{
    public class OpenSEE: IDisposable
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
        public OpenSEE()
        {
            // Establish data context for the view
            m_dataContext = new DataContext(exceptionHandler: MvcApplication.LogException);
        }

        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static OpenSEE()
        {
            s_memoryCache = new MemoryCache("openSEE");
        }
        #endregion


        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="MainController"/> object and optionally releases the managed resources.
        /// </summary>
        public void Dispose()
        {
            if (!m_disposed)
            {
                try
                {
                    m_dataContext?.Dispose();
                }
                finally
                {
                    m_disposed = true;          // Prevent duplicate dispose.
                }
            }
        }

        public JsonReturn GetData(HttpRequest Request)
        {
            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);
            int calcCycle = m_dataContext.Connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
            double systemFrequency = m_dataContext.Connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;

            string type = Request.QueryString["type"];
            string dataType = Request.QueryString["dataType"];

            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3}", ToDateTime2(m_dataContext.Connection, endTime), ToDateTime2(m_dataContext.Connection, startTime), evt.MeterID, evt.LineID);
            foreach (DataRow row in table.Rows)
            {
                Dictionary<string, FlotSeries> temp;
                if (dataType == "Time")
                    temp = QueryEventData(int.Parse(row["ID"].ToString()), meter, type);
                else
                    temp = QueryFrequencyData(int.Parse(row["ID"].ToString()), meter, type);

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

        public JsonReturn GetFaultDistanceData(HttpRequest Request)
        {

            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime epoch = new DateTime(1970, 1, 1);
            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            int calcCycle = m_dataContext.Connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("SELECT ID FROM FaultCurve WHERE EventID IN (SELECT ID FROM Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2} AND LineID = {3})", endTime, startTime, evt.MeterID, evt.LineID);
            foreach (DataRow row in table.Rows)
            {
                KeyValuePair<string, FlotSeries> temp = QueryFaultDistanceData(int.Parse(row["ID"].ToString()), meter);
                if (dict.ContainsKey(temp.Key))
                    dict[temp.Key].DataPoints = dict[temp.Key].DataPoints.Concat(temp.Value.DataPoints).ToList();
                else
                    dict.Add(temp.Key, temp.Value);
            }

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

        public JsonReturn GetBreakerData(HttpRequest Request)
        {
            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime epoch = new DateTime(1970, 1, 1);
            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
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

        private Dictionary<string, FlotSeries> QueryEventData(int eventID, Meter meter, string type)
        {
            string target = "DataGroup" + eventID.ToString() + type;
            DataGroup dataGroup = (DataGroup)s_memoryCache.Get(target);
            if (dataGroup == null)
            {

                byte[] timeDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
                dataGroup = ToDataGroup(meter, timeDomainData);
                s_memoryCache.Add(target, dataGroup, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(10.0D) });
            }
            return GetDataLookup(dataGroup, type);
        }

        private Dictionary<string, FlotSeries> QueryFrequencyData(int eventID, Meter meter, string type)
        {
            string target = "VICycleDataGroup" + eventID.ToString() + type;

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
            Dictionary<string, FlotSeries> dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == "Digital" && (ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "BreakerStatus" || ds.SeriesInfo.Channel.MeasurementCharacteristic.Name == "TCE")).ToDictionary(ds => ds.SeriesInfo.Channel.Name, ds => new FlotSeries()
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
                    DataPoints = cdg.Phase.DataPoints.Select(dataPoint => new double[] { dataPoint.Time.Subtract(m_epoch).TotalMilliseconds, dataPoint.Value }).ToList(),
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

    }
}