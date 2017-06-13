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
//  04/21/2017 - JP Hyder
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
    [TableName("FileGroup")]
    public class FileGroup
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public DateTime DataStartTime { get; set; }
        public DateTime DataEndTime { get; set; }
        public DateTime ProcessingStartTime { get; set; }
        public DateTime ProcessingEndTime { get; set; }
        public int Error { get; set; }
    }

    public class FileGroupView
    {
        [PrimaryKey(true)]
        [Searchable]
        public int ID { get; set; }
        [Searchable]
        public DateTime DataStartTime { get; set; }
        public DateTime DataEndTime { get; set; }
        public DateTime ProcessingStartTime { get; set; }
        public DateTime ProcessingEndTime { get; set; }
        public int Error { get; set; }
    }

    [TableName("FileGroupOverview")]
    public class FileGroupsForOverview : FileGroupView
    {
        public string FilePath { get; set; }
    }
}