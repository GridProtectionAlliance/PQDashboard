window.LightningQuery = (function () {
    if (window.LightningQuery)
        return window.LightningQuery;

    var $this = {};

    var _query = null;
    var _queryTask = null;
    var _timeExtent = null;
    var _geometryService = null;
    var _bufferParameters = null;
    var _unwrapFunctions = [];

    function init(urlUtils, query, queryTask, timeExtent, geometryService, bufferParameters) {
        urlUtils.addProxyRule({
            proxyUrl: "http://pq/arcgisproxynew/proxy.ashx",
            urlPrefix: "https://gis.tva.gov/arcgis/rest/services/"
        });

        _query = query;
        _queryTask = queryTask;
        _timeExtent = timeExtent;
        _geometryService = geometryService;
        _bufferParameters = bufferParameters;

        for (var i = 0; i < _unwrapFunctions.length; i++)
            _unwrapFunctions[i]();
    }

    require(["esri/urlUtils", "esri/tasks/query", "esri/tasks/QueryTask", "esri/TimeExtent", "esri/tasks/GeometryService", "esri/tasks/BufferParameters"], init);

    function exportFunction(key, apiFunction) {
        var pendingCalls = [];

        $this[key] = function () {
            pendingCalls.push(arguments);
        };

        _unwrapFunctions.push(function () {
            $this[key] = apiFunction;

            for (var i = 0; i < pendingCalls.length; i++)
                apiFunction(pendingCalls[i]);
        });
    }

    exportFunction("queryLineGeometry", function (lineKey, callback, errCallback) {
        var lineQueryTask = new _queryTask("https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Grid_Restricted_2/MapServer/6");

        var lineQuery = new _query();
        lineQuery.returnGeometry = true;
        lineQuery.outFields = ["LINENAME"];
        lineQuery.where = "UPPER(LINENAME) like '%" + lineKey.toUpperCase() + "%'";

        lineQueryTask.execute(lineQuery, function (results) {
            var totalLine = results.features.map(function (feature) { return feature.geometry; });
            callback(totalLine);
        }, errCallback);
    });

    exportFunction("queryLineBufferGeometry", function (lineGeometry, callback, errCallback) {
        var geometryService = new _geometryService("https://gis.tva.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");

        var bufferParameters = new _bufferParameters();
        bufferParameters.geometries = lineGeometry;
        bufferParameters.unionResults = true;
        bufferParameters.distances = [0.5];
        bufferParameters.unit = _geometryService.UNIT_STATUTE_MILE;

        geometryService.buffer(bufferParameters, function (geometries) {
            callback(geometries[0]);
        }, errCallback);
    });

    exportFunction("queryLightningData", function (lineBufferGeometry, startTime, endTime, callback, errCallback) {
        var vaisalaQueryTask = new _queryTask("https://gis.tva.gov/arcgis/rest/services/EGIS/LightningQuery/MapServer/0");
        var weatherbugQueryTask = new _queryTask("https://gis.tva.gov/arcgis/rest/services/EGIS/LightningQuery/MapServer/1");
        var timeExtent = new _timeExtent(startTime, endTime);

        var lightningQuery = new _query();
        //lightningQuery.returnGeometry = true;
        lightningQuery.outFields = ["DISPLAYTIME", "LATITUDE", "LONGITUDE", "AMPLITUDE"];
        lightningQuery.timeExtent = timeExtent;
        lightningQuery.geometry = lineBufferGeometry;
        lightningQuery.spatialrelationship = _query.SPATIAL_REL_INTERSECTS;

        var provide = (function () {
            var vaisalaData;
            var weatherbugData;

            return function (queryTask, lightningData) {
                if (queryTask === vaisalaQueryTask)
                    vaisalaData = lightningData;
                else if (queryTask === weatherbugQueryTask)
                    weatherbugData = lightningData;

                if (vaisalaData === undefined || weatherbugData === undefined)
                    return;

                callback(vaisalaData.concat(weatherbugData));
            };
        })();

        vaisalaQueryTask.execute(lightningQuery, function (results) {
            var vaisalaData = results.features.map(function (feature) {
                feature.attributes.SERVICE = "Vaisala";
                return feature.attributes;
            });

            provide(vaisalaQueryTask, vaisalaData);
        }, errCallback);

        weatherbugQueryTask.execute(lightningQuery, function (results) {
            var weatherbugData = results.features.map(function (feature) {
                feature.attributes.SERVICE = "WeatherBug";
                return feature.attributes;
            });

            provide(weatherbugQueryTask, weatherbugData);
        }, errCallback);
    });

    return $this;
})();