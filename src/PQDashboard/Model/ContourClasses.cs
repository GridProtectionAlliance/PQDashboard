//******************************************************************************************************
//  ContourClasses.cs - Gbtc
//
//  Copyright © 2017, Grid Protection Alliance.  All Rights Reserved.
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
//  10/10/2017 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.NumericalAnalysis.Interpolation;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;

namespace PQDashboard.Model
{
    public class TrendingDataLocation
    {
        public int ID;
        public string Name;
        public double Latitude;
        public double Longitude;
        public double? Maximum;
        public double? Minimum;
        public double? Average;
        public List<double?> Data;

        public TrendingDataLocation()
        {
            Data = new List<double?>();
        }

        public void Aggregate(double average)
        {
            m_sum += average;
            m_count++;
        }

        public double? GetAverage()
        {
            return (m_count > 0)
                ? m_sum / m_count
                : (double?)null;
        }

        private double m_sum;
        private int m_count;
    }

    public class ContourQuery
    {
        public string ColorScaleName { get; set; }
        public string Meters { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string DataType { get; set; }
        public string UserName { get; set; }
        public int Resolution { get; set; }
        public int StepSize { get; set; }
        public bool IncludeWeather { get; set; }
        public string MeterIds { get; set; }
        private Lazy<DateTime> m_startDate;
        private Lazy<DateTime> m_endDate;

        public ContourQuery()
        {
            DateTimeStyles styles = DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal;
            m_startDate = new Lazy<DateTime>(() => DateTime.SpecifyKind(DateTime.Parse(StartDate, null, styles), DateTimeKind.Unspecified));
            m_endDate = new Lazy<DateTime>(() => DateTime.SpecifyKind(DateTime.Parse(EndDate, null, styles), DateTimeKind.Unspecified));
            Resolution = -1;
            StepSize = -1;
        }

        public DateTime GetStartDate()
        {
            return m_startDate.Value;
        }

        public DateTime GetEndDate()
        {
            return m_endDate.Value;
        }
    }

    public class ContourAnimationInfo
    {
        public int AnimationID { get; set; }
        public List<ContourInfo> Infos { get; set; }
        public double[] ColorDomain { get; set; }
        public double[] ColorRange { get; set; }
        public double MinLatitude { get; set; }
        public double MaxLatitude { get; set; }
        public double MinLongitude { get; set; }
        public double MaxLongitude { get; set; }
    }

    public class ContourInfo
    {
        public string DateTo { get; set; }
        public string DateFrom { get; set; }
        public List<TrendingDataLocation> Locations { get; set; }
        public string URL { get; set; }
        public string Date { get; set; }
        public double[] ColorDomain { get; set; }
        public double[] ColorRange { get; set; }
    }

    public class ContourTileData
    {
        public ManualResetEvent WaitHandle;

        public double MinLatitude { get; set; }
        public double MaxLatitude { get; set; }
        public double MinLongitude { get; set; }
        public double MaxLongitude { get; set; }

        public IDWFunc IDWFunction { get; set; }
        public Func<double, double> ColorFunction { get; set; }
    }

}