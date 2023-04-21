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
using System.Data;
using System.Linq;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using openXDA.Model;
using PQDashboard.MapMetrics;

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

            query.PopulateMapMetricLookup(mapMetricLookup);
            query.PopulateMapMetric(query.SizeMapMetricType, updateSizeMetric);
            query.PopulateMapMetric(query.ColorMapMetricType, updateColorMetric);

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
            query.PopulateMapMetricLookup(mapMetricLookup);

            int frameCount = query.GetFrameCount();
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
            await query.PopulateMapMetricAnimationFramesAsync(query.SizeMapMetricType, populateSizeAction, cancellationToken);
            resetAggregates();
            await query.PopulateMapMetricAnimationFramesAsync(query.ColorMapMetricType, populateColorAction, cancellationToken);

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

            Comparer<double> sizeMapMetricComparer = query.SizeMapMetricType.GetMapMetricComparer();
            Comparer<double> colorMapMetricComparer = query.ColorMapMetricType.GetMapMetricComparer();
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
                    Comparer<double> mapMetricComparer = mapMetricType.GetMapMetricComparer();

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
                    Comparer<double> mapMetricComparer = mapMetricType.GetMapMetricComparer();

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