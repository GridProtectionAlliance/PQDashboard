//******************************************************************************************************
//  TableDataController.cs - Gbtc
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
//  03/30/2020 - Billy Ernest
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
using GSF.Collections;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{
    public class TableDataController<T> : ApiController where T : class, new()
    {
        #region [ Members ]

        public class DetailtsForSitesForm
        {
            public string siteId { get; set; }
            public string targetDate { get; set; }
            public string colorScale { get; set; }
            public string context { get; set; }
        }
        #endregion

        #region [ Properties ]
        protected string Tab { get; set; }
        protected string Query { get; set; }

        #endregion


        [Route(""), HttpPost]
        public IHttpActionResult Post(DetailtsForSitesForm form)
        {
            try
            {
                using (AdoDataConnection XDAconnection = new AdoDataConnection("dbOpenXDA"))
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DateTime date = DateTime.Parse(form.targetDate).ToUniversalTime();
                    DataTable table = XDAconnection.RetrieveData(Query, date, form.siteId, form.context, form.colorScale);

                    IEnumerable<ValueList> chartSettings = new TableOperations<ValueList>(connection).QueryRecordsWhere("GroupID = ( SELECT ID FROM ValueListGroup WHERE Name = 'Chart." + Tab + "')");
                    int groupID = connection.ExecuteScalar<int>($"SELECT ID FROM ValueListGroup WHERE Name = 'Chart.{Tab}'");

                    List<string> skipColumns;
                    if (Tab == "Events" || Tab == "Disturbances") skipColumns = new List<string>() { "EventID", "MeterID", "Site" };
                    else skipColumns = table.Columns.Cast<DataColumn>().Select(x => x.ColumnName).ToList();
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


                    return Ok(table);

                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}