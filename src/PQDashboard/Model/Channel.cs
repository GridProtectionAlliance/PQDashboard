//******************************************************************************************************
//  Channel.cs - Gbtc
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
//  05/11/2017 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PQDashboard.Model
{
    public class Channel
    {
        public int ID { get; set; }
        public int MeterID { get; set; }
        public int LineID { get; set; }
        public int MeasurementTypeID { get; set; }
        public int MeasurementCharacteristicID { get; set; }
        public int PhaseID { get; set; }
        public string Name { get; set; }
        public float SamplesPerHour { get; set; }
        public double? PerUnitValue { get; set; }
        public int HarmonicGroup { get; set; }
        public string Description { get; set; }
        public bool Enabled { get; set; }
    }
}