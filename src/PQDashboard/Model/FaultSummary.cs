
//******************************************************************************************************
//  AppModel.cs - Gbtc
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
//  04/13/2017 - JP Hyder
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("FaultSummary")]
    public class FaultSummary
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int EventID { get; set; }
        public string Algorithm { get; set; }
        public int FaultNumber { get; set; }
        public int CalculationCycle { get; set; }
        public float CurrentMagnitude { get; set; }
        public float CurrentLag { get; set; }
        public float PrefaultCurrent { get; set; }
        public float PostfaultCurrent { get; set; }
        public DateTime Inception { get; set; }
        public float DurationSeconds { get; set; }
        public float DurationCycles { get; set; }
        public string FaultType { get; set; }
        public int IsSelectedAlgorithm { get; set; }
        public int IsValid { get; set; }
        public int IsSuppressed { get; set; }
    }

    [TableName("FaultSummary")]
    public class FaultSummaryView
    {
        [PrimaryKey(true)]
        [Searchable]
        public int ID { get; set; }
        [Searchable]
        public int EventID { get; set; }
        public string Algorithm { get; set; }
        public int FaultNumber { get; set; }
        public int CalculationCycle { get; set; }
        public float CurrentMagnitude { get; set; }
        public float CurrentLag { get; set; }
        public float PrefaultCurrent { get; set; }
        public float PostfaultCurrent { get; set; }
        [Searchable]
        public DateTime Inception { get; set; }
        public float DurationSeconds { get; set; }
        public float DurationCycles { get; set; }
        public string FaultType { get; set; }
        public int IsSelectedAlgorithm { get; set; }
        public int IsValid { get; set; }
        public int IsSuppressed { get; set; }
    }

    [TableName("FaultSummaryOverview")]
    public class FaultSummarysForOverview
    {
        public int EventID { get; set; }

        public DateTime StartTime { get; set; }

        public string MeterName { get; set; }

        public string LineName { get; set; }

        public string Description { get; set; }

        public string FaultType { get; set; }

        public float DurationSeconds { get; set; }
    }
}