﻿//******************************************************************************************************
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

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Extensions/TableData")]
    public class ExtensionsTableDataController : TableDataController<EASExtension>
    {
        #region [ constructor ]
        public ExtensionsTableDataController()
        {
            Query = @"
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
                        DECLARE @MiddleStatment NVARCHAR(MAX) = N''

                        SELECT 
		                    @PivotColumns = @PivotColumns + '[' + t.ServiceName + '],',
		                    @ReturnColumns = @ReturnColumns + ' COALESCE([' + t.ServiceName + '], 0) AS [' + t.ServiceName + '],'
                        FROM (Select ServiceName FROM EASExtension) AS t

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
                        INTO #meterSelections
                        FROM String_To_Int_Table(@MeterID, '','')

                        SELECT * INTO #temp
                        FROM EVENT
                        WHERE   StartTime Between @startDate AND @endDate AND
                                MeterID IN (SELECT * FROM String_To_Int_Table( @MeterID,  '',''))

                        SELECT (SELECT TOP 1 ID FROM Event WHERE MeterID = Meter.ID AND StartTime >= @startDate AND StartTime < @endDate) as EventID,
                                 Meter.ID as MeterID,
                                 Meter.Name as Site,
                                 ' + SUBSTRING(@ReturnColumns,0, LEN(@ReturnColumns)) + '
                         FROM Meter Join
                            (
                                ' + SUBSTRING(@MiddleStatment,0, LEN(@MiddleStatment) - LEN('UNION')) + '
                             ) as ed
                             PIVOT(
                                    SUM(ed.EventCount)
                                    FOR ed.ServiceName IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                             ) as pvt ON pvt.MeterID = Meter.ID
                         WHERE
                            Meter.ID IN (SELECT * FROM #meterSelections)

                         ORDER BY MeterID
                         DROP Table #temp
                         '

                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME ', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate
                ";
            Tab = "Extensions";
        }
        #endregion

    }
}