//******************************************************************************************************
//  DataHub.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  01/14/2016 - Ritchie Carroll
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
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using GSF;
using GSF.Collections;
using GSF.Configuration;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web.Hubs;
using GSF.Web.Model;
using GSF.Web.Security;
using Microsoft.AspNet.SignalR;
using PQDashboard.Model;

namespace PQDashboard
{
    [AuthorizeHubRole]
    public class DataHub : Hub, IRecordOperationsHub
    {
        #region [ Members ]

        // Fields
        private readonly DataContext m_coreContext;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        public DataHub()
        {
            m_coreContext = new DataContext("securityProvider",exceptionHandler: MvcApplication.LogException);
        }

        #endregion

        #region [ Properties ]

        /// <summary>
        /// Gets <see cref="IRecordOperationsHub.RecordOperationsCache"/> for SignalR hub.
        /// </summary>
        public RecordOperationsCache RecordOperationsCache => s_recordOperationsCache;

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="DataHub"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                    {
                        m_coreContext?.Dispose();
                    }
                }
                finally
                {
                    m_disposed = true;          // Prevent duplicate dispose.
                    base.Dispose(disposing);    // Call base class Dispose().
                }
            }
        }

        public override Task OnConnected()
        {
            // Store the current connection ID for this thread
            s_connectionID.Value = Context.ConnectionId;
            s_connectCount++;

            //MvcApplication.LogStatusMessage($"DataHub connect by {Context.User?.Identity?.Name ?? "Undefined User"} [{Context.ConnectionId}] - count = {s_connectCount}");
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (stopCalled)
            {
                s_connectCount--;
                //MvcApplication.LogStatusMessage($"DataHub disconnect by {Context.User?.Identity?.Name ?? "Undefined User"} [{Context.ConnectionId}] - count = {s_connectCount}");
            }

            return base.OnDisconnected(stopCalled);
        }

        #endregion

        #region [ Static ]

        // Static Properties

        /// <summary>
        /// Gets the hub connection ID for the current thread.
        /// </summary>
        public static string CurrentConnectionID => s_connectionID.Value;

        // Static Fields
        private static volatile int s_connectCount;
        private static readonly ThreadLocal<string> s_connectionID = new ThreadLocal<string>();
        private static readonly RecordOperationsCache s_recordOperationsCache;
        private static string connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;


        // Static Methods

        /// <summary>
        /// Gets statically cached instance of <see cref="RecordOperationsCache"/> for <see cref="DataHub"/> instances.
        /// </summary>
        /// <returns>Statically cached instance of <see cref="RecordOperationsCache"/> for <see cref="DataHub"/> instances.</returns>
        public static RecordOperationsCache GetRecordOperationsCache() => s_recordOperationsCache;

        // Static Constructor
        static DataHub()
        {
            // Analyze and cache record operations of security hub
            s_recordOperationsCache = new RecordOperationsCache(typeof(DataHub));
        }

        #endregion

        // Client-side script functionality

        #region [ Page Table Operations ]

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.QueryRecordCount)]
        public int QueryPageCount(string filterText)
        {
            return m_coreContext.Table<Page>().QueryRecordCount();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.QueryRecords)]
        public IEnumerable<Page> QueryPages(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<Page>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.DeleteRecord)]
        public void DeletePage(int id)
        {
            m_coreContext.Table<Page>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.CreateNewRecord)]
        public Page NewPage()
        {
            return new Page();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.AddNewRecord)]
        public void AddNewPage(Page record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<Page>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Page), RecordOperation.UpdateRecord)]
        public void UpdatePage(Page record)
        {
            m_coreContext.Table<Page>().UpdateRecord(record);
        }

        #endregion

        #region [ Menu Table Operations ]

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.QueryRecordCount)]
        public int QueryMenuCount(string filterText)
        {
            return m_coreContext.Table<Menu>().QueryRecordCount();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.QueryRecords)]
        public IEnumerable<Menu> QueryMenus(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<Menu>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.DeleteRecord)]
        public void DeleteMenu(int id)
        {
            m_coreContext.Table<Menu>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.CreateNewRecord)]
        public Menu NewMenu()
        {
            return new Menu();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.AddNewRecord)]
        public void AddNewMenu(Menu record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<Menu>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Menu), RecordOperation.UpdateRecord)]
        public void UpdateMenu(Menu record)
        {
            m_coreContext.Table<Menu>().UpdateRecord(record);
        }

        #endregion

        #region [ MenuItem Table Operations ]

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.QueryRecordCount)]
        public int QueryMenuItemCount(int parentID, string filterText)
        {
            return m_coreContext.Table<MenuItem>().QueryRecordCount(new RecordRestriction("MenuID = {0}", parentID));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.QueryRecords)]
        public IEnumerable<MenuItem> QueryMenuItems(int parentID, string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<MenuItem>().QueryRecords(sortField, ascending, page, pageSize, new RecordRestriction("MenuID = {0}", parentID));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.DeleteRecord)]
        public void DeleteMenuItem(int id)
        {
            m_coreContext.Table<MenuItem>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.CreateNewRecord)]
        public MenuItem NewMenuItem()
        {
            return new MenuItem();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.AddNewRecord)]
        public void AddNewMenuItem(MenuItem record)
        {
            // TODO: MenuItem.Text is currently required in database, but empty should be allowed for spacer items
            if (string.IsNullOrEmpty(record.Text))
                record.Text = " ";

            m_coreContext.Table<MenuItem>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(MenuItem), RecordOperation.UpdateRecord)]
        public void UpdateMenuItem(MenuItem record)
        {
            // TODO: MenuItem.Text is currently required in database, but empty should be allowed for spacer items
            if (string.IsNullOrEmpty(record.Text))
                record.Text = " ";

            m_coreContext.Table<MenuItem>().UpdateRecord(record);
        }

        #endregion

        #region [ ValueListGroup Table Operations ]

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.QueryRecordCount)]
        public int QueryValueListGroupCount(string filterText)
        {
            return m_coreContext.Table<ValueListGroup>().QueryRecordCount();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.QueryRecords)]
        public IEnumerable<ValueListGroup> QueryValueListGroups(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<ValueListGroup>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.DeleteRecord)]
        public void DeleteValueListGroup(int id)
        {
            m_coreContext.Table<ValueListGroup>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.CreateNewRecord)]
        public ValueListGroup NewValueListGroup()
        {
            return new ValueListGroup();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.AddNewRecord)]
        public void AddNewValueListGroup(ValueListGroup record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<ValueListGroup>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueListGroup), RecordOperation.UpdateRecord)]
        public void UpdateValueListGroup(ValueListGroup record)
        {
            m_coreContext.Table<ValueListGroup>().UpdateRecord(record);
        }

        #endregion

        #region [ ValueList Table Operations ]


        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.QueryRecordCount)]
        public int QueryValueListCount(int parentID, string filterText)
        {
            return m_coreContext.Table<ValueList>().QueryRecordCount(new RecordRestriction("GroupID = {0}", parentID));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.QueryRecords)]
        public IEnumerable<ValueList> QueryValueListItems(int parentID, string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<ValueList>().QueryRecords(sortField, ascending, page, pageSize, new RecordRestriction("GroupID = {0}", parentID));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.DeleteRecord)]
        public void DeleteValueList(int id)
        {
            m_coreContext.Table<ValueList>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.CreateNewRecord)]
        public ValueList NewValueList()
        {
            return new ValueList();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.AddNewRecord)]
        public void AddNewValueList(ValueList record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<ValueList>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(ValueList), RecordOperation.UpdateRecord)]
        public void UpdateValueList(ValueList record)
        {
            m_coreContext.Table<ValueList>().UpdateRecord(record);
        }

        #endregion

        //#region [ Event Service Operations ]

        ///// <summary>
        ///// getDashSettings
        ///// </summary>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDashSettings(String userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    String thedata = "";

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectDashSettings", conn);
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (thedata);

        //}


        ///// <summary>
        ///// getSiteChannelDataQualityDetailsByDate
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <returns></returns>
        //public String getSiteChannelDataQualityDetailsByDate(string siteID, string targetDate)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSiteChannelDataQualityDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getSiteChannelCompletenessDetailsByDate
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <returns></returns>
        //public String getSiteChannelCompletenessDetailsByDate(string siteID, string targetDate)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSiteChannelCompletenessDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getPQIDetailsByEventID
        ///// </summary>
        ///// <param name="eventID"></param>
        ///// <returns></returns>
        //public String getPQIDetailsByEventID(string eventID)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.GetAllImpactedComponents", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@eventID", eventID));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getSiteLinesDetailsByDate
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <returns></returns>
        //public String getSiteLinesDetailsByDate(string siteID, string targetDate)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    SqlConnection conn2 = null;
        //    SqlDataReader rdr2 = null;


        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();

        //        SqlCommand cmd = new SqlCommand("SELECT * FROM EASExtension", conn);
        //        rdr = cmd.ExecuteReader();

        //        StringBuilder QueryBuilder = new StringBuilder();
        //        while (rdr.Read())
        //        {
        //            if (QueryBuilder.Length > 0)
        //            {
        //                QueryBuilder.Append(",");
        //            }
        //            QueryBuilder.Append("dbo.");
        //            QueryBuilder.Append(rdr["HasResultFunction"]);
        //            QueryBuilder.Append("(theeventid) AS ");
        //            QueryBuilder.Append(rdr["ServiceName"]);
        //        }
        //        rdr.Dispose();

        //        cmd = new SqlCommand("dbo.selectSiteLinesDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt;
        //        if (QueryBuilder.Length > 0)
        //        {
        //            conn2 = new SqlConnection(connectionstring);
        //            conn2.Open();

        //            cmd = new SqlCommand("SELECT * , " + QueryBuilder + " FROM @EventIDTable", conn2);
        //            cmd.Parameters.Add(new SqlParameter("@EventIDTable", rdr));
        //            cmd.Parameters[0].SqlDbType = SqlDbType.Structured;
        //            cmd.Parameters[0].TypeName = "SiteLineDetailsByDate";
        //            rdr2 = cmd.ExecuteReader();

        //            dt = new DataTable();
        //            dt.Load(rdr2);

        //        }
        //        else
        //        {
        //            dt = new DataTable();
        //            dt.Load(rdr);
        //        }

        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //        if (conn2 != null)
        //        {
        //            conn2.Close();
        //        }
        //        if (rdr2 != null)
        //        {
        //            rdr2.Close();
        //        }
        //    }

        //    return thedata;
        //}


        ///// <summary>
        ///// getSiteLinesDetailsByDate
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <returns></returns>
        //public String getSiteLinesDisturbanceDetailsByDate(string siteID, string targetDate)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    SqlConnection conn2 = null;
        //    SqlDataReader rdr2 = null;


        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();

        //        SqlCommand cmd = new SqlCommand("dbo.selectSiteLinesDisturbanceDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt;

        //        dt = new DataTable();
        //        dt.Load(rdr);


        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //        if (conn2 != null)
        //        {
        //            conn2.Close();
        //        }
        //        if (rdr2 != null)
        //        {
        //            rdr2.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getBreakersForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getBreakersForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectBreakersForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[3];
        //            //theset.xAxis = new string[duration];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "Normal";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "Late";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "Indeterminate";
        //            theset.data[2].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["normal"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["late"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["indeterminate"]);
        //                i++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getEventsForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getEventsForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectEventsForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[6];
        //            //theset.xAxis = new string[duration];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "Interruption";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "Fault";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "Sag";
        //            theset.data[2].data = new double[duration];

        //            theset.data[3] = new eventService.eventDetail();
        //            theset.data[3].name = "Transient";
        //            theset.data[3].data = new double[duration];

        //            theset.data[4] = new eventService.eventDetail();
        //            theset.data[4].name = "Swell";
        //            theset.data[4].data = new double[duration];

        //            theset.data[5] = new eventService.eventDetail();
        //            theset.data[5].name = "Other";
        //            theset.data[5].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                //thedate, thecount, thename
        //                //DateTime thedate = (DateTime)rdr["thedate"];
        //                //theset.xAxis[i] = thedate.ToString("d");
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["interruptions"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["faults"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["sags"]);
        //                theset.data[3].data[i] = Convert.ToDouble(rdr["transients"]);
        //                theset.data[4].data[i] = Convert.ToDouble(rdr["swells"]);
        //                theset.data[5].data[i] = Convert.ToDouble(rdr["others"]);
        //                i++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getDisturbancesForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getDisturbancesForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectDisturbancesForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[6];
        //            //theset.xAxis = new string[duration];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "5";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "4";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "3";
        //            theset.data[2].data = new double[duration];

        //            theset.data[3] = new eventService.eventDetail();
        //            theset.data[3].name = "2";
        //            theset.data[3].data = new double[duration];

        //            theset.data[4] = new eventService.eventDetail();
        //            theset.data[4].name = "1";
        //            theset.data[4].data = new double[duration];

        //            theset.data[5] = new eventService.eventDetail();
        //            theset.data[5].name = "0";
        //            theset.data[5].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                //thedate, thecount, thename
        //                //DateTime thedate = (DateTime)rdr["thedate"];
        //                //theset.xAxis[i] = thedate.ToString("d");
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["5"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["4"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["3"]);
        //                theset.data[3].data[i] = Convert.ToDouble(rdr["2"]);
        //                theset.data[4].data[i] = Convert.ToDouble(rdr["1"]);
        //                theset.data[5].data[i] = Convert.ToDouble(rdr["0"]);
        //                i++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getCompletenessForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getCompletenessForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);
        //    int metercount = siteID.Split(',').Length - 1;

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectCompletenessForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[7];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "> 100%";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "98% - 100%";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "90% - 97%";
        //            theset.data[2].data = new double[duration];

        //            theset.data[3] = new eventService.eventDetail();
        //            theset.data[3].name = "70% - 89%";
        //            theset.data[3].data = new double[duration];

        //            theset.data[4] = new eventService.eventDetail();
        //            theset.data[4].name = "50% - 69%";
        //            theset.data[4].data = new double[duration];

        //            theset.data[5] = new eventService.eventDetail();
        //            theset.data[5].name = ">0% - 49%";
        //            theset.data[5].data = new double[duration];

        //            theset.data[6] = new eventService.eventDetail();
        //            theset.data[6].name = "0%";
        //            theset.data[6].data = new double[duration];


        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["First"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["Second"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["Third"]);
        //                theset.data[3].data[i] = Convert.ToDouble(rdr["Fourth"]);
        //                theset.data[4].data[i] = Convert.ToDouble(rdr["Fifth"]);
        //                theset.data[5].data[i] = Convert.ToDouble(rdr["Sixth"]);

        //                Double composite = theset.data[0].data[i] + theset.data[1].data[i] + theset.data[2].data[i] + theset.data[3].data[i] + theset.data[4].data[i] + theset.data[5].data[i];

        //                theset.data[6].data[i] = metercount - composite;
        //                i++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getCorrectnessForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getCorrectnessForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);
        //    int metercount = siteID.Split(',').Length - 1;

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectCorrectnessForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[7];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "> 100%";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "98% - 100%";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "90% - 97%";
        //            theset.data[2].data = new double[duration];

        //            theset.data[3] = new eventService.eventDetail();
        //            theset.data[3].name = "70% - 89%";
        //            theset.data[3].data = new double[duration];

        //            theset.data[4] = new eventService.eventDetail();
        //            theset.data[4].name = "50% - 69%";
        //            theset.data[4].data = new double[duration];

        //            theset.data[5] = new eventService.eventDetail();
        //            theset.data[5].name = ">0% - 49%";
        //            theset.data[5].data = new double[duration];

        //            theset.data[6] = new eventService.eventDetail();
        //            theset.data[6].name = "0%";
        //            theset.data[6].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["First"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["Second"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["Third"]);
        //                theset.data[3].data[i] = Convert.ToDouble(rdr["Fourth"]);
        //                theset.data[4].data[i] = Convert.ToDouble(rdr["Fifth"]);
        //                theset.data[5].data[i] = Convert.ToDouble(rdr["Sixth"]);

        //                Double composite = theset.data[0].data[i] + theset.data[1].data[i] + theset.data[2].data[i] + theset.data[3].data[i] + theset.data[4].data[i] + theset.data[5].data[i];

        //                theset.data[6].data[i] = metercount - composite;
        //                i++;
        //            }
        //        }
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}


        ///// <summary>
        ///// getCorrectnessForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getCorrectnessForPeriod2(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectCorrectnessForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[3];
        //            //theset.xAxis = new string[duration];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "Latched";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "Unreasonable";
        //            theset.data[1].data = new double[duration];

        //            theset.data[2] = new eventService.eventDetail();
        //            theset.data[2].name = "Noncongruent";
        //            theset.data[2].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                //thedate, thecount, thename
        //                //DateTime thedate = (DateTime)rdr["thedate"];
        //                //theset.xAxis[i] = thedate.ToString("d");
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["Latched"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["Unreasonable"]);
        //                theset.data[2].data[i] = Convert.ToDouble(rdr["Noncongruent"]);
        //                i++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getTrendingForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getTrendingForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectTrendingForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[2];
        //            //theset.xAxis = new string[duration];

        //            theset.data[0] = new eventService.eventDetail();
        //            theset.data[0].name = "Alarm";
        //            theset.data[0].data = new double[duration];

        //            theset.data[1] = new eventService.eventDetail();
        //            theset.data[1].name = "OffNormal";
        //            theset.data[1].data = new double[duration];

        //            int i = 0;

        //            while (rdr.Read())
        //            {
        //                //thedate, thecount, thename
        //                //DateTime thedate = (DateTime)rdr["thedate"];
        //                //theset.xAxis[i] = thedate.ToString("d");
        //                theset.data[0].data[i] = Convert.ToDouble(rdr["Alarm"]);
        //                theset.data[1].data[i] = Convert.ToDouble(rdr["Offnormal"]);
        //                i++;
        //            }
        //        }
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// getTrendingDataForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public List<eventService.TrendingData> getTrendingDataForPeriod(string siteID, string colorScale, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    List<eventService.TrendingData> theset = new List<eventService.TrendingData>();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectTrendingDataByChannelByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@StartDate", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EndDate", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@colorScale", colorScale));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            while (rdr.Read())
        //            {
        //                eventService.TrendingData td = new eventService.TrendingData();
        //                td.Date = Convert.ToString(rdr["Date"]);
        //                td.Maximum = Convert.ToDouble(rdr["Maximum"]);
        //                td.Minimum = Convert.ToDouble(rdr["Minimum"]);
        //                td.Average = Convert.ToDouble(rdr["Average"]);

        //                theset.Add(td);
        //            }
        //        }
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}


        ///// <summary>
        ///// getFaultsForPeriod
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public eventService.eventSet getFaultsForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;
        //    eventService.eventSet theset = new eventService.eventSet();
        //    DateTime thedatefrom = DateTime.Parse(targetDateFrom);
        //    DateTime thedateto = DateTime.Parse(targetDateTo);

        //    int duration = thedateto.Subtract(thedatefrom).Days + 1;
        //    List<String> powerlineclasslist = new List<string>();

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();

        //        // Get Power Line Class Count
        //        SqlCommand cmd2 = new SqlCommand("dbo.selectPowerLineClasses", conn);
        //        cmd2.CommandType = CommandType.StoredProcedure;
        //        cmd2.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd2.CommandTimeout = 300;
        //        rdr = cmd2.ExecuteReader();
        //        if (rdr.HasRows)
        //        {
        //            while (rdr.Read())
        //            {
        //                powerlineclasslist.Add(Convert.ToString(rdr["class"]));
        //            }

        //        }

        //        rdr.Close();
        //        rdr = null;

        //        SqlCommand cmd = new SqlCommand("dbo.selectFaultsForMeterIDByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", thedatefrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", thedateto));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        if (rdr.HasRows)
        //        {

        //            theset.data = new eventService.eventDetail[powerlineclasslist.Count];
        //            ////theset.xAxis = new string[duration];
        //            int i = 0;

        //            foreach (var temp in powerlineclasslist)
        //            {

        //                theset.data[i] = new eventService.eventDetail();
        //                theset.data[i].name = temp + " kV";
        //                theset.data[i].data = new double[duration];
        //                i++;
        //            }

        //            int j = 0;

        //            while (rdr.Read())
        //            {
        //                //DateTime thedate = (DateTime)rdr["thedate"];
        //                //theset.xAxis[j] = thedate.ToString("d"); 

        //                for (i = 0; i < powerlineclasslist.Count; i++)
        //                {
        //                    theset.data[i].data[j] = Convert.ToDouble(rdr["thecount"]);
        //                    if (i < (powerlineclasslist.Count - 1)) rdr.Read();
        //                }

        //                j++;
        //            }
        //        }

        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return (theset);
        //}

        ///// <summary>
        ///// DataTable2JSON
        ///// </summary>
        ///// <param name="dt"></param>
        ///// <returns></returns>
        //public string DataTable2JSON(DataTable dt)
        //{
        //    List<Object> RowList = new List<Object>();
        //    foreach (DataRow dr in dt.Rows)
        //    {
        //        Dictionary<Object, Object> ColList = new Dictionary<Object, Object>();
        //        foreach (DataColumn dc in dt.Columns)
        //        {
        //            string t = (string)((string.Empty == dr[dc].ToString()) ? null : dr[dc].ToString());

        //            ColList.Add(dc.ColumnName, t);
        //        }
        //        RowList.Add(ColList);
        //    }
        //    JavaScriptSerializer js = new JavaScriptSerializer();
        //    string JSON = js.Serialize(RowList);
        //    return JSON;
        //}


        ///// <summary>
        ///// getDetailsForSitesBreakers
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesBreakers(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesBreakersDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesEventsDateRange
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDateFrom"></param>
        ///// <param name="targetDateTo"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesEventsDateRange(string siteID, string targetDateFrom, string targetDateTo, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesEventsDetailsByDateRange", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
        //        cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesEvents
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesEvents(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesEventsDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesEvents
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesDisturbances(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesDisturbancesDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesCompleteness
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesCompleteness(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesCompletenessDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesCorrectness
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesCorrectness(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesCorrectnessDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesFaults
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesFaults(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesFaultsDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;

        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesTrending
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesTrending(string siteID, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesTrendingDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;
        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    catch (Exception e)
        //    {
        //        int i = 0;
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        ///// <summary>
        ///// getDetailsForSitesTrendingData
        ///// </summary>
        ///// <param name="siteID"></param>
        ///// <param name="measurementType"></param>
        ///// <param name="targetDate"></param>
        ///// <param name="userName"></param>
        ///// <returns></returns>
        //public String getDetailsForSitesTrendingData(string siteID, string colorScale, string targetDate, string userName)
        //{

        //    String thedata = "";
        //    SqlConnection conn = null;
        //    SqlDataReader rdr = null;

        //    try
        //    {
        //        conn = new SqlConnection(connectionstring);
        //        conn.Open();
        //        SqlCommand cmd = new SqlCommand("dbo.selectSitesTrendingDataDetailsByDate", conn);
        //        cmd.CommandType = CommandType.StoredProcedure;
        //        cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
        //        cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
        //        cmd.Parameters.Add(new SqlParameter("@colorScaleName", colorScale));
        //        cmd.Parameters.Add(new SqlParameter("@username", userName));
        //        cmd.CommandTimeout = 300;
        //        rdr = cmd.ExecuteReader();
        //        DataTable dt = new DataTable();
        //        dt.Load(rdr);
        //        thedata = DataTable2JSON(dt);
        //        dt.Dispose();
        //    }
        //    catch (Exception e)
        //    {
        //        int i = 0;
        //    }
        //    finally
        //    {
        //        if (conn != null)
        //        {
        //            conn.Close();
        //        }
        //        if (rdr != null)
        //        {
        //            rdr.Close();
        //        }
        //    }

        //    return thedata;
        //}

        //#endregion

        #region [ Map Service Operations ]

        #endregion

        #region [ Signal Service Operations ]

        #endregion


        #region [ Miscellaneous Hub Operations ]

        /// <summary>
        /// Gets page setting for specified page.
        /// </summary>
        /// <param name="pageID">ID of page record.</param>
        /// <param name="key">Setting key name.</param>
        /// <param name="defaultValue">Setting default value.</param>
        /// <returns>Page setting for specified page.</returns>
        public string GetPageSetting(int pageID, string key, string defaultValue)
        {
            Page page = m_coreContext.Table<Page>().LoadRecord(pageID);
            Dictionary<string, string> pageSettings = (page?.ServerConfiguration ?? "").ParseKeyValuePairs();
            AppModel model = MvcApplication.DefaultModel;
            return model.GetPageSetting(pageSettings, model.Global.PageDefaults, key, defaultValue);
        }

        /// <summary>
        /// Gets the absolute path for a virtual path, e.g., ~/Images/Menu
        /// </summary>
        /// <param name="path">Virtual path o convert to absolute path.</param>
        /// <returns>Absolute path for a virtual path.</returns>
        public string GetAbsolutePath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return "";

            return VirtualPathUtility.ToAbsolute(path);
        }

        /// <summary>
        /// Gets UserAccount table ID for current user.
        /// </summary>
        /// <returns>UserAccount.ID for current user.</returns>
        public Guid GetCurrentUserID()
        {
            Guid userID;
            AuthorizationCache.UserIDs.TryGetValue(UserInfo.CurrentUserID, out userID);
            return userID;
        }

        #endregion
    }
}
