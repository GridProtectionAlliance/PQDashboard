//******************************************************************************************************
//  LoginController.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  02/26/2023 - J. Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Threading;
using System.Web.Mvc;
using GSF.Web.Security;

namespace PQDashboard.Controllers;

public class LoginController : Controller
{
    [AllowAnonymous]
    public ActionResult Index()
    {
        if (!Startup.OwinLoaded)
            throw new InvalidOperationException("Owin pipeline not loaded. Try running 'update-package Microsoft.Owin.Host.SystemWeb -reinstall' from NuGet Package Manager Console.");

        return View();
    }

    [Route("~/AuthTest")]
    [AuthorizeControllerRole]
    public ActionResult AuthTest()
    {
        return View();
    }

    [Route("~/Logout")]
    [AllowAnonymous]
    public ActionResult Logout()
    {
        return View();
    }

    [Route("~/UserInfo")]
    [AuthorizeControllerRole]
    public ActionResult UserInfo()
    {
        Thread.CurrentPrincipal = ViewBag.SecurityPrincipal = User;
        return View();
    }
}