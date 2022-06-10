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
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using GSF.Collections;
using GSF.Data;

namespace PQDashboard.Controllers.OpenSTE
{
    public class TrendingDataSet
    {
        public List<TrendingDataDatum> ChannelData;
        public List<TrendingAlarmLimit> AlarmLimits;
        public List<TrendingAlarmLimit> OffNormalLimits;

        public TrendingDataSet()
        {
            ChannelData = new List<TrendingDataDatum>();
            AlarmLimits = new List<TrendingAlarmLimit>();
            OffNormalLimits = new List<TrendingAlarmLimit>();
        }
    }

    public class TrendingDataDatum
    {
        public double Time;
        public double Maximum;
        public double Minimum;
        public double Average;
    }

    public class TrendingAlarmLimit
    {
        public double TimeStart;
        public double TimeEnd;
        public double? High;
        public double? Low;
    }

    [RoutePrefix("api/OpenSTE/TrendingData")]
    public class TrendingDataController : ApiController
    {
        [Route("{channelID:int}/{date}"), HttpGet]
        public async Task<IHttpActionResult> Get(int channelID, string date, CancellationToken cancellationToken)
        {
            try
            {
                IEnumerable<int> channelIDs = new List<int>() { channelID };
                DateTime startDate = Convert.ToDateTime(date);
                DateTime endDate = startDate.AddDays(1);
                TrendingDataSet trendingDataSet = new TrendingDataSet();
                DateTime epoch = new DateTime(1970, 1, 1);

                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    XDAClient xdaClient = new XDAClient(() => new AdoDataConnection("systemSettings"));

                    var query = new
                    {
                        Channels = channelIDs,
                        StartTime = startDate,
                        StopTime = endDate
                    };

                    Action<HIDSPoint> processHIDSPoint = point =>
                    {
                        if (!trendingDataSet.ChannelData.Exists(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds))
                        {
                            trendingDataSet.ChannelData.Add(new TrendingDataDatum());
                            trendingDataSet.ChannelData[trendingDataSet.ChannelData.Count - 1].Time = point.Timestamp.Subtract(epoch).TotalMilliseconds;
                        }

                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Average = point.Average;
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Minimum = point.Minimum;
                        trendingDataSet.ChannelData[trendingDataSet.ChannelData.IndexOf(x => x.Time == point.Timestamp.Subtract(epoch).TotalMilliseconds)].Maximum = point.Maximum;
                    };

                    await xdaClient.QueryHIDSPointsAsync(query, processHIDSPoint, cancellationToken);

                    IEnumerable<DataRow> table = Enumerable.Empty<DataRow>();

                    table = connection.RetrieveData(" Select {0} AS thedatefrom, " +
                                                                "        DATEADD(DAY, 1, {0}) AS thedateto, " +
                                                                "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.High * PerUnitValue ELSE AlarmRangeLimit.High END AS alarmlimithigh," +
                                                                "        CASE WHEN AlarmRangeLimit.PerUnit <> 0 AND Channel.PerUnitValue IS NOT NULL THEN AlarmRangeLimit.Low * PerUnitValue ELSE AlarmRangeLimit.Low END AS alarmlimitlow " +
                                                                " FROM   AlarmRangeLimit JOIN " +
                                                                "        Channel ON AlarmRangeLimit.ChannelID = Channel.ID " +
                                                                "WHERE   AlarmRangeLimit.AlarmTypeID = (SELECT ID FROM AlarmType where Name = 'Alarm') AND " +
                                                                "        AlarmRangeLimit.ChannelID = {1}", startDate, channelID).Select();

                    foreach (DataRow row in table)
                    {
                        trendingDataSet.AlarmLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("alarmlimithigh"), Low = row.Field<double?>("alarmlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
                    }

                    table = Enumerable.Empty<DataRow>();

                    table = connection.RetrieveData(" DECLARE @dayOfWeek INT = DATEPART(DW, {0}) - 1 " +
                                                                " DECLARE @hourOfWeek INT = @dayOfWeek * 24 " +
                                                                " ; WITH HourlyIndex AS" +
                                                                " ( " +
                                                                "   SELECT @hourOfWeek AS HourOfWeek " +
                                                                "   UNION ALL " +
                                                                "   SELECT HourOfWeek + 1 " +
                                                                "   FROM HourlyIndex" +
                                                                "   WHERE (HourOfWeek + 1) < @hourOfWeek + 24" +
                                                                " ) " +
                                                                " SELECT " +
                                                                "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek, {0}) AS thedatefrom, " +
                                                                "        DATEADD(HOUR, HourlyIndex.HourOfWeek - @hourOfWeek + 1, {0}) AS thedateto, " +
                                                                "        HourOfWeekLimit.High AS offlimithigh, " +
                                                                "        HourOfWeekLimit.Low AS offlimitlow " +
                                                                " FROM " +
                                                                "        HourlyIndex LEFT OUTER JOIN " +
                                                                "        HourOfWeekLimit ON HourOfWeekLimit.HourOfWeek = HourlyIndex.HourOfWeek " +
                                                                " WHERE " +
                                                                "        HourOfWeekLimit.ChannelID IS NULL OR " +
                                                                "        HourOfWeekLimit.ChannelID = {1} ", startDate, channelID).Select();

                    foreach (DataRow row in table)
                    {
                        trendingDataSet.OffNormalLimits.Add(new TrendingAlarmLimit() { High = row.Field<double?>("offlimithigh"), Low = row.Field<double?>("offlimitlow"), TimeEnd = row.Field<DateTime>("thedateto").Subtract(epoch).TotalMilliseconds, TimeStart = row.Field<DateTime>("thedatefrom").Subtract(epoch).TotalMilliseconds });
                    }

                }


                return Ok(trendingDataSet);
            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}