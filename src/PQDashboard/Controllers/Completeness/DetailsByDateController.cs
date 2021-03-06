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

namespace PQDashboard.Controllers.Completeness
{

    [RoutePrefix("api/Completeness/DetailsByDate")]
    public class CompletenessDetailsByDateController : ApiController
    {
        [Route("{siteID:int}/{month:int}/{day:int}/{year:int}"), HttpGet]
        public IHttpActionResult Get(int siteID, int month, int day, int year)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    DataTable table = connection.RetrieveData(@"
                        DECLARE @MeterID AS INT = {0}
                        DECLARE @EventDate as DateTime = {1}

                        select
                        Distinct [dbo].[Channel].[ID] as channelid,
                        [dbo].[Channel].[Name] as channelname,
                        @EventDate as date,
                        [dbo].[Meter].[ID] as meterid,
                        [dbo].[MeasurementType].[Name] as measurementtype,
                        [dbo].[MeasurementCharacteristic].[Name] as characteristic,
                        [dbo].[Phase].[Name] as phasename,

                        COALESCE(CAST( cast(LatchedPoints as float) / NULLIF(cast(expectedPoints as float),0) as float),0) * 100 as Latched,
                        COALESCE(CAST( cast(UnreasonablePoints as float) / NULLIF(cast(expectedPoints as float),0) as float),0) * 100 as Unreasonable,
                        COALESCE(CAST( cast(NoncongruentPoints as float) / NULLIF(cast(expectedPoints as float),0) as float),0) * 100 as Noncongruent,
                        COALESCE(CAST( cast(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints as float) / NULLIF(cast(expectedPoints as float),0) as float),0) * 100 as completeness

                        from [dbo].[ChannelDataQualitySummary]
                        join [dbo].[Channel] on [dbo].[ChannelDataQualitySummary].[ChannelID] = [dbo].[Channel].[ID]
                        join [dbo].[Meter] on [dbo].[Channel].[MeterID] = @MeterID
                        join [dbo].[MeasurementType] on [dbo].[MeasurementType].[ID] = [dbo].[Channel].[MeasurementTypeID]
                        join [dbo].[MeasurementCharacteristic] on [dbo].[MeasurementCharacteristic].[ID] = [dbo].[Channel].[MeasurementCharacteristicID]
                        join [dbo].[Phase] on [dbo].[Phase].[ID] = [dbo].[Channel].[PhaseID]
                        where [dbo].[ChannelDataQualitySummary].[Date] = @EventDate and [dbo].[Meter].[ID] = @MeterID
                    ", siteID, new DateTime(year, month, day));

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