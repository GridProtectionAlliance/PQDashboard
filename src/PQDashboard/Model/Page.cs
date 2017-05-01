//******************************************************************************************************
//  Page.cs - Gbtc
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

using System;
using System.ComponentModel.DataAnnotations;
using GSF.Data.Model;
using GSF.ComponentModel.DataAnnotations;

namespace PQDashboard.Model
{
    /// <summary>
    /// Model for SOETools.Page table.
    /// </summary>
    [PrimaryLabel("Name")]
    public class Page
    {
        // This is NOT currently an identity field - if this changes, set to [PrimaryKey(true)]
        [PrimaryKey]
        [Label("Page ID")]
        [RegularExpression("^[1-9][0-9]*$", ErrorMessage = "Value must be greater than zero.")]
        public int ID
        {
            get; set;
        }

        [StringLength(64)]
        public string Name
        {
            get; set;
        }

        [Required]
        [StringLength(64)]
        public string Title
        {
            get; set;
        }

        [Required]
        [Label("Menu")]
        public int MenuID
        {
            get; set;
        }

        [Required]
        [Label("Page Location")]
        public string PageLocation
        {
            get; set;
        }

        [Label("Server-side Configuration Parameters")]
        public string ServerConfiguration
        {
            get; set;
        }

        [Label("Client-side Configuration Parameters")]
        public string ClientConfiguration
        {
            get; set;
        }

        [Label("Included Roles")]
        public string IncludedRoles
        {
            get; set;
        }

        [Label("Excluded Roles")]
        public string ExcludedRoles
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

        public DateTime CreatedOn
        {
            get; set;
        }
    }
}
