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

namespace PQDashboard.Controllers
{

    [RoutePrefix("api/Disturbances/BarChart")]
    public class DisturbancesBarChartController : BarChartController<Disturbance>
    {

        #region [ constructor ]
        public DisturbancesBarChartController()
        {
            Query = @"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @MeterID AS varchar(max) = {2}
                        DECLARE @context as nvarchar(20) = {3}

                        DECLARE @startDate DATETIME = @EventDateFrom
                        DECLARE @endDate DATETIME = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))

                        DECLARE @dateStatement NVARCHAR(200) = N'CAST(Disturbance.StartTime AS Date)'
                        DECLARE @groupByStatement NVARCHAR(200) = N'CAST(Disturbance.StartTime AS Date)'

                        IF @context = 'day'
                        BEGIN
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                            SET @dateStatement = N'DateAdd(HOUR,DatePart(HOUR,Disturbance.StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(HOUR, Disturbance.StartTime), DateAdd(HOUR,DatePart(HOUR,Disturbance.StartTime), @EventDateFrom)'
                        END

                        if @context = 'hour'
                        BEGIN
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                            SET @dateStatement = N'DateAdd(MINUTE,DatePart(MINUTE,Disturbance.StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(MINUTE, Disturbance.StartTime), DateAdd(MINUTE,DatePart(MINUTE,Disturbance.StartTime), @EventDateFrom)'
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                            SET @dateStatement = N'DateAdd(SECOND,DatePart(SECOND,Disturbance.StartTime), @EventDateFrom)'
                            SET @groupByStatement = N'DATEPART(SECOND, Disturbance.StartTime), DateAdd(SECOND,DatePart(SECOND,Disturbance.StartTime), @EventDateFrom)'
                        END

                        DECLARE @voltageEnvelope varchar(max) = (SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope')


                        DECLARE @PivotColumns NVARCHAR(MAX) = N''
                        DECLARE @ReturnColumns NVARCHAR(MAX) = N''
                        DECLARE @SQLStatement NVARCHAR(MAX) = N''

                        create table #TEMP (Name varchar(max))
                        insert into #TEMP SELECT SeverityCode FROM (Select Distinct SeverityCode FROM DisturbanceSeverity) as t

                        SELECT @PivotColumns = @PivotColumns + '[' + COALESCE(CAST(Name as varchar(5)), '') + '],'
                        FROM #TEMP WHERE Name != 0 ORDER BY Name desc
                        SET @PivotColumns = @PivotColumns + '[0]'

                        SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + COALESCE(CAST(Name as varchar(5)), '0') + '], 0) AS [' + COALESCE(CAST(Name as varchar(5)), '') + '],'
                        FROM #TEMP WHERE Name != 0 ORDER BY Name desc
                        SET @ReturnColumns = @ReturnColumns + 'COALESCE([0],0) as [0]'

                        SET @SQLStatement =
                        N'
                        DECLARE @ids varchar(max) = @MeterID
                        DECLARE @start DateTime = @startDate
                        DECLARE @end DateTime = @endDate

                        SELECT *
                        INTO #selectedMeters
                        FROM String_To_Int_Table(@ids, '','')

                        SELECT DisturbanceDate as thedate, ' + @ReturnColumns + '
                         FROM (
                            SELECT
                                ' + @dateStatement + ' AS DisturbanceDate,
                                SeverityCode,
                                COUNT(*) AS DisturbanceCount
                            FROM
                                DisturbanceSeverity JOIN
                                Disturbance ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
                                Event ON Event.ID = Disturbance.EventID JOIN
                                Phase ON Disturbance.PhaseID = Phase.ID JOIN
                                VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID
                            WHERE
                                (
                                    @MeterID = ''0'' OR
                                    MeterID IN (SELECT * FROM #selectedMeters)
                                ) AND
                                Phase.Name = ''Worst'' AND
                                VoltageEnvelope.Name = COALESCE(@voltageEnvelope, ''ITIC'') AND
                                Disturbance.StartTime BETWEEN @start AND @end AND
                                Disturbance.StartTime <> @endDate
                            GROUP BY ' + @groupByStatement + ', SeverityCode
                            ) As DisturbanceDate
                         PIVOT(
                                SUM(DisturbanceDate.DisturbanceCount)
                                FOR DisturbanceDate.SeverityCode IN(' + @PivotColumns + ')
                         ) as pvt
                         ORDER BY DisturbanceDate '

                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIMe, @endDate DATEtime, @EventDateFrom DATETIME, @voltageEnvelope VARCHAR(MAX)', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate, @EventDateFrom = @EventDateFrom, @voltageEnvelope = @voltageEnvelope

                ";
            Tab = "Disturbances";
        }
        #endregion
    }
}