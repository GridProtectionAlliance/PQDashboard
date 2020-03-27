//******************************************************************************************************
//  MaximumSwellHeatmapController.cs - Gbtc
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

using System.Web.Http;
using System.Data;
using System.Collections.Generic;
using System;
using GSF.Data;

namespace PQDashboard.Controllers.Events.MaximumSwells
{
    public class MeterLocationsHeatmapForm
    {
        public string targetDateFrom { get; set; }
        public string targetDateTo { get; set; }
        public string meterIds { get; set; }
    }

    public class Locations
    {
        public DataTable Data;
        public Dictionary<string, string> Colors;
    }

    [RoutePrefix("api/Events/MaximumSwell")]
    public class MaximumSwellsHeatmapController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(MeterLocationsHeatmapForm form)
        {
            try
            {
                Locations meters = new Locations();
                meters.Colors = null;

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    meters.Data = connection.RetrieveData(@"
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
                        CAST(COALESCE((
                            SELECT (10.0/9.0) * ((MAX([PerUnitMagnitude]) - 1.1)) * 100
                            FROM
                                Disturbance  JOIN
                                Event ON Disturbance.EventID = Event.ID JOIN
                                EventType ON EventType.ID = Event.EventTypeID AND EventType.Name = 'Swell'
                            WHERE
                                CAST(Event.StartTime AS DATE) BETWEEN @startDate AND @endDate AND
                                Event.MeterID = Meter.ID AND
                                PerUnitMagnitude IS NOT NULL AND
                                PerUnitMagnitude >= 1.1
                        ), 0) AS INT) AS Count
                    FROM
                        Meter JOIN
                        Location ON Meter.LocationID = Location.ID
                        WHERE Meter.ID IN (SELECT * FROM String_To_Int_Table(@meterIds, ','))
                    ORDER BY Meter.Name

                ", form.targetDateFrom, form.targetDateTo, form.meterIds);
                    return Ok(meters);
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

        }


    }
}