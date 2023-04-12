//******************************************************************************************************
//  MainController.cs - Gbtc
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
using GSF.Data;
using GSF.Identity;
using GSF.Web.Model;
using GSF.Web.Security;
using PQDashboard.Model;

namespace PQDashboard.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's main pages.
    /// </summary>
    //[AuthorizeControllerRole]
    public class MainController : Controller
    {
        #region [ Members ]

        // Fields
        private readonly AppModel m_appModel;
        //private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="MainController"/>.
        /// </summary>
        public MainController()
        {
            // Set default model for pages used by layout
            m_appModel = new AppModel();
            ViewData.Model = m_appModel;
        }

        #endregion

        #region [ Methods ]

        [AllowAnonymous]
        public ActionResult Home()
        {
            if (!(User?.Identity?.IsAuthenticated ?? false))
                return RedirectToAction("Index", "Login");

            using DataContext dataContext = new("systemSettings");
            
            m_appModel.ConfigureView(Url.RequestContext, "Home", ViewBag);

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch
            {
                ViewBag.username = "";
            }

            return View();

        }

        public ActionResult OpenSTE()
        {
            return View();
        }

        public ActionResult MeterEventsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            using (DataContext dataContext = new("systemSettings"))
            {

                try
                {
                    ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                    ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                    if (dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                    {
                        ViewBag.username = "External";
                        ViewBag.usersid = "External";
                    }
                }
                catch
                {
                    ViewBag.username = "";
                }
            }
            return View();
        }

        public ActionResult MeterExtensionsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            using (DataContext dataContext = new("systemSettings"))
            {

                try
                {
                    ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                    ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                    if (dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                    {
                        ViewBag.username = "External";
                        ViewBag.usersid = "External";
                    }
                }
                catch
                {
                    ViewBag.username = "";
                }
            }
            return View();
        }

        public ActionResult MeterDisturbancesByLine()
        {
            using DataContext dataContext = new("systemSettings");

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch
            {
                ViewBag.username = "";
            }

            m_appModel.ConfigureView(Url.RequestContext, "MeterDisturbancesByLine", ViewBag);
            return View();
        }

        public ActionResult QuickSearch()
        {
            using DataContext dataContext = new("systemSettings");

            try
            {
                ViewBag.username = System.Web.HttpContext.Current.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);

                if (dataContext.Connection.ExecuteScalar<int>("SELECT COUNT(*) FROM UserAccount WHERE Name = {0}", ViewBag.usersid) == 0)
                {
                    ViewBag.username = "External";
                    ViewBag.usersid = "External";
                }
            }
            catch
            {
                ViewBag.username = "";
            }

            m_appModel.ConfigureView(Url.RequestContext, "QuickSearch", ViewBag);
            return View();
        }
        #endregion

        private bool ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            string userid = UserInfo.UserNameToSID(username);

            using AdoDataConnection connection = new("systemSettings");

            bool isAdmin = connection.ExecuteScalar<int>(@"
					select 
						COUNT(*) 
					from 
						UserAccount JOIN 
						ApplicationRoleUserAccount ON ApplicationRoleUserAccount.UserAccountID = UserAccount.ID JOIN
						ApplicationRole ON ApplicationRoleUserAccount.ApplicationRoleID = ApplicationRole.ID
					WHERE 
						ApplicationRole.Name = 'Administrator' AND UserAccount.Name = {0}
                ", userid) > 0;

            return isAdmin;
        }

    }
}