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

namespace PQDashboard.Controllers.Events
{
    public class DetailtsForSitesForm
    {
        public string siteId { get; set; }
        public string targetDate { get; set; }
        public string colorScale { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/Events/TableData")]
    public class EventsTableDataController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DetailtsForSitesForm form)
        {
            try
            {
                string tab = "Events";
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    IEnumerable<DashSettings> dashSettings = new TableOperations<DashSettings>(connection).QueryRecords(restriction: new RecordRestriction("Name = '" + tab + "Chart'"));
                    DateTime date = DateTime.Parse(form.targetDate).ToUniversalTime();
                    Dictionary<string, bool> disabledFileds = new Dictionary<string, bool>();
                    foreach (DashSettings setting in dashSettings)
                    {
                        if (!disabledFileds.ContainsKey(setting.Value))
                            disabledFileds.Add(setting.Value, setting.Enabled);
                    }

                    DataTable table = connection.RetrieveData(@"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}

                        DECLARE @startDate DateTime = @EventDate
                        DECLARE @endDate DateTime

                        if @context = 'day'
                            SET @endDate = DATEADD(DAY, 1, @startDate);
                        if @context = 'hour'
                            SET @endDate = DATEADD(HOUR, 1, @startDate);
                        if @context = 'minute'
                            SET @endDate = DATEADD(MINUTE, 1, @startDate);
                        if @context = 'second'
                            SET @endDate = DATEADD(SECOND, 1, @startDate);

                        DECLARE @PivotColumns NVARCHAR(MAX) = N''
                        DECLARE @ReturnColumns NVARCHAR(MAX) = N''
                        DECLARE @SQLStatement NVARCHAR(MAX) = N''

                        SELECT @PivotColumns = @PivotColumns + '[' + COALESCE(CAST(t.Name as varchar(max)), '') + '],'
                        FROM (Select Name FROM EventType) AS t

                        SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + COALESCE(CAST(t.Name as varchar(max)), '') + '], 0) AS [' + COALESCE(CAST(t.Name as varchar(max)), '') + '],'
                        FROM (Select Name FROM EventType) AS t

                        SET @SQLStatement =
                        'SELECT *
                        INTO #meterSelections
                        FROM String_To_Int_Table(@MeterID, '','')

                        SELECT (SELECT TOP 1 ID FROM Event WHERE MeterID = pvt.MeterID AND StartTime >= @startDate AND StartTime < @endDate)
                                 EventID,
                                 MeterID,
                                 Site,
                                 ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) + '
                         FROM (
                            SELECT
                                Event.MeterID, COUNT(*) AS EventCount, EventType.Name, Meter.Name as Site
                                FROM Event JOIN
                                EventType ON Event.EventTypeID = EventType.ID JOIN
                                Meter ON Event.MeterID = Meter.ID
                               WHERE
                                MeterID IN (SELECT * FROM #meterSelections) AND
                                StartTime >= @startDate AND StartTime < @endDate
                               GROUP BY Event.MeterID,Meter.Name,EventType.Name
                               ) as ed
                         PIVOT(
                                SUM(ed.EventCount)
                                FOR ed.Name IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                         ) as pvt
                         ORDER BY MeterID '

                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME ', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate

                    ", date, form.siteId, form.context, form.colorScale);


                    List<string> skipColumns;
                    if (tab == "Events" || tab == "Disturbances") skipColumns = new List<string>() { "EventID", "MeterID", "Site" };
                    else skipColumns = table.Columns.Cast<DataColumn>().Select(x => x.ColumnName).ToList();


                    List<string> columnsToRemove = new List<string>();
                    foreach (DataColumn column in table.Columns)
                    {
                        if (!skipColumns.Contains(column.ColumnName) && !disabledFileds.ContainsKey(column.ColumnName))
                        {
                            disabledFileds.Add(column.ColumnName, true);
                            new TableOperations<DashSettings>(connection).GetOrAdd(tab + "Chart", column.ColumnName, true);
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