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
    [RoutePrefix("api/Trending/TableData")]
    public class TrendingTableDataController : TableDataController<TrendingAlarmLimit>
    {
        public TrendingTableDataController()
        {
            Query = @"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}
                        declare @theDate as Date
                        declare  @MeterIDs TABLE (ID int);

                        set @theDate = CAST(@EventDate as Date)

                        INSERT INTO @MeterIDs(ID) SELECT Value FROM dbo.String_to_int_table(@MeterID, ',');

                            Select
                            Meter.ID as MeterID,
                            Channel.ID as ChannelID,
                            Meter.Name as Site,
                            'Alarm' as EventType,
                            [dbo].[MeasurementCharacteristic].[Name] as Characteristic,
                            [dbo].[MeasurementType].[Name] as MeasurementType,
                            [dbo].[Phase].[Name] as PhaseName,
                            Channel.HarmonicGroup,
                            SUM (ChannelAlarmSummary.AlarmPoints) as EventCount,
                            @theDate as Date

                            from Channel

                            join ChannelAlarmSummary on ChannelAlarmSummary.ChannelID = Channel.ID and Date = @theDate
                            join Meter on Channel.MeterID = Meter.ID and [MeterID] in ( Select * from @MeterIDs)
                            join [dbo].[MeasurementCharacteristic] on Channel.MeasurementCharacteristicID = [dbo].[MeasurementCharacteristic].[ID]
                            join [dbo].[MeasurementType] on Channel.MeasurementTypeID =  [dbo].[MeasurementType].ID
                            join [dbo].[Phase] on Channel.PhaseID = [dbo].[Phase].ID

                            Group By Meter.ID , Channel.ID , Meter.Name , [MeasurementCharacteristic].[Name] , [MeasurementType].[Name] , [dbo].[Phase].[Name], Channel.HarmonicGroup
                            Order By Meter.ID
                ";
            Tab = "Trending";
        }
    }
}