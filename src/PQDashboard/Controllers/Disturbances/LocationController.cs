﻿//******************************************************************************************************
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

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Disturbances/Location")]
    public class DisturbancesLocationController : LocationController<Disturbance>
    {
        #region [ constructor ]
        public DisturbancesLocationController()
        {
            Query = @"
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


                        create table #TEMP (Name varchar(max))
                        insert into #TEMP SELECT SeverityCode FROM (Select Distinct SeverityCode FROM DisturbanceSeverity) as t

                        SELECT @PivotColumns = @PivotColumns + '[' + COALESCE(CAST(Name as varchar(5)), '') + '],'
                        FROM #TEMP WHERE Name != 0 ORDER BY Name desc
                        SET @PivotColumns = @PivotColumns + '[0]'

                        SELECT @CountColumns = @CountColumns + 'COALESCE([' + COALESCE(CAST(Name as varchar(5)), '') + '], 0) + '
                        FROM #TEMP WHERE Name != 0 ORDER BY Name desc
                        SET @CountColumns = @CountColumns + 'COALESCE([0], 0) '


                        SELECT @ReturnColumns = @ReturnColumns + ' COALESCE([' + COALESCE(CAST(Name as varchar(5)), '') + '], 0) AS [' + COALESCE(CAST(Name as varchar(5)), '') + '],'
                        FROM #TEMP WHERE Name != 0ORDER BY Name desc
                        SET @ReturnColumns = @ReturnColumns + 'COALESCE([0], 0) as [0]'

                        DECLARE @voltageEnvelope varchar(max) = (SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope')

                        DROP TABLE #TEMP

                        SET @SQLStatement = N'
                        DECLARE @ids varchar(max) = @MeterIds
                        DECLARE @start DateTime = @startDate
                        DECLARE @end DateTime = @endDate

                        SELECT *
                        INTO #selectedMeters
                        FROM String_To_Int_Table(@ids, '','')

                        SELECT Meter.ID,
                                 Meter.Name,
                                 Location.Longitude,
                                 Location.Latitude,
                                 ' + @CountColumns +' as Count,
                                 ' + @ReturnColumns + '
                        FROM
                            Meter JOIN
                            Location ON Meter.LocationID = Location.ID LEFT OUTER JOIN
                            (
                                SELECT MeterID,
                                       COUNT(*) AS EventCount,
                                       SeverityCode
                                FROM Event JOIN
                                     Disturbance ON Event.ID = Disturbance.EventID JOIN
                                     Phase ON Phase.ID = Disturbance.PhaseID LEFT JOIN
                                     DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
                                     VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID
                                WHERE
                                     Phase.Name = ''Worst'' AND
                                     Disturbance.StartTime >= @start AND Disturbance.StartTime < @end AND
                                     VoltageEnvelope.Name = COALESCE(@voltageEnvelope, ''ITIC'')
                                GROUP BY Event.MeterID, SeverityCode
                               ) as ed
                               PIVOT(
                                     SUM(ed.EventCount)
                                     FOR ed.SeverityCode IN(' + @PivotColumns + ')
                               ) as pvt On pvt.MeterID = meter.ID
                            WHERE
                                Meter.ID IN (SELECT * FROM #selectedMeters)

                        Order By Name '

                        exec sp_executesql @SQLStatement, N'@MeterIds nvarchar(MAX), @startDate DATETIME, @endDate DATETIME , @voltageEnvelope VARCHAR(MAX)', @MeterIds = @MeterIds, @startDate = @startDate, @endDate = @endDate, @voltageEnvelope = @voltageEnvelope
                ";
            Tab = "Disturbances";
        }
        #endregion
    }
}