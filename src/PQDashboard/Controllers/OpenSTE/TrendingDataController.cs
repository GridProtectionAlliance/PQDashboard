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

        public TrendingDataSet()
        {
            ChannelData = new List<TrendingDataDatum>();
            AlarmLimits = new List<TrendingAlarmLimit>();
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
        public string Name;
        public double TimeStart;
        public double TimeEnd;
        public double Value;
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

                    bool isWeekend =
                        startDate.DayOfWeek == DayOfWeek.Saturday ||
                        startDate.DayOfWeek == DayOfWeek.Sunday;

                    string alarmDayName = startDate.DayOfWeek.ToString();
                    string altAlarmDayName = isWeekend ? "Weekend" : "Weekday";

                    const string QueryFormat =
                        "SELECT " +
                        "    AlarmGroup.Name, " +
                        "    ActiveAlarmView.Value * AlarmValue.Value Value " +
                        "FROM " +
                        "    AlarmGroup JOIN " +
                        "    ActiveAlarmView ON ActiveAlarmView.AlarmGroupID = AlarmGroup.ID JOIN " +
                        "    AlarmValue ON AlarmValue.AlarmID = ActiveAlarmView.AlarmID JOIN " +
                        "    Series ON ActiveAlarmView.SeriesID = Series.ID LEFT OUTER JOIN " +
                        "    AlarmDay ON AlarmValue.AlarmDayID = AlarmDay.ID " +
                        "WHERE " +
                        "    Series.ChannelID = {0} AND " +
                        "    ( " +
                        "        AlarmDay.ID IS NULL OR " +
                        "        AlarmDay.Name IN ({1}, {2}) " +
                        "    )";

                    using (DataTable table = connection.RetrieveData(QueryFormat, channelID, alarmDayName, altAlarmDayName))
                    {
                        double timeStart = startDate.Subtract(epoch).TotalMilliseconds;
                        double timeEnd = endDate.Subtract(epoch).TotalMilliseconds;

                        foreach (DataRow row in table.Rows)
                        {
                            string name = row.ConvertField<string>("Name");
                            double value = row.ConvertField<double>("Value");

                            trendingDataSet.AlarmLimits.Add(new TrendingAlarmLimit()
                            {
                                Name = name,
                                TimeStart = timeStart,
                                TimeEnd = timeEnd,
                                Value = value
                            });
                        }
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