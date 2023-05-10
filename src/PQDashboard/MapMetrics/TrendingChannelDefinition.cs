//******************************************************************************************************
//  TrendingChannelDefinition.cs - Gbtc
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
using System.Data;
using System.Linq;

namespace PQDashboard.MapMetrics
{
    public class TrendingChannelDefinition
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

        public static TrendingChannelDefinition GetVoltageRMSChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "RMS",
            Phases = new[] { "AN", "BN", "CN", "AB", "BC", "CA" }
        };

        public static TrendingChannelDefinition GetVoltageTHDChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "TotalTHD",
            Phases = new[] { "AN", "BN", "CN" }
        };

        public static TrendingChannelDefinition GetShortTermFlickerChannelDefinition(string aggregateType) => new TrendingChannelDefinition()
        {
            AggregateType = aggregateType,
            MeasurementType = "Voltage",
            MeasurementCharacteristic = "ShortTermFlicker",
            Phases = new[] { "AN", "BN", "CN" }
        };
    }
}