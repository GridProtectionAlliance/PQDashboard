//******************************************************************************************************
//  MainController.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  08/31/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Web.Mvc;
using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Identity;
using GSF.Web.Model;
using GSF.Web.Security;
using Newtonsoft.Json.Linq;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's main pages.
    /// </summary>
    //[AuthorizeControllerRole]
    public class MainController : Controller
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);
        private readonly DataContext m_dataContext;
        private readonly AppModel m_appModel;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="MainController"/>.
        /// </summary>
        public MainController()
        {
            // Establish data context for the view
            m_dataContext = new DataContext(exceptionHandler: MvcApplication.LogException);
            ViewData.Add("DataContext", m_dataContext);

            // Set default model for pages used by layout
            m_appModel = new AppModel(m_dataContext);
            ViewData.Model = m_appModel;
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="MainController"/> object and optionally releases the managed resources.
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

        public ActionResult Home()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Home", ViewBag);

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (m_dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch (Exception ex)
            {
                ViewBag.username = "";
            }

            return View();
        }

        public ActionResult Help()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Help", ViewBag);
            return View();
        }

        public ActionResult GraphMeasurements()
        {
            m_appModel.ConfigureView(Url.RequestContext, "GraphMeasurements", ViewBag);
            return View();
        }

        public ActionResult Contact()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Contact", ViewBag);
            ViewBag.Message = "Contacting the Grid Protection Alliance";
            return View();
        }

        public ActionResult DisplayPDF()
        {
            // Using route ID, i.e., /Main/DisplayPDF/{id}, as page name of PDF load
            string routeID = Url.RequestContext.RouteData.Values["id"] as string ?? "UndefinedPageName";
            m_appModel.ConfigureView(Url.RequestContext, routeID, ViewBag);

            return View();
        }

        public ActionResult OpenSEE()
        {
            //m_appModel.ConfigureView(Url.RequestContext, "OpenSEE", ViewBag);
            return View();
        }

        public ActionResult OpenSEE2()
        {
            //m_appModel.ConfigureView(Url.RequestContext, "OpenSEE", ViewBag);
            return View();
        }


        public ActionResult OpenSTE()
        {
            //m_appModel.ConfigureView(Url.RequestContext, "OpenSEE", ViewBag);
            return View();
        }

        public ActionResult MeterEventsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (m_dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch (Exception ex)
            {
                ViewBag.username = "";
            }

            return View();
        }

        public ActionResult MeterExtensionsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (m_dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch (Exception ex)
            {
                ViewBag.username = "";
            }

            return View();
        }

        public ActionResult MeterDisturbancesByLine()
        {
            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (m_dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch (Exception ex)
            {
                ViewBag.username = "";
            }

            m_appModel.ConfigureView(Url.RequestContext, "MeterDisturbancesByLine", ViewBag);
            return View();
        }

        public ActionResult QuickSearch()
        {
            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (m_dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch (Exception ex)
            {
                ViewBag.username = "";
            }

            m_appModel.ConfigureView(Url.RequestContext, "QuickSearch", ViewBag);
            return View();
        }


        public ActionResult GetVoltageEventData()
        {
            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2}", endTime, startTime, evt.MeterID);
            foreach (DataRow row in table.Rows)
            {
                Dictionary<string, FlotSeries> temp = QueryEventData(int.Parse(row["ID"].ToString()), meter, "Voltage");
                foreach (string key in temp.Keys)
                {
                    if (temp[key].MeasurementType == "Voltage") {
                        if (dict.ContainsKey(key))
                            dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                        else
                            dict.Add(key, temp[key]);
                    }
                }
            }

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
            return Json(returnDict, JsonRequestBehavior.AllowGet);

        }

        public ActionResult GetVoltageFrequencyData()
        {
            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2}", endTime, startTime, evt.MeterID);
            foreach (DataRow row in table.Rows)
            {
                Dictionary<string, FlotSeries> temp = QueryFrequencyData(int.Parse(row["ID"].ToString()), meter, "Voltage");
                foreach (string key in temp.Keys)
                {
                    if (temp[key].MeasurementType == "Voltage")
                    {
                        if (dict.ContainsKey(key))
                            dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                        else
                            dict.Add(key, temp[key]);
                    }
                }
            }

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
            return Json(returnDict, JsonRequestBehavior.AllowGet);

        }


        public ActionResult GetCurrentEventData()
        {
            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2}", endTime, startTime, evt.MeterID);
            foreach (DataRow row in table.Rows)
            {
                Dictionary<string, FlotSeries> temp = QueryEventData(int.Parse(row["ID"].ToString()), meter, "Current");
                foreach (string key in temp.Keys)
                {
                    if (temp[key].MeasurementType == "Current")
                    {
                        if (dict.ContainsKey(key))
                            dict[key].DataPoints = dict[key].DataPoints.Concat(temp[key].DataPoints).ToList();
                        else
                            dict.Add(key, temp[key]);
                    }
                }
            }

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
            return Json(returnDict, JsonRequestBehavior.AllowGet);

        }

        public ActionResult GetFaultDistanceData() {

            int eventId = int.Parse(Request.QueryString["eventId"]);
            Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);
            Meter meter = m_dataContext.Table<Meter>().QueryRecordWhere("ID = {0}", evt.MeterID);
            meter.ConnectionFactory = () => new AdoDataConnection(m_dataContext.Connection.Connection, typeof(SqlDataAdapter), false);

            DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
            DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
            int pixels = int.Parse(Request.QueryString["pixels"]);
            DataTable table;

            Dictionary<string, FlotSeries> dict = new Dictionary<string, FlotSeries>();
            table = m_dataContext.Connection.RetrieveData("SELECT ID FROM FaultCurve WHERE EventID IN (SELECT ID FROM Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2})", endTime, startTime, evt.MeterID);
            foreach (DataRow row in table.Rows)
            {
                KeyValuePair<string, FlotSeries> temp = QueryFaultDistanceData(int.Parse(row["ID"].ToString()), meter);
                if (dict.ContainsKey(temp.Key))
                    dict[temp.Key].DataPoints = dict[temp.Key].DataPoints.Concat(temp.Value.DataPoints).ToList();
                else
                    dict.Add(temp.Key, temp.Value);
            }
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

            return Json(returnDict, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region [ OpenSEE Table Operations ]

        private class JsonReturn
        {
            public DateTime StartDate;
            public DateTime EndDate;
            public List<FlotSeries> Data;
        }

        private class FlotSeries
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
            byte[] timeDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT TimeDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
            DataGroup dataGroup = ToDataGroup(meter, timeDomainData);       
            return GetDataLookup(dataGroup, type);
        }

        private Dictionary<string, FlotSeries> QueryFrequencyData(int eventID, Meter meter, string type)
        {
            byte[] frequencyDomainData = m_dataContext.Connection.ExecuteScalar<byte[]>("SELECT FrequencyDomainData FROM EventData WHERE ID = (SELECT EventDataID FROM Event WHERE ID = {0})", eventID);
            DataGroup dataGroup = ToDataGroup(meter, frequencyDomainData);
            VICycleDataGroup vICycleDataGroup = new VICycleDataGroup(dataGroup);
            return GetFrequencyDataLookup(vICycleDataGroup, type);
        }

        private KeyValuePair<string, FlotSeries> QueryFaultDistanceData(int faultCurveID, Meter meter)
        {

            FaultCurve faultCurve = m_dataContext.Table<FaultCurve>().QueryRecordWhere("ID = {0}", faultCurveID);
            DataGroup dataGroup = ToDataGroup(meter, faultCurve.Data);
            FlotSeries flotSeries = new FlotSeries() {
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
            return new KeyValuePair<string, FlotSeries> (faultCurve.Algorithm, flotSeries);
        }

        public DataGroup ToDataGroup(Meter meter, byte[] data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            return dataGroup;
        }


        private Dictionary<string, FlotSeries> GetDataLookup(DataGroup dataGroup, string type)
        {
            IEnumerable<string> names = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type).Select(x => GetChartLabel(x.SeriesInfo.Channel));
            Dictionary<string, FlotSeries> dataLookup = dataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type).ToDictionary(ds => GetChartLabel(ds.SeriesInfo.Channel), ds => new FlotSeries() {
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

        private Dictionary<string, FlotSeries> GetFrequencyDataLookup(DataGroup dataGroup, VICycleDataGroup vICycleDataGroup, string type)
        {
            IEnumerable<string> names = vICycleDataGroup.VA.RMS.DataPoints.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type && ds.SeriesInfo.Channel.MeasurementCharacteristic.Name != "Instantaneous").Select(x => GetChartLabel(x.SeriesInfo.Channel));
            Dictionary<string, FlotSeries> dataLookup = vICycleDataGroup.DataSeries.Where(ds => ds.SeriesInfo.Channel.MeasurementType.Name == type && ds.SeriesInfo.Channel.MeasurementCharacteristic.Name != "Instantaneous").ToDictionary(ds => GetChartLabel(ds.SeriesInfo.Channel), ds => new FlotSeries()
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

        private ChannelDetail GetChannel(int seriesID)
        {
                return m_dataContext.Table<ChannelDetail>().QueryRecordWhere("ID = (SELECT ChannelID FROM Series WHERE ID = {0})", seriesID);
        }

        private string GetChartLabel(openXDA.Model.Channel channel) {

            if (channel.MeasurementType.Name == "Voltage" && channel.MeasurementCharacteristic.Name == "Instantaneous")
                return "V" + channel.Phase.Name;
            else if (channel.MeasurementType.Name == "Current" && channel.MeasurementCharacteristic.Name == "Instantaneous")
                return "I" + channel.Phase.Name;
            else if(channel.MeasurementType.Name == "Voltage" && channel.MeasurementCharacteristic.Name != "Instantaneous")
                return "V" + channel.Phase.Name + " " + channel.MeasurementCharacteristic.Name;
            else if (channel.MeasurementType.Name == "Current" && channel.MeasurementCharacteristic.Name != "Instantaneous")
                return "I" + channel.Phase.Name + " " + channel.MeasurementCharacteristic.Name;

            return null;
        }
        private List<double[]> Downsample(List<double[]> series, int sampleCount, Range<DateTime> range)
        {
            List<double[]> data = new List<double[]>();
            DateTime epoch = new DateTime(1970, 1, 1);
            double startTime = range.Start.Subtract(epoch).TotalMilliseconds;
            double endTime = range.End.Subtract(epoch).TotalMilliseconds;
            series = series.Where(x => x[0] >= startTime && x[0] <= endTime).ToList();
            if (sampleCount > series.Count) return series;

            int index = 0;

            for (int n = 0; n < sampleCount; n += 2)
            {
                double end = startTime + (n + 2) * range.End.Subtract(range.Start).TotalMilliseconds / sampleCount;

                double[] min = null;
                double[] max = null;

                while (index < series.Count && series[index][0] < end)
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
                else
                {
                    if (data.Any() && data.Last() != null)
                        data.Add(null);
                }
            }

            return data;

        }
        #endregion

    }
}