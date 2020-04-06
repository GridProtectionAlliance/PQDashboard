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

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Correctness/TableData")]
    public class CorrectnessTableDataController : TableDataController<CorrectnessBarChart>
    {
        #region [ constructor ]
        public CorrectnessTableDataController()
        {
            Query = @"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}

                        DECLARE @thedate DATE = CAST(@EventDate AS DATE)
                        DECLARE @MeterIDs TABLE (ID INT);

                        INSERT INTO @MeterIDs(ID)
                        SELECT Value
                        FROM dbo.String_to_int_table(@MeterID, ',')

                        DECLARE @TempTable TABLE (themeterid INT, thesite VARCHAR(100), thecount FLOAT, thename VARCHAR(100));

                        INSERT INTO @TempTable (themeterid, thesite , thecount , thename)
                        SELECT
                            Meter.ID AS meterid,
                            Meter.Name AS thesite,
                            (
                                SELECT COALESCE(ROUND(CAST(SUM(LatchedPoints) AS FLOAT) / NULLIF(CAST(SUM(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints) AS FLOAT), 0) * 100 , 0), 0) AS correctnessPercentage
                                FROM MeterDataQualitySummary
                                WHERE
                                    MeterID = Meter.ID AND
                                    [Date] = @thedate
                            ) AS thecount,
                            'Latched' as thename
                        FROM
                            MeterDataQualitySummary JOIN
                            Meter ON Meter.ID = MeterDataQualitySummary.MeterID
                        WHERE
                            MeterID IN (SELECT * FROM @MeterIDs) AND
                            CAST([Date] AS DATE) = @thedate

                        INSERT INTO @TempTable (themeterid, thesite , thecount , thename)
                        SELECT
                            Meter.ID AS meterid,
                            Meter.Name AS thesite,
                            (
                                SELECT COALESCE(ROUND(CAST(SUM(UnreasonablePoints) AS FLOAT) / NULLIF(CAST(SUM(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints) AS FLOAT), 0) * 100 ,0), 0) AS correctnessPercentage
                                FROM MeterDataQualitySummary
                                WHERE
                                    MeterID = [dbo].[Meter].[ID] AND
                                    [Date] = @thedate
                            ) AS thecount,
                            'Unreasonable' AS thename
                        FROM
                            MeterDataQualitySummary JOIN
                            Meter ON Meter.ID = MeterDataQualitySummary.MeterID
                        WHERE
                            MeterID IN (SELECT * FROM @MeterIDs) AND
                            CAST([Date] AS DATE) = @thedate

                        INSERT INTO @TempTable(themeterid, thesite , thecount , thename)
                        SELECT
                            Meter.ID AS meterid,
                            Meter.Name AS thesite,
                            (
                                SELECT COALESCE(ROUND(CAST(SUM(NoncongruentPoints) AS FLOAT) / NULLIF(CAST(SUM(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints) AS FLOAT), 0) * 100 , 0), 0) AS correctnessPercentage
                                FROM MeterDataQualitySummary
                                WHERE
                                    MeterID = Meter.ID AND
                                    [Date] = @thedate
                            ) AS thecount,
                            'Noncongruent' AS thename
                        FROM
                            MeterDataQualitySummary JOIN
                            Meter ON Meter.ID = MeterDataQualitySummary.MeterID
                        WHERE
                            MeterID IN (SELECT * FROM @MeterIDs) AND
                            CAST([Date] AS DATE) = @thedate

                        DECLARE @composite TABLE (theeventid INT, themeterid INT, thesite VARCHAR(100), Latched FLOAT, Unreasonable FLOAT, Noncongruent FLOAT, Correctness FLOAT);

                        DECLARE @sitename VARCHAR(100)
                        DECLARE @themeterid INT
                        DECLARE @theeventid INT

                        DECLARE site_cursor CURSOR FOR SELECT DISTINCT themeterid, thesite FROM @TempTable

                        OPEN site_cursor

                        FETCH NEXT FROM site_cursor INTO @themeterid, @sitename

                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            INSERT INTO @composite VALUES(
                                (
                                    SELECT TOP 1 MeterDataQualitySummary.ID
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterDataQualitySummary.MeterID = @themeterid AND
                                        CAST([Date] AS DATE) = @theDate
                                ),
                                @themeterid,
                                @sitename,
                                (SELECT thecount FROM @TempTable WHERE thename = 'Latched' AND thesite = @sitename),
                                (SELECT thecount FROM @TempTable WHERE thename = 'Unreasonable' AND thesite = @sitename),
                                (SELECT thecount FROM @TempTable WHERE thename = 'Noncongruent' AND thesite = @sitename),
                                 (
                                        SELECT 100.0 * CAST(GoodPoints AS FLOAT) / CAST(NULLIF(GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints, 0) AS FLOAT) AS Correctness
                                        FROM MeterDataQualitySummary
                                        WHERE CAST([Date] AS DATE) = @theDate AND MeterID = @themeterid
                                 )
                            )

                            FETCH NEXT FROM site_cursor INTO @themeterid , @sitename
                        END

                        CLOSE site_cursor;
                        DEALLOCATE site_cursor;

                        SELECT * FROM @composite
                ";
            Tab = "Correctness";
        }
        #endregion
    }
}