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
//  04/19/2017 - JP Hyder
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
    [TableName("DisturbanceSeverity")]
    public class DisturbanceSeverity
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int VoltageEnvelopeID { get; set; }
        public int DisturbanceID { get; set; }
        public int SeverityCode { get; set; }
    }

    [TableName("DisturbanceSeverity")]
    public class DisturbanceSeverityView
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public int VoltageEnvelopeID { get; set; }
        public int DisturbanceID { get; set; }
        public int SeverityCode { get; set; }
    }

    [TableName("DisturbanceSeverityOverview")]
    public class DisturbanceSeverityOverviewView { }
}