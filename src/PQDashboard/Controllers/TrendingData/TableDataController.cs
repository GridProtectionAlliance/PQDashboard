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
    [RoutePrefix("api/TrendingData/TableData")]
    public class TrendingDataTableDataController : TableDataController<TrendingDataPoint>
    {
        public TrendingDataTableDataController()
        {
            Query = @"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}
                        DECLARE @MeterIDs TABLE (ID int);
                        DECLARE @Date as DateTime2;
                        SET  @Date = CAST(@EventDate AS DATE)

                        -- Create MeterIDs Table
                        INSERT INTO @MeterIDs(ID) SELECT Value FROM dbo.String_to_int_table(@MeterID, ',');

                        -- Trending Data
                        SELECT
                            Meter.ID as MeterID,
                            Meter.Name as Site,
                            Channel.ID as ChannelID,
                            DailyTrendingSummary.Date as Date,
                            MIN(Minimum/COALESCE(Channel.PerUnitValue,1)) as Minimum,
                            MAX(Maximum/COALESCE(Channel.PerUnitValue,1)) as Maximum,
                            AVG(Average/COALESCE(Channel.PerUnitValue,1)) as Average,
                            MeasurementCharacteristic.Name as Characteristic,
                            MeasurementType.Name as MeasurementType,
                            Phase.Name as PhaseName
                        FROM
                            DailyTrendingSummary JOIN
                            Channel ON DailyTrendingSummary.ChannelID = Channel.ID JOIN
                            Meter ON Meter.ID = Channel.MeterID JOIN
                            MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN
                            MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN
                            Phase ON Channel.PhaseID = Phase.ID
                        WHERE Meter.ID IN (SELECT * FROM @MeterIDs) AND Channel.ID IN (SELECT ChannelID FROM ContourChannel WHERE ContourColorScaleName = {3}) AND Date = @Date
                        GROUP BY Date, Meter.ID, Meter.Name, MeasurementCharacteristic.Name, MeasurementType.Name, Phase.Name, Channel.ID
                        ORDER BY Date
                ";
            Tab = "TrendingData";
        }
    }
}