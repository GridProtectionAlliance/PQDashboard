//******************************************************************************************************
//  ValueList.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  02/21/2016 - J. Ritchie Carroll
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
    /// Model for SOETools.ValueList table.
    /// </summary>
    [PrimaryLabel("Text")]
    public class ValueList
    {
        [PrimaryKey(true)]
        public int ID
        {
            get; set;
        }

        public int GroupID
        {
            get; set;
        }

        [Label("Key (Option Value)")]
        [UseEscapedName]
        public int Key
        {
            get; set;
        }

        [Label("Text (Option Label)")]
        [StringLength(200)]
        public string Text
        {
            get; set;
        }


        [Label("Alternate Text 1")]
        [StringLength(200)]
        public string AltText1
        {
            get; set;
        }

        [Label("Alternate Text 2")]
        [StringLength(200)]
        public string AltText2
        {
            get; set;
        }

        [StringLength(12)]
        public string Abbreviation
        {
            get; set;
        }

        [Label("Numeric Value")]
        public int Value
        {
            get; set;
        }

        public bool Flag
        {
            get; set;
        }

        public string Description
        {
            get; set;
        }

        [Label("Sort Order")]
        public int SortOrder
        {
            get; set;
        }

        public bool Hidden
        {
            get; set;
        }

        public bool IsDefault
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
