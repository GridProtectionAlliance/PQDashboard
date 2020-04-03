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

namespace PQDashboard.Controllers.Extensions
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

    [RoutePrefix("api/Extensions/Location")]
    public class ExtensionsLocationController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(LocationsForm form)
        {
            try
            {
                string tab = "Extensions";
                Locations meters = new Locations();
                DataTable table = new DataTable();

                Dictionary<string, string> colors = new Dictionary<string, string>();

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
                        DECLARE @context as nvarchar(20) = {3}
                    DECLARE @startDate DATETIME = @EventDateFrom
                    DECLARE @endDate DATETIME = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))


                    IF @context = 'day'
                    BEGIN
                        SET @endDate = DATEADD(DAY, 1, @startDate)
                    END

                    if @context = 'hour'
                    BEGIN
                        SET @endDate = DATEADD(HOUR, 1, @startDate)
                    END

                    if @context = 'minute'
                    BEGIN
                        SET @endDate = DATEADD(MINUTE, 1, @startDate)
                    END

                    if @context = 'second'
                    BEGIN
                        SET @endDate = DATEADD(SECOND, 1, @startDate)
                    END


                    DECLARE @PivotColumns NVARCHAR(MAX) = N''
                    DECLARE @CountColumns NVARCHAR(MAX) = N''
                    DECLARE @ReturnColumns NVARCHAR(MAX) = N''
                    DECLARE @SQLStatement NVARCHAR(MAX) = N''
                    DECLARE @MiddleStatment NVARCHAR(MAX) = N''

                    SELECT * INTO #temp
                    FROM EVENT
                    WHERE   StartTime Between @startDate AND @endDate AND
                            MeterID IN (SELECT * FROM String_To_Int_Table( @meterIds,  ','))

                    CREATE INDEX tempIndex ON #temp (MeterID)

                    CREATE TABLE #easTable( MeterID int, ServiceName varchar(max), EventCount int);

                    SELECT @PivotColumns = @PivotColumns + '[' + t.ServiceName + '],'
                    FROM (Select ServiceName FROM EASExtension) AS t

                    SELECT @CountColumns = @CountColumns + 'COALESCE([' + t.ServiceName + '], 0) + '
                    FROM (Select ServiceName FROM EASExtension) AS t


                    SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + t.ServiceName + '], 0) AS [' + t.ServiceName + '],'
                    FROM (Select ServiceName FROM EASExtension) AS t

                    DECLARE @serviceName as varchar(max);
                    DECLARE @hasResultFunction as varchar(max);

                    DECLARE aCursor CURSOR FOR
                    SELECT ServiceName, HasResultFunction FROM EASExtension
                    OPEN aCursor;
                    FETCH NEXT FROM aCursor into @serviceName, @hasResultFunction;
                    WHILE @@FETCH_STATUS = 0
                       BEGIN
                        DECLARE @Sql nvarchar(max) = N'
                                INSERT INTO #easTable
                                SELECT MeterID,
                                    '''+ @serviceName + ''' as ServiceName,
                                    Count(*) as EventCount
                                FROM    #temp
                                WHERE   dbo.' + @hasResultFunction + '(ID) != ''''
                                GROUP BY MeterID'
                        exec sp_executesql @sql
                        FETCH NEXT FROM aCursor into @serviceName, @hasResultFunction;
                       END;
                    CLOSE aCursor;
                    DEALLOCATE aCursor;


                    SELECT @MiddleStatment = @MiddleStatment +  '
                                SELECT MeterID,
                                    '''+ t.ServiceName + ''' as ServiceName,
                                    Count(*) as EventCount
                                FROM    #temp
                                WHERE   dbo.' + t.HasResultFunction + '(ID) != ''''
                                GROUP BY MeterID UNION'

                    FROM (Select * FROM EASExtension) AS t

                    SET @SQLStatement =
                    'SELECT *
                    INTO #selectedMeters
                    FROM String_To_Int_Table(@MeterIds, '','')

                    SELECT Meter.ID,
                             Meter.Name,
                             Location.Longitude,
                             Location.Latitude,
                             ' + SUBSTRING(@CountColumns,0, LEN(@CountColumns)) +' as Count,
                             ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) + '
                    FROM
                        Meter JOIN
                        Location ON Meter.LocationID = Location.ID LEFT OUTER JOIN
                        #easTable as ed
                           PIVOT(
                                 SUM(ed.EventCount)
                                 FOR ed.ServiceName IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                           ) as pvt On pvt.MeterID = meter.ID
                    WHERE
                        Meter.ID IN (SELECT * FROM #selectedMeters)

                    ORDER BY Meter.Name

                    DROP TABLE #temp
                    DROP TABLE #easTable
                    '

                    exec sp_executesql @SQLStatement, N'@MeterIds nvarchar(MAX), @startDate DATETIME, @endDate DATETIME, @EventDateFrom DATETIME ', @MeterIds = @MeterIds, @startDate = @startDate, @endDate = @endDate, @EventDateFrom = @EventDateFrom
                    ", startDate, endDate, form.meterIds, form.context);

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