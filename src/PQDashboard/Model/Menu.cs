//******************************************************************************************************
//  Menu.cs - Gbtc
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
//  02/23/2016 - J. Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.ComponentModel.DataAnnotations;
using GSF.ComponentModel.DataAnnotations;
using GSF.Data.Model;

namespace PQDashboard.Model
{
    /// <summary>
    /// Model for SOETools.Menu table.
    /// </summary>
    [PrimaryLabel("Name")]
    public class Menu
    {
        // This is NOT currently an identity field - if this changes, set to [PrimaryKey(true)]
        [PrimaryKey]
        [Label("Menu ID")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Value must be greater than or equal zero.")]
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
        [StringLength(12)]
        public string Abbreviation
        {
            get; set;
        }

        public string Description
        {
            get; set;
        }

        public DateTime CreatedOn
        {
            get; set;
        }
    }
}
