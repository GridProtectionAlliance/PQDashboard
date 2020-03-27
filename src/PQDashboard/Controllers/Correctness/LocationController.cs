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
using System.Web.Http;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Security;
using GSF.Web.Model;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers.Correctness
{
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

    [RoutePrefix("api/Correctness/Location")]
    public class CorrectnessLocationController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(LocationsForm form)
        {
            try
            {
                string tab = "Correctness";
                Locations meters = new Locations();
                DataTable table = new DataTable();

                Dictionary<string, string> colors = new Dictionary<string, string>();

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
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

                    table = connection.RetrieveData(@"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @meterIds AS varchar(max) = {2}
                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = CAST(@EventDateTo AS DATE)

                        SELECT
                            Meter.ID,
                            Meter.Name,
                            Location.Longitude,
                            Location.Latitude,
                            COALESCE(CAST(CAST(SUM(MeterDataQualitySummary.GoodPoints) AS FLOAT) / NULLIF(CAST(SUM(MeterDataQualitySummary.ExpectedPoints) AS FLOAT), 0) * 100 AS INT),0) AS Count,
                            COALESCE(SUM(MeterDataQualitySummary.ExpectedPoints) , 0) AS ExpectedPoints,
                            COALESCE(SUM(MeterDataQualitySummary.GoodPoints),0) AS GoodPoints,
                            COALESCE(SUM(MeterDataQualitySummary.LatchedPoints),0) AS LatchedPoints,
                            COALESCE(SUM(MeterDataQualitySummary.UnreasonablePoints),0) AS UnreasonablePoints,
                            COALESCE(SUM(MeterDataQualitySummary.NoncongruentPoints),0) AS NoncongruentPoints,
                            COALESCE(SUM(MeterDataQualitySummary.DuplicatePoints),0) AS DuplicatePoints
                            FROM
                                Meter JOIN
                                Location ON Meter.LocationID = Location.ID LEFT JOIN
                                ( SELECT * FROM MeterDataQualitySummary WHERE [Date] BETWEEN @startDate AND @endDate) as MeterDataQualitySummary ON MeterDataQualitySummary.MeterID = Meter.ID
                            WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                            GROUP BY Meter.ID, Meter.Name, Location.Longitude, Location.Latitude
                            ORDER BY Meter.Name

                    ", startDate, endDate, form.meterIds);

                    List<string> skipColumns = new List<string>() { "ID", "Name", "Longitude", "Latitude", "Count", "ExpectedPoints", "GoodPoints", "LatchedPoints", "UnreasonablePoints", "NoncongruentPoints", "DuplicatePoints" };
                    List<string> columnsToRemove = new List<string>();
                    foreach (DataColumn column in table.Columns)
                    {
                        if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                        {
                            disabledFileds.Add(column.ColumnName, true);
                            new TableOperations<DashSettings>(connection).GetOrAdd(tab + "Chart", column.ColumnName, true);
                        }

                        if (!skipColumns.Contains(column.ColumnName) && !colors.ContainsKey(column.ColumnName))
                        {
                            Random r = new Random(DateTime.UtcNow.Millisecond);
                            string color = r.Next(256).ToString("X2") + r.Next(256).ToString("X2") + r.Next(256).ToString("X2");
                            colors.Add(column.ColumnName, color);
                            new TableOperations<DashSettings>(connection).GetOrAdd(tab + "ChartColors", column.ColumnName + "," + color, true);
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