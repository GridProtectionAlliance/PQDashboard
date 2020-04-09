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

using System.Web.Http;
using openXDA.Model;

namespace PQDashboard.Controllers
{

    [RoutePrefix("api/Events/BarChart")]
    public class EventsBarChartController : BarChartController<Event>
    {
        #region [ constructor ]
        public EventsBarChartController() {
            Query = @"
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
                    DECLARE @SQLStatement NVARCHAR(MAX) = N''

                    SELECT @PivotColumns = @PivotColumns + '[' + t.Name + '],'
                    FROM (Select Name FROM EventType) AS t

                    SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + t.Name + '], 0) AS [' + t.Name + '],'
                    FROM (Select Name FROM EventType) AS t

                    SET @SQLStatement =
                    '
                    DECLARE @ids varchar(max) = @MeterID
                    DECLARE @start DateTime = @startDate
                    DECLARE @end DateTime = @endDate

                    SELECT *
                    INTO #selectedMeters
                    FROM String_To_Int_Table(@ids, '','')

                    SELECT Date as thedate, ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) + '
                    FROM (
                            SELECT ' + @dateStatement + ' as Date, COUNT(*) AS EventCount, EventType.Name as Name
                            FROM Event JOIN
                            EventType ON Event.EventTypeID = EventType.ID
                           WHERE
                                MeterID IN (SELECT * FROM #selectedMeters) AND
                                 StartTime >= @start AND StartTime < @end
                           GROUP BY ' + @groupByStatement + ', EventType.Name
                           ) as ed
                     PIVOT(
                            SUM(ed.EventCount)
                            FOR ed.Name IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                     ) as pvt
                     ORDER BY Date '

                    exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME, @EventDateFrom DATETIME ', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate, @EventDateFrom = @EventDateFrom
                ";
            Tab = "Events";
        }
        #endregion
    }
}