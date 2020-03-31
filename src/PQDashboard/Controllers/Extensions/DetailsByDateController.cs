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

namespace PQDashboard.Controllers.Extensions
{

    [RoutePrefix("api/Extensions/DetailsByDate")]
    public class ExtensionsDetailsByDateController : ApiController
    {
        [Route("{eventID:int}/{context}"), HttpGet]
        public IHttpActionResult Get(int eventID, string context)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable table = connection.RetrieveData(@"
                        DECLARE @eventID AS INT = {0}
                        DECLARE @context as nvarchar(20) = {1}

                        DECLARE @worstPhaseID INT = (SELECT ID FROM Phase WHERE Name = 'Worst')
						DECLARE @EventDate DATETIME2 = (SELECT StartTime FROM Event WHERE ID = @eventID)
						DECLARE @MeterID INT = (SELECT MeterID FROM Event WHERE ID = @eventID)
                        DECLARE @startDate DATETIME = @EventDate
                        DECLARE @endDate DATETIME


                        IF @context = 'day'
                        BEGIN
                            SET @startDate = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @endDate = DATEADD(DAY, 1, @startDate)
                        END

                        if @context = 'hour'
                        BEGIN
                            SET @startDate = DATEADD(HOUR, DATEDIFF(HOUR, 0, @EventDate), 0)
                            SET @endDate = DATEADD(HOUR, 1, @startDate)
                        END

                        if @context = 'minute'
                        BEGIN
                            SET @startDate = DATEADD(MINUTE, DATEDIFF(MINUTE, 0, @EventDate), 0)
                            SET @endDate = DATEADD(MINUTE, 1, @startDate)
                        END

                        if @context = 'second'
                        BEGIN
                            DECLARE @tempDate DATETIME = DATEADD(DAY, DATEDIFF(DAY, 0, @EventDate), 0)
                            SET @startDate = DATEADD(SECOND, DATEDIFF(SECOND, @tempDate, @EventDate), @tempDate)
                            SET @endDate = DATEADD(SECOND, 1, @startDate)
                        END

                        DECLARE @localEventDate DATE = CAST(@EventDate AS DATE)
                        DECLARE @localMeterID INT = CAST(@MeterID AS INT)

                        DECLARE @MiddleStatment NVARCHAR(MAX) = N''
                        DECLARE @SQLStatement NVARCHAR(MAX) = N''

                        SELECT @MiddleStatment = @MiddleStatment +  '
                                    SELECT  Event.ID as EventID,
                                            Event.StartTime as StartTime,
                                            '''+ t.ServiceName + ''' as ServiceType,
                                            MeterLine.LineName + '' '' + [Line].[AssetKey] AS LineName,
                                            Line.VoltageKV AS Voltage,
                                            CAST(dbo.'+ t.HasResultFunction+'(Event.ID) as varchar(max)) as Confidence
                                    FROM    #temp as Event JOIN
                                            Meter ON Meter.ID = Event.MeterID JOIN
                                            Line ON Event.LineID = Line.ID JOIN
                                            MeterLine ON MeterLine.MeterID = Event.MeterID AND MeterLine.LineID = Line.ID
                                    WHERE   dbo.' + t.HasResultFunction +'(Event.ID) != '''' UNION'

                        FROM (Select * FROM EASExtension) AS t

                        SET @MiddleStatment = SUBSTRING(@MiddleStatment,0, LEN(@MiddleStatment) - LEN('UNION'))

                        SET @SQLStatement =
                            '
                            SELECT * INTO #temp
                            FROM EVENT
                            WHERE   StartTime Between @startDate AND @endDate AND
                                    MeterID = @localMeterID

                            ' + @MiddleStatment + '

                             DROP TABLE #temp
                     '

                        exec sp_executesql @SQLStatement, N'@localMeterID int, @startDate DATETIME, @endDate DATETIME ', @localMeterID = @localMeterID, @startDate = @startDate, @endDate = @endDate

                    ", eventID, context);

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