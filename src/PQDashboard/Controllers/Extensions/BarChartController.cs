//******************************************************************************************************
//  BarChartController.cs - Gbtc
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
//  04/06/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System.Web.Http;

namespace PQDashboard.Controllers
{
    public class EASExtension { }
    [RoutePrefix("api/Extensions/BarChart")]
    public class ExtensionsBarChartController : BarChartController<EASExtension>
    {
        #region [ constructor ]
        public ExtensionsBarChartController()
        {
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
                ";
            Tab = "Extensions";
        }
        #endregion
    }
}