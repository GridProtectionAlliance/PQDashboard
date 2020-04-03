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

namespace PQDashboard.Controllers.Trending
{
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
        public string userName { get; set; }
        public string tab { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/Trending/BarChart")]
    public class TrendingBarChartController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DataForPeriodForm form)
        {
            try
            {
                string tab = "Trending";
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
                Dictionary<string, string> colors = new Dictionary<string, string>();
                Random r = new Random(DateTime.UtcNow.Millisecond);

                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));

                    Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                    foreach (DashSettings setting in dashSettings)
                    {

                        if (!disabledFileds.ContainsKey(setting.Value))
                            disabledFileds.Add(setting.Value, setting.Enabled);
                    }

                    IEnumerable<DashSettings> colorSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "ChartColors' AND Enabled = 1"));

                    foreach (var color in colorSettings)
                    {
                        if (colors.ContainsKey(color.Value.Split(',')[0]))
                            colors[color.Value.Split(',')[0]] = color.Value.Split(',')[1];
                        else
                            colors.Add(color.Value.Split(',')[0], color.Value.Split(',')[1]);
                    }


                    DataTable table = connection.RetrieveData(@"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @MeterID AS varchar(max) = {2}
                        DECLARE @context as nvarchar(20) = {3}

                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))

                        SELECT *
                        INTO #selectedMeters
                        FROM String_To_Int_Table(@MeterID, ',')

                        SELECT AlarmDate as thedate, COALESCE(OffNormal,0) as Offnormal, COALESCE(Alarm,0) as Alarm
                        FROM(
                            SELECT Date AS AlarmDate, AlarmType.Name, SUM(AlarmPoints) as AlarmPoints
                            FROM ChannelAlarmSummary JOIN
                                 Channel ON ChannelAlarmSummary.ChannelID = Channel.ID JOIN
                                 AlarmType ON AlarmType.ID = ChannelAlarmSummary.AlarmTypeID
                            WHERE MeterID IN (SELECT * FROM #selectedMeters) AND Date >= @startDate AND Date < @endDate
                            GROUP BY Date, AlarmType.Name
                        ) AS table1
                        PIVOT(
                            SUM(table1.AlarmPoints)
                            FOR table1.Name IN(Alarm, OffNormal)
                        ) as pvt

                    ", eventSet.StartDate, eventSet.EndDate, form.siteID, form.context);

                    foreach (DataRow row in table.Rows)
                    {
                        foreach (DataColumn column in table.Columns)
                        {
                            if (column.ColumnName != "thedate" && !disabledFileds.ContainsKey(column.ColumnName))
                            {
                                disabledFileds.Add(column.ColumnName, true);
                                new TableOperations<DashSettings>(connection).GetOrAdd(tab + "Chart", column.ColumnName, true);
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
                                        new TableOperations<DashSettings>(connection).GetOrAdd(tab + "ChartColors", column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color, true);
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
                                new TableOperations<DashSettings>(connection).GetOrAdd(tab + "Chart", column.ColumnName, true);
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
                                        new TableOperations<DashSettings>(connection).GetOrAdd(tab + "ChartColors", column.ColumnName + "," + eventSet.Types[eventSet.Types.Count - 1].Color, true);
                                    }
                                }
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
    }
}