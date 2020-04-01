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

namespace PQDashboard.Controllers.Events
{

    [RoutePrefix("api/Events/DetailsByDate")]
    public class EventsDetailsByDateController : ApiController
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


                        IF @context = '180d'
                        BEGIN
                            SET @startDate = DATEADD(HOUR, -180, @EventDate)
                            SET @endDate = @EventDate
                        END

                        IF @context = '90d'
                        BEGIN
                            SET @startDate = DATEADD(DAY, -90, @EventDate)
                            SET @endDate = @EventDate
                        END

                        IF @context = '30d'
                        BEGIN
                            SET @startDate = DATEADD(DAY, -30, @EventDate)
                            SET @endDate = @EventDate
                        END

                        IF @context = '7d'
                        BEGIN
                            SET @startDate = DATEADD(DAY, -7, @EventDate)
                            SET @endDate = @EventDate
                        END

                        IF @context = '24h'
                        BEGIN
                            SET @startDate = DATEADD(HOUR, -24, @EventDate)
                            SET @endDate = @EventDate
                        END

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


                        DECLARE @simStartDate DATETIME = DATEADD(SECOND, -5, @startDate)
                        DECLARE @simEndDate DATETIME = DATEADD(SECOND, 5, @endDate)
                        print @simStartDate
                        print @simEndDate
                        DECLARE @localEventDate DATE = CAST(@EventDate AS DATE)
                        DECLARE @localMeterID INT = CAST(@MeterID AS INT)
                        DECLARE @timeWindow int = (SELECT Value FROM DashSettings WHERE Name = 'System.TimeWindow')

                        ; WITH cte AS
                        (
                            SELECT
                                Event.AssetID AS AssetID,
                                Event.ID AS EventID,
                                EventType.Name AS EventType,
                                Event.StartTime AS StartTime,
                                Asset.AssetName AS AssetName,
                                Asset.VoltageKV AS KV,
                                COALESCE(FaultSummary.FaultType, Phase.Name, '') AS FaultType,
                                CASE 
				                    WHEN FaultSummary.Distance = '-1E308' THEN 'NaN' 
				                    ELSE COALESCE(CAST(CAST(FaultSummary.Distance AS DECIMAL(16, 4)) AS NVARCHAR(19)), '') END AS Distance,
                                CASE EventType.Name
                                    WHEN 'Sag' THEN ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY Magnitude, Disturbance.StartTime, IsSelectedAlgorithm DESC, IsSuppressed, Inception)
                                    WHEN 'Interruption' THEN ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY Magnitude, Disturbance.StartTime, IsSelectedAlgorithm DESC, IsSuppressed, Inception)
                                    WHEN 'Swell' THEN ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY Magnitude DESC, Disturbance.StartTime, IsSelectedAlgorithm DESC, IsSuppressed, Inception)
                                    WHEN 'Fault' THEN ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY IsSelectedAlgorithm DESC, IsSuppressed, IsValid DESC, Inception)
                                    ELSE ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY Event.ID)
                                END AS RowPriority,
                                Event.UpdatedBy,
                                (SELECT COUNT(*) FROM EventNote WHERE EventID = Event.ID) as Note
                            FROM
                                Event JOIN
                                EventType ON Event.EventTypeID = EventType.ID LEFT OUTER JOIN
                                Disturbance ON Disturbance.EventID = Event.ID LEFT OUTER JOIN
                                FaultSummary ON FaultSummary.EventID = Event.ID  LEFT OUTER JOIN
                                Phase ON Disturbance.PhaseID = Phase.ID LEFT JOIN
                                Meter ON Meter.ID = @MeterID LEFT JOIN
                                Asset ON Event.AssetID = Asset.ID LEFT JOIN
                                MeterAsset ON MeterAsset.MeterID = @MeterID AND MeterAsset.AssetID = Asset.ID
                            WHERE
                                Event.StartTime >= @startDate AND Event.StartTime < @endDate AND
                                Event.MeterID = @localMeterID AND
                                (Phase.ID IS NULL OR Phase.Name <> 'Worst')
                        )
                        SELECT
                            AssetID,
                            EventID,
                            EventType,
                            StartTime,
                            AssetName,
                            KV,
                            FaultType,
                            Distance,
                            UpdatedBy,
                            Note
                        FROM cte
                        WHERE RowPriority = 1
                        ORDER BY StartTime
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