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
using openXDA.Model;
using Path = System.Web.VirtualPathUtility;

namespace PQDashboard.Model
{
    /// <summary>
    /// Defines a base application model with convenient global settings and functions.
    /// </summary>
    /// <remarks>
    /// Custom view Model should inherit from AppModel because the "Global" property is used by _Layout.cshtml.
    /// </remarks>
    public class AppModel : IDisposable
    {
        #region [ Members ]

        // Fields
        private DataContext m_securityDataContext;
        private DataContext m_dbDataContext;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="AppModel"/>.
        /// </summary>
        public AppModel()
        {
            Global = MvcApplication.DefaultModel != null ? MvcApplication.DefaultModel.Global : new GlobalSettings();
        }

        /// <summary>
        /// Creates a new <see cref="AppModel"/> with the specified <paramref name="dataContext"/>.
        /// </summary>
        /// <param name="dataContext">Data context to provide to model.</param>
        public AppModel(DataContext dataContext) : this()
        {
            DataContext = dataContext;
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

        /// <summary>
        /// Gets default data context for model.
        /// </summary>
        public DataContext DataContext
        {
            get;
        }

        /// <summary>
        /// Gets security data context for model.
        /// </summary>
        public DataContext SecurityDataContext
        {
            get
            {
                return m_securityDataContext ?? (m_securityDataContext = new DataContext("securityProvider", exceptionHandler: MvcApplication.LogException));
            }
        }

        /// <summary>
        /// Gets db data context for model.
        /// </summary>
        public DataContext DbDataContext
        {
            get
            {
                return m_dbDataContext ?? (m_dbDataContext = new DataContext("thirdDb", exceptionHandler: MvcApplication.LogException));
            }
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases all the resources used by the <see cref="AppModel"/> object.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="AppModel"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                    {
                        m_securityDataContext?.Dispose();
                        m_dbDataContext?.Dispose();
                    }
                }
                finally
                {
                    m_disposed = true;  // Prevent duplicate dispose.
                }
            }
        }


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
            return DataContext.RenderViewModelConfiguration<TModel, DataHub>(viewBag, defaultSortField, "dataHub", parentKeys);
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

        #endregion
    }
}
