//******************************************************************************************************
//  MeterActivity.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/18/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GSF.Data.Model;
using openXDA.Model;

namespace PQDashboard.Model
{
    public class MeterActivity: Meter
    {
        [PrimaryKey(true)]
        public int Events24Hours { get; set; }
        public int FileGroups24Hours { get; set; }

        public int Events7Days { get; set; }
        public int FileGroups7Days { get; set; }

        public int Events30Days { get; set; }
        public int FileGroups30Days { get; set; }

        public int Events90Days { get; set; }
        public int FileGroups90Days { get; set; }

        public int Events180Days { get; set; }
        public int FileGroups180Days { get; set; }

        public int FirstEventID { get; set; }
    }
}