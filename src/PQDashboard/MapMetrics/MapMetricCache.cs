//******************************************************************************************************
//  MapMetricCache.cs - Gbtc
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
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace PQDashboard.MapMetrics
{
    public class MapMetricCache
    {
        #region [ Members ]

        // Nested Types
        private class QueryEntry
        {
            public MapMetricAnimationQuery Query { get; }
            public QueryPart SizeQueryPart { get; }
            public QueryPart ColorQueryPart { get; }

            public QueryEntry(MapMetricAnimationQuery query, QueryPart sizeQueryPart, QueryPart colorQueryPart)
            {
                Query = query;
                SizeQueryPart = sizeQueryPart;
                ColorQueryPart = colorQueryPart;
            }
        }

        private class QueryPartKey
        {
            [JsonProperty(Order = 1)]
            public DateTime StartTime { get; set; }

            [JsonProperty(Order = 2)]
            public DateTime EndTime { get; set; }

            [JsonProperty(Order = 3)]
            public MapMetricType MapMetricType { get; set; }

            [JsonProperty(Order = 4)]
            public int? AnimationInterval { get; set; }

            [JsonProperty(Order = 5)]
            public IReadOnlyList<int> MeterIDs { get; set; }

            private QueryPartKey()
            {
            }

            public override string ToString() => JObject
                .FromObject(this)
                .ToString();

            public static QueryPartKey ToQueryKey(MapMetricQuery query, MapMetricType mapMetricType)
            {
                QueryPartKey key = new QueryPartKey();
                key.StartTime = query.StartTime;
                key.EndTime = query.EndTime;
                key.MapMetricType = mapMetricType;

                key.MeterIDs = query.MeterIDs
                    .Distinct()
                    .OrderBy(id => id)
                    .ToList()
                    .AsReadOnly();

                return key;
            }

            public static QueryPartKey ToQueryPartKey(MapMetricAnimationQuery query, MapMetricType mapMetricType)
            {
                QueryPartKey key = ToQueryKey((MapMetricQuery)query, mapMetricType);
                key.AnimationInterval = query.AnimationInterval;
                return key;
            }
        }

        private class QueryPart
        {
            private Task<List<MapMetricAggregate>> QueryTask { get; }
            public QueryPartProgress QueryPartProgress { get; }

            public QueryPart(Task<List<MapMetricAggregate>> queryTask, QueryPartProgress queryProgress)
            {
                QueryTask = queryTask;
                QueryPartProgress = queryProgress;
            }

            public async Task<List<MapMetricAggregate>> GetQueryResultAsync() =>
                await QueryTask;

            public bool IsFaulted => QueryTask.IsFaulted;
        }

        private class QueryPartProgress
        {
            private int m_progress;
            private int m_total;

            public int Progress
            {
                get => Interlocked.CompareExchange(ref m_progress, 0, 0);
                set => Interlocked.Exchange(ref m_progress, value);
            }

            public int Total
            {
                get => Interlocked.CompareExchange(ref m_total, 0, 0);
                set => Interlocked.Exchange(ref m_total, value);
            }

            public void Increment() =>
                Interlocked.Increment(ref m_progress);

            public void Complete() =>
                Interlocked.Exchange(ref m_progress, Total);
        }

        #endregion

        #region [ Constructors ]

        public MapMetricCache(MemoryCache memoryCache) =>
            MemoryCache = memoryCache;

        #endregion

        #region [ Properties ]

        private MemoryCache MemoryCache { get; }

        #endregion

        #region [ Methods ]

        public string AddQuery(MapMetricAnimationQuery query)
        {
            string id = GenerateNewID();
            string cacheKey = ToCacheKey(id);
            QueryPart sizePart = AddQueryPart(query, query.SizeMapMetricType);
            QueryPart colorPart = AddQueryPart(query, query.ColorMapMetricType);
            QueryEntry queryEntry = new QueryEntry(query, sizePart, colorPart);
            CacheItemPolicy policy = ToCacheItemPolicy(QueryExpiration);

            while (!MemoryCache.Add(cacheKey, queryEntry, policy))
            {
                id = GenerateNewID();
                cacheKey = ToCacheKey(id);
            }

            return id;
        }

        public MapMetricAnimationQuery GetQuery(string queryID)
        {
            string cacheKey = ToCacheKey(queryID);
            QueryEntry queryEntry = MemoryCache.Get(cacheKey) as QueryEntry;
            return queryEntry?.Query;
        }

        public double? GetProgress(string queryID)
        {
            string cacheKey = ToCacheKey(queryID);
            QueryEntry queryEntry = MemoryCache.Get(cacheKey) as QueryEntry;

            if (queryEntry is null)
                return null;

            QueryPartProgress sizeProgress = queryEntry.SizeQueryPart.QueryPartProgress;
            QueryPartProgress colorProgress = queryEntry.ColorQueryPart.QueryPartProgress;
            int progress = sizeProgress.Progress + colorProgress.Progress;
            int total = sizeProgress.Total + colorProgress.Total;
            return progress / (double)total;
        }

        public async Task GetQueryResultAsync(string queryID, Action<MapMetricAggregate> populateSizeAction, Action<MapMetricAggregate> populateColorAction)
        {
            string cacheKey = ToCacheKey(queryID);
            QueryEntry queryEntry = MemoryCache.Get(cacheKey) as QueryEntry;

            if (queryEntry is null)
                return;

            List<MapMetricAggregate> sizeAggregates = await queryEntry.SizeQueryPart.GetQueryResultAsync();
            List<MapMetricAggregate> colorAggregates = await queryEntry.ColorQueryPart.GetQueryResultAsync();

            foreach (MapMetricAggregate aggregate in sizeAggregates)
                populateSizeAction(aggregate);

            foreach (MapMetricAggregate aggregate in colorAggregates)
                populateColorAction(aggregate);
        }

        private List<MapMetricAggregate> GenerateMapMetricAggregates(MapMetricAnimationQuery query)
        {
            List<MapMetricAggregate> aggregates = new List<MapMetricAggregate>();
            int frameCount = query.GetFrameCount();

            for (int i = 0; i < frameCount; i++)
            {
                foreach (int meterID in query.MeterIDs)
                    aggregates.Add(new MapMetricAggregate(i, meterID));
            }

            return aggregates;
        }

        private CacheItemPolicy ToCacheItemPolicy(TimeSpan slidingExpiration)
        {
            CacheItemPolicy policy = new CacheItemPolicy();
            policy.SlidingExpiration = slidingExpiration;
            return policy;
        }

        private string GenerateNewID()
        {
            Guid guid = Guid.NewGuid();
            byte[] idBytes = guid.ToByteArray();
            return string.Concat(idBytes.Select(b => $"{b:X2}"));
        }

        private string ToCacheKey(string id) =>
            $"MapMetricQuery:{id}";

        #region [ Query Parts ]

        private QueryPart AddQueryPart(MapMetricAnimationQuery query, MapMetricType type)
        {
            TaskCompletionSource<List<MapMetricAggregate>> taskSource = new(TaskCreationOptions.RunContinuationsAsynchronously);
            QueryPartProgress progress = new QueryPartProgress();

            string key = ToQueryPartKey(query, type);
            QueryPart newPart = new QueryPart(taskSource.Task, progress);
            CacheItemPolicy queryPolicy = ToCacheItemPolicy(QueryPartExpiration);
            object cacheItem = MemoryCache.AddOrGetExisting(key, newPart, queryPolicy) ?? newPart;
            QueryPart cachedPart = cacheItem as QueryPart;

            while (IsAlreadyFaulted(cachedPart))
                cachedPart = TryReplace(key, cachedPart, newPart, queryPolicy);

            if (ReferenceEquals(cachedPart, newPart))
            {
                Task.Run(async () =>
                {
                    try
                    {
                        List<MapMetricAggregate> aggregates = await RunQueryPartAsync(query, type, progress);
                        taskSource.SetResult(aggregates);
                    }
                    catch (Exception ex)
                    {
                        taskSource.SetException(ex);
                    }

                    progress.Complete();
                });
            }

            return cachedPart;
        }

        private string ToQueryPartKey(MapMetricAnimationQuery query, MapMetricType type)
        {
            QueryPartKey queryKey = QueryPartKey.ToQueryPartKey(query, type);
            return $"MapMetricQueryPart:{queryKey}";
        }

        private QueryPart TryReplace(string queryKey, QueryPart oldPart, QueryPart newPart, CacheItemPolicy queryPolicy)
        {
            CacheItemPolicy monitorPolicy = ToCacheItemPolicy(CacheMonitorExpiration);
            object newCacheMonitor = new object();
            object cacheMonitor = MemoryCache.AddOrGetExisting("MapMetricCacheMonitor", newCacheMonitor, monitorPolicy) ?? newCacheMonitor;

            lock (cacheMonitor)
            {
                object cachedPart = MemoryCache.Get(queryKey);

                if (!ReferenceEquals(cachedPart, oldPart))
                    return cachedPart as QueryPart;

                MemoryCache.Set(queryKey, newPart, queryPolicy);
                return newPart;
            }
        }

        private bool IsAlreadyFaulted(QueryPart queryPart)
        {
            if (queryPart is null)
                throw new ArgumentNullException(nameof(queryPart), "Unable to add query part to cache");

            return queryPart.IsFaulted;
        }

        private async Task<List<MapMetricAggregate>> RunQueryPartAsync(MapMetricAnimationQuery query, MapMetricType type, QueryPartProgress progress)
        {
            List<MapMetricAggregate> aggregates = GenerateMapMetricAggregates(query);
            progress.Total = aggregates.Count;

            var aggregateLookup = aggregates.ToDictionary(aggregate => Tuple.Create(aggregate.FrameIndex, aggregate.MeterID));

            void Aggregate(int frameIndex, int meterID, double value)
            {
                var aggregateKey = Tuple.Create(frameIndex, meterID);

                if (!aggregateLookup.TryGetValue(aggregateKey, out MapMetricAggregate aggregate))
                    return;

                if (!aggregate.HasValue)
                    progress.Increment();

                aggregate.Aggregate(value);
            }

            await query.PopulateMapMetricAnimationFramesAsync(type, Aggregate, default);
            return aggregates;
        }

        #endregion

        #endregion

        #region [ Static ]

        // Static Properties
        private static TimeSpan QueryExpiration { get; } = TimeSpan.FromMinutes(5.0D);
        private static TimeSpan QueryPartExpiration { get; } = TimeSpan.FromHours(1.0D);
        private static TimeSpan CacheMonitorExpiration { get; } = TimeSpan.FromMinutes(1.0D);

        #endregion
    }
}