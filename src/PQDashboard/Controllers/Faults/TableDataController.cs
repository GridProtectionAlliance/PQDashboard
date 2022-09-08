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

using System.Web.Http;
using openXDA.Model;

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Faults/TableData")]
    public class FaultsTableDataController : TableDataController<Fault>
    {
        #region [ constructor ]
        public FaultsTableDataController()
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

                        SELECT *
                        INTO #meterSelections
                        FROM String_to_int_table(@MeterID, ',')

                        ; WITH FaultDetail AS
                        (
                            SELECT
                                FaultSummary.ID AS thefaultid,
                                Meter.Name AS thesite,
                                Meter.ShortName AS theshortsite,
                                Location.ShortName AS locationname,
                                Meter.ID AS themeterid,
                                Asset.ID AS thelineid,
                                Event.ID AS theeventid,
                                Asset.AssetName AS AssetName,
			                    AssetType.Name AS AssetType,
                                Asset.VoltageKV AS voltage,
                                CAST(CAST(Event.StartTime AS TIME) AS NVARCHAR(100)) AS theinceptiontime,
                                FaultSummary.FaultType AS thefaulttype,
                                FaultCauseMetrics.TreeFaultResistance,
                                FaultCauseMetrics.LightningMilliseconds,
                                FaultCauseMetrics.InceptionDistanceFromPeak,
                                FaultCauseMetrics.PrefaultThirdHarmonic,
                                FaultCauseMetrics.GroundCurrentRatio,
                                FaultCauseMetrics.LowPrefaultCurrentRatio,
                                CASE WHEN FaultSummary.Distance = '-1E308' THEN 'NaN' ELSE CAST(CAST(FaultSummary.Distance AS DECIMAL(16,2)) AS NVARCHAR(19)) END AS thecurrentdistance,
                                (SELECT COUNT(*) FROM FaultNote WHERE FaultSummary.ID = FaultNote.FaultSummaryID) as notecount,
                                ROW_NUMBER() OVER(PARTITION BY Event.ID ORDER BY FaultSummary.IsSuppressed, FaultSummary.IsSelectedAlgorithm DESC, FaultSummary.Inception) AS rk
                            FROM
                                FaultSummary JOIN
                                Event ON FaultSummary.EventID = Event.ID JOIN
                                FaultCauseMetrics ON FaultSummary.EventID = FaultCauseMetrics.EventID AND FaultSummary.FaultNumber = FaultCauseMetrics.FaultNumber JOIN
                                EventType ON Event.EventTypeID = EventType.ID JOIN
                                Meter ON Event.MeterID = Meter.ID JOIN
                                Location ON Meter.LocationID = Location.ID JOIN
                                Asset ON Event.AssetID = Asset.ID JOIN
                                MeterAsset ON MeterAsset.MeterID = Meter.ID AND MeterAsset.AssetID = Asset.ID JOIN
			                    AssetType ON Asset.AssetTypeID = AssetType.ID
                            WHERE
                                EventType.Name = 'Fault' AND
                                Event.StartTime >= @startDate AND Event.StartTime < @endDate AND
                                Meter.ID IN (SELECT * FROM #meterSelections)
                        )
                        SELECT *
                        FROM FaultDetail
                        WHERE rk = 1
                ";
            Tab = "Faults";
        }
        #endregion
    }
}