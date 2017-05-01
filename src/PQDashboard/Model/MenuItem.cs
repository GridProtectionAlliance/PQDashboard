//******************************************************************************************************
//  MenuItem.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  02/17/2016 - J. Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System.ComponentModel.DataAnnotations;
using GSF.Data.Model;
using GSF.ComponentModel.DataAnnotations;

namespace PQDashboard.Model
{
    /// <summary>
    /// Model for SOETools.MenuItem table.
    /// </summary>
    [PrimaryLabel("Text")]
    public class MenuItem
    {
        [PrimaryKey(true)]
        public int ID
        {
            get; set;
        }

        public int MenuID
        {
            get; set;
        }

        public int PageID
        {
            get; set;
        }

        [Required]
        [Label("Image Source")]
        [StringLength(200)]
        public string Image
        {
            get; set;
        }

        [StringLength(200)]
        [Label("Image Alternate Text")]
        public string ImageAlt
        {
            get; set;
        }
        
        [Label("Menu Text")]
        [StringLength(20)]
        public string Text
        {
            get; set;
        }

        [Label("URL")]
        [StringLength(200)]
        public string Link
        {
            get; set;
        }

        [Label("Sort Order")]
        public int SortOrder
        {
            get; set;
        }

        public string Description
        {
            get; set;
        }

        [InitialValueScript("true")]
        public bool Enabled
        {
            get; set;
        }
    }
}
