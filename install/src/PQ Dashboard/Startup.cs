//******************************************************************************************************
//  Startup.cs - Gbtc
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
//  08/30/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
using GSF.Web.Model;
using GSF.Web.Security;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(PQDashboard.Startup))]
namespace PQDashboard
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Load security hub in application domain before establishing SignalR hub configuration
            //GlobalHost.DependencyResolver.Register(typeof(SecurityHub), () => new SecurityHub(new DataContext("securityProvider", exceptionHandler: MvcApplication.LogException), MvcApplication.LogStatusMessage, MvcApplication.LogException));

            HubConfiguration hubConfig = new HubConfiguration();

            // Enabled detailed client errors
            hubConfig.EnableDetailedErrors = true;

            // Load ServiceHub SignalR class
            app.MapSignalR(hubConfig);
        }
    }
}
