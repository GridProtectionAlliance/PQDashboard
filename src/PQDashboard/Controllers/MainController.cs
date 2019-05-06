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


using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Mvc;
using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Identity;
using GSF.Security;
using GSF.Web.Model;
using GSF.Web.Security;
using Newtonsoft.Json.Linq;
using openXDA.Model;
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
        private bool m_disposed;

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


        public ActionResult Home()
        {
            using (DataContext dataContext = new DataContext("systemSettings")) {
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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }

                return View();
            }
        }

        public ActionResult Home2()
        {
            using (DataContext dataContext = new DataContext("systemSettings"))
            {

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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }

                return View();
            }
        }



        public ActionResult Help()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Help", ViewBag);
            return View();
        }

        public ActionResult GraphMeasurements()
        {
            m_appModel.ConfigureView(Url.RequestContext, "GraphMeasurements", ViewBag);
            return View();
        }

        public ActionResult Contact()
        {
            m_appModel.ConfigureView(Url.RequestContext, "Contact", ViewBag);
            ViewBag.Message = "Contacting the Grid Protection Alliance";
            return View();
        }

        public ActionResult DisplayPDF()
        {
            // Using route ID, i.e., /Main/DisplayPDF/{id}, as page name of PDF load
            string routeID = Url.RequestContext.RouteData.Values["id"] as string ?? "UndefinedPageName";
            m_appModel.ConfigureView(Url.RequestContext, routeID, ViewBag);

            return View();
        }

        public ActionResult OpenSEE()
        {
            using (DataContext dataContext = new DataContext("systemSettings"))
            {
                ViewBag.EnableLightningQuery = dataContext.Connection.ExecuteScalar<bool>("SELECT Value FROM Setting WHERE Name = 'OpenSEE.EnableLightningQuery'");

                ViewBag.IsAdmin = ValidateAdminRequest();
                int eventID = int.Parse(Request.QueryString["eventid"]);
                Event evt = dataContext.Table<Event>().QueryRecordWhere("ID = {0}", eventID);
                ViewBag.EventID = eventID;
                ViewBag.EventStartTime = evt.StartTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
                ViewBag.EventEndTime = evt.EndTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
                ViewBag.SamplesPerCycle = evt.SamplesPerCycle;
                ViewBag.Cycles = Math.Floor((evt.EndTime - evt.StartTime).TotalSeconds * 60.0D); 
                return View();
            }
        }

        public ActionResult OpenSTE()
        {
            return View();
        }

        public ActionResult MeterEventsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            using (DataContext dataContext = new DataContext("systemSettings"))
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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }
            }
            return View();
        }

        public ActionResult MeterExtensionsByLine()
        {
            m_appModel.ConfigureView(Url.RequestContext, "MeterEventsByLine", ViewBag);

            using (DataContext dataContext = new DataContext("systemSettings"))
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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }
            }
            return View();
        }

        public ActionResult MeterDisturbancesByLine()
        {
            using (DataContext dataContext = new DataContext("systemSettings"))
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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }

                m_appModel.ConfigureView(Url.RequestContext, "MeterDisturbancesByLine", ViewBag);
                return View();
            }
        }

        public ActionResult QuickSearch()
        {
            using (DataContext dataContext = new DataContext("systemSettings"))
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
                catch (Exception ex)
                {
                    ViewBag.username = "";
                }

                m_appModel.ConfigureView(Url.RequestContext, "QuickSearch", ViewBag);
                return View();
            }
        }
        #endregion

        private bool ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            string userid = UserInfo.UserNameToSID(username);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
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

                if (isAdmin) return true;
                else return false;
            }

            //string username = User.Identity.Name;
            //ISecurityProvider securityProvider = SecurityProviderUtility.CreateProvider(username);
            //securityProvider.PassthroughPrincipal = User;

            //if (!securityProvider.Authenticate())
            //    return false;

            //SecurityIdentity approverIdentity = new SecurityIdentity(securityProvider);
            //SecurityPrincipal approverPrincipal = new SecurityPrincipal(approverIdentity);

            //if (!approverPrincipal.IsInRole("Administrator"))
            //    return false;

            //return true;
        }

    }
}