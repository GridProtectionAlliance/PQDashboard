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
using GSF.Collections;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{

    public class BarChartController<T> : ApiController where T : class, new()
    {
        #region [ Members ]
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

        public class DataForPeriodForm
        {
            public string siteID { get; set; }
            public string targetDateFrom { get; set; }
            public string targetDateTo { get; set; }
            //public string userName { get; set; }
            //public string tab { get; set; }
            public string context { get; set; }
        }
        #endregion

        #region [ Properties ]
        protected string Tab { get; set; }
        protected string Query { get; set; }
        #endregion

        #region [ Methods ]
        [Route(""), HttpPost]
        public IHttpActionResult Post(DataForPeriodForm form)
        {
            try
            {
                EventSet eventSet = new EventSet();
                if (form.context == "day")
                {
                    eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    eventSet.EndDate = eventSet.StartDate.AddDays(1).AddSeconds(-1);
                }
                else if (form.context == "hour")
                {
                    eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    eventSet.EndDate = eventSet.StartDate.AddHours(1).AddSeconds(-1);
                }
                else if (form.context == "minute" || form.context == "second")
                {
                    eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    eventSet.EndDate = eventSet.StartDate.AddMinutes(1).AddSeconds(-1);
                }
                else
                {
                    eventSet.StartDate = DateTime.Parse(form.targetDateFrom).ToUniversalTime();
                    eventSet.EndDate = DateTime.Parse(form.targetDateTo).ToUniversalTime();
                    form.context = "DateRange";
                }

                using (AdoDataConnection XDAconnection = new AdoDataConnection("dbOpenXDA"))
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable table = XDAconnection.RetrieveData(Query, eventSet.StartDate, eventSet.EndDate, form.siteID, form.context);

                    IEnumerable<ValueList> chartSettings = new TableOperations<ValueList>(connection).QueryRecordsWhere("GroupID = ( SELECT ID FROM ValueListGroup WHERE Name = 'Chart." + Tab + "')");
                    int groupID = connection.ExecuteScalar<int>($"SELECT ID FROM ValueListGroup WHERE Name = 'Chart.{Tab}'");


                    // remove disabled columns from set and create settings for columns that do not have settings
                    foreach (DataColumn column in table.Columns)
                    {
                        if (column.ColumnName == "thedate") continue;

                        if (!chartSettings.Any(x => x.Text == column.ColumnName))
                        {
                            Random r = new Random(DateTime.UtcNow.Millisecond);

                            new TableOperations<ValueList>(connection).AddNewRecord(new ValueList
                            {
                                Key = 0,
                                GroupID = groupID,
                                Text = column.ColumnName,
                                Flag = false,
                                AltText1 = "#" + r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2"),
                                IsDefault = false,
                                Hidden = false,
                                Enabled = true
                            });

                            chartSettings = new TableOperations<ValueList>(connection).QueryRecordsWhere("GroupID = ( SELECT ID FROM ValueListGroup WHERE Name = 'Chart." + Tab + "')");
                        }

                        ValueList setting = chartSettings.FirstOrDefault(x => x.Text == column.ColumnName);
                        if (setting != null && setting.Enabled == true)
                        {
                            if (eventSet.Types.All(x => x.Name != column.ColumnName))
                            {
                                EventSet.EventDetail ed = new EventSet.EventDetail();
                                ed.Name = column.ColumnName;
                                ed.Color = setting.AltText1;
                                eventSet.Types.Add(ed);
                            }
                        }
                    }

                    foreach (DataRow row in table.Rows)
                    {
                        foreach (DataColumn column in table.Columns)
                        {
                            if (column.ColumnName == "thedate") continue;

                            if (chartSettings.First(x => x.Text == column.ColumnName).Enabled == true)
                            {
                                eventSet.Types[eventSet.Types.IndexOf(x => x.Name == column.ColumnName)].Data.Add(Tuple.Create(Convert.ToDateTime(row["thedate"]), Convert.ToInt32(row[column.ColumnName])));
                            }
                        }
                    }


                    return Ok(eventSet);

                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        #endregion
    }
}