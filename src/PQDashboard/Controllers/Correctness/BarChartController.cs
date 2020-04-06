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
using System.Linq;
using System.Web.Http;
using GSF.Data;
using GSF.Data.Model;
using GSF.Collections;
using openXDA.Model;

namespace PQDashboard.Controllers
{
    public class CorrectnessBarChart { }
    [RoutePrefix("api/Correctness/BarChart")]
    public class CorrectnessBarChartController : BarChartController<CorrectnessBarChart>
    {
        #region [ constructor ]
        public CorrectnessBarChartController()
        {
            Query = @"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @MeterID AS varchar(max) = {2}
                        DECLARE @context as nvarchar(20) = {3}

                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = DATEADD(DAY, 1, CAST(@EventDateTo AS DATE))

                        SELECT *
                        INTO #selectedMeters
                        FROM String_To_Int_Table(@MeterID, ',')

                        SELECT  Date as thedate, COALESCE(First, 0) AS '> 100%', COALESCE(Second, 0) AS '98% - 100%', COALESCE(Third, 0) AS '90% - 97%', COALESCE(Fourth, 0) AS '70% - 89%', COALESCE(Fifth, 0) AS '50% - 69%', COALESCE(Sixth, 0) AS '>0% - 49%'
                        FROM
                            (
                                SELECT Date, CompletenessLevel, COUNT(*) AS MeterCount
                                FROM
                                (
                                    SELECT Date,
                                            CASE
                                                WHEN Correctness > 100.0 THEN 'First'
                                                WHEN 98.0 <= Correctness AND Correctness <= 100.0 THEN 'Second'
                                                WHEN 90.0 <= Correctness AND Correctness < 98.0 THEN 'Third'
                                                WHEN 70.0 <= Correctness AND Correctness < 90.0 THEN 'Fourth'
                                                WHEN 50.0 <= Correctness AND Correctness < 70.0 THEN 'Fifth'
                                                WHEN 0.0 < Correctness AND Correctness < 50.0 THEN 'Sixth'
                                            END AS CompletenessLevel
                                    FROM
                                    (
                                        SELECT Date, 100.0 * CAST(GoodPoints AS FLOAT) / CAST(NULLIF(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints, 0) AS FLOAT) AS Correctness
                                        FROM MeterDataQualitySummary
                                        WHERE Date BETWEEN @startDate AND @endDate AND MeterID IN (SELECT * FROM #selectedMeters)
                                    ) MeterDataQualitySummary
                                ) MeterDataQualitySummary
                                GROUP BY Date, CompletenessLevel
                        ) MeterDataQualitySummary
                        PIVOT
                        (
                            SUM(MeterDataQualitySummary.MeterCount)
                            FOR MeterDataQualitySummary.CompletenessLevel IN (First, Second, Third, Fourth, Fifth, Sixth)
                        ) as pvt
                        ORDER BY Date
                ";
            Tab = "Correctness";
        }
        #endregion
    }
}