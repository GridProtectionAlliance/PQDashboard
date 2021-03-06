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
    [RoutePrefix("api/Completeness/Location")]
    public class CompletenessLocationController : LocationController<CompletenessBarChart>
    {
        #region [ constructor ]
        public CompletenessLocationController()
        {
            Query = @"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @meterIds AS varchar(max) = {2}

                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = CAST(@EventDateTo AS DATE)

                        SELECT
                            Meter.ID,
                            Meter.Name,
                            Location.Longitude,
                            Location.Latitude,
                            (
                                SELECT CAST(COALESCE(CAST(SUM(goodPoints) AS FLOAT) / NULLIF(CAST(SUM(expectedPoints) AS FLOAT), 0) * 100 , 0) AS INT)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS Count,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.ExpectedPoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS ExpectedPoints,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.GoodPoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS GoodPoints,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.LatchedPoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS LatchedPoints,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.UnreasonablePoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS UnreasonablePoints,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.NoncongruentPoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS NoncongruentPoints,
                            (
                                SELECT COALESCE(SUM(MeterDataQualitySummary.DuplicatePoints), 0)
                                FROM MeterDataQualitySummary
                                WHERE MeterDataQualitySummary.MeterID = Meter.ID AND [Date] BETWEEN @startDate AND @endDate
                            ) AS DuplicatePoints
                            FROM
                                Meter JOIN
                                Location ON Meter.LocationID = Location.ID
                            WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                            ORDER BY Meter.Name
                ";
            Tab = "Completeness";
        }
        #endregion
    }
}