//******************************************************************************************************
//  Default.js - Gbtc
//
//==================================================================
//  Copyright © 2014 Electric Power Research Institute, Inc. 
//  The embodiments of this Program and supporting materials may be ordered from:
//                Electric Power Software Center (EPSC)
//                9625 Research Drive
//                Charlotte, NC 28262 USAd
//                Phone: 1-800-313-3774
//                Email: askepri@epri.com
//  THIS NOTICE MAY NOT BE REMOVED FROM THE PROGRAM BY ANY USER THEREOF.
//==================================================================
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  07/15/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************
//Weather Underground API Key 598829512645b690
//////////////////////////////////////////////////////////////////////////////////////////////
// Global


var globalcolors = ['#ff0000', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];

var globalcolorsEvents = ['#C00000', '#FF2800', '#FF9600', '#FFFF00', '#00FFF4', '#0000FF'];
var globalcolorsDQ = ['#00FFF4', '#00C80E', '#FFFF00', '#FF9600', '#FF2800', '#FF0EF0', '#0000FF'];

    var javascriptversion = "13";

    var usersettings = {
        lastSetting: {},
        uisettings: []
    };

    var applicationsettings = {};

    var cache_Meters = null;

    var cache_Map_Matrix_Data = null;
    var cache_Map_Matrix_Data_Date_From = null;
    var cache_Map_Matrix_Data_Date_To = null;

    var currentTab = null;

    var calendardatesEvents = [];
    var calendartipsEvents = [];

    var calendardatesTrending = [];
    var calendartipsTrending = [];

    var calendardatesBreakers = [];
    var calendartipsBreakers = [];

    var loadingPanel = null;

    var datafromdate = new Date();
    var datatodate = new Date();

    var contextfromdate = new Date();
    var contexttodate = new Date();

    var zoomdatefrom = null;
    var zoomdateto = null;

    var selectiontimeout = null;
    var timeout = null;
    var lastselectedindex = 0;

    var heatmap_Cache_Date_From;
    var heatmap_Cache_Date_To;
    var heatmapCache = new Array();

    var postedUserName = "";

//////////////////////////////////////////////////////////////////////////////////////////////

    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

//////////////////////////////////////////////////////////////////////////////////////////////

    function loadDataForDateClick() {
        $("#staticPeriod")[0].value = "Custom";
        loadDataForDate();
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function setMapHeaderDate(datefrom, dateto) {

        if (datefrom == dateto) {
            $("#mapHeader" + currentTab + "From").hide();
            $("#mapHeader" + currentTab + "Divider").hide();
        } else {
            $("#mapHeader" + currentTab + "From").show();
            $("#mapHeader" + currentTab + "Divider").show();
        }
        
        $("#mapHeader" + currentTab + "From")[0].innerHTML = datefrom;
        $("#mapHeader" + currentTab + "To")[0].innerHTML = dateto;
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function getMapHeaderDate(whichdate) {
        return ($("#mapHeader" + currentTab + whichdate)[0].innerHTML);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function loadDataForDate() {


        if (currentTab != null) {
            if (typeof ($('#Overview' + currentTab).highcharts()) != 'undefined') {
                $('#Overview' + currentTab).highcharts().options.chartdatefrom = "";
                $('#Overview' + currentTab).highcharts().options.chartdateto = "";
                $('#Overview' + currentTab).highcharts().options.contextfromdate = "";
                $('#Overview' + currentTab).highcharts().options.contexttodate = "";
                contextfromdate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerFrom').datepicker('getDate')));
                contexttodate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerTo').datepicker('getDate')));
            }

            setMapHeaderDate("", "");

            resetAnimatedHeatmap();
            selectsitesincharts();
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function selectmapgrid(thecontrol) {
    if (thecontrol.selectedIndex > 0) {
        $("#theMatrix" + currentTab).show();
        $("#theMap" + currentTab).hide();
        if (cache_Map_Matrix_Data != null) {
            plotGridLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);  
        }
        $.sparkline_display_visible();
        updateGridWithSelectedSites();
    } else {
        $("#theMap" + currentTab).show();
        $("#theMatrix" + currentTab).hide();
        var map = getMapInstance(currentTab);
        if (map == null) {
            createMap(currentTab);
        } else {
            google.maps.event.trigger(map, 'resize');
            selectsitesonmap();
            $.sparkline_display_visible();
            showSiteSet($("#selectSiteSet" + currentTab)[0]);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function renderMap() {
    if (cache_Map_Matrix_Data != null) {
        plotMapLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);
    }
    $.sparkline_display_visible();
    
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function GetAllSitesIDs() {

    var returnValue = "";

    $.each(cache_Map_Matrix_Data.d, function (key, value) {
        returnValue += value.id + ",";
    });

    return (returnValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function GetCurrentlySelectedSites() {
    return ($('#siteList').multiselect("getChecked").map(function() {
        return this.title + "|" + this.value;
    }).get());
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectsitesonmap(focussite) {
    var themarkers = [];
    var selectedIDs = null;

    if (focussite == null) {
        selectedIDs = GetCurrentlySelectedSites();
    } else {
        selectedIDs = focussite;
    }

    if (selectedIDs == null) return;
    if (selectedIDs.length == 0) return;

    var map = getMapInstance(currentTab);

    if ($('#mapGrid')[0].value == "Map") {

        $.each(map.markers, (function(key, value) {
            var theindex = $.inArray(map.markers[key].args.marker_name + "|" + map.markers[key].args.marker_id, selectedIDs);
            if (theindex > -1) {
                themarkers.push(value);
            }
        }));

        if (themarkers.length == 1) {

            map.setCenter(themarkers[0].latlng);

            //setTimeout(function() {
            //    $("#" + themarkers[0].div.id).fadeOut(100).fadeIn(150).fadeOut(200).fadeIn(250).fadeOut(300).fadeIn(350).fadeOut(400).fadeIn(450);
            //}, 1000);

        } else if (themarkers.length > 1) {

            var markerBounds = new google.maps.LatLngBounds();

            $.each(themarkers, function(key, value) {

                //setTimeout(function () {
                //    $("#" + value.args.div_id).fadeOut(100).fadeIn(150).fadeOut(200).fadeIn(250).fadeOut(300).fadeIn(350).fadeOut(400).fadeIn(450);
                //}, 1000);

                var latLong = new google.maps.LatLng(value.latlng.lat(), value.latlng.lng(), false);
                markerBounds.extend(latLong);
            });

            map.fitBounds(markerBounds);
            map.setCenter(markerBounds.getCenter());
        }

        if ($("#selectSiteSet" + currentTab).length > 0) {
            showSiteSet($("#selectSiteSet" + currentTab)[0]);
        }

        if ($("#selectHeatmap" + currentTab).length > 0) {
            showHeatmap($("#selectHeatmap" + currentTab)[0]);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectsitesincharts() {

    selectiontimeout = null;

    var selectedIDs = GetCurrentlySelectedSites();

    var sitename = selectedIDs.length + " of " + $('#siteList')[0].length + " selected";
    var thesiteidlist = "";

    if (selectedIDs.length > 0) {

        var thedetails = selectedIDs[0].split('|');

        if (selectedIDs.length == 1) {
            sitename = thedetails[0];
        }

        $.each(selectedIDs, function(key, value) {
            thedetails = value.split('|');
            thesiteidlist += thedetails[1] + ",";
        });
    }
    ManageLocationClick(sitename, thesiteidlist);  
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateLocationDropdownWithSelection( ax, ay, bx, by ) {
            
    var thedatasent = "{'ax':'" + ax + "', 'ay':'" + ay + "', 'bx':'" + bx + "', 'by':'" + by + "', 'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: './mapService.asmx/getMeterIDsForArea',
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            $('#siteList').val(data.d);
            $('#siteList').multiselect("refresh");
            selectsitesonmap();
            selectsitesincharts();
            showSiteSet($("#selectSiteSet" + currentTab)[0]);
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

var columnsrenderer = function (value) { return '<div style="text-align: center; margin-top: 5px;">' + value + '</div>'; };

//////////////////////////////////////////////////////////////////////////////////////////////

function populateFaultsDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "','targetDate':'" + theDate + "','userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                        { name: 'thesite' },
                        { name: 'themeterid' },
                        { name: 'thelineid' },
                        { name: 'theeventid' },
                        { name: 'theinceptiontime' },
                        { name: 'thelinename' },
                        { name: 'voltage' },
                        { name: 'thefaulttype' },
                        { name: 'thecurrentdistance' },
                        { name: 'locationname' }
                        ]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                            { text: 'thesite', datafield: 'thesite', renderer: columnsrenderer },
                            { text: 'MID', datafield: 'themeterid', renderer: columnsrenderer },
                            { text: 'LID', datafield: 'thelineid', renderer: columnsrenderer },
                            { text: 'EID', datafield: 'theeventid', renderer: columnsrenderer },
                            { text: 'Start Time', datafield: 'theinceptiontime', width: 130, renderer: columnsrenderer },
                            { text: 'Line', datafield: 'thelinename', renderer: columnsrenderer },
                            { text: 'kV', datafield: 'voltage', width: 50, renderer: columnsrenderer },
                            { text: 'Type', datafield: 'thefaulttype', width: 40, renderer: columnsrenderer },
                            { text: 'Miles', datafield: 'thecurrentdistance', width: 50, cellsalign: 'right', renderer: columnsrenderer },
                            { text: 'Location', datafield: 'locationname', width: 150, renderer: columnsrenderer },
                            { text: ' ', cellsrenderer: makeOpenSeeStackButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' },
                            { text: ' ', cellsrenderer: makeFaultSpecificsButton_html, dataField: 'FaultSpecifics', width: 40, padding: 0, cellsalign: 'left' }
                            ]
            });


            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);

            $('#DetailFaults').jqxGrid('hidecolumn', 'thesite');
            $('#DetailFaults').jqxGrid('hidecolumn', 'themeterid');
            $('#DetailFaults').jqxGrid('hidecolumn', 'thelineid');
            $('#DetailFaults').jqxGrid('hidecolumn', 'theeventid');

            var datarow = $('#DetailFaults').jqxGrid('getrowdata', 0);

            $("#faultsDetailHeader")[0].innerHTML = theDate;

            if (typeof (datarow) != "undefined") {
                $('#DetailFaults').jqxGrid('selectrow', 0);
            }
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateCorrectnessDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "','userName':'" + postedUserName + "'   }";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                                   { name: 'theeventid' },
                                   { name: 'themeterid' },
                                   { name: 'thesite' },
                                   { name: 'Latched', type: 'float' },
                                   { name: 'Unreasonable', type: 'float' },
                                   { name: 'Noncongruent', type: 'float' }]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                            { text: 'EventID', datafield: 'theeventid' },
                            { text: 'MeterID', datafield: 'themeterid' },
                            { text: 'Name', datafield: 'thesite' },
                            { text: 'Latched', datafield: 'Latched', cellsformat: 'p0', type: 'float', width: 110, cellsalign: 'right' },
                            { text: 'Unreasonable', datafield: 'Unreasonable', cellsformat: 'p0', type: 'float', width: 110, cellsalign: 'right' },
                            { text: 'NonCongruent', datafield: 'Noncongruent', cellsformat: 'p0', type: 'float', width: 110, cellsalign: 'right' },
                            { text: '  ', cellsrenderer: makeChannelDataQualityButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' }

                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);

            $('#' + thediv).jqxGrid('hidecolumn', 'theeventid');
            $('#' + thediv).jqxGrid('hidecolumn', 'themeterid');

            var datarow = $('#DetailEvents').jqxGrid('getrowdata', 0);

            $("#CorrectnessDetailHeader")[0].innerHTML = theDate;

            if (typeof (datarow) != "undefined") {
                $('#DetailEvents').jqxGrid('selectrow', 0);
            }


        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateCompletenessDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "','userName':'" + postedUserName + "'   }";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                        { name: 'theeventid' },
                        { name: 'themeterid' },
                        { name: 'thesite' },
                        { name: 'Expected', type: 'float' },
                        { name: 'Received', type: 'float' },
                        { name: 'Duplicate', type: 'float' },
                        { name: 'Completeness', type: 'float' }]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                            { text: 'EventID', datafield: 'theeventid' },
                            { text: 'MeterID', datafield: 'themeterid' },
                            { text: 'Name', datafield: 'thesite' },
                            { text: 'Expected', datafield: 'Expected', type: 'float', width: 100, cellsalign: 'right' },
                            { text: 'Received', datafield: 'Received', type: 'float', cellsformat: 'p0', width: 100, cellsalign: 'right' },
                            { text: 'Duplicate', datafield: 'Duplicate', type: 'float', cellsformat: 'p0', width: 100, cellsalign: 'right' },
                            { text: 'Complete', datafield: 'Completeness', type: 'float', cellsformat: 'p0', width: 100, cellsalign: 'right' },
                            { text: '  ', cellsrenderer: makeChannelCompletenessButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' }
                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);

            $('#' + thediv).jqxGrid('hidecolumn', 'theeventid');
            $('#' + thediv).jqxGrid('hidecolumn', 'themeterid');

            var datarow = $('#DetailEvents').jqxGrid('getrowdata', 0);

            $("#CompletenessDetailHeader")[0].innerHTML = theDate;

            if (typeof (datarow) != "undefined") {
                $('#DetailEvents').jqxGrid('selectrow', 0);
            }
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateEventsDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "','userName':'" + postedUserName + "'   }";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                                   { name: 'theeventid' },
                                   { name: 'themeterid' },
                                   { name: 'thesite' },
                                   { name: 'interruptions', type: 'float' },
                                   { name: 'faults', type: 'float' },
                                   { name: 'sags', type: 'float' },
                                   { name: 'swells', type: 'float' },
                                   { name: 'others', type: 'float' }]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                            { text: 'EventID', datafield: 'theeventid' },
                            { text: 'MeterID', datafield: 'themeterid' },
                            { text: 'Name', datafield: 'thesite' },
                            { text: 'Interruptions', datafield: 'interruptions', type: 'float', width: 90, cellsalign: 'right' },
                            { text: 'Faults', datafield: 'faults', type: 'float', width: 80, cellsalign: 'right' },
                            { text: 'Sags', datafield: 'sags', type: 'float', width: 80, cellsalign: 'right' },
                            { text: 'Swells', datafield: 'swells', type: 'float', width: 80, cellsalign: 'right' },
                            { text: 'Others', datafield: 'others', type: 'float', width: 80, cellsalign: 'right' },
                            { text: ' ', cellsrenderer: makeMeterEventsByLineButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' }
                            ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);

            $('#' + thediv).jqxGrid('hidecolumn', 'theeventid');
            $('#' + thediv).jqxGrid('hidecolumn', 'themeterid');

            var datarow = $('#DetailEvents').jqxGrid('getrowdata', 0);

            $("#eventsDetailHeader")[0].innerHTML = theDate;

            if (typeof (datarow) != "undefined") {
                $('#DetailEvents').jqxGrid('selectrow', 0);
            }
        }
    });
}


//////////////////////////////////////////////////////////////////////////////////////////////

function populateBreakersDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "','userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                                    { name: 'meterid' },
                                    { name: 'theeventid' },
                                    { name: 'eventtype' },
                                    { name: 'energized' },
                                    { name: 'breakernumber' },
                                    { name: 'linename' },
                                    { name: 'phasename' },
                                    { name: 'timing' },
                                    { name: 'speed' },
                                    { name: 'operationtype' }
                                ]
                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                            { text: 'EventID', datafield: 'theeventid' },
                            { text: 'MeterID', datafield: 'meterid' },
                            { text: 'EventType', datafield: 'eventtype' },
                            { text: 'TCE Time', datafield: 'energized', width: 140 },
                            { text: 'Breaker', datafield: 'breakernumber', width: 70 },
                            { text: 'Line', datafield: 'linename' },
                            { text: 'Phase', datafield: 'phasename', width: 60 },
                            { text: 'Timing', datafield: 'timing', cellsalign: 'right', width: 80 },
                            { text: 'Speed', datafield: 'speed', cellsalign: 'right', width: 50 },
                            { text: 'Operation', datafield: 'operationtype', width: 100 },
                            { text: '  ', cellsrenderer: makeOpenSeeStackButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' },
                            { text: '  ', cellsrenderer: filterMakeFaultSpecificsButton_html, dataField: 'OpenSeeByDate', width: 40 }
                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);
            $('#' + thediv).jqxGrid('hidecolumn', 'theeventid');
            $('#' + thediv).jqxGrid('hidecolumn', 'eventtype');
            $('#' + thediv).jqxGrid('hidecolumn', 'meterid');

            var datarow = $('#' + thediv).jqxGrid('getrowdata', 0);

            $("#breakersDetailHeader")[0].innerHTML = theDate;

            if (typeof (datarow) != "undefined") {
                $('#' + thediv).jqxGrid('selectrow', 0);
            }
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function filterMakeFaultSpecificsButton_html(id) {
    var return_html = "";

    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);

    if (datarow.eventtype == "Fault") {
        return_html = makeFaultSpecificsButton_html(id);
    }

    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeFaultSpecificsButton_html(id) {
    var return_html = "";

    return_html += '<div style="width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';

    return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open Fault Detail Window">';

    return_html += '<img src="images/faultDetailButton.png" /></button></div>';

return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToFaultSpecifics(id) {

    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);

    var popup = window.open("FaultSpecifics.aspx?eventid=" + datarow.theeventid, id + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSeeStackButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSeeStack(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSTEButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSTE(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSTE Trending Viewer">';
    return_html += '<img src="images/steButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSTE(id) {
    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);
    var popup = window.open("openSTE.aspx?channelid=" 
        + encodeURIComponent(datarow.channelid) 
        + "&date=" + encodeURIComponent(datarow.date)
        + "&meterid=" + encodeURIComponent(datarow.meterid)
        + "&measurementtype=" + encodeURIComponent(datarow.measurementtype)
        + "&characteristic=" + encodeURIComponent(datarow.characteristic)
        + "&phasename=" + encodeURIComponent(datarow.phasename)
        , id + "openSTE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSeeStack(id) {
    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);
    var url = "openSeeStack.aspx?eventid=" + datarow.theeventid;

    if (currentTab == "Breakers")
        url += "&breakerdigitals=1";

    var popup = window.open(url, id + "openSeeStack", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeChannelDataQualityButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataQuality(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dqDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeChannelCompletenessButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataCompleteness(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dcDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeMeterEventsByLineButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToMeterEventsByLine(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">';
    return_html += '<img src="images/eventDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToMeterEventsByLine(id) {
    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);
    var popup = window.open("MeterEventsByLine.aspx?eventid=" + datarow.theeventid, id + "MeterEventsByLine", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToChannelDataQuality(id) {
    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);
    var popup = window.open("ChannelDataQuality.aspx?eventid=" + datarow.theeventid, id + "ChannelDataQuality", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToChannelDataCompleteness(id) {
    var datarow = $('#Detail' + currentTab).jqxGrid('getrowdata', id);
    var popup = window.open("ChannelDataCompleteness.aspx?eventid=" + datarow.theeventid, id + "ChannelDataCompleteness", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateTrendingDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "', 'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        date: theDate,
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            $('#' + thediv).jqxGrid(
            {
                //date: theDate,
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',


                    datafields: [
                        { name: 'meterid', type: 'float' },
                        { name: 'channelid', type: 'float' },
                        { name: 'sitename' },
                        { name: 'eventtype' },
                        { name: 'characteristic' },
                        { name: 'measurementtype' },
                        { name: 'phasename' },
                        { name: 'eventcount', type: 'float' },
                        { name: 'date'}
                    ]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                    { text: 'MeterID', datafield: 'meterid', type: 'float' },
                    { text: 'ChannelID', datafield: 'channelid', type: 'float'},
                    { text: 'Name', datafield: 'sitename' },
                    { text: 'Event', datafield: 'eventtype', width: '10%' },
                    { text: 'Type', datafield: 'measurementtype', width: '10%' },
                    { text: 'Characteristic', datafield: 'characteristic', width: '18%' },
                    { text: 'Phase', datafield: 'phasename', width: '14%' },
                    { text: 'Count', datafield: 'eventcount', type: 'float', width: '10%', cellsalign: 'right' },
                    { text: '  ', cellsrenderer: makeOpenSTEButton_html, dataField: 'OpenSTE', width: 40, padding: 0, cellsalign: 'left' },
                    { text: '  ', datafield: 'date' }
                    ]

            });

            $('#' + thediv).jqxGrid('hidecolumn', 'meterid');
            $('#' + thediv).jqxGrid('hidecolumn', 'channelid');
            $('#' + thediv).jqxGrid('hidecolumn', 'date');

            var datarow = $('#DetailTrending').jqxGrid('getrowdata', 0);

            if (typeof (datarow) != "undefined") {
                $('#DetailTrending').jqxGrid('selectrow', 0);
                //PopulateTrendingWaveformDropdowns(datarow, theDate);
            } else {
                // Nothing to show.
                $('#Waveform' + currentTab).empty();
            }

            $("#trendingDetailHeader")[0].innerHTML = theDate;
            //$("#trendingWaveformHeader")[0].innerHTML = theDate;
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////
function getColorsForTab(thetab) {
    
    switch(thetab) {
    
        case "Events":
            return(globalcolorsEvents);
            break;

        case "Trending":
            return(globalcolors);
            break;

        case "Faults":
            return(globalcolors);
            break;

        case "Breakers":
            return(globalcolors);
            break;

        case "Completeness":
            return (globalcolorsDQ);
            break;

        case "Correctness":
            return (globalcolorsDQ);
            break;

        default :
            return (globalcolors);

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateDivWithBarChart(thedatasource, thediv, siteName, siteID, thedatefrom, thedateto) {

    var thestartdateX = new Date(thedatefrom);
    thestartdateX.setHours(0, 0, 0, 0);

    var contextfromdateX = new Date(contextfromdate);
    contextfromdateX.setHours(0, 0, 0, 0);

    var contexttodateX = new Date(contexttodate);
    contexttodateX.setHours(0, 0, 0, 0);

    var thestartdate = new Date(Date.UTC(thestartdateX.getUTCFullYear(), thestartdateX.getUTCMonth(), thestartdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contextfromdateUTC = new Date(Date.UTC(contextfromdateX.getUTCFullYear(), contextfromdateX.getUTCMonth(), contextfromdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contexttodateUTC = new Date(Date.UTC(contexttodateX.getUTCFullYear(), contexttodateX.getUTCMonth(), contexttodateX.getUTCDate(), 0, 0, 0)).getTime();
    var YaxisLabel = "";


    switch (currentTab) {
        case "Faults":
            YaxisLabel = "Faults";
            break;

        case "Events":
            YaxisLabel = "Events";
            break;

        case "Trending":
            YaxisLabel = "Trending";
            break;

        case "Breakers":
            YaxisLabel = "Breakers";
            break;

        case "Completeness":
            YaxisLabel = "Sites";
            break;

        case "Correctness":
            YaxisLabel = "Sites";
            break;
    }

    var options = {
        toolbar: {},
        chartdatefrom: thedatefrom,
        chartdateto: thedateto,
        contextfromdate: contextfromdateUTC,
        contexttodate: contexttodateUTC,
        colors: getColorsForTab(currentTab),
        chart: {
            panning: true,
            panKey: 'shift',
            zoomType: 'x',
            type: 'column',
            renderTo: thediv,
            reflow: true
        },
        credits: {
            enabled: false
        },
        title: {
            text: currentTab + ' for: ' + siteName
        },
        xAxis: {
            type: 'datetime',
            minTickInterval: 24 * 3600 * 1000,
            minRange: 24 * 3600000,
            dateTimeLabelFormats: {
                day: '%b %e',
                week: '%b %e'
            },
            //startOnTick: true,
            //endOnTick: true,
            maxPadding: 0,
            events: {
                afterSetExtremes: function (event) {

                    var from = getFormattedDate(new Date(event.min + ( 24 * 60 * 60 * 1000)));
                    var to = getFormattedDate(new Date(event.max + (13 * 60 * 60 * 1000)));

                    contextfromdate = from;
                    contexttodate = to;

                    $('#Detail' + currentTab).jqxGrid( 'clear');

                    if (getMapHeaderDate("From") != contextfromdate && getMapHeaderDate("To") != contexttodate) {
                        manageTabsByDate(currentTab, from, to);
                    }

                    if (this.chart.options.chartdateto == to) {
                        switch (currentTab) {
                            case "Faults":
                                populateFaultsDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;

                            case "Events":
                                populateEventsDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;

                            case "Trending":
                                populateTrendingDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;

                            case "Breakers":
                                populateBreakersDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;

                            case "Completeness":
                                populateCompletenessDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;

                            case "Correctness":
                                populateCorrectnessDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, to);
                                break;
                        }
                    }
                },
            },

            labels: {
                style: {
                    fontSize: '8px'
                },
                rotation: -45,
                enabled: true
            }
        },
        yAxis: {
            title: {
                text: YaxisLabel
            },
            stackLabels: {
                enabled: false,
                style: {
                    fontsize: '.3em',
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            y: 50,
            symbolwidth: 8,
            symbolPadding: 1,
            padding: 3,
            itemMarginTop: 5,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },

        tooltip: {
            headerFormat: '<span style="font-size:12px"><center>{point.key}</center></span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },

        plotOptions: {
            column: {

                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black, 0 0 3px black'
                    }
                }
            },

            series: {
                pointInterval: 24 * 3600 * 1000,
                pointStart: thestartdate,
                animation: false,
                //pointRange: 1,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            var thedate = getFormattedDate(new Date(this.category + (new Date(this.category).getTimezoneOffset() * 60 * 1000)));

                            contextfromdate = thedate;
                            contexttodate = thedate;
 
                            manageTabsByDate(currentTab, thedate, thedate);

                            switch (currentTab) {
                                case "Faults":
                                    populateFaultsDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;

                                case "Events":
                                    populateEventsDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;

                                case "Trending":
                                    populateTrendingDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;

                                case "Breakers":
                                    populateBreakersDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;

                                case "Completeness":
                                    populateCompletenessDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;

                                case "Correctness":
                                    populateCorrectnessDivWithGrid('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
                                    break;
                            }
                        }
                    }
                }
            }
        }
    };

    var thedatasent = "";

    thedatasent = "{'siteID':'" + siteID + "', 'targetDateFrom':'" + thedatefrom + "', 'targetDateTo':'" + thedateto + "' , 'userName':'" + postedUserName + "'}";

        var chart = new Highcharts.Chart(options);
        chart.showLoading('Loading, please wait...');

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            options.series = data.d.data;

            chart.hideLoading();

            chart = new Highcharts.Chart(options);

            chart.xAxis[0].setExtremes(options.contextfromdate, options.contexttodate);

            if ((options.contextfromdate != chart.xAxis[0].dataMin) && (options.contexttodate != chart.xAxis[0].dataMax)) {

                chart.showResetZoom();

                if (options.contextfromdate == options.contexttodate) {
                    $.each(chart.series[0].data, function(key, value) {
                        if ( options.contextfromdate - value.x  < 24 * 3600 * 1000) {
                            chart.series[0].data[key].firePointEvent('click');
                            return (false);
                        }
                    });
                }
            }

            chart.exportSVGElements[0].toFront();
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });

}

//////////////////////////////////////////////////////////////////////////////////////////////

function getEventsHeatmapSwell(currentTab, datefrom, dateto) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "'}";
    var url = "./mapService.asmx/getLocationsHeatmapSwell";

    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;

    $.ajax({
        datefrom: datefrom,
        dateto: dateto,
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            heatmap_Cache_Date_From = datefrom;
            heatmap_Cache_Date_To = dateto;
            heatmapCache = data.d;
            var map = getMapInstance(currentTab);
            LoadHeatmapData(data.d, map);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getEventsHeatmapSags(currentTab, datefrom, dateto) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "'}";
    var url = "./mapService.asmx/getLocationsHeatmapSags";

    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;

    $.ajax({
        datefrom: datefrom,
        dateto: dateto,
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            heatmap_Cache_Date_From = datefrom;
            heatmap_Cache_Date_To = dateto;
            heatmapCache = data.d;
            var map = getMapInstance(currentTab);
            LoadHeatmapData(data.d, map);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getEventsHeatmapCounts(currentTab, datefrom, dateto) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "'}";
    var url = "./mapService.asmx/getLocations" + currentTab;

    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;

    $.ajax({
        datefrom: datefrom,
        dateto: dateto,
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            var map = getMapInstance(currentTab);
            LoadHeatmapData(data.d, map);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getLocationsAndPopulateMapAndMatrix(currentTab, datefrom, dateto) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "'}";
    var url = "./mapService.asmx/getLocations" + currentTab;

    //console.log("getLocationsAndPopulateMapAndMatrix");

    cache_Map_Matrix_Data = null;
    cache_Map_Matrix_Data_Date_From = null;
    cache_Map_Matrix_Data_Date_To = null;

    setMapHeaderDate(datefrom, dateto);

    // Jeff Walker
    $.ajax({
        datefrom: datefrom,
        dateto: dateto,
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            cache_Map_Matrix_Data_Date_From = this.datefrom;
            cache_Map_Matrix_Data_Date_To = this.dateto;
            cache_Map_Matrix_Data = data;

            // Plot Map or Plot Matrix
            switch ($('#mapGrid')[0].value) {
                case "Map":
                    plotMapLocations(data, currentTab, this.datefrom, this.dateto);
                    break;
                case "Grid":
                    plotGridLocations(data, currentTab, this.datefrom, this.dateto);
                    break;
            }
           
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getSitesStatus(siteID, thedatefrom, thedateto) {

    var datefrom = $.datepicker.formatDate("mm/dd/yy", new Date(thedatefrom));
    var dateto = $.datepicker.formatDate("mm/dd/yy", new Date(thedateto));
    var thedatasent = "{'siteID':'" + siteID + "', 'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "','userName':'" + postedUserName + "' }";
    var datasource = './eventService.asmx/getSitesStatus' + currentTab;

    $.ajax({
        type: "POST",
        url: datasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            switch ($('#mapGrid')[0].value) {
                case "Map":
                    $.each(data.d, (function(key, value) {
                        populateMapSparklinePie(value.data, value.siteID, value.siteName);
                    }));
                    showSiteSet($("#selectSiteSet" + currentTab)[0]);
                    break;

                case "Grid":
                    $.each(data.d, (function (key, value) {
                        populateGridMatrix(value.data, value.siteID, value.siteName);
                    }));

                    showSiteSet($("#selectSiteSet" + currentTab)[0]);
                    break;
            }
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showSparkLines(thedatefrom,thedateto) {

    var thecontrol = $("#siteList");
    var thesiteids = "";

    $.each(thecontrol[0].options, (function (key, value) {
        thesiteids += value.value + ",";
    }));

    if (thesiteids != "") {
        getSitesStatus(thesiteids, thedatefrom, thedateto);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateMapSparklinePie(data, siteID, siteName) {

    var sparkvalues = [];
    var slicecolors = [];
    var thetooltip = siteName;

    // FAULTS

    switch(currentTab) {
        case "Faults":
            if (data[0] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0]];
                slicecolors = globalcolors; //['#CC3300'];
                thetooltip = siteName + "\n" + "Faults: " + data[0];
            }
            break;

        case "Trending":
            if (data[0] == 0 && data[1] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1]];
                slicecolors = globalcolors; //['#CC3300', '#FFCC00'];

                thetooltip = siteName + "\n" + "Alarms: " + data[0] + "\n" + "Off Normals: " + data[1];
            }
            break;
        case "Breakers":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1], data[2]];
                slicecolors = globalcolors; //['#CC3300', '#FFCC00', '#CC3300'];

                thetooltip = siteName + "\n" + "Normal: " + data[0] + "\n" + "Late: " + data[1] + "\n" + "Indeterminate: " + data[2];
            }

            break;
        case "Events":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1], data[2], data[3], data[4], data[5]];
                slicecolors = globalcolorsEvents;
                thetooltip = siteName + "\n" + "Interruptions: " + data[0] + "\n" + "Faults: " + data[1] + "\n" + "Sags: " + data[2] + "\n" + "Transients: " + data[3] + "\n" + "Swells: " + data[4] + "\n" + "Others: " + data[5];
            }
            break;

        case "Completeness":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0000FF'];
                thetooltip = "No Data Available";
            } else {

                slicecolors = globalcolorsDQ;

                var completepoints = data[1] + data[2] + data[3] + data[4];

                var val1 = (completepoints / data[0] * 100).toFixed(2);

                var val2 = (data[5] / data[0] * 100).toFixed(2);

                sparkvalues = [data[0], val1, val2];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + val1 + "%\nDuplicate: " + val2 + "%";
            }

            break;

        case "Correctness":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                var val1 = (data[2] / data[1] * 100).toFixed(2);
                var val2 = (data[3] / data[1] * 100).toFixed(2);
                var val3 = (data[4] / data[1] * 100).toFixed(2);

                sparkvalues = [val1, val2, val3];

                slicecolors = globalcolorsDQ;

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            }

            break;

        default:
            break;
    }

    var thecontainer = "#" + "site_" + siteID + "_sparkline_" + currentTab;

    $(thecontainer).sparkline(sparkvalues, {
        type: 'pie',
        height: '20px',
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 1,
        borderColor: '#000000',
        sliceColors: slicecolors,
        disableTooltips: true
        //,
        //disableHiddenCheck: true
    });

    if (typeof ($(thecontainer)[0]) != 'undefined') {
        $(thecontainer)[0].title = thetooltip;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getStatusColorForGridElement( data ) {

    switch (currentTab) {
        case "Events":

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                    return ("#0E892C");
                }

            if (data[0] > 0) { // Interruptions
                return (globalcolorsEvents[0]);
                //return ("#FF0000");
            }

            if (data[1] > 0) { // Faults
                return (globalcolorsEvents[1]);
                return ("#CC6600");
                } 

            if (data[2] > 0) { // Sags
                return (globalcolorsEvents[2]);
                return ("#FFCC00");
            }

            if (data[3] > 0) { // Transients
                return (globalcolorsEvents[3]);
                return ("#CC3300");
            }

            if (data[4] > 0) { // Swells
                return (globalcolorsEvents[4]);
                return ("#FF8800");
            }

            if (data[5] > 0) { // Others
                return (globalcolorsEvents[5]);
                return ("#FF8800");
            }
 
            break;

        case "Completeness":

            //[0]ExpectedPoints
            //[1]GoodPoints
            //[2]LatchedPoints
            //[3]UnreasonablePoints
            //[4]NoncongruentPoints
            //[5]DuplicatePoints

            //100%, 98%, 90%, 70%, 50%

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                return (globalcolorsDQ[6]);
            }

            if (data[0] == 0 || data[1] == 0) {
                return ("#CCCCCC");
            }

            var percentage = Math.floor(((data[1] + data[2] + data[3] +data[4]) / data[0]) * 100);

            if (percentage >= 100) {
                return (globalcolorsDQ[0]);
            }

            if (percentage >= 98) {
                return (globalcolorsDQ[1]);
            }

            if (percentage >= 90) {
                return (globalcolorsDQ[2]);
            }

            if (percentage >= 70) {
                return (globalcolorsDQ[3]);
            }

            if (percentage >= 50) {
                return (globalcolorsDQ[4]);
            }

            return (globalcolorsDQ[5]);

            break;

        case "Correctness":

            //[0]ExpectedPoints
            //[1]GoodPoints
            //[2]LatchedPoints
            //[3]UnreasonablePoints
            //[4]NoncongruentPoints
            //[5]DuplicatePoints

            //100%, 98%, 90%, 70%, 50%

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                return (globalcolorsDQ[6]);
            }

            if (data[0] == 0 || data[1] == 0) {
                return ("#CCCCCC");
            }

            var percentage = Math.floor(((data[1] + data[2] + data[3] + data[4]) / data[0]) * 100);

            if (percentage >= 100) {
                return (globalcolorsDQ[0]);
            }

            if (percentage >= 98) {
                return (globalcolorsDQ[1]);
            }

            if (percentage >= 90) {
                return (globalcolorsDQ[2]);
            }

            if (percentage >= 70) {
                return (globalcolorsDQ[3]);
            }

            if (percentage >= 50) {
                return (globalcolorsDQ[4]);
            }

            return (globalcolorsDQ[5]);

            break;

        case "Trending":
                    
            if (data[0] == 0 && data[1] == 0) {
                return ("#339933");
            } else {
                if (data[1] > 0 && data[0] > 0) {
                    return ("#FF7700");
                } else {
                    if (data[0] > 0 && data[1] == 0) {
                        return ("#FF0000");
                    } else {
                        if (data[1] > 0 && data[0] == 0) {
                            return ("#FFCC00");
                        }
                    }
                }
            }
            break;

        case "Faults":
            if (data[0] == 0) {
                return ("#0E892C");
            }

            if (data[0] > 0) { // Faults
                return ("#FF0000");
            }
            break;


        case "Breakers":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 ) {
                return ("#0E892C");
            }

            if (data[0] > 0) { // Normal
                return (globalcolors[0]);
                return ("#FF0000");
            }

            if (data[1] > 0) { // Late
                return (globalcolors[1]);
                return ("#CC6600");
            }

            if (data[2] > 0) { // Indeterminate
                return (globalcolors[2]);
                return ("#FFCC00");
            }

            break;

        default:
            break;
    }
    return ("#000000");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridMatrix(data, siteID, siteName) {

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).empty();

    $(matrixItemID).unbind('click');

    $(matrixItemID)[0].title = siteName + " ";

    //$(matrixItemID).append(document.createTextNode(siteName));
    $(matrixItemID).append("<div style='font-size: 1em'><div class='faultgridtitle'>" + siteName + "</div>");

    var theGridColor = getStatusColorForGridElement(data);

    $(matrixItemID).css("background-color", theGridColor);

    if (theGridColor != "#0E892C" && theGridColor != "#777777") {

        switch (currentTab) {
            case "Events":
                populateGridSparklineEvents(data, siteID, siteName);
                break;

            case "Trending":
                //populateGridSparkline(data, siteID, siteName);

                break;

            case "Faults":
                $(matrixItemID).append("<div unselectable='on' class='faultgridcount'>" + data[0] + "</div>");
                $(matrixItemID)[0].title = siteName + " Faults: " + data[0];
                break;

            case "Breakers":
                populateGridSparklineBreakers(data, siteID, siteName);
                break;

            case "Completeness":
                populateGridSparklineCompleteness(data, siteID, siteName, false);
                break;

            case "Correctness":
                populateGridSparklineCorrectness(data, siteID, siteName, false);
                break;

            default:
                break;
        }

        $(matrixItemID).append("</div>");
    }

        $(matrixItemID).click(function (e) {

            if (!e.shiftKey && !e.ctrlKey ) {
                $('#siteList').multiselect('uncheckAll');                    
            }

            var thisselectedindex = 0;

            $('#siteList').multiselect("widget").find(":checkbox").each(function(item) {
                if (this.title == siteName) {
                    thisselectedindex = item;
                }
            });


            $('#siteList').multiselect("widget").find(":checkbox").each(function (item) {

                if (e.shiftKey) {

                    if (thisselectedindex > lastselectedindex) {
                        if ((item >= lastselectedindex) && (item <= thisselectedindex)) {
                            if (this.checked == false) this.click();
                        } else {
                            if (this.checked == true) this.click();
                        }
                    } else {
                        if ((item >= thisselectedindex) && (item <= lastselectedindex)) {
                            if (this.checked == false) this.click();
                        } else {
                            if (this.checked == true) this.click();
                        }
                    }
                } else if (item == thisselectedindex) {
                        this.click();
                        return(false);
                }
            });

            if (!e.shiftKey && !e.ctrlKey) {

                lastselectedindex = thisselectedindex;

            }

            updateGridWithSelectedSites();

            if (e.ctrlKey) {
                if (selectiontimeout != null) clearTimeout(selectiontimeout);
                selectiontimeout = setTimeout('selectsitesincharts()', 1500);
            } else {
                selectsitesincharts();
            }
        });

}

//////////////////////////////////////////////////////////////////////////////////////////////

function updateGridWithSelectedSites() {
        
    $('#siteList').multiselect("widget").find(":checkbox").each(function () {
        var matrixItemID = "#" + "matrix_" + this.value + "_box_" + currentTab;
        if (this.checked) {
            $(matrixItemID).switchClass('matrixButtonBlack', 'matrixButton');
        } else {
            $(matrixItemID).switchClass('matrixButton', 'matrixButtonBlack');
        }
    });  
}

//////////////////////////////////////////////////////////////////////////////////////////////
    
function populateGridSparklineCorrectness(data, siteID, siteName, makespark) {

    var sparkvalues = [];

    var colorMap = [];

    var completeness = data[1] + data[2] + data[3] + data[4];

    sparkvalues = [data[0], completeness, data[5]];

    colorMap = globalcolorsDQ;

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    if (data[0] == 0) {
        $(matrixItemID)[0].title = "No Data Available";

    } else {
        var title = siteName;

        title += "\nGood: " + (data[1] / completeness * 100).toFixed(0) + "%";
        title += "\nLatched: " + (data[2] / completeness * 100).toFixed(0) + "%";
        title += "\nUnreasonable: " + (data[3] / completeness * 100).toFixed(0) + "%";
        title += "\nNoncongruent: " + (data[4] / completeness * 100).toFixed(0) + "%";

        $(matrixItemID)[0].title = title;
    }

    if (!makespark) return;

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        height: '10px',
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: colorMap,

        tooltipFormatter: function (sp, options, fields) {
            var returnvalue = '<div unselectable="on" class="jqsheader">' + options.userOptions.siteid + '</div>';// + ' ' + options.userOptions.datadate

            switch (fields[0].offset) {
                case 0:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Expected: ' + fields[0].value + '</div>';
                    break;
                case 1:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Received: ' + fields[0].value + '</div>';
                    break;
                case 2:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Duplicate: ' + fields[0].value + '</div>';
                    break;
            }

            return (returnvalue);
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklineCompleteness(data, siteID, siteName, makespark) {

    var sparkvalues = [];

    var colorMap = [];

    var completeness = data[1] + data[2] + data[3] + data[4];

    sparkvalues = [data[0], completeness, data[5]];

    colorMap = globalcolors;

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    if (data[0] == 0) {
        $(matrixItemID)[0].title = "No Data Available";

    } else {
        $(matrixItemID)[0].title = siteName + "\nExpected: " + data[0] + "\nReceived: " + (completeness / data[0] * 100).toFixed(2) + "%\nDuplicate: " + (data[5] / data[0] * 100).toFixed(2) + "%";

    }

    if (!makespark) return;

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        height: '10px',
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: colorMap,

        tooltipFormatter: function (sp, options, fields) {
            var returnvalue = '<div unselectable="on" class="jqsheader">' + options.userOptions.siteid + '</div>';// + ' ' + options.userOptions.datadate

            switch (fields[0].offset) {
                case 0:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Expected: ' + fields[0].value + '</div>';
                    break;
                case 1:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Received: ' + fields[0].value + '</div>';
                    break;
                case 2:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Duplicate: ' + fields[0].value + '</div>';
                    break;
            }

            return (returnvalue);
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklineEvents(data, siteID, siteName) {

    var sparkvalues = [data[0], data[1], data[2], data[3], data[4], data[5]];

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    $(matrixItemID).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function( position, feedback ) {
                $( this ).css( position );
                $( "<div>" )
                    .addClass( "arrow" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this );
            }
        },

        content: function() {
            var thetitle = "";
            thetitle += "<table>";
            thetitle += "<tr><td colspan=2 align='center'>" + siteName + "</td></tr>";
            thetitle += "<tr><td>Interruptions</td><td align='right'>" + data[0] + "</td></tr>";
            thetitle += "<tr><td>Faults</td><td align='right'>" + data[1] + "</td></tr>";
            thetitle += "<tr><td>Sags</td><td align='right'>" + data[2] + "</td></tr>";
            thetitle += "<tr><td>Transients</td><td align='right'>" + data[3] + "</td></tr>";
            thetitle += "<tr><td>Swells</td><td align='right'>" + data[4] + "</td></tr>";
            thetitle += "<tr><td>Others</td><td align='right'>" + data[5] + "</td></tr>";
            thetitle += "</table>";
            return (thetitle);
        }
    });

    //$(matrixItemID)[0].title = thetitle;

    //$(matrixItemID)[0].title = siteName + "\nInterruptions: " + data[0] + "\nFaults: " + data[1] + "\nSags: " + data[2] + "\nTransients: " + data[3] + "\nSwells: " + data[4] + "\nOthers: " + data[5];

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        height: '10px',
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: globalcolorsEvents,

        tooltipFormatter: function (sp, options, fields) {
            var returnvalue = '<div unselectable="on" class="jqsheader">' + options.userOptions.siteid + '</div>';// + ' ' + options.userOptions.datadate

            switch (fields[0].offset) {

                case 0:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Interruptions: ' + fields[0].value + '</div>';
                    break;
                case 1:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Faults: ' + fields[0].value + '</div>';
                    break;
                case 2:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Sags: ' + fields[0].value + '</div>';
                    break;
                case 3:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Transients: ' + fields[0].value + '</div>';
                    break;
                case 4:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Swells: ' + fields[0].value + '</div>';
                    break;
                case 5:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Others: ' + fields[0].value + '</div>';
                    break;

            }

            return (returnvalue);
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklineBreakers(data, siteID, siteName) {

    var sparkvalues = [];

    var colorMap = [];

    sparkvalues = [data[0], data[1], data[2]];

    colorMap = globalcolors; //['#FF0000', '#CC6600', '#FF8800'];

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    $(matrixItemID)[0].title = siteName + "\nNormal: " + data[0] + "\nLate: " + data[1] + "\nIndeterminate: " + data[2];

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        height: '10px',
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: colorMap,

        tooltipFormatter: function (sp, options, fields) {
            var returnvalue = '<div unselectable="on" class="jqsheader">' + options.userOptions.siteid + '</div>';// + ' ' + options.userOptions.datadate

            switch (fields[0].offset) {

                case 0:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Normal: ' + fields[0].value + '</div>';
                    break;
                case 1:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Late: ' + fields[0].value + '</div>';
                    break;
                case 2:
                    returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> Indeterminate: ' + fields[0].value + '</div>';
                    break;
            }
            return (returnvalue);
        }
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////

function SelectAdd(theControlID,theValue,theText,selected) {

    var exists = false;

    $('#' + theControlID + ' option').each(function () {
        if (this.innerHTML == theText) {
            exists = true;
            return false;
        }
    });

    if (!exists) {
        $('#' + theControlID).append("<option value='" + theValue + "' " + selected+ ">" + theText + "</option>");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getMapInstance(theTab) {

    if (typeof ($("#theMap" + theTab)[0].data) == "undefined") {
        return (null);
    }
        
    return ($("#theMap" + theTab)[0].data);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function createMap(newTab) {

    if (typeof ($("#theMap" + newTab)[0].data) != "undefined") return;

    $("#theMatrix" + newTab).css("display", "none");
    $("#theMap" + newTab).css("display", "block");
    $("#mapGrid" + " option:contains('Map')").attr('selected', true);

    if ($("#theMatrix" + newTab)[0].childElementCount > 0) {
        $("#theMatrix" + newTab).empty();
    }

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 0,
        panControl:true,
        zoomControl:true,
        mapTypeControl:true,
        scaleControl:true,
        streetViewControl:true,
        overviewMapControl:true,
        rotateControl:true
    }

    var map = new google.maps.Map(document.getElementById("theMap" + newTab), mapOptions);

    map.markers = [];
    map.heatmap = null;

    $("#theMap" + newTab)[0].data = map;

    map.enableKeyDragZoom({
        visualEnabled: true,
        noZoom: true
    });

    var dz = map.getDragZoomObject();

    google.maps.event.addListener(dz, 'dragend', function (bnds) {
        var northEast = bnds.getNorthEast();
        var southWest = bnds.getSouthWest();
        populateLocationDropdownWithSelection(southWest.lng(), northEast.lat(), northEast.lng(), southWest.lat());
    });

    if (newTab == "Events") {
        var legend = document.getElementById('legend');
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
        var div = document.getElementById('eventslegend');
        $('eventslegend').css('visibility: visible;');
        legend.appendChild(div);
        $('#legend').on('dragstart', function (event) { event.preventDefault(); });
    }

    google.maps.event.addListenerOnce(map, 'idle', function () {
        renderMap();
    });

    if ($('#heatmap' + newTab).length != 0) {
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push($('#heatmap' + newTab)[0]);
    }

    if (newTab == "Trending") {
        map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push($('#HeatmapControls' + newTab)[0]);
    }

    $.each(applicationsettings, function(key, value) {
        if (value.Name == "MapLayer") {
            if (value.Enabled == "True") {
                var url = value.Value;
                var dynamap = new gmaps.ags.MapOverlay(url);
                dynamap.setMap(map);
            }
        }
    });

    //var URL = 'http://www.gridprotectionalliance.org/PQDashboard/DashGoogle/kml/doc.kml' + "?dummy=" + (new Date()).getTime();

    //var weatherLayer = new google.maps.KmlLayer({
    //    url: URL
    //});

    //weatherLayer.setMap(map);

    //google.maps.event.addListener(weatherLayer, "status_changed", function () {
    //    var test = weatherLayer.getStatus();
    //    alert(test);
    //});
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showSiteSet(thecontrol) {

    var mapormatrix = $("#mapGrid")[0].value;

    if (mapormatrix == "Grid") {

        var gridchildren = $("#theMatrix" + currentTab)[0];

        switch (thecontrol.value) {

            case "All":
                $.each(gridchildren.children, function (key, value) {
                        $(value).show();
                });

                break;

            case "Events":
                $.each(gridchildren.children, function (key, value) {
                    if ( $(value).data("gridstatus") != "0")
                    {
                        $(value).show();
                    }
                    else
                    {
                        $(value).hide();
                    }
                });

                break;

            case "NoEvents":
                $.each(gridchildren.children, function (key, value) {
                    if ($(value).data("gridstatus") != "0") {
                        $(value).hide();
                    }
                    else {
                        $(value).show();
                    }
                });

                break;

            case "SelectedSites":

                var selectedIDs = GetCurrentlySelectedSites();

                $.each(gridchildren.children, function (key, value) {
                    if ($.inArray ($(value).data('siteid'), selectedIDs) > -1) {
                        $(value).show();
                    } else {
                        $(value).hide();
                    }
                });
                break;

            default:
                break;
        }
    }

    if (mapormatrix == "Map") {

        var map = getMapInstance(currentTab);

        switch (thecontrol.value) {

            case "All":
                $.each(map.markers, function (key, value) {
                    value.show();
                });
                break;

            case "Events":
                $.each(map.markers, function (key, value) {
                    if (value.args.marker_status > 0) {
                        value.show();
                    } else {
                        value.hide();
                    }
                });
                break;

            case "NoEvents":
                $.each(map.markers, function (key, value) {
                    if (value.args.marker_status == 0) {
                        value.show();
                    } else {
                        value.hide();
                    }
                });
                break;

            case "SelectedSites":

                var selectedIDs = GetCurrentlySelectedSites();
                $.each(map.markers, function (key, value) {
                    if ($.inArray(value.args.marker_name + "|" + value.args.marker_id, selectedIDs) > -1) {
                        value.show();
                    } else {
                        value.hide();
                    }
                });
                break;

            case "Sags":
                var selectedIDs = GetCurrentlySelectedSites();
                $.each(map.markers, function (key, value) {
                    if ($.inArray(value.args.marker_name + "|" + value.args.marker_id, selectedIDs) > -1) {
                        value.show();
                    } else {
                        value.hide();
                    }
                });
                break;


            default:
                break;

        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showHeatmap(thecontrol) {
    var i = 0;

    var map = getMapInstance(currentTab);
    var datefrom = getMapHeaderDate("From");
    var dateto = getMapHeaderDate("To");

    switch (thecontrol.value) {

        case "EventCounts":
            getEventsHeatmapCounts(currentTab, datefrom, dateto);
            break;

        case "MinimumSags":
            getEventsHeatmapSags(currentTab, datefrom, dateto);
            break;

        case "MaximumSwells":
            getEventsHeatmapSwell(currentTab, datefrom, dateto);
            break;

        case "TrendingCounts":
            stopAnimatedHeatmap();
            getEventsHeatmapCounts(currentTab, datefrom, dateto);
            $('#HeatmapControlsTrending').hide();
            break;

        case "THD":
            $('#HeatmapControlsTrending').show();
            break;

        default:
            break;

    }
}

/////////////////////////////////////////////////////////////////////////////////////////

function plotGridLocations(locationdata, newTab, thedatefrom, thedateto) {

    //$("#mapHeader" + newTab + "From")[0].innerHTML = thedatefrom;
    //$("#mapHeader" + newTab + "To")[0].innerHTML = thedateto;

    /// Clear Matrix
    if ($("#theMatrix" + newTab)[0].childElementCount > 0) {
        $("#theMatrix" + newTab).empty();
    }

    var selectedIDs = GetCurrentlySelectedSites();

    // For each data unit, build containers, add to layer based on status
    $.each(locationdata.d, function (key, value) {
        var theindex = $.inArray(value.name + "|" + value.id, selectedIDs);
 
        var item;

        if (theindex > -1) {
            item = $("<div unselectable='on' class='matrix matrixButton noselect' id='" + "matrix_" + value.id + "_box_" + newTab + "'/>");

        } else {
            item = $("<div unselectable='on' class='matrix matrixButtonBlack noselect' id='" + "matrix_" + value.id + "_box_" + newTab + "'/>");
        }

        item.data('gridstatus', value.status);
        item.data('siteid', value.name + "|" + value.id);
        //item.status = value.status;
        $("#theMatrix" + newTab).append(item);

    });

    /// Set Matrix Cell size
    resizeMatrixCells(newTab);

    /// Render sparklines into injected divs in map
    showSparkLines(thedatefrom, thedateto);
};

/////////////////////////////////////////////////////////////////////////////////////////
/// creates markers for each geocoordinate
/// Builds location dropdown
/// Builds sparklines
/// Builds Heatmap

function plotMapLocations(locationdata, newTab, thedatefrom , thedateto) {

    //$("#mapHeader" + newTab + "From")[0].innerHTML = thedatefrom;
    //$("#mapHeader" + newTab + "To")[0].innerHTML = thedateto;
    //console.log("plotMapLocations");

    var markerBounds = new google.maps.LatLngBounds();
    var selectedIDs = GetCurrentlySelectedSites();

    $(".spark_pie").remove();

    var map = getMapInstance(newTab);

    $.each(map.markers, function(key, value) {
        value.setMap(null);
        value.remove();
    });

    map.markers = [];

    // For each data unit, build containers, add to layer based on status
    $.each(locationdata.d, function (key, value) {

        var latLong = new google.maps.LatLng(value.location.latitude, value.location.longitude, false);

        /// MATRIX Add Grid Box container with magic name
        /// EXTEND Map Bounds, and highlight Matrix for selected sites

        var theindex = $.inArray(value.name + "|" + value.id, selectedIDs);
        if (theindex > -1) {
            markerBounds.extend(latLong);
        }

        var overlay = new CustomMarker(latLong, map,
            {
                marker_name: value.name,
                marker_id: value.id,
                marker_status: value.status,
                div_id: 'site_' + value.id + '_sparkline_' + newTab
            }
        );

        map.markers.push(overlay);
    });

    // Set zoom level to markerBounds, and center to middle of that bounds
    if (markerBounds.getCenter().lng() != 0) {
        map.fitBounds(markerBounds);
        map.setCenter(markerBounds.getCenter());        
    }

    //LoadHeatmapData(locationdata.d, map);
    /// Set Matrix Cell size
    //resizeMatrixCells(newTab);

    /// Render sparklines into injected divs in map
    showSparkLines(thedatefrom, thedateto);

    selectsitesonmap();

    showSiteSet($("#selectSiteSet" + currentTab)[0]);
};

//////////////////////////////////////////////////////////////////////////////////////////////

function highlightDaysInCalendar(date) {
    var i = -1;

    //if ((i = $.inArray(date.toString().substr(0, 16), calendardatesEvents)) > -1) {

        switch ( currentTab ) {
        
            case "Events":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesEvents)) > -1) {
                    return [true, 'highlight', calendartipsEvents[i]];
                }

                break;

            case "Faults":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesEvents)) > -1) {
                    if (calendartipsEvents[i].indexOf("Fault") > -1) {
                        return [true, 'highlight', calendartipsEvents[i]];
                    }
                }
                break;

            case "Trending":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesTrending)) > -1) {
                    return [true, 'highlight', calendartipsTrending[i]];
                }
                break;

            case "Breakers":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesBreakers)) > -1) {
                    return [true, 'highlight', calendartipsBreakers[i]];
                }
                break;
        }
    
    return [true, ''];
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ManageLocationClick(siteName, siteID) {

    var thedatefrom = $.datepicker.formatDate("mm/dd/yy", $('#datePickerFrom').datepicker('getDate'));
    var thedateto = $.datepicker.formatDate("mm/dd/yy", $('#datePickerTo').datepicker('getDate'));

    if ((thedatefrom == "") || (thedateto == "")) return;

    switch (currentTab) {
        case "Events":
            populateDivWithBarChart('getEventsForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
           
            break;

        case "Faults":
            populateDivWithBarChart('getFaultsForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
            
            break;

        case "Trending":
            populateDivWithBarChart('getTrendingForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        case "Breakers":
            populateDivWithBarChart('getBreakersForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        case "Completeness":
            populateDivWithBarChart('getCompletenessForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        case "Correctness":
            populateDivWithBarChart('getCorrectnessForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        default:
            break;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function manageTabsByDate(theNewTab, thedatefrom, thedateto) {

    if ((thedatefrom == "") || (thedateto == "")) return;

    currentTab = theNewTab;

    reflowContents(theNewTab);

    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function reflowContents(newTab) {

    resizeMapAndMatrix(newTab);

    var map = getMapInstance(newTab);

    if (map != null) {
        google.maps.event.trigger(map, 'resize');
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeDocklet( theparent , chartheight ) {

    theparent.css("height", chartheight);

    var firstChild = $("#" + theparent[0].firstElementChild.id);

    firstChild.css("height", chartheight);

    var chart = firstChild.highcharts();
    
    if (typeof chart != 'undefined') {
        chart.reflow();
    }

    // Force Grids to render and fill 100% height
    $("#" + firstChild[0].id).jqxGrid('render');
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMapAndMatrix(newTab) {

    $("#datePickerFrom").datepicker("hide");
    $("#datePickerTo").datepicker("hide");

    var columnheight = $(window).height() - $('#tabs-' + newTab).offset().top - 30;

    $("#theMap" + newTab).css("height", columnheight);
    $("#theMatrix" + newTab).css("height", columnheight);

    var theuncollapsedcount = $("#Portlet1" + currentTab).closest(".column").children().children().find('.ui-icon-minusthick').length;

    if (theuncollapsedcount != 0) {
        var chartheight = (columnheight - 24) / theuncollapsedcount;
        resizeDocklet($("#DockOverview" + newTab), chartheight);
        resizeDocklet($("#DockDetail" + newTab), chartheight);
    }

    resizeMatrixCells(newTab);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMatrixCells(newTab) {
    var h = $("#theMatrix" + newTab).height();
    var w = $("#MapMatrix" + newTab).width();
    var r = $('#siteList')[0].length;

    if (h > 0 && w > 0 && r > 0) {
        var columns = Math.floor(Math.sqrt(r));
        var rows = Math.ceil(r / columns);
        $(".matrix").css("width", (w / columns) - 4);
        $(".matrix").css("height", (h / rows) - 2);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializeDatePickers(datafromdate , datatodate) {

    $("#datePickerFrom").datepicker({
        onSelect: function (dateText, inst) {
            //$("#staticPeriod")[0].value = "Custom";
        },
        onChangeMonthYear: function (year, month, instance) {

            var d = instance.selectedDay;
            // Set new Date(year, month, 0) for entire month
            $(this).datepicker('setDate', new Date(year, month - 1, d));
        },

        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        autoSize: false,
        beforeShowDay: highlightDaysInCalendar,
        timeFormat: 'hh:mm:ss',
        dateFormat: 'mm/dd/yy',
        showButtonPanel: false,

        onClose: function (selectedDate) {
            $("#datePickerTo").datepicker("option", "minDate", selectedDate);
            $("#datePickerTo").datepicker("option", "minDate", null);
        }
    });

    $("#datePickerFrom").datepicker("setDate", new Date(datafromdate));

    $("#datePickerTo").datepicker({
        onSelect: function (dateText, inst) {
            //$("#staticPeriod")[0].value = "Custom";
        },
        onChangeMonthYear: function (year, month, instance) {

            var d = instance.selectedDay;
            // Set new Date(year, month, 0) for entire month

            $(this).datepicker('setDate', new Date(year, month - 1, d));
        },

        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        autoSize: true,
        beforeShowDay: highlightDaysInCalendar,
        timeFormat: 'hh:mm:ss',
        dateFormat: 'mm/dd/yy',
        showButtonPanel: false,
        onClose: function (selectedDate) {
            $("#datePickerFrom").datepicker("option", "maxDate", selectedDate);
            $("#datePickerFrom").datepicker("option", "maxDate", null);
        }
    });

    $("#datePickerTo").datepicker("setDate", new Date(datatodate));
}

//////////////////////////////////////////////////////////////////////////////////////////////

function isRightClick(event) {
    var rightclick;
    if (!event) var event = window.event;
    if (event.which) rightclick = (event.which == 3);
    else if (event.button) rightclick = (event.button == 2);
    return rightclick;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadconfigdropdown(currentselected) {
    $('#Configurations')[0].options.length = 0;
    $.each(usersettings.uisettings, function (key, value) {
        SelectAdd("Configurations", key, value.Name, (currentselected == value.Name) ? "selected" : "");
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function validatesettings(usersettings) {

    if (typeof (usersettings["lastSetting"]) == 'undefined') {
        initializesettings();
        return (false);
    };

    if (typeof (usersettings["javascriptversion"]) == 'undefined') {
        initializesettings();
        return (false);
    } else if (usersettings["javascriptversion"] != javascriptversion) {
        initializesettings();
        return (false);
    }

    $.each(usersettings.uisettings, function(key, value) {

        if (typeof (value["Name"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["CurrentTab"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["DataFromDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["DataToDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };

        if (typeof (value["ContextFromDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["ContextToDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["MapGrid"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["EventSiteDropdownSelected"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["staticPeriod"]) == 'undefined') {
            initializesettings();
            return (false);
        };
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationapply(item) {
        
    var currentconfigname = $("#Configurations :selected").text();

    usersettings["lastSetting"] = currentconfigname;

    $.jStorage.set("usersettings", usersettings);

    $("#datePickerFrom").datepicker("setDate", new Date(getcurrentconfigsetting("DataFromDate")));

    $("#datePickerTo").datepicker("setDate", new Date(getcurrentconfigsetting("DataToDate")));

    contextfromdate = getcurrentconfigsetting("ContextFromDate");
    contexttodate = getcurrentconfigsetting("ContextToDate");

    var selectedsites = getcurrentconfigsetting("EventSiteDropdownSelected");
    if (selectedsites != null) {
        $('#siteList').multiselect("uncheckAll");
        $('#siteList').val(selectedsites);
    }
    else {
        $('#siteList').multiselect("checkAll");
    }

    $('#siteList').multiselect('refresh');

    $("#application-tabs").tabs("option", "active", getcurrentconfigsetting("CurrentTab"));

    $("#mapGrid")[0].value = getcurrentconfigsetting("MapGrid");
    $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

    selectmapgrid($("#mapGrid")[0]);

    manageTabsByDate(currentTab, contextfromdate, contexttodate);

    selectsitesincharts();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function deleteconfirmation(item) {

    var currentconfigname = $("#Configurations :selected").text();

    if (currentconfigname == "Last Session") return;
    if (currentconfigname == "Default") return;

    $('#deleteconfigname')[0].innerText = currentconfigname;

    var dialog = $('#delete-dialog').dialog({
        modal: true,
        stack: true,
        width: 300,
        buttons: {

            "Delete": function () {

                var loc = -1;

                $.each(usersettings.uisettings, function (key, value) {
                    if (currentconfigname == value.Name) {


                            usersettings.uisettings.remove(key, key);
                            usersettings["lastSetting"] = "Default";
                            $.jStorage.set("usersettings", usersettings);
                            loadconfigdropdown("Default");
                            configurationapply(item);
                            return (false);
                            
                    }
                });

                $(this).dialog("close");
            },

            Cancel: function () {

                $(this).dialog("close");

            }

        }
    }).parent('.ui-dialog').css('zIndex', 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationscopy(item) {
    var dialog = $('#modal-dialog').dialog({
        modal: true,
        stack: true,
        width: 300,
        buttons: {

            "Create": function () {
                var theconfigname = $("#newconfigname").val();
                $("#newconfigname")[0].value = "";

                if (theconfigname.length > 0) {
                    createupdateconfig(theconfigname);
                    loadconfigdropdown(theconfigname);
                }

                $(this).dialog("close");
            },

            Cancel: function () {

                $(this).dialog("close");

            }

        }
    }).parent('.ui-dialog').css('zIndex', 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function substituteToken(thetoken) {

var returnvalue = "";

switch (thetoken) {

    case "Today":
        returnvalue = $.datepicker.formatDate("mm/dd/yy", new Date());
        break;

    case "PastWeek":
        var d = new Date();
        d.setDate(d.getDate() - 7);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;

    case "PastMonth":

        var d = new Date();
        d.setDate(d.getDate() - 30);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;

    case "PastYear":
        var d = new Date();
        d.setDate(d.getDate() - 365);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;
            
    default:
        returnvalue = thetoken;
        /// Today
        break;
}

return (returnvalue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getcurrentconfigsetting(configatom) {
    var returnvalue = null;
    var currentconfigname = $("#Configurations :selected").text();

    $.each(usersettings.uisettings, function (key, value) {
        if (currentconfigname == value.Name) {

            switch (configatom) {
                
                case "DataToDate":
                case "DataFromDate":
                case "ContextToDate":
                case "ContextFromDate":
                    returnvalue = substituteToken(value[configatom]);
                    break;

                default:
                    returnvalue = value[configatom];
                    break;
            }

            return (false);
        }
    });
    return (returnvalue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationsupdate(item) {
    var currentconfigname = $("#Configurations :selected").text();
    createupdateconfig(currentconfigname);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationsdelete(item) {
    deleteconfirmation(item);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializesettings() {
    var thesetting = {};
    usersettings.uisettings.length = 0;

    usersettings["javascriptversion"] = javascriptversion;

    thesetting["Name"] = "Default";
    thesetting["DataToDate"] = "Today";
    thesetting["DataFromDate"] = "PastMonth";
    thesetting["ContextToDate"] = "Today";
    thesetting["ContextFromDate"] = "PastMonth";
    thesetting["CurrentTab"] = "0";
    thesetting["MapGrid"] = "Grid";
    thesetting["EventSiteDropdownSelected"] = null;
    thesetting["staticPeriod"] = "PastMonth";

    usersettings["uisettings"].push(thesetting);

    var thesetting = {};
    thesetting["Name"] = "Last Session";
    thesetting["CurrentTab"] = "0";
    thesetting["DataFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datafromdate));
    thesetting["DataToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datatodate));
    thesetting["ContextFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datafromdate));
    thesetting["ContextToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datatodate));
    thesetting["MapGrid"] = "Map";
    thesetting["EventSiteDropdownSelected"] = null;
    thesetting["staticPeriod"] = "Custom";

    usersettings["lastSetting"] = "Default";
    usersettings["uisettings"].push(thesetting);

    $.jStorage.set("usersettings", null);
    $.jStorage.set("usersettings", usersettings);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function createupdateconfig(configname) {

    if (configname == "Default") return;

    if (configname == null) {
        configname = "Last Session";
    }

    if (usersettings == null) {
        usersettings = {
            lastSetting: {},
            uisettings: []
        };
    }

    var thesetting = {};

    thesetting["Name"] = configname;
    thesetting["CurrentTab"] = $("#application-tabs").tabs("option", "active");
    thesetting["DataFromDate"] = $("#datePickerFrom")[0].value;
    thesetting["DataToDate"] = $("#datePickerTo")[0].value;
    thesetting["ContextFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(contextfromdate));
    thesetting["ContextToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date (contexttodate));
    thesetting["MapGrid"] = $("#mapGrid")[0].value;
    thesetting["EventSiteDropdownSelected"] = $("#siteList").val();
    thesetting["staticPeriod"] = $("#staticPeriod").val();

    var loc = -1;

    $.each(usersettings.uisettings, function (key, value) {
        if (configname == value.Name) loc = key;
    });

    if (loc == -1) {
        usersettings["uisettings"].push(thesetting);
    } else {
        usersettings.uisettings[loc] = thesetting;
    }

    usersettings["lastSetting"] = "Default";
    $.jStorage.set("usersettings", usersettings);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showContent() {

    //var login = $("#userid").val();
    //var password = $("#password").val();

    //if ((login != 'EPRI') && (password != 1234)) {
    //    if ((login.length > 0) || (password.length > 0)) {
    //        $("#incorrect").css("visibility", "visible"); 
    //    }
    //    return;
    //}

    $("#loginContent").css("visibility", "hidden");
    $("#ApplicationContent").css("visibility", "visible");
    $("#logout_button").css("visibility", "visible");
    buildPage();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getMeters() {

    var thedatasent = "{'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: './mapService.asmx/getMeters',
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            cache_Meters = data.d;
        },
        failure: function (msg) {
            alert(msg);
        },
        async: false
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectStaticPeriod(thecontrol) {
    var theCalculatedDate = new Date();

    if (thecontrol.value != "Custom") {
        $("#datePickerTo").datepicker("setDate", new Date(theCalculatedDate));
        $("#datePickerFrom").datepicker("setDate", new Date(substituteToken(thecontrol.value)));
        loadDataForDate();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {

    postedUserName = $("#postedUserName")[0].innerHTML;

    $('form').bind('submit', $('form'), function(event) {
        var form = this;
        event.preventDefault();
        event.stopPropagation();
        showcontent();
        return;
    });

    $("#password").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#loginbutton").click();
        }
    });


    showContent();
});

//////////////////////////////////////////////////////////////////////////////////////////////

function loadsitedropdown() {

    $("#siteList").multiselect({
        close: function (event, ui) {
            showSiteSet($("#selectSiteSet" + currentTab)[0]);
            updateGridWithSelectedSites();
            selectsitesonmap();
            selectsitesincharts();
        },
        minWidth: 250, selectedList: 1, noneSelectedText: "Select Site"
    }).multiselectfilter();

    $.each(cache_Meters, function (key, value) {
        SelectAdd("siteList", value.id, value.name, "selected");
    });

    var selectedsites = getcurrentconfigsetting("EventSiteDropdownSelected");
    if (selectedsites != null) {
        $('#siteList').multiselect("uncheckAll");
        $('#siteList').val(selectedsites);
    }
    else {
        $('#siteList').multiselect("checkAll");
    }

    $('#siteList').multiselect('refresh');
}

//////////////////////////////////////////////////////////////////////////////////////////////

//    function populateCalendarEvents() {

//        calendardatesEvents = [];
//        calendardatesEvents = [];

//        var thedatasent = "{'userName':'" + postedUserName + "'}";

//        $.ajax({
//            type: "POST",
//            url: './eventService.asmx/getCalendarForEvents',
//            data: thedatasent,
//            contentType: "application/json; charset=utf-8",
//            dataType: 'json',
//            cache: true,
//            success: function (data) {

//                var obj = JSON.parse(data.d);

//                $.each(obj, (function (key, value) {

//                    if ((value.faults > 0) || (value.interruptions > 0) || (value.others > 0) || (value.sags > 0) || (value.swells > 0)) {
                        
//                        calendardatesEvents.push(new Date(value.thedate).toString().substr(0, 16));
//                        var tempstatus = "";

//                        if (value.faults > 0) {

//                            tempstatus += "Fault: " + value.faults + "\n";
//                        }

//                        if (value.sags > 0) {

//                            tempstatus += "Sag:  " + value.sags + "\n";
//                        }

//                        if (value.interruptions > 0) {

//                            tempstatus += "Interruption: " + value.interruptions + "\n";
//                        }

//                        if (value.swells > 0) {

//                            tempstatus += "Swell:  " + value.swells + "\n";
//                        }

//                        if (value.others > 0) {

//                            tempstatus += "Other:  " + value.others;
//                        }

//                        calendartipsEvents.push(tempstatus);
//                    }
//                }));

//                $("#datePickerFrom").datepicker("refresh");
//                $("#datePickerTo").datepicker("refresh");
//            },
//            failure: function (msg) {
//                alert(msg);
//            },
//            async: true
//        });
//    }

//    //////////////////////////////////////////////////////////////////////////////////////////////

//    function populateCalendarTrending() {

//        calendardatesTrending = [];
//        calendartipsTrending = [];

//        var thedatasent = "{'userName':'" + postedUserName + "'}";

//        $.ajax({
//            type: "POST",
//            url: './eventService.asmx/getCalendarForTrending',
//            data: thedatasent,
//            contentType: "application/json; charset=utf-8",
//            dataType: 'json',
//            cache: true,
//            success: function (data) {

//                var obj = JSON.parse(data.d);

//                $.each(obj, (function (key, value) {

//                    if ((value.alarm > 0) || (value.offnormal > 0)) {

//                        calendardatesTrending.push(new Date(value.thedate).toString().substr(0, 16));
//                        var tempstatus = "";

//                        if (value.alarm > 0) {

//                            tempstatus += "Alarm: " + value.alarm + "\n";
//                        }

//                        if (value.offnormal > 0) {

//                            tempstatus += "Offnormal:  " + value.offnormal + "\n";
//                        }

//                        calendartipsTrending.push(tempstatus);
//                    }
//                }));

//                $("#datePickerFrom").datepicker("refresh");
//                $("#datePickerTo").datepicker("refresh");
//            },
//            failure: function (msg) {
//                alert(msg);
//            },
//            async: true
//        });
//    }

////////////////////////////////////////////////////////////////////////////////////////////////

//    function populateCalendarBreakers() {

//        calendardatesBreakers = [];
//        calendartipsBreakers = [];

//        var thedatasent = "{'userName':'" + postedUserName + "'}";

//        $.ajax({
//            type: "POST",
//            url: './eventService.asmx/getCalendarForBreakers',
//            data: thedatasent,
//            contentType: "application/json; charset=utf-8",
//            dataType: 'json',
//            cache: true,
//            success: function (data) {

//                var obj = JSON.parse(data.d);

//                $.each(obj, (function (key, value) {

//                    if ((value.normal > 0) || (value.late > 0) || (value.indeterminate > 0)) {

//                        calendardatesBreakers.push(new Date(value.thedate).toString().substr(0, 16));
//                        var tempstatus = "";

//                        if (value.normal > 0) {

//                            tempstatus += "Normal: " + value.normal + "\n";
//                        }

//                        if (value.late > 0) {

//                            tempstatus += "Late:  " + value.late + "\n";
//                        }

//                        if (value.indeterminate > 0) {

//                            tempstatus += "Indeterminate:  " + value.indeterminate + "\n";
//                        }

//                        calendartipsBreakers.push(tempstatus);
//                    }
//                }));

//                $("#datePickerFrom").datepicker("refresh");
//                $("#datePickerTo").datepicker("refresh");
//            },
//            failure: function (msg) {
//                alert(msg);
//            },
//            async: true
//        });
//    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //function populateDivWithLineChartByChannelID(thedatasource, thediv, thechannelid, thedate, eventtype, label) {

    //    var options = {
    //        colors: globalcolors,
    //        plotOptions: {
    //            series: {
    //                animation: false,
    //                marker: {
    //                    radius: 2
    //                }
    //            }
    //        },
    //        chart: {
    //            panning: true,
    //            panKey: 'shift',
    //            type: 'line',
    //            zoomType: 'x',
    //            renderTo: thediv
    //        },
    //        credits: {
    //            enabled: false
    //        },
    //        title: {
    //            text: label,
    //            style: { "color": "#333333", "fontSize": "12px" }
    //        },
    //        xAxis: {
    //            type: 'datetime',
    //            categories: [],

    //            labels: {
    //                style: {
    //                    fontSize: '8px'
    //                },
    //                rotation: -45,
    //                enabled: true
    //            }
    //        },
    //        yAxis: {

    //            title: {
    //                text: 'Trend Magnitude'
    //            },
    //            stackLabels: {
    //                enabled: true,
    //                style: {
    //                    fontsize: '.3em',
    //                    fontWeight: 'bold',
    //                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
    //                }
    //            }
    //        },
    //        legend: {
    //            layout: 'vertical',
    //            align: 'right',
    //            verticalAlign: 'middle',
    //            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
    //            borderWidth: 0
    //        },
    //        tooltip: {
    //            positioner: function () {
    //                return { x: 2, y: 12 };
    //            },
    //            formatter: function () {

    //                var tooltipstring = "";

    //                if (typeof (this.point.low) != 'undefined' && typeof (this.point.high) != 'undefined') {
    //                    tooltipstring = '<b>' + this.series.name + ' : ' + this.point.low.toFixed(3) + ' - ' + this.point.high.toFixed(3) + '</b>';
    //                } else {
    //                    tooltipstring = '<b>' + this.series.name + ' @ ' + this.x + ' : ' + this.y.toFixed(3) + '</b>';
    //                }

    //                return tooltipstring;
    //            },
    //            shadow: false,
    //            borderWidth: 0,
    //            backgroundColor: 'rgba(255,255,255,0)'
    //        }
    //    };

    //    var thedatasent = "{'ChannelID':'" + thechannelid + "', 'targetDate':'" + thedate + "'}";

    //    var chart = new Highcharts.Chart(options);
    //    chart.showLoading('Loading, please wait...');

    //    $.ajax({
    //        type: "POST",
    //        url: './eventService.asmx/' + thedatasource,
    //        data: thedatasent,
    //        contentType: "application/json; charset=utf-8",
    //        dataType: 'json',
    //        cache: true,
    //        success: function (data) {
    //            if (data.d == null) {
    //                chart.hideLoading();
    //                return;
    //            }

    //            options.xAxis.categories = data.d.xAxis;

    //            $.each(data.d.data[2].data, (function (key, value) {

    //                data.d.data[2].data[key] = [data.d.xAxis[key], data.d.data[4].data[key], data.d.data[2].data[key]];

    //            }));

    //            data.d.data[2].linkedTo = 2;
    //            data.d.data[2].name = 'Range';
    //            options.series = data.d.data;
    //            options.series[3].lineWidth = 0;
    //            options.series[4].showInLegend = false;

    //            chart = new Highcharts.Chart(options);
    //            chart.series[4].hide();
    //            //chart.series[3].hide();

    //            if (data.d.data[6].data.length == 0) {
    //                chart.series[6].hide();
    //                options.series[6].showInLegend = false;
    //            }

    //            if (eventtype == 'Alarm') {
    //                chart.series[5].hide();
    //                chart.series[1].hide();
    //            }

    //            if (eventtype == 'OffNormal') {
    //                chart.series[0].hide();
    //                chart.series[6].hide();
    //            }

    //            chart.hideLoading();
    //        },
    //        failure: function (msg) {
    //            alert(msg);
    //        },
    //        async: true
    //    });
    //}

//////////////////////////////////////////////////////////////////////////////////////////////

//function populateTrendingMetric(metric, siteID, theDate, desiredvalue) {

//    var thedatasent = "";
//    var theMeasurementType = "";
//    var theMeasurementCharacteristic = "";

//    switch (metric) {
//        case "MeasurementType":
//            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
//            break;

//        case "MeasurementCharacteristic":
//            theMeasurementType = $("#MeasurementType").val();
//            if (theMeasurementType == null) {
//                $("#MeasurementCharacteristic").empty();
//                $("#MeasurementCharacteristic").multiselect("refresh");
//                $("#Phase").empty();
//                $("#Phase").multiselect("refresh");
//                return;
//            }

//            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theMeasurementType + "'}";
//            break;

//        case "Phase":

//            theMeasurementType = $("#MeasurementType").val();
//            if (theMeasurementType == null) {
//                $("#MeasurementCharacteristic").empty();
//                $("#MeasurementCharacteristic").multiselect("refresh");
//                return;
//            }

//            theMeasurementCharacteristic = $("#MeasurementCharacteristic").val();
//            if (theMeasurementCharacteristic == null) {
//                $("#Phase").empty();
//                $("#Phase").multiselect("refresh");
//                return;
//            }

//            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theMeasurementType + "', 'theCharacteristic':'" + theMeasurementCharacteristic + "'}";
//            break;

//    }

//    $.ajax({
//        type: "POST",
//        url: './eventService.asmx/' + metric,
//        data: thedatasent,
//        desiredvalue: desiredvalue,
//        contentType: "application/json; charset=utf-8",
//        dataType: 'json',
//        cache: true,
//        success: function (data) {

//            // Disable change event on dropdown to be populated.
//            var temp = $('#' + metric)[0].change;
//            $('#' + metric)[0].change = null;
//            //

//            $('#' + metric).empty();

//            if (data.d.length > 0) {
//                $.each(data.d, (function (key, value) {
//                    var selected = "";
//                    if (value.Item2 == desiredvalue) {
//                        selected = "selected";
//                    }
//                    SelectAdd(metric, value.Item1, value.Item2, selected);
//                }));

//            }

//            $('#' + metric).multiselect("refresh");

//            // Restore change event on completion
//            $('#' + metric)[0].change = temp;
//            //

//        },
//        failure: function (msg) {
//            alert(msg);
//        },
//        async: false
//    });

//}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadSettingsAndApply() {

    var thedatasent = "{'userName':'" + postedUserName + "'}";
    var url = "./eventService.asmx/getDashSettings";

    $.ajax({
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            var settings = eval(data.d);
            // Turn Off Features

            applicationsettings = settings;

            $.each(settings, (function (key, value) {
                if (value.Name == "DashTab") {
                    if (value.Enabled == 'True') {
                        $(value.Value).show();
                    } else {
                        $(value.Value).hide();
                    }
                }


                if (value.Name == "DashImage") {

                }

            }));

        },
        failure: function (msg) {
            alert(msg);
        },
        async: false
    });
}
  
//////////////////////////////////////////////////////////////////////////////////////////////

function buildPage() {

    $(document).bind('contextmenu', function (e) { return false; });

    $.blockUI({ css: { border: '0px' } });

    $(document).ajaxStart(function () {
        //if (timeout != null) {
        //    clearTimeout(timeout);
        //    timeout = null;
        //}

        timeout = setTimeout(function () {
            $.blockUI({ message: '<div unselectable="on" class="wait_container"><img alt="" src="./images/ajax-loader.gif" /><br><div unselectable="on" class="wait">Please Wait. Loading...</div></div>' });
        }, 1000);
    });

    $(document).ajaxStop(function () {
        if (timeout != null) {
            clearTimeout(timeout);
            timeout = null;
        }

        $.unblockUI();
    });

    $("#draggable").draggable({ scroll: false });

    $('#draggable').hide();

    $('#delete-dialog').hide();

    $('#modal-dialog').hide();

    //$(".column").sortable({
    //    connectWith: ".column",
    //    handle: ".portlet-header",
    //    cancel: ".portlet-toggle",
    //    placeholder: "portlet-placeholder",
    //    dropOnEmpty: true,
    //    forcePlaceholderSize: true,
    //    tolerance: "pointer",
    //    receive: function (event, ui) {
    //        if (typeof (map) != "undefined") {
    //            google.maps.event.trigger(map, 'resize');
    //            //map.updateSize();
    //        }
    //    },
    //    start: function (event, ui) {
    //        $('#sortable').sortable('refreshPositions');
    //    }
    //});

    var mousemove = null;

    $(".resizeable").resizable(
    {
        autoHide: true,
        handles: 'e',
        animate: false,

        resize: function (e, ui) {
            var parent = ui.element.parent();
            var remainingSpace = parent.width() - ui.element.outerWidth(),
                divTwo = ui.element.next(),
                divTwoWidth = ((remainingSpace - (divTwo.outerWidth() - divTwo.width() + 1)) / parent.width()) * 100 + "%";
            divTwo.width(divTwoWidth);
        },
        stop: function (e, ui) {
            var parent = ui.element.parent();
            ui.element.css(
            {
                width: ui.element.width() / parent.width() * 100 + "%"
            });

            reflowContents(currentTab);
        }
    });

    $(".portlet")
        .addClass("ui-widget ui-widget-content ui-helper-clearfix")
        .find(".portlet-header")
        .addClass("ui-widget-header")
        .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>")
        .end()
        .find(".portlet-content");

    $(".portlet-toggle").click(function () {
        var icon = $(this);
        icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
        icon.closest(".portlet").find(".portlet-content").slideToggle(0, function () { reflowContents(currentTab); });
        return (true);
    });

    $.ech.multiselect.prototype.options.selectedText = "# of # selected";

    $(window).on('resize', function () { resizeMapAndMatrix(currentTab); });

    if ($.jStorage.get("usersettings") != null) {
        usersettings = $.jStorage.get("usersettings");
        validatesettings(usersettings);
    } else {
        initializesettings();
    }

    loadconfigdropdown(usersettings.lastSetting);

    currentTab = "Events";

    //if (getcurrentconfigsetting("CurrentTab") == 1) {
    //    currentTab = "Faults";
    //}

    $("#application-tabs").tabs({
        active: getcurrentconfigsetting("CurrentTab"),
        heightStyle: "100%",
        widthStyle: "99%",

        activate: function (event, ui) {
            stopAnimatedHeatmap();
            var newTab = ui.newTab.attr('li', "innerHTML")[0].getElementsByTagName("a")[0].innerHTML;
            var mapormatrix = $("#mapGrid")[0].value;
            manageTabsByDate(newTab, contextfromdate, contexttodate);
            resizeMapAndMatrix(newTab);
            selectsitesincharts();
            $("#mapGrid")[0].value = mapormatrix;
            selectmapgrid($("#mapGrid")[0]);
            
        }
    });

        

    datafromdate = getcurrentconfigsetting("DataFromDate");
    datatodate = getcurrentconfigsetting("DataToDate");

    contextfromdate = getcurrentconfigsetting("ContextFromDate");
    contexttodate = getcurrentconfigsetting("ContextToDate");

    initializeDatePickers(datafromdate, datatodate);
    getMeters();
    loadsitedropdown();

    //$("#MeasurementType").multiselect({ minWidth: 120, noneSelectedText: "Type", selectedList: 1, multiple: false });
    //$("#MeasurementCharacteristic").multiselect({ minWidth: 120, noneSelectedText: "Characteristic", selectedList: 1, multiple: false });
    //$("#Phase").multiselect({ minWidth: 120, noneSelectedText: "Phase", selectedList: 1, multiple: false });
    //$("#Period").multiselect({ minWidth: 70, noneSelectedText: "Period", selectedList: 1, multiple: false });

    //$("#MeasurementType")[0].change = function (event, ui) {
    //    selectMeasure(this);
    //};
    //$("#MeasurementCharacteristic")[0].change = function (event, ui) {
    //    selectMeasure(this);
    //};
    //$("#Phase")[0].change = function (event, ui) {
    //    selectMeasure(this);
    //};
    //$("#Period")[0].change = function (event, ui) {
    //    selectMeasure(this);
    //};


    $('#DetailEvents').jqxGrid({ width: 0 });

    $('#DetailEvents').mousedown(function (event) {

        var datainformation = $('#DetailEvents').jqxGrid('getdatainformation');
        if (datainformation.rowscount == 0) return (false);

        // get the clicked cell.
        var cell = $('#DetailEvents').jqxGrid('getCellAtPosition', event.pageX, event.pageY);
        //select row.
        if (cell != null && cell.row) {
            $('#DetailEvents').jqxGrid('selectrow', cell.row);
        }
        //var rightClick = isRightClick(event);
        //if (rightClick) {
        var datarow = $('#DetailEvents').jqxGrid('getrowdata', cell.row);

        //var testy1 = datarow.thesite + "|" + datarow.themeterid;
        var testy = [];
        testy.push(datarow.thesite + "|" + datarow.themeterid);

        selectsitesonmap(testy);
        //var popup = window.open("OpenSEEStack.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "-browser", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no");
        return false;
        //}
    });

    $('#DetailBreakers').jqxGrid({ width: 0 });

    $('#DetailBreakers').mousedown(function (event) {

        var datainformation = $('#DetailBreakers').jqxGrid('getdatainformation');
        if (datainformation.rowscount == 0) return (false);

        // get the clicked cell.
        var cell = $('#DetailBreakers').jqxGrid('getCellAtPosition', event.pageX, event.pageY);
        //select row.
        if (cell != null && cell.row) {
            $('#DetailBreakers').jqxGrid('selectrow', cell.row);
        }
        //var rightClick = isRightClick(event);
        //if (rightClick) {
        var datarow = $('#DetailBreakers').jqxGrid('getrowdata', cell.row);

        //var testy1 = datarow.thesite + "|" + datarow.themeterid;
        var testy = [];
        testy.push(datarow.thesite + "|" + datarow.themeterid);

        selectsitesonmap(testy);
        //var popup = window.open("OpenSEEStack.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "-browser", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no");
        return false;
        //}
    });


    //$('#DetailEvents').on('rowdoubleclick', function (event) {

    //    var datainformation = $('#DetailEvents').jqxGrid('getdatainformation');
    //    if (datainformation.rowscount == 0) return (false);

    //    // get the clicked cell.
    //    var cell = $('#DetailEvents').jqxGrid('getCellAtPosition', event.args.originalEvent.pageX, event.args.originalEvent.pageY);
    //    //select row.
    //    if (cell != null && cell.row) {
    //        $('#DetailEvents').jqxGrid('selectrow', cell.row);
    //    }

    //    var datarow = $('#DetailEvents').jqxGrid('getrowdata', cell.row);

    //    var popup = window.open("MeterEventsByLine.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "-browser", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no");

    //    //var args = event.args;
    //    //// row's bound index.
    //    //var boundIndex = args.rowindex;
    //    //// row's visible index.
    //    //var visibleIndex = args.visibleindex;
    //    //// right click.
    //    //var rightclick = args.rightclick;
    //    //// original event.
    //    //var ev = args.originalEvent;
    //});


    $('#DetailFaults').jqxGrid({ width: 0 });

    $('#DetailFaults').mousedown(function (event) {

        var datainformation = $('#DetailFaults').jqxGrid('getdatainformation');
        if (datainformation.rowscount == 0) return (false);

        // get the clicked cell.
        var cell = $('#DetailFaults').jqxGrid('getCellAtPosition', event.pageX, event.pageY);
        //select row.
        if (cell != null && cell.row) {
            $('#DetailFaults').jqxGrid('selectrow', cell.row);
        }
        //var rightClick = isRightClick(event);
        //if (rightClick) {
        var datarow = $('#DetailFaults').jqxGrid('getrowdata', cell.row);

        //var testy1 = datarow.thesite + "|" + datarow.themeterid;
        var testy = [];
        testy.push(datarow.thesite + "|" + datarow.themeterid);

        selectsitesonmap(testy);

        //var popup = window.open("OpenSEEStack.aspx?eventid=" + datarow.eventid, datarow.eventid + "-browser", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no");
        return false;
        //}
    });

    //$('#DetailFaults').on('rowdoubleclick', function (event) {

    //    var datainformation = $('#DetailFaults').jqxGrid('getdatainformation');
    //    if (datainformation.rowscount == 0) return (false);

    //    // get the clicked cell.
    //    var cell = $('#DetailFaults').jqxGrid('getCellAtPosition', event.args.originalEvent.pageX, event.args.originalEvent.pageY);
    //    //select row.
    //    if (cell != null && cell.row) {
    //        $('#DetailFaults').jqxGrid('selectrow', cell.row);
    //    }

    //    var datarow = $('#DetailFaults').jqxGrid('getrowdata', cell.row);

    //    var popup = window.open("MeterEventsByLine.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "-browser", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no");

    //    //var args = event.args;
    //    //// row's bound index.
    //    //var boundIndex = args.rowindex;
    //    //// row's visible index.
    //    //var visibleIndex = args.visibleindex;
    //    //// right click.
    //    //var rightclick = args.rightclick;
    //    //// original event.
    //    //var ev = args.originalEvent;
    //});

    $('#DetailTrending').jqxGrid({ width: 0 });

    $('#DetailTrending').bind('rowdoubleclick', function (event) {
        var row = event.args.rowindex;

        $('#DetailTrending').jqxGrid('selectrow', row);
        var datarow = $('#DetailTrending').jqxGrid('getrowdata', row);
        var thedate = $("#trendingDetailHeader")[0].innerHTML;
        $("#trendingWaveformHeader")[0].innerHTML = $("#trendingDetailHeader")[0].innerHTML;
        PopulateTrendingWaveformDropdowns(datarow, thedate);
        populateDivWithLineChartByChannelID('getTrendsforChannelIDDate', 'Waveform' + currentTab, datarow.channelid, thedate, datarow.eventtype, datarow.sitename + " - " + datarow.eventtype + " - " + datarow.measurementtype + " - " + datarow.characteristic + " - " + datarow.phasename + " for " + thedate);
    });

    resizeMapAndMatrix(currentTab);
    manageTabsByDate(currentTab, contextfromdate, contexttodate);
    selectsitesincharts();

    $("#application-tabs").tabs("option", "active", getcurrentconfigsetting("CurrentTab"));
    $("#mapGrid")[0].value = getcurrentconfigsetting("MapGrid");
    $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

    selectmapgrid($("#mapGrid")[0]);

    $('#actionButton').click(function () {
        $('#actionButton').toggleClass('off');
        if ($("#actionButton").hasClass("off")) {
            start_animate_heatmap();
        } else {
            stop_animate_heatmap();
        }
    });

    $('#HeatmapControlsTrending').hide();
    $("#slider").slider({
        change: function(event, ui) {
            if (heatmapCache != null) {
                if (heatmapCache.length > 0) {
                    if (heatmapCache[0].length > 0) {

                        currentframe = ui.value;

                        $("#position")[0].innerHTML = heatmapCache[ui.value][0].datetime;

                        var themap = getMapInstance(currentTab);
                        LoadHeatmapDataAnimate(heatmapCache[ui.value], themap);

                        if ($("#actionButton").hasClass("off")) {
                            timeoutID = window.setInterval(NextHeatmap, 0);
                        }
                    } else {
                        $("#position")[0].innerHTML = "No Data Loaded";
                        $("#actionButton").removeClass("off");
                    }
                } else {
                    $("#position")[0].innerHTML = "No Data Loaded";
                    $("#actionButton").removeClass("off");
                }
            }
        }
    });

    loadSettingsAndApply();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function start_animate_heatmap() {
    var dateFrom = getMapHeaderDate("From");
    var dateTo = getMapHeaderDate("To");
    FetchHeatmapForDateRange(dateTo, dateTo);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function stop_animate_heatmap() {
    if (timeoutID != null) {
        window.clearInterval(timeoutID);
        timeoutID = null;
        //$("#slider").slider("option", "value", 0);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

var currentframe = 0;
var timeoutID = null;

/////////////////////////////////////////////////////////////////////////////////////////

function NextHeatmap() {

    if (timeoutID != null) {
        window.clearInterval(timeoutID);
    }

    if (currentframe >= heatmapCache.length) { clearheatmap(); }

    if ((currentframe >= heatmapCache.length) || (currentframe == 0)) {
        currentframe = 0;
    }

    $("#slider").slider("option", "value", currentframe);

    currentframe++;
}

/////////////////////////////////////////////////////////////////////////////////////////

function LoadHeatmapData(data, themap) {

    var heat_data = new google.maps.MVCArray();

    var accumulatedmax = 0;

    $.each(data, function (key, value) {

        if (accumulatedmax < value.status) { accumulatedmax = value.status }
        if (value.status != 0) {
            heat_data.push({
                id: value.id,
                location: new google.maps.LatLng(value.location.latitude, value.location.longitude),
                weight: value.status
            });
        }
    });

    clearheatmap();

    themap.heatmap = new google.maps.visualization.HeatmapLayer({
        maxIntensity: accumulatedmax,
        radius: 50,
        data: heat_data
        //dissipating: false,
        //opacity: .2
    });

    themap.heatmap.setMap(themap);

}

/////////////////////////////////////////////////////////////////////////////////////////

function clearheatmap() {
    var themap = getMapInstance(currentTab);
    if (themap != null) {
        if (themap.heatmap != null) {
            themap.heatmap.setData([]);
        }            
    }
}

/////////////////////////////////////////////////////////////////////////////////////////

function getpreviousheatmapvalue(id) {

    var thevalue = 0;

    var map = getMapInstance(currentTab);
    var themapdata = map.heatmap.getData();
    if (themapdata == null) return (0);
    if (themapdata.length == 0) return (0);

    themapdata.forEach(function (mapdatachunk) {

        if (mapdatachunk.id == id) {
            thevalue = mapdatachunk.weight;
            return true;
        }
    });

    return (thevalue);
}

/////////////////////////////////////////////////////////////////////////////////////////

function LoadHeatmapDataAnimate(data, themap) {

    var theoldvalue = 0;
    var thenewvalue = 0;
    var heat_data = new google.maps.MVCArray();
    var accumulatedmax = 0;

    $.each(cache_Map_Matrix_Data.d, function (key, thecachedvalue) {

        //find in current heatmap
        theoldvalue = getpreviousheatmapvalue(thecachedvalue.id);
        thenewvalue = 0;

        $.each(data, function (key, thefetchedvalue) {

            if (thecachedvalue.id == thefetchedvalue.id) {
                thenewvalue = thefetchedvalue.status;
                return true;
            }
        });

        if (thenewvalue > 0) {
            heat_data.push({
                id: thecachedvalue.id,
                location: new google.maps.LatLng(thecachedvalue.location.latitude, thecachedvalue.location.longitude),
                weight: thenewvalue
            });
            if (accumulatedmax < thenewvalue) {
                accumulatedmax = thenewvalue;
            }
        }
        else if (theoldvalue > 0) {
            heat_data.push({
                id: thecachedvalue.id,
                location: new google.maps.LatLng(thecachedvalue.location.latitude, thecachedvalue.location.longitude),
                weight: theoldvalue
            });
            if (accumulatedmax < theoldvalue) {
                accumulatedmax = theoldvalue;
            }
        }
    });

    themap.heatmap.setData(heat_data);

    themap.heatmap.maxIntensity = accumulatedmax;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function FetchHeatmapForDateRange(begindate, enddate) {
    heatmap_Cache_Date_From = moment(new Date(begindate));
    heatmap_Cache_Date_To = moment(new Date(begindate)).add(1, "day");;

    var thedate = heatmap_Cache_Date_From.format('MM/DD/YYYY HH:mm:ss');
    var theenddate = heatmap_Cache_Date_To.format('MM/DD/YYYY HH:mm:ss');

    $("#position")[0].innerHTML = "Loading Data...";
    if (heatmapCache != null) {
        if (heatmapCache.length > 0) {
            if (heatmapCache[0].length > 0) {
                var heatmapCacheDateCurrent = moment(new Date(begindate)).format('MM/DD/YYYY HH:mm:ss');
                if (thedate == heatmapCacheDateCurrent) {
                    $("#slider").slider("option", "value", currentframe);
                    return;
                } else {
                    heatmapCache.length = 0;
                    var themapdata = getMapInstance(currentTab).heatmap.getData();
                    themapdata.forEach(function(thepoint) {
                        thepoint.weight = 0;
                    });
                }
            }
        }
    }

    var thesiteidlist = GetAllSitesIDs();
    heatmapCache = new Array();

    cacheLocationsAndStateForPeriod(currentTab, thedate, theenddate , thesiteidlist);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function cacheLocationsAndStateForPeriod(currentTab, datefrom, dateto, thesites) {

    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'meterIDs':'" + thesites + "' , 'userName':'" + postedUserName + "'}";
    var url = "./mapService.asmx/getHeatmapLocations" + currentTab;

    $.ajax({
        datefrom: datefrom,
        dateto: dateto,
        thesites: thesites,
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            if (heatmapCache == null) {
                heatmapCache = new Array();
            }

            heatmapCache.push(data.d);

            if (this.datefrom != this.dateto) {
                var temp = moment(new Date(this.datefrom)).add(5, "minutes");
                var thedate = temp.format('MM/DD/YYYY HH:mm:ss');
                cacheLocationsAndStateForPeriod(currentTab, thedate, this.dateto, thesites);

            } else {
                $("#slider").slider("option", "min", 0);
                $("#slider").slider("option", "max", heatmapCache.length);
                NextHeatmap();
            }

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////
function resetAnimatedHeatmap() {

    stopAnimatedHeatmap();
    clearheatmap();
    if (heatmapCache != null) {
        heatmapCache.length = 0;
    }
    $("#slider").slider("option", "min", 0);
    $("#slider").slider("option", "max", 0);
    $("#slider").slider("option", "value", 0);
    $("#actionButton").removeClass("off");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function stopAnimatedHeatmap() {

    if (timeoutID != null) {
        window.clearInterval(timeoutID);
    }

    timeoutID = null;
    $("#actionButton").removeClass("off");
}

//////////////////////////////////////////////////////////////////////////////////////////////
/// EOF




