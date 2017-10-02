//******************************************************************************************************
//  DashSettings.cs - Gbtc
//
//  Copyright © 2017, Grid Protection Alliance.  All Rights Reserved.
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
//  09/26/2017 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using GSF.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using GSF.Data.Model;
using System.Transactions;

namespace PQDashboard.Model
{
    [TableName("DashSettings")]
    public class DashSettings
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public bool Enabled { get; set; }

    }

    [TableName("USerDashSettings")]
    public class UserDashSettings: DashSettings
    {
        [Label("Account Name")]
        public Guid UserAccountID { get; set; }
    }

    public static partial class TableOperationsExtensions
    {
        public static DashSettings GetOrAdd(this TableOperations<DashSettings> table, string name, string value, bool enabled = true)
        {
            TransactionScopeOption required = TransactionScopeOption.Required;

            TransactionOptions transactionOptions = new TransactionOptions()
            {
                IsolationLevel = IsolationLevel.ReadCommitted,
                Timeout = TransactionManager.MaximumTimeout
            };

            DashSettings dashSettings;

            using (TransactionScope transactionScope = new TransactionScope(required, transactionOptions))
            {
                if(value.Contains(","))
                    dashSettings = table.QueryRecordWhere("Name = {0} AND SUBSTRING(Value, 0, CHARINDEX(',', Value)) = {1}", name, value.Split(',').First());
                else
                    dashSettings = table.QueryRecordWhere("Name = {0} AND Value = {1}", name, value);

                if ((object)dashSettings == null)
                {
                    dashSettings = new DashSettings();
                    dashSettings.Name = name;
                    dashSettings.Value = value;
                    dashSettings.Enabled = enabled;

                    table.AddNewRecord(dashSettings);

                    dashSettings.ID = table.Connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                }

                transactionScope.Complete();
            }

            return dashSettings;
        }

        public static UserDashSettings GetOrAdd(this TableOperations<UserDashSettings> table, string name, Guid user, string value, bool enabled = true)
        {
            TransactionScopeOption required = TransactionScopeOption.Required;

            TransactionOptions transactionOptions = new TransactionOptions()
            {
                IsolationLevel = IsolationLevel.ReadCommitted,
                Timeout = TransactionManager.MaximumTimeout
            };

            UserDashSettings dashSettings;

            using (TransactionScope transactionScope = new TransactionScope(required, transactionOptions))
            {
                if (value.Contains(","))
                    dashSettings = table.QueryRecordWhere("Name = {0} AND SUBSTRING(Value, 0, CHARINDEX(',', Value)) = {1} AND UserAccountID = {2}", name, value.Split(',').First(), user);
                else
                    dashSettings = table.QueryRecordWhere("Name = {0} AND Value = {1} AND UserAccountID = {2}", name, value, user);

                if ((object)dashSettings == null)
                {
                    dashSettings = new UserDashSettings();
                    dashSettings.Name = name;
                    dashSettings.Value = value;
                    dashSettings.Enabled = enabled;
                    dashSettings.UserAccountID = user;

                    table.AddNewRecord(dashSettings);

                    dashSettings.ID = table.Connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                }

                transactionScope.Complete();
            }

            return dashSettings;
        }

    }
}