//******************************************************************************************************
//  LocationController.cs - Gbtc
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
//  03/27/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using GSF.Data;
using GSF.Data.Model;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{
    public class LocationController<T> : ApiController where T : class, new()
    {
        #region [ Members ]
        public class Locations
        {
            public DataTable Data;
            public Dictionary<string, string> Colors;
        }

        public class LocationsForm
        {
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            public string meterIds { get; set; }
            public string context { get; set; }
        }

        #endregion

        #region [ Properties ]
        protected string Tab { get; set; }
        protected string Query { get; set; }

        #endregion

        [Route(""), HttpPost]
        public IHttpActionResult Post(LocationsForm form)
        {
            try
            {
                Locations meters = new Locations();

                using (AdoDataConnection XDAconnection = new AdoDataConnection("dbOpenXDA"))
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DateTime startDate;
                    DateTime endDate;

                    if (form.context == "day")
                    {
                        startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                        endDate = startDate.AddDays(1).AddSeconds(-1);
                    }
                    else if (form.context == "hour")
                    {
                        startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                        endDate = startDate.AddHours(1).AddSeconds(-1);
                    }
                    else if (form.context == "minute")
                    {
                        startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                        endDate = startDate.AddMinutes(1).AddSeconds(-1);
                    }
                    else if (form.context == "second")
                    {
                        startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                        endDate = startDate.AddSeconds(1).AddMilliseconds(-1);
                    }
                    else
                    {
                        startDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                        endDate = DateTime.Parse(form.targetDateTo).ToUniversalTime();
                    }

                    DataTable table = XDAconnection.RetrieveData(Query, startDate, endDate, form.meterIds, form.context);

                    IEnumerable<ValueList> chartSettings = new TableOperations<ValueList>(connection).QueryRecordsWhere("GroupID = ( SELECT ID FROM ValueListGroup WHERE Name = 'Chart." + Tab + "')");
                    int groupID = connection.ExecuteScalar<int>($"SELECT ID FROM ValueListGroup WHERE Name = 'Chart.{Tab}'");

                    List<string> skipColumns = new List<string>() { "ID", "Name", "Longitude", "Latitude", "Count", "ExpectedPoints", "GoodPoints", "LatchedPoints", "UnreasonablePoints", "NoncongruentPoints", "DuplicatePoints" };
                    List<string> columnsToRemove = new List<string>();
                    foreach (DataColumn column in table.Columns)
                    {
                        if (skipColumns.Contains(column.ColumnName)) continue;

                        //if (!chartSettings.Any(x => x.Text == column.ColumnName))
                        //{
                        //    Random r = new Random(DateTime.UtcNow.Millisecond);

                        //    new TableOperations<ValueList>(connection).AddNewRecord(new ValueList
                        //    {
                        //        Key = 0,
                        //        GroupID = groupID,
                        //        Text = column.ColumnName,
                        //        Flag = false,
                        //        AltText1 = "#" + r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2"),
                        //        IsDefault = false,
                        //        Hidden = false,
                        //        Enabled = true
                        //    });

                        //    chartSettings = new TableOperations<ValueList>(connection).QueryRecordsWhere("GroupID = ( SELECT ID FROM ValueListGroup WHERE Name = 'Chart." + Tab + "')");
                        //}

                        ValueList setting = chartSettings.FirstOrDefault(x => x.Text == column.ColumnName);
                        if (setting != null && setting.Enabled == false)
                        {
                            columnsToRemove.Add(column.ColumnName);
                        }

                    }
                    foreach (string columnName in columnsToRemove)
                    {
                        table.Columns.Remove(columnName);
                    }

                    meters.Colors = chartSettings.ToDictionary(x => x.Text, x => x.AltText1);
                    meters.Data = table;
                    return Ok(meters);

                }

            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}