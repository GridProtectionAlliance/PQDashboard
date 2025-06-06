﻿using System.Web;
using System.Web.Optimization;

namespace PQDashboard
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {

            bundles.Add(new ScriptBundle("~/Scripts/default").Include(
                "~/Scripts/default.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/others").Include(
                "~/Scripts/site.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/bootstrap").Include(
                "~/Scripts/bootstrap-3.3.2.min.js",
                "~/Scripts/bootstrap-multiselect.js",
                "~/Scripts/bootstrap-fullscreen-select.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/bootstrap-fullscreen-select").Include(
                "~/Scripts/bootstrap-fullscreen-select.js"
            ));



            bundles.Add(new ScriptBundle("~/Scripts/jquery").Include(
                "~/Scripts/jquery-3.3.1.js",
                "~/Scripts/jquery-ui.js",
                "~/Scripts/jquery.blockUI.js",
                "~/Scripts/jquery.sparkline.js",
                "~/Scripts/jstorage.js",
                "~/Scripts/jquery.jspanel-compiled.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/D3/d3").Include(
                "~/Scripts/D3/d3.js",
                "~/Scripts/D3/d3-color.v1.js",
                "~/Scripts/D3/d3-interpolate.v1.js",
                "~/Scripts/D3/d3-scale.v1.js",
                "~/Scripts/D3/d3-shape.v1.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/flot/flot").Include(
                "~/Scripts/flot/jquery.flot.js",
                "~/Scripts/flot/jquery.flot.errorbars.js",
                "~/Scripts/flot/jquery.flot.navigate.js",
                "~/Scripts/flot/jquery.flot.resize.js",
                "~/Scripts/flot/jquery.flot.time.js",
                "~/Scripts/flot/jquery.flot.selection.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/Leaflet/leaflet").Include(
                "~/Scripts/Leaflet/leaflet-src.js",
                "~/Scripts/heatmap.js",
                "~/Scripts/leaflet-heatmap.js",
                "~/Scripts/Leaflet/leaflet-omnivore.min.js",
                "~/Scripts/Leaflet/esri-leaflet.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/PrimeUI/primeui").Include(
                "~/Scripts/PrimeUI/primeui.js"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/random").Include(
                "~/Scripts/moment.js",
                "~/Scripts/daterangepicker.js",
                "~/Scripts/plotly-latest.min.js"
            ));


            bundles.Add(new StyleBundle("~/Content/default").Include(
                "~/Content/Default.css",
                "~/Content/overview.css"
            ));

            bundles.Add(new StyleBundle("~/Content/bootstrap/bootstrap").Include(
                "~/Content/bootstrap/theme.css",
                "~/Content/bootstrap-3.3.2.min.css",
                "~/Content/themes/redmond/jquery-ui.css",
                "~/Content/bootstrap-multiselect.css",
                "~/Content/jquery.jspanel.min.css",
                "~/Content/bootstrap-fullscreen-select.css"
            ));

            bundles.Add(new StyleBundle("~/Content/primeui").Include(
                "~/Content/font-awesome.css",
                "~/Scripts/PrimeUI/themes/flick/theme.css",
                "~/Scripts/PrimeUI/primeui.min.css"
            ));

            bundles.Add(new ScriptBundle("~/Scripts/PQDashboard").Include(
                "~/Scripts/PQdashboard.js"
            ));


            // Code removed for clarity.
#if !DEBUG
            BundleTable.EnableOptimizations = true;
#endif


        }
    }
}
