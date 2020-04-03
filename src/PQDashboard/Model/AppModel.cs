//******************************************************************************************************
//  AppModel.cs - Gbtc
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
//  08/31/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Text;
using System.Web.Routing;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using GSF.Web.Model;
using Path = System.Web.VirtualPathUtility;
using PQDashboard;
namespace PQDashboard.Model
{
    /// <summary>
    /// Defines a base application model with convenient global settings and functions.
    /// </summary>
    /// <remarks>
    /// Custom view Model should inherit from AppModel because the "Global" property is used by _Layout.cshtml.
    /// </remarks>
    public class AppModel
    {
        #region [ Members ]

        // Fields

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="AppModel"/>.
        /// </summary>
        public AppModel()
        {
            Global = MvcApplication.DefaultModel != null ? MvcApplication.DefaultModel.Global : new GlobalSettings();
        }

        #endregion

        #region [ Properties ]

        /// <summary>
        /// Gets global settings for application.
        /// </summary>
        public GlobalSettings Global
        {
            get;
        }


        #endregion

        #region [ Methods ]


        /// <summary>
        /// Renders client-side configuration script for paged view model.
        /// </summary>
        /// <typeparam name="TModel">Modeled database table (or view).</typeparam>
        /// <param name="viewBag">ViewBag for the view.</param>
        /// <param name="defaultSortField">Default sort field name, defaults to first primary key field. Prefix field name with a minus, i.e., '-', to default to descending sort.</param>
        /// <param name="parentKeys">Primary keys values of the parent record to load.</param>
        /// <returns>Rendered paged view model configuration script.</returns>
        public string RenderViewModelConfiguration<TModel>(object viewBag, string defaultSortField = null, params object[] parentKeys) where TModel : class, new()
        {
            using (DataContext dataContext = new DataContext("systemSettings")) {
                return dataContext.RenderViewModelConfiguration<TModel, DataHub>(viewBag, defaultSortField, "dataHub", parentKeys);
            }
        }

        /// <summary>
        /// Configures a simple view with common view bag parameters based on page name.
        /// </summary>
        /// <param name="requestContext">Url.RequestContext for view.</param>
        /// <param name="pageName">Page name as defined in Page table.</param>
        /// <param name="viewBag">Current view bag.</param>
        /// <remarks>
        /// This is normally called from controller before returning view action result.
        /// </remarks>
        public void ConfigureView(RequestContext requestContext, string pageName, dynamic viewBag)
        {
            ConfigureView(pageName, viewBag);
        }

        /// <summary>
        /// Configures a view establishing user roles based on page name, modeled table <typeparamref name="TModel"/> and SignalR <see cref="DataHub"/>.
        /// </summary>
        /// <param name="requestContext">Url.RequestContext for view.</param>
        /// <param name="pageName">Page name as defined in Page table.</param>
        /// <param name="viewBag">Current view bag.</param>
        /// <remarks>
        /// This is normally called from controller before returning view action result.
        /// </remarks>
        public void ConfigureView<TModel>(RequestContext requestContext, string pageName, dynamic viewBag) where TModel : class, new()
        {
            ConfigureView(pageName, viewBag);
        }

        // Handles querying page details from Page table
        private void ConfigureView(string pageName, dynamic viewBag)
        {
            viewBag.PageName = pageName;
        }

        public bool IsDebug()
        {
#if DEBUG 
            return true;
#else
            return false;
#endif

        }
        #endregion
    }
}
