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
    [RoutePrefix("api/Trending/Location")]
    public class TrendingLocationController : LocationController<TrendingAlarmLimit>
    {
        #region [ constructor ]
        public TrendingLocationController()
        {
            Query = @"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @meterIds AS varchar(max) = {2}
                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = CAST(@EventDateTo AS DATE)

                        declare @thedatefrom as Date;
                        declare @thedateto as Date;

                        set @thedatefrom = CAST(@EventDateFrom as Date);
                        set @thedateto = CAST(@EventDateTo as Date);

                        SELECT
                            [dbo].[Meter].[ID],
                            [dbo].[Meter].[Name],
                            [dbo].[Location].[Longitude],
                            [dbo].[Location].[Latitude],
                            COALESCE(Alarm, 0) as Alarm,
                            COALESCE(Offnormal, 0) As Offnormal,
                            COALESCE(AlarmCount, 0) As AlarmCount
                        FROM
                            Meter JOIN
                            Location ON Meter.LocationID = Location.ID LEFT OUTER JOIN
                            (
                                SELECT
                                    MeterID,
                                    Alarm + Offnormal as AlarmCount,
                                    Alarm,
                                    Offnormal
                                FROM
                                    (
                                        SELECT
                                            Channel.MeterID,
                                            AlarmType.Name
                                        FROM
                                            AlarmType JOIN
                                            ChannelAlarmSummary ON ChannelAlarmSummary.AlarmTypeID = AlarmType.ID JOIN
                                            Channel ON Channel.ID = ChannelAlarmSummary.ChannelID
                                        WHERE ChannelAlarmSummary.Date BETWEEN @thedatefrom AND @thedateto

                                    ) AS AlarmCodes
                                    PIVOT
                                    (
                                        COUNT(Name)
                                        FOR Name IN (Alarm, Offnormal)
                                    ) AS PivotTable
                        ) AS AlarmCount ON AlarmCount.MeterID = Meter.ID
                        WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                       ORDER BY Meter.Name
                ";
            Tab = "Trending";
        }
        #endregion
    }
}