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

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/Completeness/TableData")]
    public class CompletenessTableDataController : TableDataController<CompletenessBarChart>
    {
        #region [ constructor ]
        public CompletenessTableDataController()
        {
            Query = @"
                        DECLARE @EventDate DATETIME = {0}
                        DECLARE @MeterID AS varchar(max) = {1}
                        DECLARE @context as nvarchar(20) = {2}

                        DECLARE @thedate DATE = CAST(@EventDate AS DATE)
                        DECLARE @MeterIDs TABLE (ID INT);

                        INSERT INTO @MeterIDs(ID)
                        SELECT Value FROM dbo.String_to_int_table(@MeterID, ',')

                        DECLARE @TempTable TABLE (themeterid INT, thesite VARCHAR(100), thecount FLOAT, thename VARCHAR(100));

                        INSERT INTO @TempTable (themeterid, thesite , thecount , thename)
                        SELECT
                            Meter.ID AS meterid,
                            Meter.Name AS thesite,
                            (
                                SELECT COALESCE((
                                    SELECT CAST(CAST((GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints) AS FLOAT) / NULLIF(CAST(expectedPoints AS FLOAT), 0) AS FLOAT) AS completenessPercentage
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterID = Meter.ID AND
                                        [Date] = @thedate
                                )
                            , 0)) AS thecount,
                            'Completeness' as thename
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
                                SELECT COALESCE((
                                    SELECT CAST(NULLIF(CAST(expectedPoints AS FLOAT), 0) AS FLOAT) AS completenessPercentage
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterID = Meter.ID AND
                                        [Date] = @thedate
                                )
                            , 0)) AS thecount,
                            'Expected' AS thename
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
                                SELECT COALESCE((
                                    SELECT CAST(CAST((GoodPoints + LatchedPoints + UnreasonablePoints + NoncongruentPoints + DuplicatePoints) AS FLOAT) / NULLIF(CAST(expectedPoints AS FLOAT), 0) AS FLOAT) AS completenessPercentage
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterID = Meter.ID AND
                                        [Date] = @theDate
                                )
                            , 0)) AS thecount,
                            'Received' AS thename
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
                                SELECT COALESCE((
                                    SELECT CAST(CAST((DuplicatePoints) AS FLOAT) / NULLIF(CAST(expectedPoints AS FLOAT), 0) AS FLOAT) AS completenessPercentage
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterID = Meter.ID AND
                                        [Date] = @thedate
                                )
                            , 0)) AS thecount,
                            'Duplicate' AS thename
                        FROM
                            MeterDataQualitySummary JOIN
                            Meter ON Meter.ID = MeterDataQualitySummary.MeterID
                        WHERE
                            MeterID IN (SELECT * FROM @MeterIDs) AND
                            CAST([Date] AS DATE) = @thedate

                        DECLARE @composite TABLE (theeventid INT, themeterid INT, thesite VARCHAR(100), Expected FLOAT, Received FLOAT, Duplicate FLOAT, Completeness FLOAT);

                        DECLARE @sitename VARCHAR(100)
                        DECLARE @themeterid INT
                        DECLARE @theeventid INT

                        DECLARE site_cursor CURSOR FOR SELECT DISTINCT themeterid, thesite FROM @TempTable

                        OPEN site_cursor

                        FETCH NEXT FROM site_cursor INTO @themeterid , @sitename

                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            INSERT @composite VALUES(
                                (
                                    SELECT TOP 1 MeterDataQualitySummary.ID
                                    FROM MeterDataQualitySummary
                                    WHERE
                                        MeterDataQualitySummary.MeterID = @themeterid AND
                                        CAST([Date] as Date) = @thedate
                                ),
                                @themeterid,
                                @sitename,
                                (SELECT thecount * 100 FROM @TempTable WHERE thename = 'Expected' AND thesite = @sitename),
                                (SELECT thecount * 100 FROM @TempTable WHERE thename = 'Received' AND thesite = @sitename),
                                (SELECT thecount * 100 FROM @TempTable WHERE thename = 'Duplicate' AND thesite = @sitename),
                                (SELECT thecount * 100 FROM @TempTable WHERE thename = 'Completeness' AND thesite = @sitename)
                            )

                            FETCH NEXT FROM site_cursor INTO @themeterid , @sitename
                        END

                        CLOSE site_cursor;
                        DEALLOCATE site_cursor;

                        SELECT * FROM @composite
                ";
            Tab = "Completeness";
        }
        #endregion
    }
}