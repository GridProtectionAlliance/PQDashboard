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
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Web.Mvc;
using FaultData.DataAnalysis;
using GSF;
using GSF.Identity;
using GSF.Web.Model;
using GSF.Web.Security;
using Newtonsoft.Json.Linq;
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

        public ActionResult GetEventData()
        {
                int eventId = int.Parse(Request.QueryString["eventId"]);
                Event evt = m_dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventId);

                DateTime startTime = (Request.QueryString["startDate"] != null ? DateTime.Parse(Request.QueryString["startDate"]) : evt.StartTime);
                DateTime endTime = (Request.QueryString["endDate"] != null ? DateTime.Parse(Request.QueryString["endDate"]) : evt.EndTime);
                int pixels = int.Parse(Request.QueryString["pixels"]);
                string type = Request.QueryString["type"];
                DataTable table;

                Dictionary<string, List<double[]>> dict = new Dictionary<string, List<double[]>>();
                table = m_dataContext.Connection.RetrieveData("select ID from Event WHERE StartTime <= {0} AND EndTime >= {1} and MeterID = {2}", endTime, startTime, evt.MeterID);
                foreach (DataRow row in table.Rows)
                {
                    Dictionary<string, List<double[]>> temp = QueryEventData(int.Parse(row["ID"].ToString()), type);
                    foreach (string key in temp.Keys)
                    {
                        if (dict.ContainsKey(key))
                        {
                            dict[key] = dict[key].Concat(temp[key]).ToList();
                        }
                        else
                        {
                            dict.Add(key, temp[key]);
                        }
                    }
                }

                Dictionary<string, List<double[]>> returnDict = new Dictionary<string, List<double[]>>();
                foreach (string key in dict.Keys)
                {
                    returnDict.Add(key, Downsample(dict[key].OrderBy(x => x[0]).ToList(), pixels, new Range<DateTime>(startTime, endTime)));
                }

                return Json(returnDict, JsonRequestBehavior.AllowGet);

            }


        #endregion

        #region [ OpenSEE Table Operations ]

        private Dictionary<string, List<double[]>> QueryEventData(int eventID, string type)
        {

            const string EventDataQueryFormat =
                "SELECT " +
                "    EventData.TimeDomainData, " +
                "    EventData.FrequencyDomainData " +
                "FROM " +
                "    Event JOIN " +
                "    EventData ON Event.EventDataID = EventData.ID " +
                "WHERE Event.ID = {0}";

            Dictionary<int, List<double[]>> dataLookup = new Dictionary<int, List<double[]>>();
            byte[] timeDomainData = null;

            using (IDataReader reader = m_dataContext.Connection.ExecuteReader(EventDataQueryFormat, eventID))
            {
                while (reader.Read())
                {
                    timeDomainData = Decompress((byte[])reader["TimeDomainData"]);
                }
            }


            return GetDataLookup(timeDomainData, type);
        }

        private byte[] Decompress(byte[] compressedBytes)
        {
            using (MemoryStream memoryStream = new MemoryStream(compressedBytes))
            using (GZipStream gzipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
            using (MemoryStream destinationStream = new MemoryStream())
            {
                gzipStream.CopyTo(destinationStream);
                return destinationStream.ToArray();
            }
        }

        public DataGroup ToDataGroup(Meter meter, byte[] data)
        {
            DataGroup dataGroup = new DataGroup();
            dataGroup.FromData(meter, data);
            return dataGroup;
        }


        private Dictionary<string, List<double[]>> GetDataLookup(byte[] bytes, string type)
        {
            int offset;
            int samples;
            double[] times;

            string channelName;
            List<double[]> dataSeries;
            Dictionary<string, List<double[]>> dataLookup = new Dictionary<string, List<double[]>>();

            offset = 0;
            samples = LittleEndian.ToInt32(bytes, offset);
            offset += sizeof(int);

            long epoch = new DateTime(1970, 1, 1).Ticks;

            times = new double[samples];

            for (int i = 0; i < samples; i++)
            {
                times[i] = (LittleEndian.ToInt64(bytes, offset) - epoch) / (double)TimeSpan.TicksPerMillisecond;
                offset += sizeof(long);
            }


            while (offset < bytes.Length)
            {
                dataSeries = new List<double[]>();
                channelName = GetChannelName(LittleEndian.ToInt32(bytes, offset));
                offset += sizeof(int);

                for (int i = 0; i < samples; i++)
                {
                    dataSeries.Add(new double[] { times[i], LittleEndian.ToDouble(bytes, offset) });
                    offset += sizeof(double);
                }

                if (channelName.Contains(type))
                    dataLookup.Add(channelName, dataSeries);
            }

            return dataLookup;
        }

        private string GetChannelName(int seriesID)
        {
                const string QueryFormat =
                    "SELECT Channel.Name " +
                    "FROM " +
                    "    Channel JOIN " +
                    "    Series ON Series.ChannelID = Channel.ID " +
                    "WHERE Series.ID = {0}";

                return m_dataContext.Connection.ExecuteScalar<string>(QueryFormat, seriesID);
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