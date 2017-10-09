using System.Web;
using System.Web.Optimization;

namespace PQDashboard
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
#if DEBUG
            const string min = "";
#else
            const string min = ".min";
#endif

            bundles.Add(new ScriptBundle("~/js.bundle/jquery").Include(
                        $"~/Scripts/jquery-2.2.3{min}.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/jqueryui").Include(
                        $"~/Scripts/jquery-ui{min}.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/jqueryval").Include(
                        $"~/Scripts/jquery.validate{min}.js",
                        $"~/Scripts/jquery.validate.unobtrusive{min}.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/js.bundle/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/js.bundle/bootstrap").Include(
                        $"~/Scripts/bootstrap{min}.js",
                        "~/Scripts/ie10-viewport-bug-workaround.js",
                        "~/Scripts/respond.js",
                        $"~/Scripts/bootstrap-datepicker{min}.js",
                        $"~/Scripts/bootstrap-toolkit{min}.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/fileinput").Include(
                        $"~/Scripts/fileinput{min}.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/primeui").Include(
                        "~/Scripts/plugins-all.js",
                        $"~/Scripts/mustache{min}.js",
                        "~/Scripts/primeui.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/signalR").Include(
                        $"~/Scripts/jquery.signalR-2.2.0{min}.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/gsfwebclient").Include(
                        "~/Scripts/gsf.web.client.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/gsfwebprimeui").Include(
                        "~/Scripts/gsf.web.primeui.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/site").Include(
                        "~/Scripts/Site.js",
                        "~/Scripts/js.cookie.js"));

            bundles.Add(new ScriptBundle("~/js.bundle/knockout").Include(
                        "~/Scripts/knockout-3.4.0.js",
                        "~/Scripts/knockout.mapping-latest.js",
                        $"~/Scripts/knockout.validation{min}.js",
                        $"~/Scripts/ko-reactor{min}.js",
                        "~/Scripts/ko.observableDictionary.js"));

            bundles.Add(new StyleBundle("~/css.bundle/primeui").Include(
                        $"~/Content/font-awesome{min}.css",
                        $"~/Content/primeui.css"));

            bundles.Add(new StyleBundle("~/css.bundle/site").Include(
                        "~/Content/Site.css"));

            bundles.Add(new ScriptBundle("~/Scripts/default").Include(
                    "~/Scripts/default.js"
                ));
        }
    }
}
