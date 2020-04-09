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
    [RoutePrefix("api/Trending/BarChart")]
    public class TrendingBarChartController : BarChartController<TrendingAlarmLimit>
    {
        #region [ constructor ]
        public TrendingBarChartController()
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

                        SELECT AlarmDate as thedate, COALESCE(OffNormal,0) as Offnormal, COALESCE(Alarm,0) as Alarm
                        FROM(
                            SELECT Date AS AlarmDate, AlarmType.Name, SUM(AlarmPoints) as AlarmPoints
                            FROM ChannelAlarmSummary JOIN
                                 Channel ON ChannelAlarmSummary.ChannelID = Channel.ID JOIN
                                 AlarmType ON AlarmType.ID = ChannelAlarmSummary.AlarmTypeID
                            WHERE MeterID IN (SELECT * FROM #selectedMeters) AND Date >= @startDate AND Date < @endDate
                            GROUP BY Date, AlarmType.Name
                        ) AS table1
                        PIVOT(
                            SUM(table1.AlarmPoints)
                            FOR table1.Name IN(Alarm, OffNormal)
                        ) as pvt
                ";
            Tab = "Trending";
        }
        #endregion
    }
}