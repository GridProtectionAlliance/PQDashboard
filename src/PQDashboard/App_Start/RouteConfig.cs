using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace PQDashboard
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("{resource}.asmx/{*pathInfo}");

            routes.MapRoute(
                name: "LoginRoute",
                url: "Login",
                defaults: new { controller = "Login", action = "Index" }
            );

            routes.MapRoute(
                name: "AuthTestRoute",
                url: "AuthTest",
                defaults: new { controller = "Login", action = "AuthTest" }
            );

            routes.MapRoute(
                name: "LogoutRoute",
                url: "Logout",
                defaults: new { controller = "Login", action = "Logout" }
            );

            routes.MapRoute(
                name: "UserInfoRoute",
                url: "UserInfo",
                defaults: new { controller = "Login", action = "UserInfo" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Main", action = "Home", id = UrlParameter.Optional }
            );
        }
    }
}
