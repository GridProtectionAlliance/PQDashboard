//******************************************************************************************************
//  SettingsController.cs - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  04/03/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web;
using GSF.Web.Model;
using PQDashboard.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Http;

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Settings")]
    public class SettingsController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post([FromBody] ValueList valueList )
        {
            if (User.IsInRole("Administrator"))
            {
                try
                {
                    using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                    {
                        new TableOperations<ValueList>(connection).UpdateRecord(valueList);
                        return Ok(valueList);
                    }
                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }
            else
                return Unauthorized();

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
            //    using (DataContext dataContext = new DataContext("dbOpenXDA")) {
            //        TableOperations<DashSettings> dashSettingsTable = dataContext.Table<DashSettings>();
            //        TableOperations<UserDashSettings> userDashSettingsTable = dataContext.Table<UserDashSettings>();

            //        Guid userAccountID = dataContext.Connection.ExecuteScalar<Guid>("SELECT ID FROM UserAccount WHERE Name = {0}", form.UserId);
            //        DashSettings globalSetting = dashSettingsTable.QueryRecordWhere("ID = {0}", form.ID);
            //        UserDashSettings userSetting;

            //        if (form.Name.StartsWith("System."))
            //            userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1}", userAccountID, form.Name);
            //        else if (form.Name.EndsWith("Colors"))
            //            userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1} AND Value LIKE {2}", userAccountID, form.Name, form.Value.Split(',')[0] + "%");
            //        else
            //            userSetting = userDashSettingsTable.QueryRecordWhere("UserAccountID = {0} AND Name = {1} AND Value = {2}", userAccountID, form.Name, form.Value);

            //        if (userSetting == null)
            //        {
            //            userSetting = new UserDashSettings();
            //            userSetting.UserAccountID = userAccountID;
            //            userSetting.Name = form.Name;
            //        }

            //        userSetting.Value = form.Value;
            //        userSetting.Enabled = form.Enabled;

            //        if ((userSetting.Enabled != globalSetting.Enabled) || (userSetting.Value != globalSetting.Value))
            //            dataContext.Table<UserDashSettings>().AddNewOrUpdateRecord(userSetting);
            //        else
            //            dataContext.Table<UserDashSettings>().DeleteRecord(new RecordRestriction("ID = {0}", userSetting.ID));

            //    }
        }
    }
}