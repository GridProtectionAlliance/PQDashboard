//******************************************************************************************************
//  PQDashboardController.cs - Gbtc
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
//  04/07/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using GSF;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using openXDA.Model;

namespace PQDashboard.Controllers
{
    [RoutePrefix("api/PQDashboard")]
    public class PQDashboardController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #endregion

        #region [ Static ]

        private static MemoryCache s_memoryCache;

        static PQDashboardController()
        {
            s_memoryCache = new MemoryCache("PQDashboard");
        }

        #endregion

        #region [ Methods ]

        #region [ Circle Colors And Sizes ]

        public enum MapMetricType
        {
            EventCount,
            SagCount,
            SwellCount,
            InterruptionCount,
            SagMinimum,
            SwellMaximum,

            MaximumVoltageRMS,
            MinimumVoltageRMS,
            AverageVoltageRMS,
            MaximumVoltageTHD,
            MinimumVoltageTHD,
            AverageVoltageTHD,
            MaximumShortTermFlicker,
            MinimumShortTermFlicker,
            AverageShortTermFlicker
        }

        public class MapMetricQuery
        {
            public List<int> MeterIDs;
            public DateTime StartTime;
            public DateTime EndTime;

            [EditorBrowsable(EditorBrowsableState.Never)]
            public string SizeMetricType;

            [EditorBrowsable(EditorBrowsableState.Never)]
            public string ColorMetricType;

            public string MeterFilter =>
                string.Join(",", MeterIDs);

            public MapMetricType SizeMapMetricType
            {
                get
                {
                    MapMetricType sizeMetricType;
                    return Enum.TryParse(SizeMetricType, out sizeMetricType)
                        ? sizeMetricType
                        : MapMetricType.EventCount;
                }
            }

            public MapMetricType ColorMapMetricType
            {
                get
                {
                    MapMetricType colorMetricType;
                    return Enum.TryParse(ColorMetricType, out colorMetricType)
                        ? colorMetricType
                        : MapMetricType.EventCount;
                }
            }
        }

        public class MapMetricAnimationQuery : MapMetricQuery
        {
            public int AnimationInterval;
        }

        public class MapMetricQueryResult
        {
            public List<MapMetric> MapMetrics;
            public double Largest;
            public double Smallest;
            public double Red;
            public double Green;
        }

        public class MapMetricAnimationResult
        {
            public List<MapMetricAnimationFrame> Frames;
            public double Largest;
            public double Smallest;
            public double Red;
            public double Green;
        }

        public class MapMetricAnimationFrame
        {
            public List<MapMetric> MapMetrics;
            public string Date;
        }

        public class MapMetric
        {
            public double Longitude;
            public double Latitude;
            public double? SizeValue;
            public double? ColorValue;
        }

        private class MapMetricAggregate
        {
            public MapMetricAggregate(MapMetric mapMetric) { MapMetric = mapMetric; }

            public MapMetric MapMetric { get; }
            public double Maximum => _Maximum ?? 0.0D;
            public double Minimum => _Minimum ?? 0.0D;
            public double Average => Total / Count;

            private double? _Maximum { get; set; }
            private double? _Minimum { get; set; }
            private double Total { get; set; }
            private int Count { get; set; }

            public void Aggregate(double value)
            {
                if (!_Maximum.HasValue || value > Maximum)
                    _Maximum = value;
                if (!_Minimum.HasValue || value < Minimum)
                    _Minimum = value;
                Total += value;
                Count++;
            }

            public void Reset()
            {
                _Maximum = null;
                _Minimum = null;
                Total = 0.0D;
                Count = 0;
            }
        }

        [Route("GetMapMetrics"), HttpPost]
        public MapMetricQueryResult GetMapMetrics([FromBody] MapMetricQuery query)
        {
            Dictionary<int, MapMetric> mapMetricLookup = new Dictionary<int, MapMetric>();

            Action<int, double> updateSizeMetric = (meterID, value) =>
            {
                MapMetric mapMetric;
                if (mapMetricLookup.TryGetValue(meterID, out mapMetric))
                    mapMetric.SizeValue = value;
            };

            Action<int, double> updateColorMetric = (meterID, value) =>
            {
                MapMetric mapMetric;
                if (mapMetricLookup.TryGetValue(meterID, out mapMetric))
                    mapMetric.ColorValue = value;
            };

            PopulateMapMetricLookup(query, mapMetricLookup);
            PopulateMapMetric(query, query.SizeMapMetricType, updateSizeMetric);
            PopulateMapMetric(query, query.ColorMapMetricType, updateColorMetric);

            List<MapMetric> mapMetrics = mapMetricLookup.Values.ToList();
            double largest = GetMax(mapMetrics, query.SizeMapMetricType, mapMetric => mapMetric.SizeValue);
            double smallest = GetMin(mapMetrics, query.SizeMapMetricType, mapMetric => mapMetric.SizeValue);
            double red = GetMax(mapMetrics, query.ColorMapMetricType, mapMetric => mapMetric.ColorValue);
            double green = GetMin(mapMetrics, query.ColorMapMetricType, mapMetric => mapMetric.ColorValue);

            return new MapMetricQueryResult()
            {
                MapMetrics = mapMetrics,
                Largest = largest,
                Smallest = smallest,
                Red = red,
                Green = green
            };
        }

        [Route("GetMapMetricAnimation"), HttpPost]
        public async Task<MapMetricAnimationResult> GetMapMetricAnimation([FromBody] MapMetricAnimationQuery query, CancellationToken cancellationToken)
        {
            Dictionary<int, MapMetric> mapMetricLookup = new Dictionary<int, MapMetric>();
            PopulateMapMetricLookup(query, mapMetricLookup);

            int frameCount = GetFrameCount(query);
            List<Dictionary<int, MapMetricAggregate>> frameLookups = GenerateFrameLookups(frameCount, mapMetricLookup);

            Func<IEnumerable<MapMetricAggregate>, List<MapMetric>> unwrapAggregates = aggregates => aggregates
                .Select(aggregate => aggregate.MapMetric)
                .ToList();

            Func<int, string> toDate = index =>
                query.StartTime.AddMinutes(index * query.AnimationInterval).ToString();

            Func<IEnumerable<MapMetricAggregate>, int, MapMetricAnimationFrame> toAnimationFrame = (aggregates, index) => new MapMetricAnimationFrame()
            {
                MapMetrics = unwrapAggregates(aggregates),
                Date = toDate(index)
            };

            List<MapMetricAnimationFrame> frames = frameLookups
                .Select(lookup => lookup.Values)
                .Select(toAnimationFrame)
                .ToList();

            Func<int, int, MapMetricAggregate> getMapMetricAggregate = (frameIndex, meterID) =>
            {
                if (frameIndex < 0 || frameIndex >= frameLookups.Count)
                    return null;

                Dictionary<int, MapMetricAggregate> frameLookup = frameLookups[frameIndex];

                MapMetricAggregate aggregate;
                if (!frameLookup.TryGetValue(meterID, out aggregate))
                    return null;
                return aggregate;
            };

            Action<int, int, double> populateSizeAction = (frameIndex, meterID, value) =>
            {
                MapMetricAggregate aggregate = getMapMetricAggregate(frameIndex, meterID);
                if (aggregate == null)
                    return;
                aggregate.Aggregate(value);

                switch (query.SizeMapMetricType)
                {
                    case MapMetricType.MaximumVoltageRMS:
                    case MapMetricType.MaximumVoltageTHD:
                    case MapMetricType.MaximumShortTermFlicker:
                        aggregate.MapMetric.SizeValue = aggregate.Maximum;
                        break;

                    case MapMetricType.MinimumVoltageRMS:
                    case MapMetricType.MinimumVoltageTHD:
                    case MapMetricType.MinimumShortTermFlicker:
                        aggregate.MapMetric.SizeValue = aggregate.Minimum;
                        break;

                    default:
                    case MapMetricType.AverageVoltageRMS:
                    case MapMetricType.AverageVoltageTHD:
                    case MapMetricType.AverageShortTermFlicker:
                        aggregate.MapMetric.SizeValue = aggregate.Average;
                        break;
                }
            };

            Action<int, int, double> populateColorAction = (frameIndex, meterID, value) =>
            {
                MapMetricAggregate aggregate = getMapMetricAggregate(frameIndex, meterID);
                if (aggregate == null)
                    return;
                aggregate.Aggregate(value);

                switch (query.ColorMapMetricType)
                {
                    case MapMetricType.MaximumVoltageRMS:
                    case MapMetricType.MaximumVoltageTHD:
                    case MapMetricType.MaximumShortTermFlicker:
                        aggregate.MapMetric.ColorValue = aggregate.Maximum;
                        break;

                    case MapMetricType.MinimumVoltageRMS:
                    case MapMetricType.MinimumVoltageTHD:
                    case MapMetricType.MinimumShortTermFlicker:
                        aggregate.MapMetric.ColorValue = aggregate.Minimum;
                        break;

                    default:
                    case MapMetricType.AverageVoltageRMS:
                    case MapMetricType.AverageVoltageTHD:
                    case MapMetricType.AverageShortTermFlicker:
                        aggregate.MapMetric.ColorValue = aggregate.Average;
                        break;
                }
            };

            List<MapMetricAggregate> allAggregates = frameLookups
                .SelectMany(frame => frame.Values)
                .ToList();

            Action resetAggregates = () => allAggregates.ForEach(aggregate => aggregate.Reset());

            resetAggregates();
            await PopulateMapMetricAnimationFramesAsync(query, query.SizeMapMetricType, populateSizeAction, cancellationToken);
            resetAggregates();
            await PopulateMapMetricAnimationFramesAsync(query, query.ColorMapMetricType, populateColorAction, cancellationToken);

            Func<Func<MapMetric, double?>, IComparer<double>, double> max = (selector, comparer) =>
            {
                return frames
                    .SelectMany(frame => frame.MapMetrics)
                    .Select(selector)
                    .Where(value => value != null)
                    .Cast<double>()
                    .DefaultIfEmpty(0.0D)
                    .Max(comparer);
            };

            Func<Func<MapMetric, double?>, IComparer<double>, double> min = (selector, comparer) =>
            {
                return frames
                    .SelectMany(frame => frame.MapMetrics)
                    .Select(selector)
                    .Where(value => value != null)
                    .Cast<double>()
                    .DefaultIfEmpty(0.0D)
                    .Min(comparer);
            };

            Comparer<double> sizeMapMetricComparer = GetMapMetricComparer(query.SizeMapMetricType);
            Comparer<double> colorMapMetricComparer = GetMapMetricComparer(query.ColorMapMetricType);
            double largest = max(mapMetric => mapMetric.SizeValue, sizeMapMetricComparer);
            double smallest = min(mapMetric => mapMetric.SizeValue, sizeMapMetricComparer);
            double red = max(mapMetric => mapMetric.ColorValue, colorMapMetricComparer);
            double green = min(mapMetric => mapMetric.ColorValue, colorMapMetricComparer);

            return new MapMetricAnimationResult()
            {
                Frames = frames,
                Largest = largest,
                Smallest = smallest,
                Red = red,
                Green = green
            };
        }

        private void PopulateMapMetricLookup(MapMetricQuery mapMetricQuery, Dictionary<int, MapMetric> mapMetricLookup)
        {
            const string SQLQuery =
                "SELECT * " +
                "INTO #meterIDs " +
                "FROM String_To_Int_Table({0}, ',') " +
                "" +
                "SELECT " +
                "    Meter.ID MeterID, " +
                "    Location.Longitude, " +
                "    Location.Latitude " +
                "FROM " +
                "    Meter JOIN " +
                "    Location ON Meter.LocationID = Location.ID " +
                "WHERE Meter.ID IN (SELECT * FROM #meterIDs)";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(SQLQuery, mapMetricQuery.MeterFilter, mapMetricQuery.StartTime, mapMetricQuery.EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");

                    MapMetric mapMetric = new MapMetric()
                    {
                        Longitude = row.ConvertField<double>("Longitude"),
                        Latitude = row.ConvertField<double>("Latitude")
                    };

                    mapMetricLookup.Add(meterID, mapMetric);
                }
            }
        }

        private void PopulateMapMetric(MapMetricQuery mapMetricQuery, MapMetricType mapMetricType, Action<int, double> populateAction)
        {
            switch (mapMetricType)
            {
                case MapMetricType.EventCount:
                    PopulateWithEventCount(mapMetricQuery, populateAction);
                    break;

                case MapMetricType.SagCount:
                    PopulateWithEventCount(mapMetricQuery, "Sag", populateAction);
                    break;

                case MapMetricType.SwellCount:
                    PopulateWithEventCount(mapMetricQuery, "Swell", populateAction);
                    break;

                case MapMetricType.InterruptionCount:
                    PopulateWithEventCount(mapMetricQuery, "Interruption", populateAction);
                    break;

                case MapMetricType.SagMinimum:
                    PopulateWithSagMinimum(mapMetricQuery, populateAction);
                    break;

                case MapMetricType.SwellMaximum:
                    PopulateWithSwellMaximum(mapMetricQuery, populateAction);
                    break;

                case MapMetricType.MaximumVoltageRMS:
                    PopulateWithVoltageRMS(mapMetricQuery, "Maximum", populateAction);
                    break;

                case MapMetricType.MinimumVoltageRMS:
                    PopulateWithVoltageRMS(mapMetricQuery, "Minimum", populateAction);
                    break;

                case MapMetricType.AverageVoltageRMS:
                    PopulateWithVoltageRMS(mapMetricQuery, "Average", populateAction);
                    break;

                case MapMetricType.MaximumVoltageTHD:
                    PopulateWithVoltageTHD(mapMetricQuery, "Maximum", populateAction);
                    break;

                case MapMetricType.MinimumVoltageTHD:
                    PopulateWithVoltageTHD(mapMetricQuery, "Minimum", populateAction);
                    break;

                case MapMetricType.AverageVoltageTHD:
                    PopulateWithVoltageTHD(mapMetricQuery, "Average", populateAction);
                    break;

                case MapMetricType.MaximumShortTermFlicker:
                    PopulateWithShortTermFlicker(mapMetricQuery, "Maximum", populateAction);
                    break;

                case MapMetricType.MinimumShortTermFlicker:
                    PopulateWithShortTermFlicker(mapMetricQuery, "Minimum", populateAction);
                    break;

                case MapMetricType.AverageShortTermFlicker:
                    PopulateWithShortTermFlicker(mapMetricQuery, "Average", populateAction);
                    break;
            }
        }

        private void PopulateWithEventCount(MapMetricQuery query, Action<int, double> populateAction)
        {
            const string SQLQuery =
                "DECLARE @startTime DATETIME2 = {1} " +
                "DECLARE @endTime DATETIME2 = {2} " +
                "" +
                "SELECT * " +
                "INTO #meterIDs " +
                "FROM String_To_Int_Table({0}, ',') " +
                "" +
                "SELECT MeterID, COUNT(*) Value " +
                "FROM Event " +
                "WHERE " +
                "    StartTime >= @startTime AND " +
                "    StartTime < @endTime AND " +
                "    MeterID IN (SELECT * FROM #meterIDs) " +
                "GROUP BY MeterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(SQLQuery, query.MeterFilter, query.StartTime, query.EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithEventCount(MapMetricQuery query, string eventType, Action<int, double> populateAction)
        {
            const string SQLQuery =
                "DECLARE @startTime DATETIME2 = {1} " +
                "DECLARE @endTime DATETIME2 = {2} " +
                "DECLARE @eventType VARCHAR(MAX) = {3} " +
                "" +
                "SELECT * " +
                "INTO #meterIDs " +
                "FROM String_To_Int_Table({0}, ',') " +
                "" +
                "SELECT MeterID, COUNT(*) Value " +
                "FROM " +
                "    Event JOIN " +
                "    EventType ON Event.EventTypeID = EventType.ID " +
                "WHERE " +
                "    StartTime >= @startTime AND " +
                "    StartTime < @endTime AND " +
                "    EventType.Name = @eventType AND " +
                "    MeterID IN (SELECT * FROM #meterIDs) " +
                "GROUP BY MeterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(SQLQuery, query.MeterFilter, query.StartTime, query.EndTime, eventType))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithSagMinimum(MapMetricQuery query, Action<int, double> populateAction)
        {
            const string SQLQuery =
                "DECLARE @startTime DATETIME2 = {1} " +
                "DECLARE @endTime DATETIME2 = {2} " +
                "" +
                "SELECT * " +
                "INTO #meterIDs " +
                "FROM String_To_Int_Table({0}, ',') " +
                "" +
                "SELECT " +
                "    Event.MeterID, " +
                "    MIN(Disturbance.PerUnitMagnitude) Value " +
                "FROM " +
                "    Event JOIN " +
                "    Disturbance ON Disturbance.EventID = Event.ID JOIN " +
                "    EventType ON Disturbance.EventTypeID = EventType.ID " +
                "WHERE " +
                "    Event.StartTime >= @startTime AND " +
                "    Event.StartTime < @endTime AND " +
                "    EventType.Name = 'Sag' AND " +
                "    Event.MeterID IN (SELECT * FROM #meterIDs) AND " +
                "    Disturbance.PerUnitMagnitude <> -1E38 " +
                "GROUP BY Event.MeterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(SQLQuery, query.MeterFilter, query.StartTime, query.EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithSwellMaximum(MapMetricQuery query, Action<int, double> populateAction)
        {
            const string SQLQuery =
                "DECLARE @startTime DATETIME2 = {1} " +
                "DECLARE @endTime DATETIME2 = {2} " +
                "" +
                "SELECT * " +
                "INTO #meterIDs " +
                "FROM String_To_Int_Table({0}, ',') " +
                "" +
                "SELECT " +
                "    Event.MeterID, " +
                "    MAX(Disturbance.PerUnitMagnitude) Value " +
                "FROM " +
                "    Event JOIN " +
                "    Disturbance ON Disturbance.EventID = Event.ID JOIN " +
                "    EventType ON Disturbance.EventTypeID = EventType.ID " +
                "WHERE " +
                "    Event.StartTime >= @startTime AND " +
                "    Event.StartTime < @endTime AND " +
                "    EventType.Name = 'Swell' AND " +
                "    Event.MeterID IN (SELECT * FROM #meterIDs) AND " +
                "    Disturbance.PerUnitMagnitude <> -1E38 " +
                "GROUP BY Event.MeterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(SQLQuery, query.MeterFilter, query.StartTime, query.EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private class TrendingChannelDefinition
        {
            public string AggregateType { get; set; }
            public string MeasurementType { get; set; }
            public string MeasurementCharacteristic { get; set; }
            public IEnumerable<string> Phases { get; set; }

            public string PhaseList => string.Join(",", Phases
                .Select(phase => $"'{phase}'"));

            public string AggregateFunction
            {
                get
                {
                    switch (AggregateType)
                    {
                        default:
                        case "Average": return "AVG";
                        case "Maximum": return "MAX";
                        case "Minimum": return "MIN";
                    }
                }
            }
        }

        private TrendingChannelDefinition GetVoltageRMSChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "RMS",
            Phases = new[] { "AN", "BN", "CN", "AB", "BC", "CA" }
        };

        private TrendingChannelDefinition GetVoltageTHDChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "TotalTHD",
            Phases = new[] { "AN", "BN", "CN" }
        };

        private TrendingChannelDefinition GetShortTermFlickerChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "ShortTermFlicker",
            Phases = new[] { "AN", "BN", "CN" }
        };

        private void PopulateWithVoltageRMS(MapMetricQuery query, string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = GetVoltageRMSChannelDefinition(aggregateType);
            PopulateWithTrendingData(query, channelDefinition, populateAction);
        }

        private void PopulateWithVoltageTHD(MapMetricQuery query, string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = GetVoltageTHDChannelDefinition(aggregateType);
            PopulateWithTrendingData(query, channelDefinition, populateAction);
        }

        private void PopulateWithShortTermFlicker(MapMetricQuery query, string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = GetShortTermFlickerChannelDefinition(aggregateType);
            PopulateWithTrendingData(query, channelDefinition, populateAction);
        }

        private void PopulateWithTrendingData(MapMetricQuery query, TrendingChannelDefinition channelDefinition, Action<int, double> populateAction)
        {
            DateTime startDate = query.StartTime.Date;
            DateTime endDate = query.EndTime.Date;

            string aggregateType = channelDefinition.AggregateType;
            string aggregateFunction = channelDefinition.AggregateFunction;
            string measurementType = channelDefinition.MeasurementType;
            string measurementCharacteristic = channelDefinition.MeasurementCharacteristic;
            string phaseList = channelDefinition.PhaseList;

            string sqlQuery =
                $"DECLARE @startTime DATETIME2 = {{1}} " +
                $"DECLARE @endTime DATETIME2 = {{2}} " +
                $"" +
                $"SELECT * " +
                $"INTO #meterIDs " +
                $"FROM String_To_Int_Table({{0}}, ',') " +
                $"" +
                $"SELECT " +
                $"    Channel.MeterID, " +
                $"    {aggregateFunction}(DailyTrendingSummary.{aggregateType} / COALESCE(Channel.PerUnitValue, 1)) Value " +
                $"FROM " +
                $"    DailyTrendingSummary JOIN " +
                $"    Channel ON DailyTrendingSummary.ChannelID = Channel.ID JOIN " +
                $"    MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN " +
                $"    MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN " +
                $"    Phase ON Channel.PhaseID = Phase.ID " +
                $"WHERE " +
                $"    DailyTrendingSummary.Date >= @startTime AND " +
                $"    DailyTrendingSummary.Date < @endTime AND " +
                $"    Channel.MeterID IN (SELECT * FROM #meterIDs) AND " +
                $"    MeasurementType.Name = '{measurementType}' AND " +
                $"    MeasurementCharacteristic.Name = '{measurementCharacteristic}' AND " +
                $"    Phase.Name IN ({phaseList})" +
                $"GROUP BY Channel.MeterID";

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable table = connection.RetrieveData(sqlQuery, query.MeterFilter, startDate, endDate))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private async Task PopulateMapMetricAnimationFramesAsync(MapMetricAnimationQuery mapMetricQuery, MapMetricType mapMetricType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            switch (mapMetricType)
            {
                case MapMetricType.MaximumVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync(mapMetricQuery, "Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync(mapMetricQuery, "Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync(mapMetricQuery, "Average", populateAction, cancellationToken);
                    break;

                case MapMetricType.MaximumVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync(mapMetricQuery, "Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync(mapMetricQuery, "Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync(mapMetricQuery, "Average", populateAction, cancellationToken);
                    break;

                case MapMetricType.MaximumShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync(mapMetricQuery, "Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync(mapMetricQuery, "Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync(mapMetricQuery, "Average", populateAction, cancellationToken);
                    break;
            }
        }

        private async Task PopulateMapMetricAnimationWithVoltageRMSAsync(MapMetricAnimationQuery mapMetricQuery, string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = GetVoltageRMSChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(mapMetricQuery, channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationWithVoltageTHDAsync(MapMetricAnimationQuery mapMetricQuery, string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = GetVoltageTHDChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(mapMetricQuery, channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationWithShortTermFlickerAsync(MapMetricAnimationQuery mapMetricQuery, string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = GetShortTermFlickerChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(mapMetricQuery, channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationFramesAsync(MapMetricAnimationQuery mapMetricQuery, TrendingChannelDefinition channelDefinition, Action<int, int, double> parentAction, CancellationToken cancellationToken)
        {
            string meterIDList = string.Join(",", mapMetricQuery.MeterIDs);
            string measurementType = channelDefinition.MeasurementType;
            string measurementCharacteristic = channelDefinition.MeasurementCharacteristic;
            string phaseList = channelDefinition.PhaseList;

            string idQuery =
                $"SELECT " +
                $"    Channel.ID AS ChannelID, " +
                $"    Meter.ID AS MeterID, " +
                $"    Channel.PerUnitValue " +
                $"FROM " +
                $"    Meter JOIN " +
                $"    Channel ON Channel.MeterID = Meter.ID JOIN " +
                $"    MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN " +
                $"    MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN " +
                $"    Phase ON Channel.PhaseID = Phase.ID " +
                $"WHERE " +
                $"    Meter.ID IN ({meterIDList}) AND " +
                $"    MeasurementType.Name = {{0}} AND " +
                $"    MeasurementCharacteristic.Name = {{1}} AND " +
                $"    Phase.Name IN ({phaseList})";

            List<int> channels;
            Func<int, double> getNominalValue;
            Action<int, int, double> populateAction;

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            using (DataTable idTable = connection.RetrieveData(idQuery, measurementType, measurementCharacteristic))
            {

                channels = idTable
                    .AsEnumerable()
                    .Select(row => row.ConvertField<int>("ChannelID"))
                    .ToList();

                var lookup = idTable
                    .AsEnumerable()
                    .Select(row => new
                    {
                        ChannelID = row.ConvertField<int>("ChannelID"),
                        MeterID = row.ConvertField<int>("MeterID"),
                        PerUnitValue = row.ConvertField<double?>("PerUnitValue")
                    })
                    .ToDictionary(mapping => mapping.ChannelID);

                getNominalValue = channelID =>
                {
                    var mapping = lookup.Values.Take(0).SingleOrDefault();
                    return lookup.TryGetValue(channelID, out mapping)
                        ? mapping.PerUnitValue ?? 1.0D
                        : 1.0D;
                };

                populateAction = (frameIndex, channelID, value) =>
                {
                    var mapping = lookup.Values.Take(0).SingleOrDefault();
                    if (!lookup.TryGetValue(channelID, out mapping))
                        return;

                    parentAction(frameIndex, mapping.MeterID, value);
                };
            }

            var hidsQuery = new
            {
                StartTime = mapMetricQuery.StartTime,
                EndTime = mapMetricQuery.EndTime,
                Channels = channels,
                AggregateDuration = $"{mapMetricQuery.AnimationInterval}m"
            };

            Func<HIDSPoint, double> getValue = new Func<Func<HIDSPoint, double>>(() =>
            {
                switch (channelDefinition.AggregateType)
                {
                    case "Maximum": return point => point.Maximum;
                    case "Minimum": return point => point.Minimum;
                    case "Average": return point => point.Average;
                    default: return point => double.NaN;
                }
            })();

            Action<HIDSPoint> processPoint = point =>
            {
                string tag = point.Tag;
                DateTime timestamp = point.Timestamp;
                double value = getValue(point);

                int channelID = Convert.ToInt32(tag, 16);
                DateTime startDate = mapMetricQuery.StartTime;
                int stepSize = mapMetricQuery.AnimationInterval;
                int frameIndex = (int)((timestamp - startDate).TotalMinutes / stepSize);
                populateAction(frameIndex, channelID, value);
            };

            XDAClient xdaClient = new XDAClient(() => new AdoDataConnection("systemSettings"));
            await xdaClient.QueryHIDSPointsAsync(hidsQuery, processPoint, cancellationToken);
        }

        private int GetFrameCount(MapMetricAnimationQuery mapMetricQuery)
        {
            DateTime startDate = mapMetricQuery.StartTime;
            DateTime endDate = mapMetricQuery.EndTime;
            int stepSize = mapMetricQuery.AnimationInterval;

            // The frames to be included are those whose timestamps fall
            // within the range which is specified by startDate and
            // endDate. We start by aligning startDate and endDate with
            // the nearest frame timestamps which fall within that range
            int startTimeOffset = (int)Math.Ceiling((startDate - startDate.Date).TotalMinutes / stepSize);
            startDate = startDate.Date.AddMinutes(startTimeOffset * stepSize);

            int endTimeOffset = (int)Math.Floor((endDate - endDate.Date).TotalMinutes / stepSize);
            endDate = endDate.Date.AddMinutes(endTimeOffset * stepSize);

            // Since each frame includes data from all timestamps between
            // the previous frame's timestamp and its own timestamp, we
            // must include one additional frame of data before startDate
            startDate = startDate.AddMinutes(-stepSize);

            return (int)((endDate - startDate).TotalMinutes / stepSize);
        }

        private List<Dictionary<int, MapMetricAggregate>> GenerateFrameLookups(int frameCount, Dictionary<int, MapMetric> mapMetricLookup)
        {
            Func<MapMetric, MapMetric> cloneMapMetric = mapMetric => new MapMetric()
            {
                Latitude = mapMetric.Latitude,
                Longitude = mapMetric.Longitude
            };

            Func<MapMetric, MapMetricAggregate> toAggregate = mapMetric =>
                new MapMetricAggregate(cloneMapMetric(mapMetric));

            Func<Dictionary<int, MapMetric>, Dictionary<int, MapMetricAggregate>> toAggregateLookup = lookup => lookup
                .ToDictionary(kvp => kvp.Key, kvp => toAggregate(kvp.Value));

            return Enumerable.Range(0, frameCount)
                .Select(_ => toAggregateLookup(mapMetricLookup))
                .ToList();
        }

        private double GetMax(List<MapMetric> mapMetrics, MapMetricType mapMetricType, Func<MapMetric, double?> mapMetricValueSelector)
        {
            switch (mapMetricType)
            {
                case MapMetricType.SagMinimum:
                    return 0.0D;

                case MapMetricType.SwellMaximum:
                    return 2.0D;

                default:
                case MapMetricType.EventCount:
                case MapMetricType.SagCount:
                case MapMetricType.SwellCount:
                case MapMetricType.InterruptionCount:
                case MapMetricType.MaximumVoltageRMS:
                case MapMetricType.MinimumVoltageRMS:
                case MapMetricType.AverageVoltageRMS:
                case MapMetricType.MaximumVoltageTHD:
                case MapMetricType.MinimumVoltageTHD:
                case MapMetricType.AverageVoltageTHD:
                case MapMetricType.MaximumShortTermFlicker:
                case MapMetricType.MinimumShortTermFlicker:
                case MapMetricType.AverageShortTermFlicker:
                    Comparer<double> mapMetricComparer = GetMapMetricComparer(mapMetricType);

                    Func<Func<MapMetric, double?>, IComparer<double>, double> max = (selector, comparer) =>
                    {
                        return mapMetrics
                            .Select(selector)
                            .Where(value => value != null)
                            .Cast<double>()
                            .DefaultIfEmpty(0.0D)
                            .Max(comparer);
                    };

                    return max(mapMetricValueSelector, mapMetricComparer);
            }
        }

        private double GetMin(List<MapMetric> mapMetrics, MapMetricType mapMetricType, Func<MapMetric, double?> mapMetricValueSelector)
        {
            switch (mapMetricType)
            {
                case MapMetricType.SagMinimum:
                case MapMetricType.SwellMaximum:
                    return 1.0D;

                default:
                case MapMetricType.EventCount:
                case MapMetricType.SagCount:
                case MapMetricType.SwellCount:
                case MapMetricType.InterruptionCount:
                case MapMetricType.MaximumVoltageRMS:
                case MapMetricType.MinimumVoltageRMS:
                case MapMetricType.AverageVoltageRMS:
                case MapMetricType.MaximumVoltageTHD:
                case MapMetricType.MinimumVoltageTHD:
                case MapMetricType.AverageVoltageTHD:
                case MapMetricType.MaximumShortTermFlicker:
                case MapMetricType.MinimumShortTermFlicker:
                case MapMetricType.AverageShortTermFlicker:
                    Comparer<double> mapMetricComparer = GetMapMetricComparer(mapMetricType);

                    Func<Func<MapMetric, double?>, IComparer<double>, double> min = (selector, comparer) =>
                    {
                        return mapMetrics
                            .Select(selector)
                            .Where(value => value != null)
                            .Cast<double>()
                            .DefaultIfEmpty(0.0D)
                            .Min(comparer);
                    };

                    return min(mapMetricValueSelector, mapMetricComparer);
            }
        }

        private Comparer<double> GetMapMetricComparer(MapMetricType mapMetricType)
        {
            switch (mapMetricType)
            {
                default:
                case MapMetricType.EventCount:
                case MapMetricType.SwellMaximum:
                case MapMetricType.SagCount:
                case MapMetricType.SwellCount:
                case MapMetricType.InterruptionCount:
                case MapMetricType.MaximumVoltageRMS:
                case MapMetricType.MaximumVoltageTHD:
                case MapMetricType.MinimumVoltageTHD:
                case MapMetricType.AverageVoltageTHD:
                case MapMetricType.MaximumShortTermFlicker:
                case MapMetricType.MinimumShortTermFlicker:
                case MapMetricType.AverageShortTermFlicker:
                    return Comparer<double>.Default;

                case MapMetricType.SagMinimum:
                case MapMetricType.MinimumVoltageRMS:
                case MapMetricType.AverageVoltageRMS:
                    Comparison<double> reverse = (x, y) =>
                        Comparer<double>.Default.Compare(y, x);

                    return Comparer<double>.Create(reverse);
            }
        }

        #endregion

        #region [ Old Main Dashboard ]

        public class DetailtsForSitesForm {
            public string siteId { get; set; }
            public string targetDate { get; set; }
            public string userName { get; set; }
            public string tab { get; set; }
            public string colorScale { get; set; }
            public string context { get; set; }
        }

        [Route("GetNotesForEvent"),HttpGet]
        public IEnumerable<EventNote> GetNotesForEvent()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int id = int.Parse(query["id"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA")) {
                return new TableOperations<EventNote>(connection).QueryRecords(restriction: new RecordRestriction("EventID = {0}", id));
            }
        }

        public class NoteForEventForm
        {
            public int id { get; set; }
            public string note { get; set; }
            public string userId { get; set; }

        }

        [Route("SaveNoteForEvent"),HttpPost]
        public void SaveNoteForEvent(NoteForEventForm form)
        {
            if (form.note.Trim().Length > 0)
            {
                using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
                {
                    new TableOperations<EventNote>(connection).AddNewRecord(new EventNote()
                    {
                        EventID = form.id,
                        Note = form.note,
                        UserAccount = form.userId,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
        }

        [Route("RemoveEventNote"),HttpPost]
        public void RemoveEventNote(NoteForEventForm form)
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                new TableOperations<EventNote>(connection).DeleteRecord(restriction: new RecordRestriction("ID = {0}", form.id));
            }
        }


        [Route("GetCurves"),HttpGet]
        public IEnumerable<WorkbenchVoltageCurveView> GetCurves()
        {
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                return new TableOperations<WorkbenchVoltageCurveView>(connection).QueryRecords("ID, LoadOrder");
            }
        }

        public class MetersForm {
            public int deviceFilter { get; set; }
            public string userName { get; set; }
        }


        public class AssetGroupWithSubIDs: AssetGroup {
            public List<int> SubID { get; set; }
        }
        public class GetMetersReturn
        {
            public IEnumerable<Meter> Meters { get; set; }
            public List<AssetGroupWithSubIDs> AssetGroups { get; set; }
            public int? ParentAssetGroupID { get; set; }
        }

        [Route("GetMeters"), HttpPost]
        public GetMetersReturn GetMeters(MetersForm form)
        {
            GetMetersReturn data = new GetMetersReturn();
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA")) {
                data.ParentAssetGroupID = connection.ExecuteScalar<int?>("SELECT TOP 1 ParentAssetGroupID FROM AssetGroupAssetGroup where ChildAssetGroupID = {0}", form.deviceFilter);
                data.Meters = new TableOperations<Meter>(connection).QueryRecordsWhere("ID IN (SELECT MeterID FROM MeterAssetGroup WHERE AssetGroupID = {0})", form.deviceFilter);
                var assetGroups = new TableOperations<AssetGroup>(connection).QueryRecordsWhere("ID IN (SELECT ChildAssetGroupID FROM AssetGroupAssetGroup WHERE ParentAssetGroupID = {0}) AND DisplayDashboard = 1", form.deviceFilter);

                data.AssetGroups = new List<AssetGroupWithSubIDs>();
                foreach(var assetGroup in assetGroups)
                {
                    AssetGroupWithSubIDs record = new AssetGroupWithSubIDs() {
                        ID = assetGroup.ID, Name = assetGroup.Name, SubID = new List<int>()
                    };

                    DataTable tbl = connection.RetrieveData("SELECT ID FROM RecursiveMeterSearch({0})", assetGroup.ID);

                    record.SubID = tbl.Select().Select(x => int.Parse(x["ID"].ToString())).ToList();
                    data.AssetGroups.Add(record);
                }
                return data;
            }
        }
        #endregion

        #endregion
    }
}