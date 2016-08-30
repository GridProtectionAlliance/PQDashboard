//******************************************************************************************************
//  Historian.cs - Gbtc
//
//  Copyright © 2015, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  08/23/2015 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using GSF;
using GSF.Snap;
using GSF.Snap.Filters;
using GSF.Snap.Services;
using GSF.Snap.Services.Reader;
using openHistorian.Net;
using openHistorian.Queues;
using openHistorian.Snap;

namespace openHistorian.XDALink
{
    /// <summary>
    /// Series ID values.
    /// </summary>
    public enum SeriesID
    {
        Minimum = 0,
        Maximum = 1,
        Average = 2
    }

    public class Historian : IDisposable
    {
        #region [ Members ]

        // Constants

        /// <summary>
        /// Default historian server port number.
        /// </summary>
        public const int DefaultHistorianPort = 38402;

        // Fields
        private HistorianClient m_client;
        private ClientDatabaseBase<HistorianKey, HistorianValue> m_database;
        private Lazy<HistorianInputQueue> m_queue;
        private List<TreeStream<HistorianKey, HistorianValue>> m_treeStreams;

        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        public Historian(string server, string database)
        {
            string[] split = server.Split(':');
            int port;

            if (split.Length == 1)
            {
                m_client = new HistorianClient(split[0], DefaultHistorianPort);
            }
            else
            {
                if (!int.TryParse(split[1], out port))
                    throw new ArgumentException("Invalid format for server[:port]. " + server, "server");

                m_client = new HistorianClient(split[0], port);
            }

            m_database = m_client.GetDatabase<HistorianKey, HistorianValue>(database);
            m_queue = new Lazy<HistorianInputQueue>(() => new HistorianInputQueue(() => m_database));
            m_treeStreams = new List<TreeStream<HistorianKey, HistorianValue>>();
        }

        #endregion

        #region [ Methods ]

        public IEnumerable<TrendingDataPoint> Read(IEnumerable<int> channels, DateTime startTime, DateTime stopTime)
        {
            IEnumerable<ulong> measurementIDs = channels.SelectMany(GetAllMeasurementIDs);
            return Read(measurementIDs, startTime, stopTime);
        }

        public void Write(int channelID, SeriesID seriesID, DateTime timestamp, double value)
        {
            HistorianKey historianKey = new HistorianKey();
            HistorianValue historianValue = new HistorianValue();

            historianKey.PointID = ToPointID(channelID, (int)seriesID);
            historianKey.TimestampAsDate = timestamp;
            historianValue.AsSingle = (float)value;

            m_queue.Value.Enqueue(historianKey, historianValue);
        }

        public void Flush()
        {
            Flush(1);
        }

        public void Flush(int pollingFrequency)
        {
            if (m_queue.IsValueCreated)
            {
                while (m_queue.Value.Size > 0)
                    Thread.Sleep(1000 / pollingFrequency);
            }
        }

        public void Dispose()
        {
            if (!m_disposed)
            {
                try
                {
                    foreach (TreeStream<HistorianKey, HistorianValue> stream in m_treeStreams)
                        stream.Dispose();

                    if (m_queue.IsValueCreated)
                    {
                        Flush(10);
                        m_queue.Value.Dispose();
                    }

                    m_database.Dispose();
                    m_client.Dispose();
                }
                finally
                {
                    m_disposed = true;
                }
            }
        }

        private IEnumerable<TrendingDataPoint> Read(IEnumerable<ulong> measurementIDs, DateTime startTime, DateTime stopTime)
        {
            SeekFilterBase<HistorianKey> timeFilter = TimestampSeekFilter.CreateFromRange<HistorianKey>(startTime, stopTime);
            MatchFilterBase<HistorianKey, HistorianValue> pointFilter = null;
            HistorianKey key = new HistorianKey();
            HistorianValue value = new HistorianValue();

            if ((object)measurementIDs != null)
                pointFilter = PointIdMatchFilter.CreateFromList<HistorianKey, HistorianValue>(measurementIDs);

            // Start stream reader for the provided time window and selected points
            using (TreeStream<HistorianKey, HistorianValue> stream = m_database.Read(SortedTreeEngineReaderOptions.Default, timeFilter, pointFilter))
            {
                m_treeStreams.Add(stream);

                while (stream.Read(key, value))
                {
                    yield return new TrendingDataPoint()
                    {
                        ChannelID = (int)key.PointID.HighDoubleWord(),
                        SeriesID = (SeriesID)(int)key.PointID.LowDoubleWord(),
                        Timestamp = key.TimestampAsDate,
                        Value = value.AsSingle
                    };
                }
            }
        }

        private IEnumerable<ulong> GetAllMeasurementIDs(int channel)
        {
            return SeriesIDs.Select(series => ToPointID(channel, (int)series));
        }

        private ulong ToPointID(int channel, int series)
        {
            return Word.MakeQuadWord((uint)channel, (uint)series);
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly List<SeriesID> SeriesIDs = Enum.GetValues(typeof(SeriesID))
            .Cast<SeriesID>()
            .ToList();

        #endregion
    }
}
