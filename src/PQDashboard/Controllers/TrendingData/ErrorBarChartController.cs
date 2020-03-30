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

namespace PQDashboard.Controllers.TrendingData
{
    public class TrendingData
    {
        public string Date;
        public double? Minimum;
        public double? Maximum;
        public double? Average;
    }

    public class TrendingDataForPeriodForm
    {
        public string siteID { get; set; }
        public string colorScale { get; set; }
        public string targetDateFrom { get; set; }
        public string targetDateTo { get; set; }
        public string userName { get; set; }
    }


    [RoutePrefix("api/TrendingData/ErrorBarChart")]
    public class TrendingBarChartController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(TrendingDataForPeriodForm form)
        {
            try
            {
                List<TrendingData> eventSet = new List<TrendingData>();
                DateTime thedatefrom = DateTime.Parse(form.targetDateFrom);
                DateTime thedateto = DateTime.Parse(form.targetDateTo);

                int duration = thedateto.Subtract(thedatefrom).Days + 1;
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable table = connection.RetrieveData(@"
                        DECLARE  @MeterIDs TABLE (ID int);
                        DECLARE  @ChannelID AS nvarchar(MAX);

                        -- Create MeterIDs Table
                        INSERT INTO @MeterIDs(ID) SELECT Value FROM dbo.String_to_int_table({2}, ',');

                        -- Trending Data
                        SELECT
                            Date,
                            MIN(Minimum/COALESCE(Channel.PerUnitValue, 1)) as Minimum,
                            MAX(Maximum/COALESCE(Channel.PerUnitValue,1)) as Maximum,
                            AVG(Average/COALESCE(Channel.PerUnitValue,1)) as Average
                        FROM
                            DailyTrendingSummary JOIN
                            Channel ON DailyTrendingSummary.ChannelID = Channel.ID JOIN
                            Meter ON Meter.ID = Channel.MeterID
                        WHERE Meter.ID IN (SELECT * FROM @MeterIDs) AND Channel.ID IN (SELECT ChannelID FROM ContourChannel WHERE ContourChannel.ContourColorScaleName = {3}) AND Date >= {0} AND Date <= {1}
                        GROUP BY Date
                        ORDER BY Date

                    ", form.targetDateFrom, form.targetDateTo, form.siteID, form.colorScale);

                    foreach (DataRow row in table.Rows )
                    {
                        TrendingData td = new TrendingData();
                        td.Date = Convert.ToString(row["Date"]);
                        td.Maximum = row.Field<double?>("Maximum");
                        td.Minimum = row.Field<double?>("Minimum");
                        td.Average = row.Field<double?>("Average");

                        eventSet.Add(td);
                    }

                    return Ok(eventSet);

                }


            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}