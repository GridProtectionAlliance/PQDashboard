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

    [RoutePrefix("api/Breakers/BarChart")]
    public class BreakersBarChartController : BarChartController<Breaker>
    {
        #region [ constructor ]
        public BreakersBarChartController()
        {
            Query = @"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @MeterID AS varchar(max) = {2}
                        DECLARE @context as nvarchar(20) = {3}

                        DECLARE @startDate DATETIME = @EventDateFrom
                        DECLARE @endDate DATETIME = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))

                        DECLARE @dateStatement NVARCHAR(200) = N'CAST(TripCoilEnergized AS Date)'
                        DECLARE @groupByStatement NVARCHAR(200) = N'CAST(TripCoilEnergized AS Date)'

                        IF @context = 'day'
                        BEGIN
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                            SET @dateStatement = N'DateAdd(HOUR,DatePart(HOUR,TripCoilEnergized), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(HOUR, TripCoilEnergized), DateAdd(HOUR,DatePart(HOUR,TripCoilEnergized), @EventDateFrom)'
                        END


                        if @context = 'hour'
                        BEGIN
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                            SET @dateStatement = N'DateAdd(MINUTE,DatePart(MINUTE,TripCoilEnergized), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(MINUTE, TripCoilEnergized), DateAdd(MINUTE,DatePart(MINUTE,TripCoilEnergized), @EventDateFrom)'
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                            SET @dateStatement = N'DateAdd(SECOND,DatePart(SECOND,TripCoilEnergized), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(SECOND, TripCoilEnergized), DateAdd(SECOND,DatePart(SECOND,TripCoilEnergized), @EventDateFrom)'
                        END

                        DECLARE @PivotColumns NVARCHAR(MAX) = N''
                        DECLARE @ReturnColumns NVARCHAR(MAX) = N''
                        DECLARE @SQLStatement NVARCHAR(MAX) = N''

                        create table #TEMP (Name varchar(max))
                        insert into #TEMP SELECT Name FROM (Select Distinct Name FROM BreakerOperationType) as t

                        SELECT @PivotColumns = @PivotColumns + '[' + COALESCE(CAST(Name as varchar(max)), '') + '],'
                        FROM #TEMP ORDER BY Name desc

                        SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + COALESCE(CAST(Name as varchar(max)), '') + '], 0) AS [' + COALESCE(CAST(Name as varchar(max)), '') + '],'
                        FROM #TEMP ORDER BY Name desc

                        DROP TABLE #TEMP

                        SET @SQLStatement =
                        '                                                                                                            ' +
                        ' SELECT *                                                                                                   ' +
                        ' INTO #selectedMeters                                                                                       ' +
                        ' FROM String_To_Int_Table(@MeterID, '','')                                                                  ' +
                        '                                                                                                            ' +
                        ' SELECT Date as thedate, ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) +
                        ' FROM (                                                                                                     ' +
                        '   SELECT ' + @dateStatement + '  AS Date,                                                          ' +
                        '          BreakerOperationType.Name,                                                                        ' +
                        '          COUNT(*) AS thecount                                                                              ' +
                        '   FROM BreakerOperation JOIN                                                                               ' +
                        '        BreakerOperationType ON BreakerOperation.BreakerOperationTypeID = BreakerOperationType.ID JOIN      ' +
                        '        Event ON Event.ID = BreakerOperation.EventID                                                        ' +
                        '   WHERE MeterID IN (SELECT * FROM #selectedMeters) AND                                                     ' +
                        '         TripCoilEnergized >= @startDate AND TripCoilEnergized < @endDate                                   ' +
                        '   GROUP BY ' + @groupByStatement + ', BreakerOperationType.Name                                        ' +
                        ') as table1                                                                                                 ' +
                        ' PIVOT(                                                                                                     ' +
                        '       SUM(table1.thecount)                                                                                 ' +
                        '       FOR table1.Name IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')                           ' +
                        ' ) as pvt                                                                                                   ' +
                        ' ORDER BY Date                                                                                   '

                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME, @EventDateFrom DateTime ', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate, @EventDateFrom = @EventDateFrom
                ";
            Tab = "Breakers";
        }
        #endregion

    }
}