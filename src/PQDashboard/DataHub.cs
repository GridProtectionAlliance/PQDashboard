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
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using FaultData.Database;
using GSF;
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
    public class DataHub : RecordOperationsHub<DataHub>
    {
        #region [ Members ]

        // Fields
        private readonly DataContext m_coreContext;
        private bool m_disposed;
        private readonly DataSubscriptionOperations m_dataSubscriptionOperations;


        #endregion

        #region [ Constructors ]

        public DataHub()
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

        public IEnumerable<MeterID> GetMeters(int meterGroup)
        {
            return DataContext.Table<MeterID>().QueryRecords(restriction: new RecordRestriction("ID IN (SELECT MeterID FROM MeterMeterGroup WHERE MeterGroupID = {0})", meterGroup));
        }

        #endregion

        #region [ Event Tab Operations]
        #endregion

        #region [OpenSEE Operations]
        public List<SignalCode.FlotSeries> GetFlotData(int eventID, List<int> seriesIndexes)
        {
            SignalCode sc = new SignalCode();
            return sc.GetFlotData(eventID, seriesIndexes);
        }
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
        public Guid GetCurrentUserID()
        {
            Guid userID;
            AuthorizationCache.UserIDs.TryGetValue(UserInfo.CurrentUserID, out userID);
            return userID;
        }

        #endregion
    }
}
