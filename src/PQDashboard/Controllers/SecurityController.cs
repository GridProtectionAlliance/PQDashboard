//******************************************************************************************************
//  SecurityController.cs - Gbtc
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


using System.Web.Mvc;
using GSF.Security.Model;
using GSF.Web.Model;
using GSF.Web.Security;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's security pages.
    /// </summary>
    [AuthorizeControllerRole("Administrator")]
    public class SecurityController : Controller
    {
        #region [ Members ]

        // Fields
        private readonly DataContext m_dataContext;
        private readonly AppModel m_appModel;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="SecurityController"/>.
        /// </summary>
        public SecurityController()
        {
            // Establish data context for the view
            m_dataContext = new DataContext(exceptionHandler: MvcApplication.LogException);
            ViewData.Add("DataContext", m_dataContext);

            // Set default model for pages used by layout
            m_appModel = new AppModel(m_dataContext);
            ViewData.Model = m_appModel;
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="SecurityController"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                        m_dataContext?.Dispose();
                }
                finally
                {
                    m_disposed = true;          // Prevent duplicate dispose.
                    base.Dispose(disposing);    // Call base class Dispose().
                }
            }
        }

        public ActionResult Users()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Security.Users", ViewBag);
            m_dataContext.ConfigureView<UserAccount, SecurityHub>(Url.RequestContext, ViewBag);
            return View();
        }

        public ActionResult Groups()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Security.Groups", ViewBag);
            m_dataContext.ConfigureView<UserAccount, SecurityHub>(Url.RequestContext, ViewBag);
            return View();
        }

        #endregion
    }
}