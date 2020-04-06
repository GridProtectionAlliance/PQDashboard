//******************************************************************************************************
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
    [RoutePrefix("api/Correctness/Location")]
    public class CorrectnessLocationController : LocationController<CorrectnessBarChart>
    {
        #region [ constructor ]
        public CorrectnessLocationController()
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
                            COALESCE(CAST(CAST(SUM(MeterDataQualitySummary.GoodPoints) AS FLOAT) / NULLIF(CAST(SUM(MeterDataQualitySummary.ExpectedPoints) AS FLOAT), 0) * 100 AS INT),0) AS Count,
                            COALESCE(SUM(MeterDataQualitySummary.ExpectedPoints) , 0) AS ExpectedPoints,
                            COALESCE(SUM(MeterDataQualitySummary.GoodPoints),0) AS GoodPoints,
                            COALESCE(SUM(MeterDataQualitySummary.LatchedPoints),0) AS LatchedPoints,
                            COALESCE(SUM(MeterDataQualitySummary.UnreasonablePoints),0) AS UnreasonablePoints,
                            COALESCE(SUM(MeterDataQualitySummary.NoncongruentPoints),0) AS NoncongruentPoints,
                            COALESCE(SUM(MeterDataQualitySummary.DuplicatePoints),0) AS DuplicatePoints
                            FROM
                                Meter JOIN
                                Location ON Meter.LocationID = Location.ID LEFT JOIN
                                ( SELECT * FROM MeterDataQualitySummary WHERE [Date] BETWEEN @startDate AND @endDate) as MeterDataQualitySummary ON MeterDataQualitySummary.MeterID = Meter.ID
                            WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                            GROUP BY Meter.ID, Meter.Name, Location.Longitude, Location.Latitude
                            ORDER BY Meter.Name
                ";
            Tab = "Correctness";
        }
        #endregion
    }
}