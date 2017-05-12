//******************************************************************************************************
//  AlarmRangeLimit.cs - Gbtc
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

using GSF.Data.Model;

namespace PQDashboard.Model
{
    [TableName("AlarmRangeLimit")]
    public class AlarmRangeLimit
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int ChannelID { get; set; }
        public int AlarmTypeID { get; set; }
        public int Severity { get; set; }
        public double? High { get; set; }
        public double? Low { get; set; }
        public int RangeInclusive { get; set; }
        public int PerUnit { get; set; }
        public int Enabled { get; set; }
        public bool IsDefault { get; set; }

    }

    [TableName("DefaultAlarmRangeLimit")]
    public class DefaultAlarmRangeLimit
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int MeasurementTypeID { get; set; }
        public int MeasurementCharacteristicID { get; set; }
        public int AlarmTypeID { get; set; }
        public int Severity { get; set; }
        public double? High { get; set; }
        public double? Low { get; set; }
        public int RangeInclusive { get; set; }
        public int PerUnit { get; set; }
    }

}