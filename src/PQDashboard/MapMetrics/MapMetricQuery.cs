//******************************************************************************************************
//  MapMetricQuery.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  04/21/2023 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GSF.Data;

namespace PQDashboard.MapMetrics
{
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

        public void PopulateMapMetricLookup(Dictionary<int, MapMetric> mapMetricLookup)
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
            using (DataTable table = connection.RetrieveData(SQLQuery, MeterFilter, StartTime, EndTime))
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

        public void PopulateMapMetric(MapMetricType mapMetricType, Action<int, double> populateAction)
        {
            switch (mapMetricType)
            {
                case MapMetricType.EventCount:
                    PopulateWithEventCount(populateAction);
                    break;

                case MapMetricType.SagCount:
                    PopulateWithEventCount("Sag", populateAction);
                    break;

                case MapMetricType.SwellCount:
                    PopulateWithEventCount("Swell", populateAction);
                    break;

                case MapMetricType.InterruptionCount:
                    PopulateWithEventCount("Interruption", populateAction);
                    break;

                case MapMetricType.SagMinimum:
                    PopulateWithSagMinimum(populateAction);
                    break;

                case MapMetricType.SwellMaximum:
                    PopulateWithSwellMaximum(populateAction);
                    break;

                case MapMetricType.MaximumVoltageRMS:
                    PopulateWithVoltageRMS("Maximum", populateAction);
                    break;

                case MapMetricType.MinimumVoltageRMS:
                    PopulateWithVoltageRMS("Minimum", populateAction);
                    break;

                case MapMetricType.AverageVoltageRMS:
                    PopulateWithVoltageRMS("Average", populateAction);
                    break;

                case MapMetricType.MaximumVoltageTHD:
                    PopulateWithVoltageTHD("Maximum", populateAction);
                    break;

                case MapMetricType.MinimumVoltageTHD:
                    PopulateWithVoltageTHD("Minimum", populateAction);
                    break;

                case MapMetricType.AverageVoltageTHD:
                    PopulateWithVoltageTHD("Average", populateAction);
                    break;

                case MapMetricType.MaximumShortTermFlicker:
                    PopulateWithShortTermFlicker("Maximum", populateAction);
                    break;

                case MapMetricType.MinimumShortTermFlicker:
                    PopulateWithShortTermFlicker("Minimum", populateAction);
                    break;

                case MapMetricType.AverageShortTermFlicker:
                    PopulateWithShortTermFlicker("Average", populateAction);
                    break;
            }
        }

        private void PopulateWithEventCount(Action<int, double> populateAction)
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
            using (DataTable table = connection.RetrieveData(SQLQuery, MeterFilter, StartTime, EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithEventCount(string eventType, Action<int, double> populateAction)
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
            using (DataTable table = connection.RetrieveData(SQLQuery, MeterFilter, StartTime, EndTime, eventType))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithSagMinimum(Action<int, double> populateAction)
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
            using (DataTable table = connection.RetrieveData(SQLQuery, MeterFilter, StartTime, EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithSwellMaximum(Action<int, double> populateAction)
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
            using (DataTable table = connection.RetrieveData(SQLQuery, MeterFilter, StartTime, EndTime))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }

        private void PopulateWithVoltageRMS(string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetVoltageRMSChannelDefinition(aggregateType);
            PopulateWithTrendingData(channelDefinition, populateAction);
        }

        private void PopulateWithVoltageTHD(string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetVoltageTHDChannelDefinition(aggregateType);
            PopulateWithTrendingData(channelDefinition, populateAction);
        }

        private void PopulateWithShortTermFlicker(string aggregateType, Action<int, double> populateAction)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetShortTermFlickerChannelDefinition(aggregateType);
            PopulateWithTrendingData(channelDefinition, populateAction);
        }

        private void PopulateWithTrendingData(TrendingChannelDefinition channelDefinition, Action<int, double> populateAction)
        {
            DateTime startDate = StartTime.Date;
            DateTime endDate = EndTime.Date;

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
            using (DataTable table = connection.RetrieveData(sqlQuery, MeterFilter, startDate, endDate))
            {
                foreach (DataRow row in table.Rows)
                {
                    int meterID = row.ConvertField<int>("MeterID");
                    double value = row.ConvertField<double>("Value");
                    populateAction(meterID, value);
                }
            }
        }
    }

    public class MapMetricAnimationQuery : MapMetricQuery
    {
        public int AnimationInterval;

        public int GetFrameCount()
        {
            DateTime startDate = StartTime;
            DateTime endDate = EndTime;
            int stepSize = AnimationInterval;

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

        public async Task PopulateMapMetricAnimationFramesAsync(MapMetricType mapMetricType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            switch (mapMetricType)
            {
                case MapMetricType.MaximumVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync("Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync("Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageVoltageRMS:
                    await PopulateMapMetricAnimationWithVoltageRMSAsync("Average", populateAction, cancellationToken);
                    break;

                case MapMetricType.MaximumVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync("Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync("Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageVoltageTHD:
                    await PopulateMapMetricAnimationWithVoltageTHDAsync("Average", populateAction, cancellationToken);
                    break;

                case MapMetricType.MaximumShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync("Maximum", populateAction, cancellationToken);
                    break;

                case MapMetricType.MinimumShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync("Minimum", populateAction, cancellationToken);
                    break;

                case MapMetricType.AverageShortTermFlicker:
                    await PopulateMapMetricAnimationWithShortTermFlickerAsync("Average", populateAction, cancellationToken);
                    break;
            }
        }

        private async Task PopulateMapMetricAnimationWithVoltageRMSAsync(string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetVoltageRMSChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationWithVoltageTHDAsync(string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetVoltageTHDChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationWithShortTermFlickerAsync(string aggregateType, Action<int, int, double> populateAction, CancellationToken cancellationToken)
        {
            TrendingChannelDefinition channelDefinition = TrendingChannelDefinition.GetShortTermFlickerChannelDefinition(aggregateType);
            await PopulateMapMetricAnimationFramesAsync(channelDefinition, populateAction, cancellationToken);
        }

        private async Task PopulateMapMetricAnimationFramesAsync(TrendingChannelDefinition channelDefinition, Action<int, int, double> parentAction, CancellationToken cancellationToken)
        {
            string meterIDList = string.Join(",", MeterIDs);
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

                populateAction = (frameIndex, channelID, value) =>
                {
                    var mapping = lookup.Values.Take(0).SingleOrDefault();
                    if (!lookup.TryGetValue(channelID, out mapping))
                        return;

                    double nominalValue = mapping.PerUnitValue ?? 1.0D;
                    double perUnitValue = value / nominalValue;
                    parentAction(frameIndex, mapping.MeterID, perUnitValue);
                };
            }

            var hidsQuery = new
            {
                StartTime = StartTime,
                StopTime = EndTime,
                Channels = channels,
                AggregateDuration = $"{AnimationInterval}m"
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
                DateTime startDate = StartTime;
                int stepSize = AnimationInterval;
                int frameIndex = (int)((timestamp - startDate).TotalMinutes / stepSize);
                populateAction(frameIndex, channelID, value);
            };

            XDAClient xdaClient = new XDAClient(() => new AdoDataConnection("systemSettings"));
            await xdaClient.QueryHIDSPointsAsync(hidsQuery, processPoint, cancellationToken);
        }
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
}