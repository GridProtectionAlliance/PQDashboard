//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF;
using GSF.Data;
using GSF.Data.Model;
using Newtonsoft.Json.Linq;
using PQDashboard.Model;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;

namespace PQDashboard.Controllers
{
    public class OpenSEEController : ApiController
    {

        private Dictionary<string, List<double[]>> QueryEventData(int eventID, string type)
        {

            const string EventDataQueryFormat =
                "SELECT " +
                "    EventData.TimeDomainData, " +
                "    EventData.FrequencyDomainData " +
                "FROM " +
                "    Event JOIN " +
                "    EventData ON Event.EventDataID = EventData.ID " +
                "WHERE Event.ID = {0}";

            Dictionary<int, List<double[]>> dataLookup = new Dictionary<int, List<double[]>>();
            byte[] timeDomainData = null;

            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            using (IDataReader reader = connection.ExecuteReader(EventDataQueryFormat, eventID))
            {
                while (reader.Read())
                {
                    timeDomainData = Decompress((byte[])reader["TimeDomainData"]);
                }
            }


            return GetDataLookup(timeDomainData, type);
        }

        private byte[] Decompress(byte[] compressedBytes)
        {
            using (MemoryStream memoryStream = new MemoryStream(compressedBytes))
            using (GZipStream gzipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
            using (MemoryStream destinationStream = new MemoryStream())
            {
                gzipStream.CopyTo(destinationStream);
                return destinationStream.ToArray();
            }
        }

        private Dictionary<string, List<double[]>> GetDataLookup(byte[] bytes, string type)
        {
            int offset;
            int samples;
            double[] times;

            string channelName;
            List<double[]> dataSeries;
            Dictionary<string, List<double[]>> dataLookup = new Dictionary<string, List<double[]>>();

            offset = 0;
            samples = LittleEndian.ToInt32(bytes, offset);
            offset += sizeof(int);

            long epoch = new DateTime(1970, 1, 1).Ticks;

            times = new double[samples];

            for (int i = 0; i < samples; i++)
            {
                times[i] = (LittleEndian.ToInt64(bytes, offset) - epoch) / (double)TimeSpan.TicksPerMillisecond;
                offset += sizeof(long);
            }


            while (offset < bytes.Length)
            {
                dataSeries = new List<double[]>();
                channelName = GetChannelName(LittleEndian.ToInt32(bytes, offset));
                offset += sizeof(int);

                for (int i = 0; i < samples; i++)
                {
                    dataSeries.Add(new double[] { times[i], LittleEndian.ToDouble(bytes, offset) });
                    offset += sizeof(double);
                }

                if (channelName.Contains(type))
                    dataLookup.Add(channelName, dataSeries);
            }

            return dataLookup;
        }

        private string GetChannelName(int seriesID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("SystemSettings"))
            {
                const string QueryFormat =
                    "SELECT Channel.Name " +
                    "FROM " +
                    "    Channel JOIN " +
                    "    Series ON Series.ChannelID = Channel.ID " +
                    "WHERE Series.ID = {0}";

                return connection.ExecuteScalar<string>(QueryFormat, seriesID);
            }
        }

        private List<double[]> Downsample(List<double[]> series, int sampleCount, Range<DateTime> range)
        {
            List<double[]> data = new List<double[]>();
            DateTime epoch = new DateTime(1970, 1, 1);
            double startTime = range.Start.Subtract(epoch).TotalMilliseconds;
            double endTime = range.End.Subtract(epoch).TotalMilliseconds;
            series = series.Where(x => x[0] >= startTime && x[0] <= endTime).ToList();
            if (sampleCount > series.Count) return series;

            int index = 0;

            for (int n = 0; n < sampleCount; n += 2)
            {
                double end = startTime + (n + 2) * range.End.Subtract(range.Start).TotalMilliseconds / sampleCount;

                double[] min = null;
                double[] max = null;

                while (index < series.Count && series[index][0] < end)
                {
                    if (min == null || min[1] > series[index][1])
                        min = series[index];

                    if (max == null || max[1] <= series[index][1])
                        max = series[index];

                    ++index;
                }

                if (min != null)
                {
                    if (min[0] < max[0])
                    {
                        data.Add(min);
                        data.Add(max);
                    }
                    else if (min[0] > max[0])
                    {
                        data.Add(max);
                        data.Add(min);
                    }
                    else
                    {
                        data.Add(min);
                    }
                }
                else
                {
                    if (data.Any() && data.Last() != null)
                        data.Add(null);
                }
            }

            return data;

        }
    }
}
