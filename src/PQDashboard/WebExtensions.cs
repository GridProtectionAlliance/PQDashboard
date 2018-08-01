//******************************************************************************************************
//  WebExtensions.cs - Gbtc
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
//  08/30/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System.Collections.Generic;
using GSF.Data.Model;
using GSF.Web.Model;
using openXDA.Model;

namespace PQDashboard
{
    public static class WebExtensions
    {
        public static Dictionary<string, string> LoadDatabaseSettings(this DataContext dataContext, string scope)
        {
            Dictionary<string, string> settings = new Dictionary<string, string>();

            foreach (Setting setting in dataContext.Table<Setting>().QueryRecords("Name", new RecordRestriction("Scope = {0}", scope)))
            {
                if (!string.IsNullOrEmpty(setting.Name))
                    settings.Add(setting.Name, setting.Value);
            }

            return settings;
        }
    }
}
