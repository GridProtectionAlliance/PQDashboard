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

namespace PQDashboard.Controllers.Disturbances
{

    [RoutePrefix("api/Disturbances/DetailsByDate")]
    public class DisturbancesDetailsByDateController : ApiController
    {
        [Route("{eventID:int}/{context}"), HttpGet]
        public IHttpActionResult Get(int eventID, string context)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable table = connection.RetrieveData(@"
                        DECLARE @eventID AS INT = {0}
                        DECLARE @context as nvarchar(20) = {1}

                        DECLARE @worstPhaseID INT = (SELECT ID FROM Phase WHERE Name = 'Worst')
						DECLARE @EventDate DATETIME2 = (SELECT StartTime FROM Event WHERE ID = @eventID)
						DECLARE @MeterID INT = (SELECT MeterID FROM Event WHERE ID = @eventID)
                        DECLARE @startDate DATETIME = @EventDate
                        DECLARE @endDate DATETIME


                        IF @context = 'day'
                        BEGIN
                            SET @startDate = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                        END

                        if @context = 'hour'
                        BEGIN
                            SET @startDate = DATEADD(HOUR, DATEDIFF(HOUR, 0, @EventDate), 0)
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @startDate = DATEADD(MINUTE, DATEDIFF(MINUTE, 0, @EventDate), 0)
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                        END

                        if @context = 'second'
                        BEGIN
                            DECLARE @tempDate DATETIME = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @startDate = DATEADD(SECOND, DATEDIFF(SECOND, @tempDate, @EventDate), @tempDate)
                            SET @endDate = DATEADD(SECOND, 1, @startDate)
                        END

                        DECLARE @voltageEnvelope varchar(max) = (SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope')

                        SELECT
                            Event.AssetID AS thelineid,
                            Event.ID AS theeventid,
                            Disturbance.ID as disturbanceid,
                            EventType.Name AS disturbancetype,
                            Phase.Name AS phase,
                            CASE Disturbance.PerUnitMagnitude
                                WHEN -1E308 THEN 'NaN'
                                ELSE CAST(Disturbance.PerUnitMagnitude AS VARCHAR(MAX))
                            END AS magnitude,
                            CASE Disturbance.DurationSeconds
                                WHEN -1E308 THEN 'NaN'
                                ELSE CAST(CONVERT(DECIMAL(10,3), Disturbance.DurationSeconds) AS VARCHAR(14))
                            END AS duration,
                            CAST(Disturbance.StartTime AS VARCHAR(26)) AS theinceptiontime,
                            dbo.DateDiffTicks('1970-01-01', Disturbance.StartTime) / 10000.0 AS startmillis,
                            dbo.DateDiffTicks('1970-01-01', Disturbance.EndTime) / 10000.0 AS endmillis,
                            DisturbanceSeverity.SeverityCode,
                            Asset.AssetName AS thelinename,
                            Asset.VoltageKV AS voltage,
                            (SELECT COUNT(*) FROM EventNote WHERE EventID = Event.ID) as notes
                        FROM
                            Event JOIN
                            Disturbance ON Disturbance.EventID = Event.ID JOIN
                            Disturbance WorstDisturbance ON
                                Disturbance.EventID = WorstDisturbance.EventID AND
                                Disturbance.PerUnitMagnitude = WorstDisturbance.PerUnitMagnitude AND
                                Disturbance.DurationSeconds = WorstDisturbance.DurationSeconds JOIN
                            EventType ON Disturbance.EventTypeID = EventType.ID JOIN
                            Phase ON Disturbance.PhaseID = Phase.ID JOIN
                            DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
                            Meter ON Meter.ID = @MeterID JOIN
                            Asset ON Event.AssetID = Asset.ID JOIN
                            MeterAsset ON MeterAsset.MeterID = @MeterID AND MeterAsset.AssetID = Asset.ID JOIN
                            VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID
                        WHERE
                            Event.StartTime >= @startDate AND Event.StartTime < @endDate AND
                            Event.MeterID = @MeterID AND
                            WorstDisturbance.PhaseID = @worstPhaseID AND
                            Disturbance.PhaseID <> @worstPhaseID AND
                            VoltageEnvelope.Name = COALESCE(@voltageEnvelope, 'ITIC')
                        ORDER BY
                            Event.StartTime ASC

                    ", eventID, context);

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