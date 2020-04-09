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
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Security;
using GSF.Web.Model;
using openXDA.Model;
using PQDashboard.Model;

namespace PQDashboard.Controllers.TrendingData
{
    [RoutePrefix("api/TrendingData/Location")]
    public class TrendingDataLocationController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(ContourQuery contourQuery)
        {
            try
            {
                List<TrendingDataLocation> locations = new List<TrendingDataLocation>();
                DataTable colorScale;

                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    DataTable table = connection.RetrieveData(@"
                        DECLARE @EventDateFrom DATETIME = {0}
                        DECLARE @EventDateTo DATETIME = {1}
                        DECLARE @colorScaleName AS varchar(max) = {2}
                        DECLARE @meterIds AS varchar(max) = {3}
                        DECLARE @startDate DATE = CAST(@EventDateFrom AS DATE)
                        DECLARE @endDate DATE = CAST(@EventDateTo AS DATE)

                        DECLARE @thedatefrom AS DATE
                        DECLARE @thedateto AS DATE

                        SET @thedatefrom = CAST(@EventDateFrom AS DATE)
                        SET @thedateto = CAST(@EventDateTo AS DATE)

                        SELECT
                            Meter.ID,
                            Meter.Name,
                            Data.Minimum AS Minimum,
                            Data.Maximum AS Maximum,
                            Data.Average AS Average,
                            Location.Longitude,
                            Location.Latitude
                        FROM
                            Meter LEFT OUTER JOIN
                            (
                                SELECT
                                    ContourChannel.MeterID AS MID,
                                    MIN(Minimum/COALESCE(ContourChannel.PerUnitValue, 1)) AS Minimum,
                                    MAX(Maximum/COALESCE(ContourChannel.PerUnitValue, 1)) AS Maximum,
                                    AVG(Average/COALESCE(ContourChannel.PerUnitValue, 1)) AS Average
                                FROM
                                    ContourChannel JOIN
                                    DailyTrendingSummary ON  DailyTrendingSummary.ChannelID = ContourChannel.ChannelID
                                WHERE Date >= @thedatefrom AND Date <= @thedateto AND ContourColorScaleName = @colorScaleName
                                GROUP BY ContourChannel.MeterID
                            ) AS Data ON Data.MID = Meter.ID JOIN
                            Location ON Meter.LocationID = Location.ID
                            WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                        ORDER BY Meter.Name

                    ", contourQuery.GetStartDate(), contourQuery.GetEndDate(), contourQuery.ColorScaleName, contourQuery.MeterIds);

                    foreach (DataRow row in table.Rows)
                    {
                        TrendingDataLocation ourStatus = new TrendingDataLocation();
                        ourStatus.Latitude = (double)row["Latitude"];
                        ourStatus.Longitude = (double)row["Longitude"];
                        ourStatus.Name = (string)row["Name"];
                        ourStatus.Average = row.Field<double?>("Average");
                        ourStatus.Maximum = row.Field<double?>("Maximum");
                        ourStatus.Minimum = row.Field<double?>("Minimum");
                        ourStatus.ID = (int)row["id"];
                        ourStatus.Data.Add(ourStatus.Average);
                        ourStatus.Data.Add(ourStatus.Maximum);
                        ourStatus.Data.Add(ourStatus.Minimum);
                        locations.Add(ourStatus);
                    }

                    string query =
                        "SELECT " +
                        "    ContourColorScalePoint.Value, " +
                        "    ContourColorScalePoint.Color " +
                        "FROM " +
                        "    ContourColorScale JOIN " +
                        "    ContourColorScalePoint ON ContourColorScalePoint.ContourColorScaleID = ContourColorScale.ID " +
                        "WHERE ContourColorScale.Name = {0} " +
                        "ORDER BY ContourColorScalePoint.OrderID";

                    colorScale = connection.RetrieveData(query, contourQuery.ColorScaleName);
                }

                double[] colorDomain = colorScale
                    .Select()
                    .Select(row => row.ConvertField<double>("Value"))
                    .ToArray();

                double[] colorRange = colorScale
                    .Select()
                    .Select(row => (double)(uint)row.ConvertField<int>("Color"))
                    .ToArray();

                return Ok(new ContourInfo()
                {
                    Locations = locations,
                    ColorDomain = colorDomain,
                    ColorRange = colorRange,
                    DateTo = contourQuery.EndDate,
                    DateFrom = contourQuery.StartDate
                });

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}