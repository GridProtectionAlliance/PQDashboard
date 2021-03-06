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
    [RoutePrefix("api/Disturbances/TableData")]
    public class DisturbancesTableDataController : TableDataController<Disturbance>
    {
        #region [ constructor ]
        public DisturbancesTableDataController()
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

                        create table #TEMP (Name varchar(max))
                        insert into #TEMP SELECT SeverityCode FROM (Select Distinct SeverityCode FROM DisturbanceSeverity) as t

                        SELECT 
		                    @PivotColumns = @PivotColumns + '[' + COALESCE(CAST(Name as varchar(5)), '') + '],',
		                    @ReturnColumns = @ReturnColumns + ' COALESCE([' + COALESCE(CAST(Name as varchar(5)), '') + '], 0) AS [' + COALESCE(CAST(Name as varchar(5)), '') + '],'
                        FROM #TEMP ORDER BY Name desc

                        DECLARE @voltageEnvelope varchar(max) = (SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope')

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
                                Event.MeterID, COUNT(*) AS EventCount, SeverityCode, Meter.Name as Site
                            FROM
                                Disturbance JOIN
                                DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
                                Event ON Disturbance.EventID = Event.ID JOIN
                                EventType ON Event.EventTypeID = EventType.ID JOIN
                                Meter ON Event.MeterID = Meter.ID JOIN
                                Phase ON Phase.ID = Disturbance.PhaseID JOIN
                                VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID
                            WHERE
                                Phase.Name = ''Worst'' AND
                                MeterID IN (SELECT * FROM #meterSelections) AND
                                VoltageEnvelope.Name = COALESCE(@voltageEnvelope, ''ITIC'') AND
                                Event.StartTime >= @startDate AND Event.StartTime < @endDate
                            GROUP BY Event.MeterID,Meter.Name,SeverityCode
                               ) as ed
                         PIVOT(
                                SUM(ed.EventCount)
                                FOR ed.SeverityCode IN(' + SUBSTRING(@PivotColumns,0, LEN(@PivotColumns)) + ')
                         ) as pvt
                         ORDER BY MeterID '

                        exec sp_executesql @SQLStatement, N'@MeterID nvarchar(MAX), @startDate DATETIME, @endDate DATETIME, @voltageEnvelope VARCHAR(MAX) ', @MeterID = @MeterID, @startDate = @startDate, @endDate = @endDate, @voltageEnvelope = @voltageEnvelope
                ";
            Tab = "Disturbances";
        }
        #endregion
    }
}