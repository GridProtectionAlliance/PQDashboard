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
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web;
using GSF.Web.Model;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Caching;
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

        #region [ Old Main Dashboard ]

        public class DetailtsForSitesForm {
            public string siteId { get; set; }
            public string targetDate { get; set; }
            public string userName { get; set; }
            public string tab { get; set; }
            public string colorScale { get; set; }
            public string context { get; set; }
        }

        [Route("GetNotesForEvent"),HttpGet]
        public IEnumerable<EventNote> GetNotesForEvent()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int id = int.Parse(query["id"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA")) {
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
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
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
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                new TableOperations<EventNote>(connection).DeleteRecord(restriction: new RecordRestriction("ID = {0}", form.id));
            }
        }


        [Route("GetCurves"),HttpGet]
        public IEnumerable<WorkbenchVoltageCurveView> GetCurves()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
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
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA")) {
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
            using(DataContext dataContext = new DataContext("dbOpenXDA"))
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
            using (DataContext dataContext = new DataContext("dbOpenXDA")) {
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