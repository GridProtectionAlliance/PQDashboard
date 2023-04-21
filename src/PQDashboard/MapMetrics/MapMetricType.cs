//******************************************************************************************************
//  MapMetricType.cs - Gbtc
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

using System.Collections.Generic;
using System;

namespace PQDashboard.MapMetrics
{
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

    public static class MapMetricTypeExtensions
    {
        public static Comparer<double> GetMapMetricComparer(this MapMetricType mapMetricType)
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
    }
}