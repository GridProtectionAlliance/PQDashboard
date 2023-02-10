//******************************************************************************************************
//  ArcGISLayer.cs - Gbtc
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
//  02/10/2023 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

namespace PQDashboard.Model
{
    /// <summary>
    /// Defines a connection to a ArcGIS layer and display properties.
    /// </summary>
    public class ArcGISLayer
    {
        #region [ Properties ]
        /// <summary>
        /// ID of the layer for accessing from the ArcGIS service
        /// </summary>
        public string ID { get; set; }

        /// <summary>
        /// Name of the layer for displaying on PQDashboard
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Image Asociated with the Layer, used for displaying on the map. Relative to /Scripts/Leaflet/images
        /// </summary>
        public string Image { get; set; }
        #endregion
    }
}
