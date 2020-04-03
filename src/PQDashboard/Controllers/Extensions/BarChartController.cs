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

namespace PQDashboard.Controllers.Extensions
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

    [RoutePrefix("api/Extensions/BarChart")]
    public class ExtensionsBarChartController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(DataForPeriodForm form)
        {
            try
            {
                string tab = "Extensions";
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

                        DECLARE @startDate DATETIME = @EventDateFrom
                        DECLARE @endDate DATETIME = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))

                        DECLARE @dateStatement NVARCHAR(200) = N'CAST(StartTime AS Date)'
                        DECLARE @groupByStatement NVARCHAR(200) = N'CAST(StartTime AS Date)'

                        IF @context = 'day'
                        BEGIN
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                            SET @dateStatement = N'DateAdd(HOUR,DatePart(HOUR,StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(HOUR, StartTime), DateAdd(HOUR,DatePart(HOUR,StartTime), @EventDateFrom)'
                        END

                        if @context = 'hour'
                        BEGIN
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                            SET @dateStatement = N'DateAdd(MINUTE,DatePart(MINUTE,StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(MINUTE, StartTime), DateAdd(MINUTE,DatePart(MINUTE,StartTime), @EventDateFrom)'
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                            SET @dateStatement = N'DateAdd(SECOND,DatePart(SECOND,StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(SECOND, StartTime), DateAdd(SECOND,DatePart(SECOND,StartTime), @EventDateFrom)'
                        END



                        DECLARE @PivotColumns NVARCHAR(MAX) = N''
                        DECLARE @ReturnColumns NVARCHAR(MAX) = N''
                        DECLARE @MiddleStatment NVARCHAR(MAX) = N''
                        DECLARE @SQLStatement NVARCHAR(MAX) = N''

                        SELECT @PivotColumns = @PivotColumns + '[' + t.ServiceName + '],'
                        FROM (Select ServiceName FROM EASExtension) AS t

                        SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + t.ServiceName + '], 0) AS [' + t.ServiceName + '],'
                        FROM (Select ServiceName FROM EASExtension) AS t

                        SELECT @MiddleStatment = @MiddleStatment +  '
                                    SELECT '+@dateStatement+' as date,
                                        '''+ t.ServiceName + ''' as ServiceName,
                                        Count(*) as EventCount
                                    FROM    #temp
                                    WHERE   dbo.' + t.HasResultFunction + '(ID) != ''''
                                    GROUP BY '+ @dateStatement + ' UNION'

                        FROM (Select * FROM EASExtension) AS t

                        SELECT * INTO #temp
                        FROM EVENT
                        WHERE   StartTime Between @startDate AND @endDate AND
                                MeterID IN (SELECT * FROM String_To_Int_Table( @MeterID,  ','))

                        CREATE INDEX tempIndex ON #temp (MeterID)

                        SET @SQLStatement =
                        '
                        SELECT Date as thedate, ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) + '
                        FROM (
                                SELECT * FROM (
                                ' + SUBSTRING(@MiddleStatment,0, LEN(@MiddleStatment) - LEN('UNION')) + ' ) as innertable
                               ) as ed
                         PIVOT(
                                SUM(ed.EventCount)
                                FOR ed.ServiceName IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                         ) as pvt
                         ORDER BY Date

                         DROP TABLE #temp
                         '
                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME, @EventDateFrom DATETIME ',  @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate, @EventDateFrom = @EventDateFrom
    
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