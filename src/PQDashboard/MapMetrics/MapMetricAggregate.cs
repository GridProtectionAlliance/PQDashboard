//******************************************************************************************************
//  MapMetricAggregate.cs - Gbtc
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
//  04/25/2023 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

namespace PQDashboard.MapMetrics
{
    public class MapMetricAggregate
    {
        public int FrameIndex { get; }
        public int MeterID { get; }

        public double Maximum { get; private set; } = double.NaN;
        public double Minimum { get; private set; } = double.NaN;
        public double Average => Total / Count;
        public bool HasValue => Count > 0;

        private double Total { get; set; }
        private int Count { get; set; }

        public MapMetricAggregate(int frameIndex, int meterID)
        {
            FrameIndex = frameIndex;
            MeterID = meterID;
        }

        public void Aggregate(double value)
        {
            if (double.IsNaN(value))
                return;
            if (double.IsNaN(Maximum) || value > Maximum)
                Maximum = value;
            if (double.IsNaN(Minimum) || value < Minimum)
                Minimum = value;
            Total += value;
            Count++;
        }

        public void Reset()
        {
            Maximum = double.NaN;
            Minimum = double.NaN;
            Total = 0.0D;
            Count = 0;
        }
    }
}