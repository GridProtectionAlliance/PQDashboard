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
using System.Data;
using System.Web.Http;
using GSF.Data;

namespace PQDashboard.Controllers.Correctness
{
    [RoutePrefix("api/Correctness/DetailsByDate")]
    public class CorrectnessDetailsByDateController : ApiController
    {
        [Route("{siteID:int}/{month:int}/{day:int}/{year:int}"), HttpGet]
        public IHttpActionResult Get(int siteID, int month, int day, int year)
        {
            const string QueryFormat =
                "DECLARE @meterID AS INT = {0} " +
                "DECLARE @queryDate as DateTime = {1} " +
                "" +
                "SELECT DISTINCT " +
                "    Channel.ID AS channelid, " +
                "    @queryDate AS date, " +
                "    Channel.Name AS channelname, " +
                "    Meter.ID AS meterid, " +
                "    MeasurementType.Name AS measurementtype, " +
                "    MeasurementCharacteristic.Name AS characteristic, " +
                "    Phase.Name AS phasename, " +
                "    DailyTrendingSummary.ValidCount + DailyTrendingSummary.InvalidCount AS ReceivedPoints, " +
                "    ChannelDataQualitySummary.GoodPoints AS GoodPoints, " +
                "    ChannelDataQualitySummary.LatchedPoints AS LatchedPoints, " +
                "    ChannelDataQualitySummary.UnreasonablePoints AS UnreasonablePoints, " +
                "    ChannelDataQualitySummary.NoncongruentPoints AS NoncongruentPoints " +
                "FROM " +
                "    ChannelDataQualitySummary JOIN " +
                "    DailyTrendingSummary ON " +
                "        DailyTrendingSummary.ChannelID = ChannelDataQualitySummary.ChannelID AND " +
                "        DailyTrendingSummary.Date = ChannelDataQualitySummary.Date JOIN " +
                "    Channel ON ChannelDataQualitySummary.ChannelID = Channel.ID JOIN " +
                "    Meter ON Channel.MeterID = @meterID JOIN " +
                "    MeasurementType ON MeasurementType.ID = Channel.MeasurementTypeID JOIN " +
                "    MeasurementCharacteristic ON MeasurementCharacteristic.ID = Channel.MeasurementCharacteristicID JOIN " +
                "    Phase ON Phase.ID = Channel.PhaseID " +
                "WHERE " +
                "    ChannelDataQualitySummary.Date = @queryDate AND " +
                "    Meter.ID = @meterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DateTime date = new DateTime(year, month, day);
                DataTable table = connection.RetrieveData(QueryFormat, siteID, date);
                return Ok(table);
            }
        }
    }
}