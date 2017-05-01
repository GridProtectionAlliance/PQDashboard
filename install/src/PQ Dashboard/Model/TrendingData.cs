using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Web;

namespace PQDashboard.Model
{
    public class TrendingDataSet
    {
        public List<TrendingDataPoint> ChannelData;
        public List<TrendingAlarmLimit> AlarmLimits;
        public List<TrendingAlarmLimit> OffNormalLimits;

        public TrendingDataSet()
        {
            ChannelData = new List<TrendingDataPoint>();
            AlarmLimits = new List<TrendingAlarmLimit>();
            OffNormalLimits = new List<TrendingAlarmLimit>();
        }
    }

    public class TrendingDataPoint
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
}