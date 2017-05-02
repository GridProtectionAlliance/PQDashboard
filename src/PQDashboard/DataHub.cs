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
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using GSF.Configuration;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web.Hubs;
using GSF.Web.Model;
using GSF.Web.Security;
using PQDashboard.Model;
using openHistorian.XDALink;

namespace PQDashboard
{
    public class DataHub : RecordOperationsHub<DataHub>
    {
        #region [ Members ]

        // Fields
        private readonly DataContext m_coreContext;
        private bool m_disposed;
        private readonly DataSubscriptionOperations m_dataSubscriptionOperations;


        #endregion

        #region [ Constructors ]

        public DataHub() : base(MvcApplication.LogStatusMessage, MvcApplication.LogException)
        {
            m_coreContext = new DataContext("securityProvider",exceptionHandler: MvcApplication.LogException);
            m_dataSubscriptionOperations = new DataSubscriptionOperations(this, MvcApplication.LogStatusMessage, MvcApplication.LogException);

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

        [RecordOperation(typeof(Page), RecordOperation.QueryRecordCount)]
        public int QueryPageCount(string filterText)
        {
            return m_coreContext.Table<Page>().QueryRecordCount();
        }

        [RecordOperation(typeof(Page), RecordOperation.QueryRecords)]
        public IEnumerable<Page> QueryPages(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<Page>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [RecordOperation(typeof(Page), RecordOperation.DeleteRecord)]
        public void DeletePage(int id)
        {
            m_coreContext.Table<Page>().DeleteRecord(id);
        }

        [RecordOperation(typeof(Page), RecordOperation.CreateNewRecord)]
        public Page NewPage()
        {
            return new Page();
        }

        [RecordOperation(typeof(Page), RecordOperation.AddNewRecord)]
        public void AddNewPage(Page record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<Page>().AddNewRecord(record);
        }

        [RecordOperation(typeof(Page), RecordOperation.UpdateRecord)]
        public void UpdatePage(Page record)
        {
            m_coreContext.Table<Page>().UpdateRecord(record);
        }

        #endregion

        #region [ Menu Table Operations ]

        [RecordOperation(typeof(Menu), RecordOperation.QueryRecordCount)]
        public int QueryMenuCount(string filterText)
        {
            return m_coreContext.Table<Menu>().QueryRecordCount();
        }

        [RecordOperation(typeof(Menu), RecordOperation.QueryRecords)]
        public IEnumerable<Menu> QueryMenus(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<Menu>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [RecordOperation(typeof(Menu), RecordOperation.DeleteRecord)]
        public void DeleteMenu(int id)
        {
            m_coreContext.Table<Menu>().DeleteRecord(id);
        }

        [RecordOperation(typeof(Menu), RecordOperation.CreateNewRecord)]
        public Menu NewMenu()
        {
            return new Menu();
        }

        [RecordOperation(typeof(Menu), RecordOperation.AddNewRecord)]
        public void AddNewMenu(Menu record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<Menu>().AddNewRecord(record);
        }

        [RecordOperation(typeof(Menu), RecordOperation.UpdateRecord)]
        public void UpdateMenu(Menu record)
        {
            m_coreContext.Table<Menu>().UpdateRecord(record);
        }

        #endregion

        #region [ MenuItem Table Operations ]

        [RecordOperation(typeof(MenuItem), RecordOperation.QueryRecordCount)]
        public int QueryMenuItemCount(int parentID, string filterText)
        {
            return m_coreContext.Table<MenuItem>().QueryRecordCount(new RecordRestriction("MenuID = {0}", parentID));
        }

        [RecordOperation(typeof(MenuItem), RecordOperation.QueryRecords)]
        public IEnumerable<MenuItem> QueryMenuItems(int parentID, string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<MenuItem>().QueryRecords(sortField, ascending, page, pageSize, new RecordRestriction("MenuID = {0}", parentID));
        }

        [RecordOperation(typeof(MenuItem), RecordOperation.DeleteRecord)]
        public void DeleteMenuItem(int id)
        {
            m_coreContext.Table<MenuItem>().DeleteRecord(id);
        }

        [RecordOperation(typeof(MenuItem), RecordOperation.CreateNewRecord)]
        public MenuItem NewMenuItem()
        {
            return new MenuItem();
        }

        [RecordOperation(typeof(MenuItem), RecordOperation.AddNewRecord)]
        public void AddNewMenuItem(MenuItem record)
        {
            // TODO: MenuItem.Text is currently required in database, but empty should be allowed for spacer items
            if (string.IsNullOrEmpty(record.Text))
                record.Text = " ";

            m_coreContext.Table<MenuItem>().AddNewRecord(record);
        }

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

        [RecordOperation(typeof(ValueListGroup), RecordOperation.QueryRecordCount)]
        public int QueryValueListGroupCount(string filterText)
        {
            return m_coreContext.Table<ValueListGroup>().QueryRecordCount();
        }

        [RecordOperation(typeof(ValueListGroup), RecordOperation.QueryRecords)]
        public IEnumerable<ValueListGroup> QueryValueListGroups(string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<ValueListGroup>().QueryRecords(sortField, ascending, page, pageSize);
        }

        [RecordOperation(typeof(ValueListGroup), RecordOperation.DeleteRecord)]
        public void DeleteValueListGroup(int id)
        {
            m_coreContext.Table<ValueListGroup>().DeleteRecord(id);
        }

        [RecordOperation(typeof(ValueListGroup), RecordOperation.CreateNewRecord)]
        public ValueListGroup NewValueListGroup()
        {
            return new ValueListGroup();
        }

        [RecordOperation(typeof(ValueListGroup), RecordOperation.AddNewRecord)]
        public void AddNewValueListGroup(ValueListGroup record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<ValueListGroup>().AddNewRecord(record);
        }

        [RecordOperation(typeof(ValueListGroup), RecordOperation.UpdateRecord)]
        public void UpdateValueListGroup(ValueListGroup record)
        {
            m_coreContext.Table<ValueListGroup>().UpdateRecord(record);
        }

        #endregion

        #region [ ValueList Table Operations ]


        [RecordOperation(typeof(ValueList), RecordOperation.QueryRecordCount)]
        public int QueryValueListCount(int parentID, string filterText)
        {
            return m_coreContext.Table<ValueList>().QueryRecordCount(new RecordRestriction("GroupID = {0}", parentID));
        }

        [RecordOperation(typeof(ValueList), RecordOperation.QueryRecords)]
        public IEnumerable<ValueList> QueryValueListItems(int parentID, string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return m_coreContext.Table<ValueList>().QueryRecords(sortField, ascending, page, pageSize, new RecordRestriction("GroupID = {0}", parentID));
        }

        [RecordOperation(typeof(ValueList), RecordOperation.DeleteRecord)]
        public void DeleteValueList(int id)
        {
            m_coreContext.Table<ValueList>().DeleteRecord(id);
        }

        [RecordOperation(typeof(ValueList), RecordOperation.CreateNewRecord)]
        public ValueList NewValueList()
        {
            return new ValueList();
        }

        [RecordOperation(typeof(ValueList), RecordOperation.AddNewRecord)]
        public void AddNewValueList(ValueList record)
        {
            record.CreatedOn = DateTime.UtcNow;
            m_coreContext.Table<ValueList>().AddNewRecord(record);
        }

        [RecordOperation(typeof(ValueList), RecordOperation.UpdateRecord)]
        public void UpdateValueList(ValueList record)
        {
            m_coreContext.Table<ValueList>().UpdateRecord(record);
        }

        #endregion

        #region [ Page Load Operations]

        public IEnumerable<MeterID> GetMetersByGroup(int meterGroup)
        {
            return DataContext.Table<MeterID>().QueryRecords(restriction: new RecordRestriction("ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID = {0})", meterGroup));
        }

        public IEnumerable<MeterID> GetMeters(int deviceFilter, string userName)
        {
            DeviceFilter df = DataContext.Table<DeviceFilter>().QueryRecord(new RecordRestriction("ID = {0}", deviceFilter));
            DataTable table;

            try
            {
                string filterExpression = null;
                if (df == null)
                {
                    table = DataContext.Connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID =  (SELECT ID FROM UserAccount WHERE Name = '{userName}')))");
                    return table.Select().Select(row => DataContext.Table<MeterID>().LoadRecord(row));
                }

                if (df.MeterGroupID == 0)
                    table = DataContext.Connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID = (SELECT ID FROM UserAccount WHERE Name = '{df.UserAccount}')))");
                else
                    table = DataContext.Connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID = {df.MeterGroupID})");

                if (df.FilterExpression != "")
                    return table.Select(df.FilterExpression).Select(row => DataContext.Table<MeterID>().LoadRecord(row));
            }
            catch (Exception)
            {
                return new List<MeterID>();
            }

            return table.Select().Select(row => DataContext.Table<MeterID>().LoadRecord(row));
        }


        public IEnumerable<DashSettings> GetTabSettings(string userName)
        {
            List<DashSettings> dashSettings = DataContext.Table<DashSettings>().QueryRecords().ToList();

            List<UserDashSettings> userDashSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

            foreach (UserDashSettings setting in userDashSettings)
            {
                if(setting.Name == "DashTab")
                    dashSettings.Find(x => x.Value == setting.Value).Enabled = setting.Enabled;
            }

            return dashSettings;
        }

        #endregion

        #region [ Graph Data Operations]
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

        public class TrendingData
        {
            public string Date;
            public double Minimum;
            public double Maximum;
            public double Average;
        }

        public EventSet GetDataForPeriod(string siteID, string targetDateFrom, string targetDateTo, string userName, string tab)
        {
            EventSet eventSet = new EventSet();
            eventSet.StartDate = DateTime.Parse(targetDateFrom);
            eventSet.EndDate = DateTime.Parse(targetDateTo);
            Dictionary<string, string> colors = new Dictionary<string, string>();
            Random r = new Random(DateTime.UtcNow.Millisecond);

            IEnumerable<DashSettings> dashSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
            List<UserDashSettings> userDashSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            IEnumerable<DashSettings> colorSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND Enabled = 1"));
            List<UserDashSettings> userColorSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            using (IDbCommand sc = DataContext.Connection.Connection.CreateCommand())
            {
                sc.CommandText = "dbo.select" + tab + "ForMeterIDbyDateRange";
                sc.CommandType = CommandType.StoredProcedure;
                IDbDataParameter param1 = sc.CreateParameter();
                param1.ParameterName = "@EventDateFrom";
                param1.Value = targetDateFrom;
                IDbDataParameter param2 = sc.CreateParameter();
                param2.ParameterName = "@EventDateTo";
                param2.Value = targetDateTo;
                IDbDataParameter param3 = sc.CreateParameter();
                param3.ParameterName = "@MeterID";
                param3.Value = siteID;
                IDbDataParameter param4 = sc.CreateParameter();
                param4.ParameterName = "@username";
                param4.Value = userName;

                sc.Parameters.Add(param1);
                sc.Parameters.Add(param2);
                sc.Parameters.Add(param3);
                sc.Parameters.Add(param4);

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
                                DashSettings ds = new DashSettings()
                                {
                                    Name = "" + tab + "Chart",
                                    Value = column.ColumnName,
                                    Enabled = true
                                };
                                DataContext.Table<DashSettings>().AddNewRecord(ds);

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
                                        DashSettings ds = new DashSettings()
                                        {
                                            Name = "" + tab + "ChartColors",
                                            Value = column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color,
                                            Enabled = true
                                        };
                                        DataContext.Table<DashSettings>().AddNewRecord(ds);
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
                                DashSettings ds = new DashSettings()
                                {
                                    Name = "" + tab + "Chart",
                                    Value = column.ColumnName,
                                    Enabled = true
                                };
                                DataContext.Table<DashSettings>().AddNewRecord(ds);

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
                                        DashSettings ds = new DashSettings()
                                        {
                                            Name = "" + tab + "ChartColors",
                                            Value = column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color,
                                            Enabled = true
                                        };
                                        DataContext.Table<DashSettings>().AddNewRecord(ds);

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

        public List<TrendingData> GetTrendingDataForPeriod(string siteID, string colorScale, string targetDateFrom, string targetDateTo, string userName)
        {
            List<TrendingData> eventSet = new List<TrendingData>();
            DateTime thedatefrom = DateTime.Parse(targetDateFrom);
            DateTime thedateto = DateTime.Parse(targetDateTo);

            int duration = thedateto.Subtract(thedatefrom).Days + 1;
            using (IDbCommand sc = DataContext.Connection.Connection.CreateCommand())
            {
                sc.CommandText = "dbo.selectTrendingDataByChannelByDate";
                sc.CommandType = CommandType.StoredProcedure;
                IDbDataParameter param1 = sc.CreateParameter();
                param1.ParameterName = "@StartDate";
                param1.Value = targetDateFrom;
                IDbDataParameter param2 = sc.CreateParameter();
                param2.ParameterName = "@EndDate";
                param2.Value = targetDateTo;
                IDbDataParameter param3 = sc.CreateParameter();
                param3.ParameterName = "@MeterID";
                param3.Value = siteID;
                IDbDataParameter param4 = sc.CreateParameter();
                param4.ParameterName = "@username";
                param4.Value = userName;
                IDbDataParameter param5 = sc.CreateParameter();
                param5.ParameterName = "@colorScale";
                param5.Value = colorScale;
    

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

        public IEnumerable<DisturbanceView> GetVoltageMagnitudeData(string meterIds,DateTime startDate, DateTime endDate)
        {

            DataTable table = DataContext.Connection.RetrieveData(
                " SELECT * " +
                " FROM DisturbanceView  " +
                " WHERE (MeterID IN (Select * FROM String_To_Int_Table({0},','))) " +
                " AND StartTime >= {1} AND StartTime <= {2} AND PhaseID IN (SELECT ID FROM Phase WHERE Name = 'Worst') ", meterIds, startDate, endDate);
            return table.Select().Select(row => DataContext.Table<DisturbanceView>().LoadRecord(row));
        }

        public IEnumerable<WorkbenchVoltageCurveView> GetCurves()
        {
            return DataContext.Table<WorkbenchVoltageCurveView>().QueryRecords("ID, LoadOrder");
        }

        #endregion

        #region [ Table Data ]

        /// <summary>
        /// getDetailsForSite
        /// </summary>
        /// <param name="siteId"></param>
        /// <param name="targetDate"></param>
        /// <param name="userName"></param>
        /// <param name="tab"></param>
        /// <returns></returns>
        public string GetDetailsForSites(string siteId, string targetDate, string userName, string tab)
        {

            IEnumerable<DashSettings> dashSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
            List<UserDashSettings> userDashSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            String thedata = "";
            SqlConnection conn = null;
            SqlDataReader rdr = null;

            try
            {
                conn = new SqlConnection(connectionstring);
                conn.Open();
                SqlCommand cmd = new SqlCommand("dbo.selectSites" + tab + "DetailsByDate", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
                cmd.Parameters.Add(new SqlParameter("@MeterID", siteId));
                cmd.Parameters.Add(new SqlParameter("@username", userName));
                cmd.CommandTimeout = 300;

                rdr = cmd.ExecuteReader();
                DataTable table = new DataTable();
                table.Load(rdr);

                List<string> skipColumns = new List<string>() { "EventID", "MeterID", "Site" };
                List<string> columnsToRemove = new List<string>();
                foreach (DataColumn column in table.Columns)
                {
                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                    {
                        disabledFileds.Add(column.ColumnName, true);
                        DashSettings ds = new DashSettings()
                        {
                            Name = "" + tab + "Chart",
                            Value = column.ColumnName,
                            Enabled = true
                        };
                        DataContext.Table<DashSettings>().AddNewRecord(ds);

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


                thedata = DataTable2JSON(table);
                table.Dispose();
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                }
                if (rdr != null)
                {
                    rdr.Close();
                }
            }

            return thedata;
        }

        /// <summary>
        /// getSiteLinesDetailsByDate
        /// </summary>
        /// <param name="siteID"></param>
        /// <param name="targetDate"></param>
        /// <returns></returns>
        public string GetSiteLinesDetailsByDate(string siteID, string targetDate)
        {
            string thedata = "";
            string connectionString = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;
            DataTable dt;

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("dbo.selectSiteLinesDetailsByDate", conn))
            {
                conn.Open();

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@EventDate", targetDate));
                cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
                cmd.CommandTimeout = 300;

                using (SqlDataReader rdr = cmd.ExecuteReader())
                {
                    dt = new DataTable();
                    dt.Load(rdr);
                }
            }

            thedata = DataTable2JSON(dt);
            dt.Dispose();

            return thedata;
        }


        /// <summary>
        /// getSiteLinesDetailsByDate
        /// </summary>
        /// <param name="siteID"></param>
        /// <param name="targetDate"></param>
        /// <returns></returns>
        [WebMethod]
        public string GetSiteLinesDisturbanceDetailsByDate(string siteID, string targetDate)
        {

            string thedata = "";
            string connectionString = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;
            SqlConnection conn = null;
            SqlDataReader rdr = null;
            SqlConnection conn2 = null;
            SqlDataReader rdr2 = null;

            DateTime date = DateTime.Parse(targetDate);

            try
            {
                conn = new SqlConnection(connectionString);
                conn.Open();

                SqlCommand cmd = new SqlCommand("dbo.selectSiteLinesDisturbanceDetailsByDate", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@EventDate", date.Date));
                cmd.Parameters.Add(new SqlParameter("@MeterID", siteID));
                cmd.CommandTimeout = 300;

                rdr = cmd.ExecuteReader();
                DataTable dt;

                dt = new DataTable();
                dt.Load(rdr);


                thedata = DataTable2JSON(dt);
                dt.Dispose();
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                }
                if (rdr != null)
                {
                    rdr.Close();
                }
                if (conn2 != null)
                {
                    conn2.Close();
                }
                if (rdr2 != null)
                {
                    rdr2.Close();
                }
            }

            return thedata;
        }

        #endregion

        #region [ Map/Grip Data Operations]

        public class MeterLocations
        {
            public string Data;
            public Dictionary<string, string> Colors; 
        }

        /// <summary>
        /// getLocationsEvents 
        /// </summary>
        /// <param name="targetDateFrom">Start Date</param>
        /// <param name="targetDateTo">End Date</param>
        /// <param name="meterGroup">Meter Group</param>
        /// <param name="tab">Current PQDashboard Tab</param>
        /// <param name="userName">Current PQDashboard user</param>
        /// <returns>Object with list of meters and counts for tab.</returns> 
        public MeterLocations GetMeterLocationsOld(string targetDateFrom, string targetDateTo, int meterGroup, string tab, string userName)
        {
            SqlConnection conn = null;
            SqlDataReader rdr = null;
            MeterLocations meters = new MeterLocations();
            DataTable table = new DataTable();

            Dictionary<string, string> colors = new Dictionary<string, string>();

            IEnumerable<DashSettings> dashSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
            List<UserDashSettings> userDashSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            IEnumerable<DashSettings> colorSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND Enabled = 1"));
            List<UserDashSettings> userColorSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            try
            {
                conn = new SqlConnection(connectionstring);
                conn.Open();
                SqlCommand cmd = new SqlCommand("dbo.selectMeterLocations" + tab, conn);

                cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
                cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
                cmd.Parameters.Add(new SqlParameter("@meterGroup", meterGroup));
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;
                rdr = cmd.ExecuteReader();
                table.Load(rdr);

                List<string> skipColumns = new List<string>() { "ID", "Name", "Longitude", "Latitude", "Count", "ExpectedPoints", "GoodPoints", "LatchedPoints", "UnreasonablePoints", "NoncongruentPoints", "DuplicatePoints"};
                List<string> columnsToRemove = new List<string>();
                foreach (DataColumn column in table.Columns)
                {
                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                    {
                        disabledFileds.Add(column.ColumnName, true);
                        DashSettings ds = new DashSettings()
                        {
                            Name = "" + tab + "Chart",
                            Value = column.ColumnName,
                            Enabled = true
                        };
                        DataContext.Table<DashSettings>().AddNewRecord(ds);

                    }

                    if (!skipColumns.Contains(column.ColumnName) && !colors.ContainsKey(column.ColumnName))
                    {
                        Random r = new Random(DateTime.UtcNow.Millisecond);
                        string color = r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                        colors.Add(column.ColumnName, color);

                        DashSettings ds = new DashSettings()
                        {
                            Name = "" + tab + "ChartColors",
                            Value = column.ColumnName + ",#" + color,
                            Enabled = true
                        };
                        DataContext.Table<DashSettings>().AddNewRecord(ds);


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
                meters.Data = DataTable2JSON(table);
            }
            finally
            {
                if (!rdr.IsClosed)
                {
                    rdr.Close();
                }
            }
            return meters;
        }

        /// <summary>
        /// getLocationsEvents 
        /// </summary>
        /// <param name="targetDateFrom">Start Date</param>
        /// <param name="targetDateTo">End Date</param>
        /// <param name="meterIds">comma separated list of meterIds</param>
        /// <param name="tab">Current PQDashboard Tab</param>
        /// <param name="userName">Current PQDashboard user</param>
        /// <returns>Object with list of meters and counts for tab.</returns> 
        public MeterLocations GetMeterLocations(string targetDateFrom, string targetDateTo, string meterIds, string tab, string userName)
        {
            SqlConnection conn = null;
            SqlDataReader rdr = null;
            MeterLocations meters = new MeterLocations();
            DataTable table = new DataTable();

            Dictionary<string, string> colors = new Dictionary<string, string>();

            IEnumerable<DashSettings> dashSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
            List<UserDashSettings> userDashSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            IEnumerable<DashSettings> colorSettings = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND Enabled = 1"));
            List<UserDashSettings> userColorSettings = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", userName)).ToList();

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

            try
            {
                conn = new SqlConnection(connectionstring);
                conn.Open();
                SqlCommand cmd = new SqlCommand("dbo.selectMeterLocations" + tab, conn);

                cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
                cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
                cmd.Parameters.Add(new SqlParameter("@meterIds", meterIds));
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;
                rdr = cmd.ExecuteReader();
                table.Load(rdr);

                List<string> skipColumns = new List<string>() { "ID", "Name", "Longitude", "Latitude", "Count", "ExpectedPoints", "GoodPoints", "LatchedPoints", "UnreasonablePoints", "NoncongruentPoints", "DuplicatePoints" };
                List<string> columnsToRemove = new List<string>();
                foreach (DataColumn column in table.Columns)
                {
                    if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                    {
                        disabledFileds.Add(column.ColumnName, true);
                        DashSettings ds = new DashSettings()
                        {
                            Name = "" + tab + "Chart",
                            Value = column.ColumnName,
                            Enabled = true
                        };
                        DataContext.Table<DashSettings>().AddNewRecord(ds);

                    }

                    if (!skipColumns.Contains(column.ColumnName) && !colors.ContainsKey(column.ColumnName))
                    {
                        Random r = new Random(DateTime.UtcNow.Millisecond);
                        string color = r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                        colors.Add(column.ColumnName, color);

                        DashSettings ds = new DashSettings()
                        {
                            Name = "" + tab + "ChartColors",
                            Value = column.ColumnName + ",#" + color,
                            Enabled = true
                        };
                        DataContext.Table<DashSettings>().AddNewRecord(ds);


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
                meters.Data = DataTable2JSON(table);
            }
            finally
            {
                if (!rdr.IsClosed)
                {
                    rdr.Close();
                }
            }
            return meters;
        }

        /// <summary>
        /// getLocationsHeatmapSags 
        /// </summary>
        /// <param name="targetDateFrom"></param>
        /// <param name="targetDateTo"></param>
        /// <param name="userName"></param>
        /// <returns></returns>
        public MeterLocations GetLocationsHeatmap(string targetDateFrom, string targetDateTo, string meterIds, string type)
        {
            SqlConnection conn = null;
            SqlDataReader rdr = null;
            MeterLocations meters = new MeterLocations();
            DataTable table = new DataTable();

            try
            {
                conn = new SqlConnection(connectionstring);
                conn.Open();
                SqlCommand cmd = new SqlCommand("dbo.selectMeterLocations" + type, conn);

                cmd.Parameters.Add(new SqlParameter("@EventDateFrom", targetDateFrom));
                cmd.Parameters.Add(new SqlParameter("@EventDateTo", targetDateTo));
                cmd.Parameters.Add(new SqlParameter("@meterIds", meterIds));
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;
                rdr = cmd.ExecuteReader();
                table.Load(rdr);

                meters.Colors = null;
                meters.Data = DataTable2JSON(table);
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                }
                if (rdr != null)
                {
                    rdr.Close();
                }
            }

            return meters;
        }


        #endregion

        #region [ Fault Notes ]

        public IEnumerable<FaultNote> GetNotesForFault(int id)
        {
            return DataContext.Table<FaultNote>().QueryRecords(restriction: new RecordRestriction("FaultSummaryID = {0}", id));
        }

        public void SaveNoteForFault(int id, string note, string userId)
        {
            DataContext.Table<FaultNote>().AddNewRecord(new FaultNote()
            {
                FaultSummaryID = id,
                Note = note,
                UserAccountID = DataContext.Connection.ExecuteScalar<Guid>("SELECT ID FROM UserAccount WHERE Name = {0}", userId),
                TimeStamp = DateTime.UtcNow
            });
        }

        public void RemoveNote(int id)
        {
            DataContext.Table<FaultNote>().DeleteRecord(restriction: new RecordRestriction("ID = {0}", id));
        }


        #endregion

        #region [ PageSettings ]

        public void UpdateDashSettings(int id, string field, string value, string userId)
        {
            DashSettings ds = DataContext.Table<DashSettings>().QueryRecords(restriction: new RecordRestriction("ID = {0}", id))?.FirstOrDefault() ?? null;
            UserDashSettings uds = DataContext.Table<UserDashSettings>().QueryRecords(restriction: new RecordRestriction("Name = {0} AND Value LIKE {1} AND UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {2}) ", ds.Name, ds.Value.Split(',')[0] + "%", userId))?.FirstOrDefault() ?? null;

            if(uds != null)
            {
                if (field.EndsWith("enable") || field.EndsWith("tab"))
                    uds.Enabled = !uds.Enabled;
                else
                    uds.Value = uds.Value.Split(',')[0] + ",#" + value;

                if(uds.Enabled != ds.Enabled)
                    DataContext.Table<UserDashSettings>().UpdateRecord(uds);
                else
                    DataContext.Table<UserDashSettings>().DeleteRecord(new RecordRestriction("ID = {0}", uds.ID));
            }
            else
            {
                uds = new UserDashSettings();
                uds.UserAccountID = DataContext.Connection.ExecuteScalar<Guid>("SELECT ID FROM UserAccount WHERE Name = {0}", userId);
                uds.Name = ds.Name;

                bool result;
                if (!bool.TryParse(value, out result))
                {
                    uds.Enabled = true;
                    uds.Value = ds.Value.Split(',')[0] + ",#" + value;
                }
                else
                {
                    uds.Enabled = result;
                    uds.Value = ds.Value;
                }
               
                if(uds.Enabled != ds.Enabled)
                    DataContext.Table<UserDashSettings>().AddNewRecord(uds);

            }
        }

        public void ResetDefaultSettings()
        {
            DataContext.Table<UserDashSettings>().DeleteRecord(new RecordRestriction("UserAccountID IN (SELECT ID FROM UserAccount WHERE Name = {0})", GetCurrentUserSID()));
        }
        #endregion

        #region [ DeviceFilter Operations ]

        public IEnumerable<DeviceFilter> QueryDeviceFilterRecords(string userAccount)
        {
            return DataContext.Table<DeviceFilter>().QueryRecords(restriction: new RecordRestriction("UserAccount = {0}", userAccount));
        }

        public DeviceFilter QueryDeviceFilterRecord(int id)
        {
            return DataContext.Table<DeviceFilter>().QueryRecord( new RecordRestriction("ID = {0}", id));
        }

        public int AddDeviceFilter(DeviceFilter record)
        {
            DataContext.Table<DeviceFilter>().AddNewRecord(record);
            return DataContext.Connection.ExecuteScalar<int>("SELECT @@IDENTITY");

        }

        public void EditDeviceFilter(DeviceFilter record)
        {
            DataContext.Table<DeviceFilter>().UpdateRecord(record);
        }


        public void DeleteDeviceFilter(int id)
        {
            DataContext.Table<DeviceFilter>().DeleteRecord(new RecordRestriction("ID = {0}", id));
        }

        public IEnumerable<MeterID> DeviceFilterPreview(int meterGroupId, string filterExpression, string userName)
        {
            DataTable table;

            try
            {

                if (meterGroupId == 0)
                    table = DataContext.Connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID IN (SELECT MeterGroupID FROM UserAccountMeterGroup WHERE UserAccountID = (SELECT ID FROM UserAccount WHERE Name = '{userName}')))");
                else
                    table = DataContext.Connection.Connection.RetrieveData(typeof(SqlDataAdapter), $"SELECT * FROM Meter WHERE ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID = {meterGroupId})");

                if (filterExpression != "")
                    return table.Select(filterExpression).Select(row => DataContext.Table<MeterID>().LoadRecord(row));
            }
            catch (Exception)
            {
                return new List<MeterID>();
            }

            return table.Select().Select(row => DataContext.Table<MeterID>().LoadRecord(row));
        }


        #endregion

        #region [ SavedViews Operations ]

        public IEnumerable<SavedViews> QuerySavedViewsRecords(string userAccount)
        {
            return DataContext.Table<SavedViews>().QueryRecordsWhere("UserAccount = {0}", userAccount);
        }

        public SavedViews QuerySavedViewsRecord(int id)
        {
            return DataContext.Table<SavedViews>().QueryRecordWhere("ID = {0}", id);
        }

        public int AddSavedViews(SavedViews record)
        {
            DataContext.Table<SavedViews>().AddNewRecord(record);
            return DataContext.Connection.ExecuteScalar<int>("SELECT @@IDENTITY");

        }

        public void EditSavedViews(SavedViews record)
        {
            DataContext.Table<SavedViews>().UpdateRecord(record);
        }


        public void DeleteSavedViews(int id)
        {
            DataContext.Table<SavedViews>().DeleteRecordWhere("ID = {0}", id);
        }

        #endregion

        #region [OpenSEE Operations]
        public List<SignalCode.FlotSeries> GetFlotData(int eventID, List<int> seriesIndexes)
        {
            SignalCode sc = new SignalCode();
            return sc.GetFlotData(eventID, seriesIndexes);
        }
        #endregion

        #region [OpenSTE Operations]



        public TrendingDataSet GetTrendsForChannelIDDate(string ChannelID, string targetDate)
        {
            string historianServer = DataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Server'") ?? "127.0.0.1";
            string historianInstance = DataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Historian.Instance'") ?? "XDA";
            IEnumerable<int> channelIDs = new List<int>() { Convert.ToInt32(ChannelID) };
            DateTime startDate = Convert.ToDateTime(targetDate);
            DateTime endDate = startDate.AddDays(1);
            TrendingDataSet trendingDataSet = new TrendingDataSet();
            DateTime epoch = new DateTime(1970, 1, 1);

            using (Historian historian = new Historian(historianServer, historianInstance))
            {
                foreach (openHistorian.XDALink.TrendingDataPoint point in historian.Read(channelIDs, startDate, endDate))
                {
                    if (!trendingDataSet.ChannelData.Exists(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds))
                    {
                        trendingDataSet.ChannelData.Add(new PQDashboard.Model.TrendingDataPoint());
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.Count - 1].Time = point.Timestamp.Subtract(epoch).TotalMilliseconds;
                    }

                    if (point.SeriesID.ToString() == "Average")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Average = point.Value;
                    else if (point.SeriesID.ToString() == "Minimum")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Minimum = point.Value;
                    else if (point.SeriesID.ToString() == "Maximum")
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Maximum = point.Value;

                }
            }
            IEnumerable<DataRow> table = Enumerable.Empty<DataRow>();

            table = DataContext.Connection.RetrieveData(" Select {0} AS thedatefrom, " +
                                                        "        DATEADD(DAY, 1, {0}) AS thedateto, " +
                                                        "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.High * PerUnitValue ELSE AlarmRangeLimit.High END AS alarmlimithigh," +
                                                        "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.Low * PerUnitValue ELSE AlarmRangeLimit.Low END AS alarmlimitlow " +
                                                        " FROM   AlarmRangeLimit JOIN " +
                                                        "        Channel ON AlarmRangeLimit.ChannelID = Channel.ID " +
                                                        "WHERE   AlarmRangeLimit.AlarmTypeID = (SELECT ID FROM AlarmType where Name = 'Alarm') AND " +
                                                        "        AlarmRangeLimit.ChannelID = {1}", startDate, Convert.ToInt32(ChannelID)).Select();

            foreach (DataRow row in table)
            {
                trendingDataSet.AlarmLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("alarmlimithigh"), Low = row.Field<double?>("alarmlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
            }

            table = Enumerable.Empty<DataRow>();

            table = DataContext.Connection.RetrieveData(" DECLARE @dayOfWeek INT = DATEPART(DW, {0}) - 1 " +
                                                        " DECLARE @hourOfWeek INT = @dayOfWeek * 24 " +
                                                        " ; WITH HourlyIndex AS" +
                                                        " ( " +
                                                        "   SELECT @hourOfWeek AS HourOfWeek " +
                                                        "   UNION ALL " +
                                                        "   SELECT HourOfWeek + 1 " +
                                                        "   FROM HourlyIndex" +
                                                        "   WHERE (HourOfWeek + 1) < @hourOfWeek + 24" +
                                                        " ) " +
                                                        " SELECT " +
                                                        "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek, {0}) AS thedatefrom, " +
                                                        "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek + 1, {0}) AS thedateto, " +
                                                        "        HourOfWeekLimit.High AS offlimithigh, " +
                                                        "        HourOfWeekLimit.Low AS offlimitlow " +
                                                        " FROM " +
                                                        "        HourlyIndex LEFT OUTER JOIN " +
                                                        "        HourOfWeekLimit ON HourOfWeekLimit.HourOfWeek = HourlyIndex.HourOfWeek " +
                                                        " WHERE " +
                                                        "        HourOfWeekLimit.ChannelID IS NULL OR " +
                                                        "        HourOfWeekLimit.ChannelID = {1} ", startDate, Convert.ToInt32(ChannelID)).Select();

            foreach (DataRow row in table)
            {
                trendingDataSet.OffNormalLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("offlimithigh"), Low = row.Field<double?>("offlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
            }

            return trendingDataSet;
        }

        #endregion

        #region [ FileGroup - Event - FaultSummary - Disturbance - DisturbanceSeverity ]
        
        private bool ValidatePassedTimeSpanUnit(string timeSpanUnit)
        {
            // The Validation of the date range unit in string timeSpanUnit; where,
            // the date range unit indicates the spanning of whole days ('d','dd') or months ('m', 'mm') or years ('yy', 'yyyy')
            // used in the SQL Date method DATEADD('time span unit', 'int value of span', 'starting SQL DateTime')
            if (System.Text.RegularExpressions.Regex.IsMatch(timeSpanUnit, @"^([m]{1,2}|[M]{1,2}|[d]{1,2}|[D]{1,2}|[y]{2}|[y]{4}|[Y]{2}|[Y]{4})$"))
            {
                return true;
            }
            return false;
        }

        public int QueryFileGroupCount()
        {
            //int year = 2014;
            //int month = 6;
            //int day = 10;
            //DateTime dateTimeToday = new DateTime(year, month, day);

            DateTime dateTimeToday = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);

            int recordCount = -1;

            recordCount = DataContext.Table<PQDashboard.Model.FileGroup>().QueryRecordCountWhere("[FileGroup].ID IN (SELECT [Event].FileGroupID FROM [Event] LEFT JOIN FileGroup ON FileGroup.ID = [Event].FileGroupID WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(d,1,{0})))", dateTimeToday);

            return recordCount;
        }

        public int QueryFileGroupCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;
            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<PQDashboard.Model.FileGroup>().QueryRecordCountWhere("[FileGroup].ID IN (SELECT [Event].FileGroupID FROM [Event] LEFT JOIN [FileGroup] ON [FileGroup].ID = [Event].FileGroupID WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0})))", startTime);
            }

            return recordCount;
        }

        public IEnumerable<PQDashboard.Model.FileGroup> QueryFileGroupRecords()
        {
            int year = 2014;
            int month = 6;
            int day = 10;
            DateTime dateTimeToday = new DateTime(year, month, day);
            //DateTime dateTimeToday = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);

            return DataContext.Table<PQDashboard.Model.FileGroup>().QueryRecords(restriction: new RecordRestriction("[FileGroup].ID IN (SELECT [Event].FileGroupID FROM [Event] LEFT JOIN [FileGroup] ON [FileGroup].ID = [Event].FileGroupID WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(d,1,{0})))", dateTimeToday));
        }

        public IEnumerable<PQDashboard.Model.FileGroup> QueryFileGroupRecords(DateTime startTime, string timeSpanUnit, int timeSpanValue)
        {
            if(ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                return DataContext.Table<PQDashboard.Model.FileGroup>().QueryRecords(restriction: new RecordRestriction("[FileGroup].ID IN (SELECT [Event].FileGroupID FROM [Event] LEFT JOIN [FileGroup] ON  [Event].FileGroupID = [FileGroup].ID WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanValue + ",{0})))", startTime));
            }
            else
            {
                return null;
            }
        }

        public int QueryEventCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.Event>().QueryRecordCountWhere("([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0}))", startTime);
            }

            return recordCount;
        }

        public int QueryMeterCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.Meter>().QueryRecordCountWhere("[Meter].ID IN (SELECT DISTINCT [Event].MeterID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0})))", startTime);
            }

            return recordCount;
        }

        public IEnumerable<PQDashboard.Model.Meter> QueryMeterRecords(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                return DataContext.Table<Model.Meter>().QueryRecords(restriction: new RecordRestriction("[Meter].ID IN (SELECT DISTINCT [Event].MeterID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0})))", startTime)); ;
            }
            else
            {
                return null;
            }
        }

        public int QueryLineCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.Line>().QueryRecordCountWhere("[Line].ID IN (SELECT DISTINCT [Event].LineID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0})))", startTime);
            }

            return recordCount;
        }

        public IEnumerable<PQDashboard.Model.Line> QueryLineRecords(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                return DataContext.Table<Model.Line>().QueryRecords(restriction: new RecordRestriction("[Line].ID IN (SELECT DISTINCT [Event].LineID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + "," + timeSpanrange + ",{0})))", startTime)); ;
            }
            else
            {
                return null;
            }
        }

        public int QueryFaultSummaryCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.FaultSummary>().QueryRecordCountWhere("[FaultSummary].EventID IN (SELECT [Event].ID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + ", " + timeSpanrange + ",{0}))) AND ([FaultSummary].IsSelectedAlgorithm <> 0 AND [FaultSummary].IsValid <> 0 AND [FaultSummary].IsSuppressed = 0)", startTime);
            }

            return recordCount;
        }

        public IEnumerable<PQDashboard.Model.FaultSummary> QueryFaultSummaryRecords(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                return DataContext.Table<Model.FaultSummary>().QueryRecords(restriction: new RecordRestriction("[FaultSummary].EventID IN (SELECT [Event].ID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + ", " + timeSpanrange + ",{0}))) AND ([FaultSummary].IsSelectedAlgorithm <> 0 AND [FaultSummary].IsValid <> 0 AND [FaultSummary].IsSuppressed = 0)", startTime));
            }
            else
            {
                return null;
            }
        }

        public int QueryFaultSummaryGroundFaultCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.FaultSummary>().QueryRecordCountWhere("[FaultSummary].EventID IN (SELECT [Event].ID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + ", " + timeSpanrange + ",{0}))) AND ([FaultSummary].FaultType = 'AN' OR [FaultSummary].FaultType = 'BN' OR [FaultSummary].FaultType = 'CN') AND ([FaultSummary].IsSelectedAlgorithm <> 0 AND [FaultSummary].IsValid <> 0 AND [FaultSummary].IsSuppressed = 0)", startTime);
            }

            return recordCount;
        }

        public int QueryFaultSummaryLineFaultCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.FaultSummary>().QueryRecordCountWhere("[FaultSummary].EventID IN (SELECT [Event].ID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + ", " + timeSpanrange + ",{0}))) AND ([FaultSummary].FaultType = 'AB' OR [FaultSummary].FaultType = 'BC' OR [FaultSummary].FaultType = 'CA') AND (FaultSummary.IsSelectedAlgorithm <> 0 AND FaultSummary.IsValid <> 0 AND FaultSummary.IsSuppressed = 0)", startTime);
            }

            return recordCount;
        }

        public int QueryFaultSummaryAllPhaseFaultCount(DateTime startTime, string timeSpanUnit, int timeSpanrange)
        {
            int recordCount = -1;

            if (ValidatePassedTimeSpanUnit(timeSpanUnit))
            {
                recordCount = DataContext.Table<Model.FaultSummary>().QueryRecordCountWhere("[FaultSummary].EventID IN (SELECT [Event].ID FROM [Event] WHERE ([Event].StartTime >= {0} AND [Event].StartTime < DATEADD(" + timeSpanUnit + ", " + timeSpanrange + ",{0}))) AND ([FaultSummary].FaultType = 'ABC') AND (FaultSummary.IsSelectedAlgorithm <> 0 AND FaultSummary.IsValid <> 0 AND FaultSummary.IsSuppressed = 0)", startTime);
            }

            return recordCount;
        }

        // public int
        // public IEnumerable<>
        // public string

        #endregion

        #region [ Data Subscription Operations ]

        // These functions are dependent on subscriptions to data where each client connection can customize the subscriptions, so an instance
        // of the DataHubSubscriptionClient is created per SignalR DataHub client connection to manage the subscription life-cycles.

        public IEnumerable<MeasurementValue> GetMeasurements()
        {
            return m_dataSubscriptionOperations.GetMeasurements();
        }

        public IEnumerable<DeviceDetail> GetDeviceDetails()
        {
            return m_dataSubscriptionOperations.GetDeviceDetails();
        }

        public IEnumerable<MeasurementDetail> GetMeasurementDetails()
        {
            return m_dataSubscriptionOperations.GetMeasurementDetails();
        }

        public IEnumerable<PhasorDetail> GetPhasorDetails()
        {
            return m_dataSubscriptionOperations.GetPhasorDetails();
        }

        public IEnumerable<SchemaVersion> GetSchemaVersion()
        {
            return m_dataSubscriptionOperations.GetSchemaVersion();
        }

        public IEnumerable<MeasurementValue> GetStats()
        {
            return m_dataSubscriptionOperations.GetStats();
        }

        public IEnumerable<StatusLight> GetLights()
        {
            return m_dataSubscriptionOperations.GetLights();
        }

        public void InitializeSubscriptions()
        {
            m_dataSubscriptionOperations.InitializeSubscriptions();
        }

        public void TerminateSubscriptions()
        {
            m_dataSubscriptionOperations.TerminateSubscriptions();
        }

        public void UpdateFilters(string filterExpression)
        {
            m_dataSubscriptionOperations.UpdateFilters(filterExpression);
        }

        public void StatSubscribe(string filterExpression)
        {
            m_dataSubscriptionOperations.StatSubscribe(filterExpression);
        }

        #endregion

        #region [ Misc Hub Operations ]

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
        public static Guid GetCurrentUserID()
        {
            Guid userID;
            AuthorizationCache.UserIDs.TryGetValue(Thread.CurrentPrincipal.Identity.Name, out userID);
            return userID;
        }

        /// <summary>
        /// Gets UserAccount table ID for current user.
        /// </summary>
        /// <returns>UserAccount.ID for current user.</returns>
        public static string GetCurrentUserSID()
        {
            return UserInfo.UserNameToSID(Thread.CurrentPrincipal.Identity.Name);
        }



        /// <summary>
        /// DataTable2JSON
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public string DataTable2JSON(DataTable dt)
        {
            List<Object> RowList = new List<Object>();
            foreach (DataRow dr in dt.Rows)
            {
                Dictionary<Object, Object> ColList = new Dictionary<Object, Object>();
                foreach (DataColumn dc in dt.Columns)
                {
                    string t = (string)((string.Empty == dr[dc].ToString()) ? null : dr[dc].ToString());

                    ColList.Add(dc.ColumnName, t);
                }
                RowList.Add(ColList);
            }
            JavaScriptSerializer js = new JavaScriptSerializer();
            string JSON = js.Serialize(RowList);
            return JSON;
        }


        #endregion
    }
}
