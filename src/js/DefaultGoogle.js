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


var globalcolorsBreakers = ['#90ed7d', '#434348', '#ff0000'];
var globalcolorsTrending = ['#434348', '#ff0000'];

var globalcolors = ['#90ed7d', '#434348', '#ff0000', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
var globalcolorsFaults = [ '#2b908f', '#e4d354', '#f15c80', '#8085e9', '#f7a35c', '#90ed7d', '#434348', '#ff0000'];
//var globalcolorsEvents = ['#C00000', '#FF2800', '#FF9600', '#FFFF00', '#00FFF4', '#0000FF'];
var globalcolorsEvents = ['#0000FF', '#00FFF4', '#FFFF00', '#FF9600', '#FF2800', '#C00000'];
//var globalcolorsDQ = ['#00FFF4', '#00C80E', '#FFFF00', '#FF9600', '#FF2800', '#FF0EF0', '#0000FF'];
var globalcolorsDQ = ['#0000FF', '#FF0EF0', '#FF2800', '#FF9600', '#FFFF00', '#00C80E', '#00FFF4'];

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

// Billy's cached data
var cache_Graph_Data = null;
var cache_ErrorBar_data = null;
var cache_Table_Data = null;
var cache_Contour_Data = null;
var brush = null;
var cache_Last_Date = null;
var contourMap = null;
var markerGroup = null;

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
        var fromdate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerFrom').datepicker('getDate')));
        var todate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerTo').datepicker('getDate')));

        contextfromdate = getFormattedDate(fromdate);
        contexttodate = getFormattedDate(todate);

        if (contextfromdate == contexttodate) {
            cache_Last_Date = contexttodate;
        }
        else {
            cache_Last_Date = null;
            cache_Table_Data = null;
        }

        setMapHeaderDate(contextfromdate, contexttodate);
        manageTabsByDate(currentTab, contextfromdate, contexttodate);
        resetAnimatedHeatmap();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectmapgrid(thecontrol) {
    if (thecontrol.selectedIndex === 1) {
        $("#theMatrix" + currentTab).show();
        $("#theMap" + currentTab).hide();
        $("#ContoursControlsTrending").hide();
        if (cache_Map_Matrix_Data != null) {
            plotGridLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);  
        }
        $.sparkline_display_visible();
        updateGridWithSelectedSites();
    } else if (currentTab !== "TrendingData" && thecontrol.selectedIndex === 0) {
        $("#ContoursControlsTrending").hide();
        $("#theMap" + currentTab).show();
        $("#theMatrix" + currentTab).hide();

        var map = getMapInstance(currentTab);
        if (map == null) {
            createMap(currentTab);
        } else {
            google.maps.event.trigger(map, 'resize');
            $.sparkline_display_visible();
            showSiteSet($("#selectSiteSet" + currentTab)[0]);
        }
    } else if (currentTab === "TrendingData" && thecontrol.selectedIndex === 0) {
        $("#ContoursControlsTrending").hide();
        $("#theMap" + currentTab).show();
        $("#theMatrix" + currentTab).hide();
        if (contourMap == null) {
            loadLeafletMap('theMap' + currentTab);
            //loadDataForDate();
        }

        showSiteSet($("#selectSiteSet" + currentTab)[0]);
        
        //$('#theContourMap' + currentTab).height($(document))
        //var map = getMapInstance(currentTab);
        //if (map == null) {
        //    createMap(currentTab);
        //} else {
        //    google.maps.event.trigger(map, 'resize');
        //    $.sparkline_display_visible();
        //    showSiteSet($("#selectSiteSet" + currentTab)[0]);
        //}

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function renderMap() {
    if (cache_Map_Matrix_Data != null) {
        plotMapLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To, "undefined");
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

function selectsitesonmap(focussite, filter) {
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
            
            var legendFields;
            if ($("#application-tabs").tabs("option", "active") === getcurrentconfigsetting("CurrentTab")) {
                var leg = d3.selectAll('.legend' + currentTab);
                var filterString = [];
                var unfilteredString = [];
                $.each(leg[0], function (i, d) {
                    if ($(d).children('rect').css('fill') === 'rgb(128, 128, 128)')
                        filterString.push($(d).children('text').text());
                    unfilteredString.push($(d).children('text').text());
                });
                legendFields = unfilteredString.filter(function (a) { return filterString.indexOf(a) < 0 });
            }
            showHeatmap($("#selectHeatmap" + currentTab)[0], filter);

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

    if (cache_Last_Date !== null) {
        getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, sitename, thesiteidlist, cache_Last_Date);
    } else {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
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
// The following functions are for getting Table data and populating the tables
function getTableDivData(thedatasource, thediv, siteName, siteID, theDate) {
    var thedatasent = "{'siteID':'" + siteID + "'"+ (currentTab === "TrendingData"? ", 'measurementType': '" + $('#trendingDataSelection').val() + "'": "")+ ", 'targetDate':'" + theDate + "','userName':'" + postedUserName + "'   }";
    //console.log(thedatasent);
    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            var json = $.parseJSON(data.d)
            cache_Table_Data = json;

            //if (currentTab === "TrendingData") {
            //    window["populate" + currentTab + "DivWithGrid"](json, null);
            //} else {

                var filterString = [];
                var leg = d3.selectAll('.legend');

                $.each(leg[0], function (i, d) {
                    if ($(d).children('rect').css('fill') === 'rgb(128, 128, 128)')
                        filterString.push($(d).children('text').text());
                });
                window["populate" + currentTab + "DivWithGrid"](json, filterString);

            //}
        }
    });
}

function populateFaultsDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (disabledFields !== null) {
        $.each(data, function (i, d) {
            if(disabledFields.indexOf(d.voltage + ' kV') < 0)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }


    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'theinceptiontime', headerText: 'Start Time', headerStyle: 'width: 15%', bodyStyle: 'width: 15%; height: 20px', sortable: true },
            { field: 'thelinename', headerText: 'Line', headerStyle: 'width: 40%', bodyStyle: 'width: 40%; height: 20px', sortable: true },
            { field: 'voltage', headerText: 'kV', headerStyle: 'width: 6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
            { field: 'thefaulttype', headerText: 'Type', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
            { field: 'thecurrentdistance', headerText: 'Miles', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
            { field: 'locationname', headerText: 'Location', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'OpenSEE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSEEButton_html },
            { field: 'FaultSpecifics', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeFaultSpecificsButton_html }
        ],
        datasource: filteredData
    });
}

function populateCorrectnessDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (disabledFields !== null) {
        $.each(data, function (i, d) {
            var flag = false;
            $.each(disabledFields, function (j, e) {
                switch (e) {
                    case '> 100%':
                        if (parseFloat(d.Correctness) > 100)
                            flag = true;
                        break;

                    case '98% - 100%':
                        if (parseFloat(d.Correctness) >= 98 && parseFloat(d.Correctness) <= 100)
                            flag = true;
                        break;

                    case '90% - 97%':
                        if (parseFloat(d.Correctness) >= 90 && parseFloat(d.Correctness) < 98)
                            flag = true;
                        break;

                    case '70% - 89%':
                        if (parseFloat(d.Correctness) >= 70 && parseFloat(d.Correctness) < 90)
                            flag = true;
                        break;

                    case '50% - 69%':
                        if (parseFloat(d.Correctness) >= 50 && parseFloat(d.Correctness) < 70)
                            flag = true;
                        break;

                    case '>0% - 49%':
                        if (parseFloat(d.Correctness) > 0 && parseFloat(d.Correctness) < 50)
                            flag = true;
                        break;

                    case '0%':
                        if (parseFloat(d.Correctness) == 0)
                            flag = true;
                        break;
                }
            });
            if (!flag)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }


    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
            { field: 'Latched', headerText: 'Latched', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Latched).toFixed(0) + '%'; } },
            { field: 'Unreasonable', headerText: 'Unreasonable', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Unreasonable).toFixed(0) + '%'; } },
            { field: 'Noncongruent', headerText: 'Noncongruent', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Noncongruent).toFixed(0) + '%'; } },
            { field: 'Correctness', headerText: 'Correctness', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Correctness).toFixed(0) + '%'; } },
            { field: 'ChannelDataQuality', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeChannelDataQualityButton_html }
        ],
        datasource: filteredData
    });
}

function populateCompletenessDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (disabledFields !== null) {
        $.each(data, function (i, d) {
            var flag = false;
            $.each(disabledFields, function (j, e) {
                switch (e) {
                    case '> 100%':
                        if (d.Completeness > 100)
                            flag = true;
                        break;

                    case '98% - 100%':
                        if (d.Completeness >= 98 && d.Completeness <= 100)
                            flag = true;
                        break;

                    case '90% - 97%':
                        if (d.Completeness >= 90 && d.Completeness < 98)
                            flag = true;
                        break;

                    case '70% - 89%':
                        if (d.Completeness >= 70 && d.Completeness < 90)
                            flag = true;
                        break;

                    case '50% - 69%':
                        if (d.Completeness >= 50 && d.Completeness < 70)
                            flag = true;
                        break;

                    case '>0% - 49%':
                        if (d.Completeness > 0 && d.Completeness < 50)
                            flag = true;
                        break;

                    case '0%':
                        if (d.Completeness == 0)
                            flag = true;
                        break;
                }
            });
            if (!flag)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }


    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
            { field: 'Expected', headerText: 'Expected', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true },
            { field: 'Received', headerText: 'Received', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Received).toFixed(0) + '%'; } },
            { field: 'Duplicate', headerText: 'Duplicate', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Duplicate).toFixed(0) + '%'; } },
            { field: 'Completeness', headerText: 'Complete', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Completeness).toFixed(0) + '%'; } },
            { field: 'ChannelCompleteness', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeChannelCompletenessButton_html }
        ],
        datasource: filteredData
    });
}

function populateEventsDivWithGrid(data, disabledFields) {
    //console.log($('#Detail' + currentTab + 'Table').children());
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail'+ currentTab +'Table"></div>');
    }

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterEventsByLine(' + row.theeventid + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.thesite+ '</button>' } },
            { field: 'interruptions', headerText: 'Interruptions', headerStyle: 'width: 12%; ' + (disabledFields !== null && disabledFields.indexOf('Interruption') >= 0 ? 'display: none' : '' ), bodyStyle: 'width: 12%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('Interruption') >= 0 ? 'display: none': ''), sortable: true },
            { field: 'faults', headerText: 'Faults', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('Fault') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('Fault') >= 0 ? 'display: none' : ''), sortable: true },
            { field: 'sags', headerText: 'Sags', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('Sag') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('Sag') >= 0 ? 'display: none' : ''), sortable: true },
            { field: 'swells', headerText: 'Swells', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('Swell') >= 0 ? 'display: none' : ''), bodyStyle: 'width:  10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('Swell') >= 0 ? 'display: none' : ''), sortable: true },
            { field: 'others', headerText: 'Others', headerStyle: 'width:  10%; ' + (disabledFields !== null && disabledFields.indexOf('Other') >= 0 ? 'display: none' : ''), bodyStyle: 'width:  10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('Other') >= 0 ? 'display: none' : ''), sortable: true }
        ],
        datasource: data
    });

}

function populateDisturbancesDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterDisturbancesByLine(' + row.theeventid + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.thesite+ '</button>' } },
            { field: '5', headerText: '5', headerStyle: 'width: 12%; ' + (disabledFields !== null && disabledFields.indexOf('5') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 12%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('5') >= 0 ? 'display: none' : ''), sortable: true },
            { field: '4', headerText: '4', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('4') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('4') >= 0 ? 'display: none' : ''), sortable: true },
            { field: '3', headerText: '3', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('3') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('3') >= 0 ? 'display: none' : ''), sortable: true },
            { field: '2', headerText: '2', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('2') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('2') >= 0 ? 'display: none' : ''), sortable: true },
            { field: '1', headerText: '1', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('1') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('1') >= 0 ? 'display: none' : ''), sortable: true },
            { field: '0', headerText: '0', headerStyle: 'width: 10%; ' + (disabledFields !== null && disabledFields.indexOf('0') >= 0 ? 'display: none' : ''), bodyStyle: 'width: 10%; height: 20px; ' + (disabledFields !== null && disabledFields.indexOf('0') >= 0 ? 'display: none' : ''), sortable: true },
        ],
        datasource: data
    });
}

function populateBreakersDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }


    var filteredData = [];
    if (disabledFields !== null) {
        $.each(data, function (i, d) {
            if (disabledFields.indexOf(d.operationtype) < 0)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'energized', headerText: 'TCE Time', headerStyle: 'width: 15%', bodyStyle: 'width: 15%; height: 20px', sortable: true },
            { field: 'breakernumber', headerText: 'Breaker', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'linename', headerText: 'Line', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'phasename', headerText: 'Phase', headerStyle: 'width:  10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'timing', headerText: 'Timing', headerStyle: 'width:  10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'speed', headerText: 'Speed', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'operationtype', headerText: 'Operation', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'OpenSEE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSEEButton_html },
            //{ field: 'FaultSpecifics', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeFaultSpecificsButton_html }
        ],
        datasource: filteredData
    });

}

function populateTrendingDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (disabledFields !== null) {
        $.each(data, function (i, d) {
            if (disabledFields.indexOf(d.eventtype) < 0)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'sitename', headerText: 'Name', headerStyle: 'width: 25%', bodyStyle: 'width: 35%; height: 20px', sortable: true},
            { field: 'eventtype', headerText: 'Alarm Type', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true },
            { field: 'measurementtype', headerText: 'Measurement Type', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'characteristic', headerText: 'Characteristic', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'phasename', headerText: 'Phase', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'HarmonicGroup', headerText: 'HG', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'eventcount', headerText: 'Count', headerStyle: 'width:  10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'OpenSTE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: function (row) { return makeOpenSTEButton_html(row); } }
        ],
        datasource: filteredData
    });

}

function populateTrendingDataDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }


    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'Name', headerText: 'Name', headerStyle: 'width: 15%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
            { field: 'characteristic', headerText: 'Characterisitc', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true },
            { field: 'phasename', headerText: 'Phase', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
            { field: 'Minimum', headerText: 'Minimum', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Minimum).toFixed(4);} },
            { field: 'Maximum', headerText: 'Maximum', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Maximum).toFixed(4); } },
            { field: 'Average', headerText: 'Average', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return parseFloat(row.Average).toFixed(4); } },
            //{ field: 'eventcount', headerText: 'Count', headerStyle: 'width:  10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
            { field: 'OpenSTE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: function (row) { return makeOpenSTEButton_html(row); }}
        ],
        datasource: data
    });

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////

function filterMakeFaultSpecificsButton_html(id) {
    var return_html = "";

    if (id.eventtype == "Fault") {
        return_html = makeFaultSpecificsButton_html(id);
    }

    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeFaultSpecificsButton_html(id) {

    var return_html = "";

    return_html += '<div style="width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';

    return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open Fault Detail Window">';

    return_html += '<img src="images/faultDetailButton.png" /></button></div>';

return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToFaultSpecifics(id) {
    var datarow = id;
    //console.log(id);
    var popup = window.open("FaultSpecifics.aspx?eventid=" + id, id + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSEEButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSTEButton_html(id) {
    var return_html = "";
    var url = "'openSTE.aspx?channelid="
        + encodeURIComponent(id.channelid)
        + "&date=" + encodeURIComponent(id.date)
        + "&meterid=" + encodeURIComponent(id.meterid)
        + "&measurementtype=" + encodeURIComponent(id.measurementtype)
        + "&characteristic=" + encodeURIComponent(id.characteristic)
        + "&phasename=" + encodeURIComponent(id.phasename) + "'";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSTE( ' + url + ',' + id.channelid + ' )" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSTE Trending Viewer">';
    return_html += '<img src="images/steButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSTE(url, id) {
    var popup = window.open(url, id + "openSTE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}


//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSEE(id) {
    var url = "openSEE.aspx?eventid=" + id;

    if (currentTab == "Breakers")
        url += "&breakerdigitals=1";
    else
        url += "&faultcurves=1";

    var popup = window.open(url, id + "openSEE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeChannelDataQualityButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataQuality(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dqDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeChannelCompletenessButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataCompleteness(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dcDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeMeterEventsByLineButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToMeterEventsByLine(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">';
    return_html += '<img src="images/eventDetailButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToMeterEventsByLine(id) {
    var popup = window.open("MeterEventsByLine.aspx?eventid=" + id, id + "MeterEventsByLine", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToMeterDisturbancesByLine(id) {
    var popup = window.open("MeterDisturbancesByLine.aspx?eventid=" + id, id + "MeterDisturbancesByLine", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}


//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToChannelDataQuality(id) {
    var popup = window.open("ChannelDataQuality.aspx?eventid=" + id, id + "ChannelDataQuality", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToChannelDataCompleteness(id) {
    var popup = window.open("ChannelDataCompleteness.aspx?eventid=" + id, id + "ChannelDataCompleteness", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
function getColorsForTab(thetab) {
    
    switch(thetab) {
    
        case "Events":
            return(globalcolorsEvents);
            break;

        case "Disturbances":
            return (globalcolorsEvents);
            break;


        case "Trending":
            return(globalcolorsTrending);
            break;

        case "Faults":
            return(globalcolorsFaults);
            break;

        case "Breakers":
            return(globalcolorsBreakers);
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
    var newdate = new Date(date);
    var year = newdate.getFullYear();
    var month = (1 + newdate.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = newdate.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateDivWithBarChart(thedatasource, thediv, siteName, siteID, thedatefrom, thedateto) {
    //console.log("disturbances");
    var thestartdateX = new Date(thedatefrom);
    thestartdateX.setHours(0, 0, 0, 0);

    var contextfromdateX = new Date(contextfromdate);
    contextfromdateX.setHours(0, 0, 0, 0);

    var contexttodateX = new Date(contexttodate);
    contexttodateX.setHours(0, 0, 0, 0);

    var thestartdate = new Date(Date.UTC(thestartdateX.getUTCFullYear(), thestartdateX.getUTCMonth(), thestartdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contextfromdateUTC = new Date(Date.UTC(contextfromdateX.getUTCFullYear(), contextfromdateX.getUTCMonth(), contextfromdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contexttodateUTC = new Date(Date.UTC(contexttodateX.getUTCFullYear(), contexttodateX.getUTCMonth(), contexttodateX.getUTCDate(), 0, 0, 0)).getTime();


    var thedatasent = "";
    thedatasent = "{'siteID':'" + siteID + "', 'targetDateFrom':'" + thedatefrom + "', 'targetDateTo':'" + thedateto + "' , 'userName':'" + postedUserName + "'}";
    //console.log(thedatasource);
    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            //console.log(data.d.data);

            data.d.data.reverse();
            var graphData = [];
            for (var i = 0; i < data.d.data[0].data.length; ++i) {
                var obj = {};
                var total = 0;
                obj["Date"] = new Date(thedatefrom).setDate(new Date(thedatefrom).getDate() + i);
                data.d.data.forEach(function (d, j) {
                    obj[d.name] = d.data[i];
                    total += d.data[i];
                    obj[d.name + 'Disabled'] = false;
                });
                obj["Total"] = total;
                graphData.push(obj);

            }


            cache_Graph_Data = graphData;

            if (thediv === "Overview") {

            } else if (thediv === "TrendingData") {

            }else
                buildBarChart(graphData, thediv, siteName, siteID, thedatefrom, thedateto);
            
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });

}

function buildBarChart(data, thediv, siteName, siteID, thedatefrom, thedateto) {
    $('#' + thediv).children().remove();

    var YaxisLabel = "";
    switch (currentTab) {
        case "Completeness":
            YaxisLabel = "Sites";
            break;

        case "Correctness":
            YaxisLabel = "Sites";
            break;

        default:
            YaxisLabel = currentTab;
            break;
    }

    // D3
    var chartData = deepCopy(data);

    //container sizing variables
    var margin = { top: 20, right: 125, bottom: 100, left: 60 },
        width = $('#' + thediv).width() - margin.left - margin.right,
        height = $('#' + thediv).height() - margin.top - margin.bottom,
        marginOverview = { top: height + 50, right: margin.right, bottom: 20, left: margin.left }
    heightOverview = $('#' + thediv).height() - marginOverview.top - marginOverview.bottom;

    // axis definition and construction
    var x = d3.time.scale().domain([new Date(thedatefrom), new Date(thedateto).setDate(new Date(thedateto).getDate() + 1)]).range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var binsScale = d3.scale.ordinal().domain(d3.range(30)).rangeBands([0, width], 0.1, 0.05);
    var xOverview = d3.time.scale().domain([new Date(thedatefrom), new Date(thedateto).setDate(new Date(thedateto).getDate() + 1)]).range([0, width]);
    var yOverview = d3.scale.linear().range([heightOverview, 0]);
    var color = d3.scale.ordinal().range(getColorsForTab(currentTab));

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2d"));
    var xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom");

    // graph initialization
    var tooltip = d3.select('#' + thediv).append('div')
                .attr('class', 'hidden tooltip');

    var svg = d3.select("#" + thediv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var main = null, overview = null, legend = null;

    if (brush === null) {
        brush = d3.svg.brush()
    }
        
     brush.x(xOverview).on("brush", brushed);



    y.domain([0, d3.max(chartData, function (d) { return d.Total; })]);
    yOverview.domain(y.domain());
    color.domain(d3.keys(chartData[0]).filter(function (key) { return key !== "Date" && key !== "Total" && key.indexOf('Disabled') < 0 }));

    var numSamples = chartData[0].length;
    var seriesClass = function (seriesName) { return "series-" + seriesName.toLowerCase(); };
    var layerClass = function (d) { return "layer " + seriesClass(d.key); };

    var stack = d3.stack()
        .keys(d3.keys(chartData[0]).filter(function (key) { return key !== "Date" && key !== "Total" && key.indexOf('Disabled') < 0 }))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var series = null;

    var tempKeys = d3.keys(chartData[0]).filter(function (key) { return key !== 'Total' && key !== 'Date' && key.indexOf('Disabled') < 0 });

    $.each(chartData, function (i, d) {
        $.each(tempKeys, function (j, k) {
            if (chartData[i][k + 'Disabled'] === true)
                chartData[i][k] = 0;

        });

    });


    if (brush !== null && !brush.empty()) {
        x.domain(brush.extent());
        series = stack(chartData.filter(function (d) {
            return d.Date > new Date(brush.extent()[0]).setHours(0, 0, 0, 0) && d.Date < new Date(brush.extent()[1]).setHours(0, 0, 0, 0);
        }));
    }
    else {
        series = stack(chartData);
    }
    var overviewSeries = stack(chartData);
    var keys = d3.keys(series).filter(function (a) { return a !== "Values"; }).reverse();
    
    buildMainGraph(series);
    buildOverviewGraph(overviewSeries);
    buildLegend();


    //// d3 Helper Functions
    function buildMainGraph(data) {
        var numSamples;
        if (brush !== null && !brush.empty()) {
            var date1 = new Date(brush.extent()[0]).setHours(0,0,0,0);
            var date2 = new Date(brush.extent()[1]).setHours(0,0,0,0);
            numSamples = 1 + (date2 - date1) / 1000 / 60 / 60 / 24;
        }
        else {
            var date1 = new Date(thedatefrom).setHours(0, 0, 0, 0);
            var date2 = new Date(thedateto).setHours(0, 0, 0, 0);
            numSamples = 1 + (date2 - date1) / 1000 / 60 / 60 / 24;
        }


        y.domain([0, d3.max(data, function (d) { return d3.max(d, function (e) { return e[1] }); })]);

        main = svg.append("g")
            .attr("class", "main")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        main.append("g")
            .attr("class", "grid-lines")
            .selectAll(".grid-line").data(y.ticks(5))
                .enter().append("line")
                    .attr("class", "grid-line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y)
                    .attr("y2", y);

        var layersArea = main.append("g")
            .attr("class", "layers");

        var layers = layersArea.selectAll(".layer").data(data)
            .enter().append("g")
                .attr("class", layerClass);

        var bar = layers.selectAll("rect").data(function (d) {
            //console.log(d);
            return d;
        })
            .enter().append("rect")
                .attr("x", function (d) {
                    //console.log(d.data.Date);
                    return x(d.data.Date);
                })
                .attr("width", function () {
                    //console.log(numSamples);
                    return width / numSamples;
                })
                .attr("y", function (d) {
                    //console.log(d);
                    return y(d[1]);
                })
                .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                .style("fill", function (d, e, i) {
                    return color(series[i].key);
                })
                .style("cursor", "pointer");

        main.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        main.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", ".71em")
            .text(YaxisLabel);

        bar.on('mousemove', function (d, f, g) {
            var mouse = d3.mouse(svg.node()).map(function (e) {
                return parseInt(e);
            });
            //console.log(d);
            var html = "<table><tr><td>Date: </td><td style='text-align: right'>" + getFormattedDate(d.data.Date) + "</td></tr>";
            var dKeys = d3.keys(d.data).filter(function (key) { return key !== 'Date' && key !== 'Total' && key !== 'Disabled' && key !== 'Values' && key.indexOf('Disabled') < 0 }).reverse();
            dKeys.forEach(function (data, i) {
                html += "<tr><td>" + data + "</td><td style='text-align: right'>" + (data === "Date" ? getFormattedDate(d.data.Date) : d.data[data]) + "</td></tr>";
            });
            html += "</table>";

            tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (height / 2) + 'px')
            .html(html);
        });

        bar.on('mouseout', function () {
            tooltip.classed('hidden', true);
        });

        bar.on('click', function (d) {
            var thedate = getFormattedDate(d.data.Date + (new Date(d.data.Date).getTimezoneOffset() * 60 * 1000));
            contextfromdate = thedate;
            contexttodate = thedate;
            var filter = [];
            $.each(legend.selectAll("rect"), function (i, element) {
                if ($(this).css('fill') !== 'rgb(128, 128, 128)')
                    filter.push(element[0].__data__);
            });
            manageTabsByDateForClicks(currentTab, thedate, thedate, filter);
            cache_Last_Date = thedate;
            getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);
        });


    }

    function buildOverviewGraph(data) {

        var date1 = new Date(thedatefrom).setHours(0, 0, 0, 0);
        var date2 = new Date(thedateto).setHours(0, 0, 0, 0);
        var numSamples = 1 + (date2 - date1) / 1000 / 60 / 60 / 24;


        yOverview.domain([0, d3.max(data, function (d) { return d3.max(d, function (e) { return e[1] }); })]);

        overview = svg.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

        var layersArea = overview.append("g")
                    .attr("class", "layers");

        var layers = layersArea.selectAll(".layer").data(data)
            .enter().append("g")
                .attr("class", layerClass);

        var bar = layers.selectAll("rect").data(function (d) { return d;  })
            .enter().append("rect")
                .attr("x", function (d) { return xOverview(d.data.Date); })
                .attr("width", function () { return width / numSamples; })
                .attr("y", function (d) {  return yOverview(d[1]); })
                .attr("height", function (d) { return yOverview(d[0]) - yOverview(d[1]); })
                .style("fill", "black");


        overview.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + heightOverview + ")")
            .call(xAxisOverview);

        // add the brush target area on the overview chart
        overview.append("g").attr("class", "x brush")
            .call(brush).selectAll("rect").attr("y", -6).attr("height", heightOverview + 7);  // +7 is magic number for styling


    }

    function buildLegend() {
        ////Legend attributes
        legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("id", "chartLegend")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(140," + i * 20 + ")"; });

        var disabledLegendFields = [];

        legend.append("rect")
            .attr("x", width + -65)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d, i, e) {
                if (cache_Graph_Data[0][d + 'Disabled']) {
                    disabledLegendFields.push(d);
                    return '#808080';
                }
                return color(d);
            })
            .style("cursor", "pointer")
            .on("click", function (d, i) {
                if ($(this).css('fill') !== 'rgb(128, 128, 128)') {
                    $(this).css('fill', 'rgb(128, 128, 128)');
                    disabledLegendFields.push(d);
                }
                else {
                    $(this).css('fill', color(d));
                    disabledLegendFields = disabledLegendFields.filter(function (word) { return word !== d });
                }

                toggleSeries(d, chartData, $(this).css('fill') === 'rgb(128, 128, 128)');
                window["populate" + currentTab + "DivWithGrid"](cache_Table_Data, disabledLegendFields);

                if ($('#mapGrid')[0].value == "Map" && (currentTab === 'Disturbances' || currentTab === 'Events' || currentTab ==='Trending')) {
                    var legendFields = color.domain().slice().filter(function (a) { return disabledLegendFields.indexOf(a) < 0 });
                    showHeatmap(document.getElementById('selectHeatmap' + currentTab), legendFields);
                }

            });

        legend.append("text")
            .attr("x", width - 40)
            .attr("y", 9)
            .attr("width", 40)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) { return d; });

    }

    //called when selection is chosen on overview map
    function brushed() {
        if (brush.empty())
            return;


        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
        main.selectAll("g").remove();

        var newData = deepCopy(cache_Graph_Data);
        var tempKeys = d3.keys(newData[0]).filter(function (key) { return key !== 'Total' && key !== 'Date' && key.indexOf('Disabled') < 0 });

        $.each(newData, function (i, d) {
            $.each(tempKeys, function (j, k) {
                if (newData[i][k + 'Disabled'] === true)
                    newData[i][k] = 0;

            });

        });

        var stackedData = stack(newData.filter(function (d) {
            return d.Date > new Date(brush.extent()[0]).setHours(0, 0, 0, 0) && d.Date < new Date(brush.extent()[1]).setHours(0, 0, 0, 0);
        }));


        buildMainGraph(stackedData);


    }

    //Toggles a certain series.
    function toggleSeries(seriesName, data, isDisabling) {

        var newData = deepCopy(cache_Graph_Data);

        var tempKeys = d3.keys(newData[0]).filter(function (key) { return key !== 'Total' && key !== 'Date' && key.indexOf('Disabled') < 0 });
        $.each(newData, function (i, d) {

            cache_Graph_Data[i][seriesName + 'Disabled'] = isDisabling;
            newData[i][seriesName + 'Disabled'] = isDisabling;
            $.each(tempKeys, function (j, k) {
                if (newData[i][k + 'Disabled'] === true)
                    newData[i][k] = 0;

            });

        });

        var stackedData = stack((!brush.empty() ? newData.filter(function (d) { return d.Date > new Date(brush.extent()[0]).setHours(0, 0, 0, 0) && d.Date < new Date(brush.extent()[1]).setHours(0, 0, 0, 0); }) : newData));
        var overviewStackedData = stack(newData);
        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
        main.selectAll("g").remove();
        buildMainGraph(stackedData);
        overview.selectAll("g").remove();
        buildOverviewGraph(overviewStackedData);
    }

    // Deep copies an obj
    function deepCopy(obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            var out = [], i = 0, len = obj.length;
            for (; i < len; i++) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        if (typeof obj === 'object') {
            var out = {}, i;
            for (i in obj) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        return obj;
    }

}
//////////////////////////////////////////////////////////////////////////////////////////////
function populateDivWithErrorBarChart(thedatasource, thediv, siteName, siteID, thedatefrom, thedateto) {
    //console.log("disturbances");
    var thestartdateX = new Date(thedatefrom);
    thestartdateX.setHours(0, 0, 0, 0);

    var contextfromdateX = new Date(contextfromdate);
    contextfromdateX.setHours(0, 0, 0, 0);

    var contexttodateX = new Date(contexttodate);
    contexttodateX.setHours(0, 0, 0, 0);

    var thestartdate = new Date(Date.UTC(thestartdateX.getUTCFullYear(), thestartdateX.getUTCMonth(), thestartdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contextfromdateUTC = new Date(Date.UTC(contextfromdateX.getUTCFullYear(), contextfromdateX.getUTCMonth(), contextfromdateX.getUTCDate(), 0, 0, 0)).getTime();
    var contexttodateUTC = new Date(Date.UTC(contexttodateX.getUTCFullYear(), contexttodateX.getUTCMonth(), contexttodateX.getUTCDate(), 0, 0, 0)).getTime();


    var thedatasent = "";
    thedatasent = "{'siteID':'" + siteID + "', 'measurementType':'"+$('#trendingDataSelection').val()+"', 'targetDateFrom':'" + thedatefrom + "', 'targetDateTo':'" + thedateto + "' , 'userName':'" + postedUserName + "'}";
    //console.log(thedatasource);
    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            cache_ErrorBar_Data = data.d;

            buildErrorBarChart(data.d, thediv, siteName, siteID, thedatefrom, thedateto);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });

}

function buildErrorBarChart(data, thediv, siteName, siteID, thedatefrom, thedateto) {
    function drawCap(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.lineTo(x + radius, y);
        ctx.lineTo(x - radius, y);
        ctx.stroke();
    }

    if (data == null)
        return;

    var dataPoints = {
        show: true,
        radius: 2
    }

    var errorBars = {
        show: false,
        errorbars: "y",
        lineWidth: 0.5,
        radius: 0.5,
        yerr: { show: true, asymmetric: true, upperCap: drawCap, lowerCap: drawCap, shadowSize: 0, radius: 3 }
    }

    var graphData = [
        { color: "", points: { show: true, radius: 0.5 }, data: [], visible: false, label: 'Max' },
        { color: "#90ed7d", points: dataPoints, data: [], label: 'Average', visible: true, type: 'points' },
        { color: "", points: { show: true, radius: 0.5 }, data: [], visible: false, label: 'Min' },
        { color: "black", points: errorBars, data: [], label: "Range", visible: true, type: 'errorbar' }
    ];

    $.each(data, function (_, point) {
        var mid = (point.Maximum + point.Minimum) / 2;
        graphData[0].data.push([new Date(point.Date + ' UTC').getTime(), point.Maximum]);
        graphData[1].data.push([new Date(point.Date + ' UTC').getTime(), point.Average]);
        graphData[2].data.push([new Date(point.Date + ' UTC').getTime(), point.Minimum]);
        graphData[3].data.push([new Date(point.Date + ' UTC').getTime(), mid, mid - point.Minimum, point.Maximum - mid]);
    });


    //Set mins and maxes
    var xMin = new Date(thedatefrom + ' UTC').getTime();
    var xMax = new Date(thedateto + ' UTC').getTime();

    //initiate plot
    var plot = $.plot($('#' + thediv), graphData, {
        legend: {
            show: false
        },
        series: {
            lines: {
                show: false
            }
        },
        xaxis: {
            mode: "time",
            zoomRange: [60000 * 15, xMax],
            panRange: [xMin, xMax],
            min: xMin,
            max: xMax
        },
        yaxis: {
            zoomRange: false /*[0.5, yMax+1]*/,
            //panRange: [yMin-1,yMax+1],
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: false
        },
        grid: {
            hoverable: true,
            clickable: true
        },
        selection: { mode: "x" }
    });

    $("<div id='tooltip'></div>").css({
        position: "absolute",
        display: "none",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#fee",
        opacity: 0.80
    }).appendTo("body");

    $('#' + thediv).unbind("plothover");
    $('#' + thediv).bind("plothover", function (event, pos, item) {
        if (item) {
            var time = $.plot.formatDate($.plot.dateGenerator(item.datapoint[0], { timezone: "utc" }), "%l:%M:%S %P");
            var html = '<div>' + time + '</div>';
            html += '<div>' + item.series.label + ': <span style="font-weight:bold">' + (item.series.label !== 'Range' ? item.datapoint[1] : item.datapoint[1] - item.datapoint[2] + ' - ' + (item.datapoint[1] + item.datapoint[3])) + '</span></div>';
            $("#tooltip").html(html)
                .css({ top: item.pageY + -50, left: item.pageX - 100, border: '1px solid ' + item.series.color })
                .fadeIn(200);
        } else {
            $("#tooltip").hide();
        }

    });

    $('#' + thediv).unbind("plotclick");
    $('#' + thediv).bind("plotclick", function (event, pos, item) {
        if (item) {
            $('.info.contourControl.leaflet-control').remove();
            var contourControl = L.control({ position: 'bottomleft' });

            contourControl.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info contourControl'),
                    labels = [];
                div.innerHTML = '<div id="ContoursControlsTrending">' +
                                        '<div class="row" style="width: 100%; margin: auto">' +
                                                '<div class="" style="float: left; margin-right: 4px;">' +
                                                   '<table>'+
                                                        '<tr>' +
                                                            '<td style="width: 50%">' +
                                                                '<div class="checkbox"><label><input type="checkbox" id="weatherCheckbox"/>Weather</label></div>'+
                                                            '</td>'+
                                                            '<td style="width: 50%">' +
                                                                '<select class="form-control" id="contourAnimationStepSelect" onchange="stepSelectionChange(this);">'+
                                                                   '<option value="60">60 min</option>' +
                                                                   '<option value="30">30 min</option>' +
                                                                   '<option value="20">20 min</option>' +
                                                                   '<option selected="selected" value="15">15 min</option>' +
                                                                   '<option value="10">10 min</option>' +
                                                                   '<option value="5">5 min</option>' +
                                                                   '<option value="1">1 min</option>' +
                                                                '</select>' +
                                                            '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                             '<td colspan="2">' +
                                                                '<div id="time-range">' +
                                                                    '<div class="sliders_step1">' +
                                                                        '&nbsp;<div id="slider-range"></div> ' +
                                                                    '</div>' +
                                                                    '<p><span class="slider-time">12:00 AM</span> - <span class="slider-time2">11:59 PM</span></p>' +
                                                                '</div>' +
                                                            '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                            '<td colspan="2">' +
                                                                '<button class="btn btn-default form-control" onclick="loadContourAnimationData()">Load Data</button>' +
                                                            '</td>' +
                                                        '</tr>' +
                                                    '</table>' + 
                                                '</div>' +
                                                '<div class="" id="progressBar" style="float: left; margin-left: 40px; display: none">' +
                                                    '<table style="width: 100%">' +
                                                        '<tr><td>&nbsp;</td></tr>' +
                                                        '<tr><td>&nbsp;</td></tr>' +
                                                        '<tr><td>&nbsp;</td></tr>' +
                                                        '<tr><td style="width: 100%">' +
                                                                '<div id="contourAnimationProgressBar"><div id="contourAnimationInnerBar"><div id="progressbarLabel"></div></div></div>' +
                                                        '</td></tr>'+
                                                        '<tr><td>&nbsp;</td></tr>' +
                                                        '<tr><td>&nbsp;</td></tr>' +
                                                        '<tr><td style="width: 100%; text-align: center">' +
                                                                    '<div class="player text-center" id="contourPlayerButtons">' +
                                                                        '<button type="button" id="button_fbw" class="btn"><i class="fa fa-fast-backward"></i></button>'  +
                                                                        '<button type="button" id="button_bw" class="btn"><i class="fa fa-backward"></i></button>' +
                                                                        '<button type="button" id="button_play" class="btn"><i class="fa fa-play"></i></button>' +
                                                                        '<button type="button" id="button_stop" class="btn"><i class="fa fa-stop"></i></button>' +
                                                                        '<button type="button" id="button_fw" class="btn"><i class="fa fa-forward"></i></button>' +
                                                                        '<button type="button" id="button_ffw" class="btn"><i class="fa fa-fast-forward"></i></button>' +    
                                                                    '</div>'+
                                                        '</td></tr>' +
                                                   '</table>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                return div;
            };

            contourControl.addTo(contourMap);
            initiateTimeRangeSlider();
            cache_Contour_Data = null;
            var thedate = $.plot.formatDate($.plot.dateGenerator(item.datapoint[0], { timezone: "utc" }), "%m/%d/%Y");
            manageTabsByDateForClicks(currentTab,thedate, thedate, null);
            cache_Last_Date = thedate;
            getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, siteName, siteID, thedate);

        }
    });

    $('#' + thediv).unbind("plotselected");
    $('#' + thediv).bind("plotselected", function (event, ranges) {
        var xAxis = plot.getXAxes();

        $.each(xAxis, function (_, axis) {
            var opts = axis.options;
            opts.min = ranges.xaxis.from;
            opts.max = ranges.xaxis.to;
        });

        scaleYAxis(plot, ranges.xaxis.from, ranges.xaxis.to);
        plot.clearSelection();
    });

    $('#' + thediv).unbind("plotzoom");
    $('#' + thediv).bind("plotzoom", function (event, stuff) {
        scaleYAxis(plot);
        plot.clearSelection();
    });

    function scaleYAxis(plot, xMin, xMax) {
        var data = plot.getData();
        var yMin = null, yMax = null;

        $.each(plot.getXAxes(), function (_, xAxis) {
            if (!xMin)
                xMin = xAxis.min;

            if (!xMax)
                xMax = xAxis.max;
        });

        $.each(data, function (i, d) {
            if (d.visible === true) {
                var isAlarmData = (i == 0) || (i == 6);

                $.each(d.data, function (j, e) {
                    if (isAlarmData || (e[0] >= xMin && e[0] <= xMax)) {
                        var eMin = (d.label !== "Range") ? e[1] : e[1] - e[2];
                        var eMax = (d.label !== "Range") ? e[1] : e[1] + e[3];

                        if (yMin == null || yMin > eMin)
                            yMin = eMin;
                        if (yMax == null || yMax < eMax)
                            yMax = eMax;
                    }
                });
            }
        });

        $.each(plot.getYAxes(), function (_, axis) {
            var opts = axis.options;
            var pad = (yMax - yMin) * 0.1;
            opts.min = yMin - pad;
            opts.max = yMax + pad;
        });

        plot.setupGrid();
        plot.draw();
    }


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

function getEventsHeatmapCounts(currentTab, datefrom, dateto, severities) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "', 'severityFilter':'" + severities + "'}";
    var url = "./mapService.asmx/getLocations" + currentTab + "HeatmapCounts";

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

function getDisturbancesHeatmapCounts(currentTab, datefrom, dateto, severities) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "', 'severityFilter':'" + severities+"'}";
    var url = "./mapService.asmx/getLocations" + currentTab + "HeatmapCounts";
    //console.log(thedatasent);
    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;
    //console.log(url);
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
            //console.log(data.d);
            var map = getMapInstance(currentTab);
            LoadHeatmapData(data.d, map);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function getTrendingHeatmapCounts(currentTab, datefrom, dateto, severities) {
    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "', 'severityFilter':'" + severities + "'}";
    var url = "./mapService.asmx/getLocations" + currentTab + "HeatmapCounts";
    //console.log(thedatasent);
    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;
    //console.log(url);
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
            //console.log(data.d);
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
function getLocationsAndPopulateMapAndMatrix(currentTab, datefrom, dateto, string) {
    var url = "./mapService.asmx/getLocations" + currentTab;
    var thedatasent = "{'targetDateFrom':'" + datefrom + "'" + (currentTab === "TrendingData" ? ", 'measurementType': '" + $('#trendingDataSelection').val() + "'" : "") + " , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "'" + (currentTab === "TrendingData" ? ", 'dataType': '" + $('#trendingDataTypeSelection').val() + "'" : "") + "}";

    if (currentTab !== "TrendingData") {
        thedatasent = {
            targetDateFrom: datefrom,
            targetDateTo: dateto,
            userName: postedUserName
        };
    } else {
        thedatasent = {
            contourQuery: {
                StartDate: datefrom,
                EndDate: dateto,
                MeasurementType: $('#trendingDataSelection').val(),
                DataType: $('#trendingDataTypeSelection').val(),
                UserName: postedUserName
            }
        };
    }

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
        data: JSON.stringify(thedatasent),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            //console.log(data);
            cache_Map_Matrix_Data_Date_From = this.datefrom;
            cache_Map_Matrix_Data_Date_To = this.dateto;
            cache_Map_Matrix_Data = data;

            //console.log(data);
            // Plot Map or Plot Matrix
            switch ($('#mapGrid')[0].value) {
                case "Map":
                    if (currentTab == "TrendingData")
                        plotContourMapLocations(data.d, currentTab, this.datefrom, this.dateto, string);
                    else
                        plotMapLocations(data, currentTab, this.datefrom, this.dateto, string);
                    break;
                case "Grid":
                    plotGridLocations(data, currentTab, this.datefrom, this.dateto, string);
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
    var thedatasent = "{'siteID':'" + siteID + "', 'targetDateFrom':'" + datefrom + "'" + (currentTab === "TrendingData" ? ", 'measurementType': '" + $('#trendingDataSelection').val() + "'" : "") + " , 'targetDateTo':'" + dateto + "','userName':'" + postedUserName + "' }";
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
                slicecolors = ['#CC3300'];
                thetooltip = siteName + "\n" + "Faults: " + data[0];
            }
            break;

        case "Trending":
            if (data[0] == 0 && data[1] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1]];
                slicecolors = ['#CC3300', '#FFCC00'];

                thetooltip = siteName + "\n" + "Alarms: " + data[0] + "\n" + "Off Normals: " + data[1];
            }
            break;
        case "Breakers":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1], data[2]];
                slicecolors = ['#CC3300', '#FFCC00', '#CC3300'];

                thetooltip = siteName + "\n" + "Normal: " + data[0] + "\n" + "Late: " + data[1] + "\n" + "Indeterminate: " + data[2];
            }

            break;
        case "Events":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1], data[2], data[3], data[4], data[5]];
                slicecolors = globalcolorsEvents.slice().reverse();
                thetooltip = siteName + "\n" + "Interruptions: " + data[0] + "\n" + "Faults: " + data[1] + "\n" + "Sags: " + data[2] + "\n" + "Transients: " + data[3] + "\n" + "Swells: " + data[4] + "\n" + "Others: " + data[5];
            }
            break;

        case "Disturbances":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0E892C'];
            } else {
                sparkvalues = [data[0], data[1], data[2], data[3], data[4], data[5]];
                slicecolors = globalcolorsEvents.slice().reverse();
                thetooltip = siteName + "\n" + "5: " + data[0] + "\n" + "4: " + data[1] + "\n" + "3: " + data[2] + "\n" + "2: " + data[3] + "\n" + "1: " + data[4] + "\n" + "0: " + data[5];
            }
            break;

        case "Completeness":
            var completepoints = data[1] + data[2] + data[3] + data[4];

            var percentage = (completepoints / data[0] * 100).toFixed(2);

            var val2 = (data[5] / data[0] * 100).toFixed(2);

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0000FF'];
                thetooltip = "No Data Available";
            } else if( percentage > 100) {

                slicecolors = [globalcolorsDQ[6]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else if (percentage <= 100 && percentage >= 98 ) {

                slicecolors = [globalcolorsDQ[5]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else if (percentage < 98 && percentage >= 90) {

                slicecolors = [globalcolorsDQ[4]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else if (percentage < 90 && percentage >= 70) {

                slicecolors = [globalcolorsDQ[3]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else if (percentage < 70 && percentage >= 50) {

                slicecolors = [globalcolorsDQ[2]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else if (percentage < 50 && percentage > 0) {

                slicecolors = [globalcolorsDQ[1]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            } else {

                slicecolors = [globalcolorsDQ[0]];

                sparkvalues = [100];

                thetooltip = siteName + "\nExpected: " + data[0] + "\nReceived: " + percentage + "%\nDuplicate: " + val2 + "%";
            }

            break;

        case "Correctness":

            var percentage = (data[1] / (data[1] + data[2] + data[3] + data[4]) * 100).toFixed(2);

            var val1 = (data[2] / data[1] * 100).toFixed(2);
            var val2 = (data[3] / data[1] * 100).toFixed(2);
            var val3 = (data[4] / data[1] * 100).toFixed(2);

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                sparkvalues = [100];
                slicecolors = ['#0000FF'];
                thetooltip = "No Data Available";
            } else if (percentage > 100) {

                slicecolors = [globalcolorsDQ[6]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else if (percentage <= 100 && percentage >= 98) {

                slicecolors = [globalcolorsDQ[5]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else if (percentage < 98 && percentage >= 90) {

                slicecolors = [globalcolorsDQ[4]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else if (percentage < 90 && percentage >= 70) {

                slicecolors = [globalcolorsDQ[3]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else if (percentage < 70 && percentage >= 50) {

                slicecolors = [globalcolorsDQ[2]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else if (percentage < 50 && percentage > 0) {

                slicecolors = [globalcolorsDQ[1]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            } else {

                slicecolors = [globalcolorsDQ[0]];

                sparkvalues = [100];

                thetooltip = siteName + "\nLatched: " + val1 + "%\nUnreasonable: " + val2 + "%\nNon-Congruent: " + val3 + "%";
            }


            break;

        default:
            break;
    }

    var thecontainer = "#" + "site_" + siteID + "_sparkline_" + currentTab;

    $(thecontainer).sparkline(sparkvalues, {
        type: 'pie',
        height: '10px',
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
                return (globalcolorsEvents[5]);
                //return ("#FF0000");
            }

            if (data[1] > 0) { // Faults
                return (globalcolorsEvents[4]);
                //return ("#CC6600");
                } 

            if (data[2] > 0) { // Sags
                return (globalcolorsEvents[3]);
                //return ("#FFCC00");
            }

            if (data[3] > 0) { // Transients
                return (globalcolorsEvents[2]);
                //return ("#CC3300");
            }

            if (data[4] > 0) { // Swells
                return (globalcolorsEvents[1]);
                //return ("#FF8800");
            }

            if (data[5] > 0) { // Others
                return (globalcolorsEvents[0]);
                //return ("#FF8800");
            }
 
            break;
        case "Disturbances":

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) {
                return ("#0E892C");
            }

            if (data[0] > 0) { // 5
                return (globalcolorsEvents[5]);
                //return ("#FF0000");
            }

            if (data[1] > 0) { // 4
                return (globalcolorsEvents[4]);
                return ("#CC6600");
            }

            if (data[2] > 0) { // 3
                return (globalcolorsEvents[3]);
                return ("#FFCC00");
            }

            if (data[3] > 0) { // 2
                return (globalcolorsEvents[2]);
                return ("#CC3300");
            }

            if (data[4] > 0) { // 1
                return (globalcolorsEvents[1]);
                return ("#FF8800");
            }

            if (data[5] > 0) { // 0
                return (globalcolorsEvents[0]);
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
                return (globalcolorsDQ[0]);
            }

            if (data[0] == 0 || data[1] == 0) {
                return ("#CCCCCC");
            }

            var percentage = Math.floor(((data[1] + data[2] + data[3] +data[4]) / data[0]) * 100);

            if (percentage > 100) {
                return (globalcolorsDQ[6]);
            }

            if (percentage >= 98) {
                return (globalcolorsDQ[5]);
            }

            if (percentage >= 90) {
                return (globalcolorsDQ[4]);
            }

            if (percentage >= 70) {
                return (globalcolorsDQ[3]);
            }

            if (percentage >= 50) {
                return (globalcolorsDQ[2]);
            }
            if (percentage > 0) {
                return (globalcolorsDQ[1]);
            }
            return (globalcolorsDQ[0]);

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
                return (globalcolorsDQ[0]);
            }

            if (data[0] == 0 || data[1] == 0) {
                return ("#CCCCCC");
            }

            var percentage = Math.floor((data[1]/(data[1] + data[2] + data[3] + data[4])) * 100);

            if (percentage > 100) {
                return (globalcolorsDQ[6]);
            }

            if (percentage >= 98) {
                return (globalcolorsDQ[5]);
            }

            if (percentage >= 90) {
                return (globalcolorsDQ[4]);
            }

            if (percentage >= 70) {
                return (globalcolorsDQ[3]);
            }

            if (percentage >= 50) {
                return (globalcolorsDQ[2]);
            }
            if (percentage > 0) {
                return (globalcolorsDQ[1]);
            }
            return (globalcolorsDQ[0]);


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


        case "TrendingData":
            if ($('#trendingDataSelection').val() === "Voltage") {
                if ($('#trendingDataTypeSelection').val() === "Average") {
                    if (data[2] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Minimum") {
                    if (data[1] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Maximum") {
                    if (data[0] !== null) return ("#0E892C");
                }
            }
            else if ($('#trendingDataSelection').val() === "Current") {
                if ($('#trendingDataTypeSelection').val() === "Average") {
                    if (data[2] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Minimum") {
                    if (data[1] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Maximum") {
                    if (data[0] !== null) return ("#0E892C");
                }
            }
            else if ($('#trendingDataSelection').val() === "Power") {
                if ($('#trendingDataTypeSelection').val() === "Average") {
                    if (data[2] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Minimum") {
                    if (data[1] !== null) return ("#0E892C");
                }
                else if ($('#trendingDataTypeSelection').val() === "Maximum") {
                    if (data[0] !== null) return ("#0E892C");
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
    //console.log(data);
    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).empty();

    $(matrixItemID).unbind('click');

    $(matrixItemID)[0].title = siteName + " ";

    $(matrixItemID).append("<div style='font-size: 1em'><div class='faultgridtitle'>" + siteName + "</div>");

    var theGridColor = getStatusColorForGridElement(data);

    $(matrixItemID).css("background-color", theGridColor);

    if (theGridColor != "#0E892C" && theGridColor != "#777777") {
        DrawGridSparklines(data, siteID, siteName, matrixItemID);
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
function DrawGridSparklines(data, siteID, siteName, matrixItemID) {
    switch (currentTab) {
        case "Events":
            populateGridSparklineEvents(data, siteID, siteName);
            break;

        case "Disturbances":
            populateGridSparklineDisturbances(data, siteID, siteName);
            break;

        case "Trending":
            

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

    //var sparklinedraw = function (height, barWidth) {

        $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
            type: 'bar',
            height: '10px',
            barWidth: '3px',
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
    //}

    //var sparkResize;

    //$(document).on('matrixResize', function (e) {
    //    clearTimeout(sparkResize);

    //    sparkResize = setTimeout(function () { sparklinedraw($('.sparkbox').height(), $('.sparkbox').width() / 10); }, 500);
    //});

    //sparklinedraw($('.sparkbox').height() - 1, $('.sparkbox').width() / 10);

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

    //var sparklinedraw = function (height, barWidth) {
        $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
            type: 'bar',
            height: '10px',
            barWidth: '3px',
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
    //}

    //var sparkResize;

    //$(document).on('matrixResize', function (e) {
    //    clearTimeout(sparkResize);

    //    sparkResize = setTimeout(function () { sparklinedraw($('.sparkbox').height(), $('.sparkbox').width() / 10); }, 500);
    //});

    //sparklinedraw($('.sparkbox').height() - 1, $('.sparkbox').width() / 10);

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
    //var sparklinedraw = function (height, barWidth) {
        $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
            type: 'bar',
            height: '10px',
            barWidth: '3px',
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
    //}

    //var sparkResize;

    //$(document).on('matrixResize', function (e) {
    //    clearTimeout(sparkResize);

    //    sparkResize = setTimeout(function () { sparklinedraw($('.sparkbox').height(), $('.sparkbox').width()/10); }, 500);
    //});

    //sparklinedraw($('.sparkbox').height() - 1, $('.sparkbox').width() / 10);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklineDisturbances(data, siteID, siteName) {

    var sparkvalues = [data[0], data[1], data[2], data[3], data[4], data[5]];

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    $(matrixItemID).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                    .addClass("arrow")
                    .addClass(feedback.vertical)
                    .addClass(feedback.horizontal)
                    .appendTo(this);
            }
        },

        content: function () {
            var thetitle = "";
            thetitle += "<table>";
            thetitle += "<tr><td colspan=2 align='center'>" + siteName + "</td></tr>";
            thetitle += "<tr><td>5</td><td align='right'>" + data[0] + "</td></tr>";
            thetitle += "<tr><td>4</td><td align='right'>" + data[1] + "</td></tr>";
            thetitle += "<tr><td>3</td><td align='right'>" + data[2] + "</td></tr>";
            thetitle += "<tr><td>2</td><td align='right'>" + data[3] + "</td></tr>";
            thetitle += "<tr><td>1</td><td align='right'>" + data[4] + "</td></tr>";
            thetitle += "<tr><td>0</td><td align='right'>" + data[5] + "</td></tr>";
            thetitle += "</table>";
            return (thetitle);
        }
    });

    //$(matrixItemID)[0].title = thetitle;

    //$(matrixItemID)[0].title = siteName + "\nInterruptions: " + data[0] + "\nFaults: " + data[1] + "\nSags: " + data[2] + "\nTransients: " + data[3] + "\nSwells: " + data[4] + "\nOthers: " + data[5];

    //var sparklinedraw = function (height, barWidth) {

        $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
            type: 'bar',
            height: '10px',
            barWidth: '3px',
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
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 5: ' + fields[0].value + '</div>';
                        break;
                    case 1:
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 4: ' + fields[0].value + '</div>';
                        break;
                    case 2:
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 3: ' + fields[0].value + '</div>';
                        break;
                    case 3:
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 2: ' + fields[0].value + '</div>';
                        break;
                    case 4:
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 1: ' + fields[0].value + '</div>';
                        break;
                    case 5:
                        returnvalue += '<div unselectable="on" class="jqsfield"><span style="color: ' + fields[0].color + '">&#9679;</span> 0: ' + fields[0].value + '</div>';
                        break;

                }

                return (returnvalue);
            }
        });
    //}
    //var sparkResize;

    //$(document).on('matrixResize', function (e) {
    //    clearTimeout(sparkResize);

    //    sparkResize = setTimeout(function () { sparklinedraw($('.sparkbox').height(), $('.sparkbox').width() / 10); }, 500);
    //});

    //sparklinedraw($('.sparkbox').height() - 1, $('.sparkbox').width() / 10);

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

    //var sparklinedraw = function (height, barWidth) {

        $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
            type: 'bar',
            height: '10px',
            barWidth: '3px',
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
    //}

    //var sparkResize;

    //$(document).on('matrixResize', function (e) {
    //    clearTimeout(sparkResize);

    //    sparkResize = setTimeout(function () { sparklinedraw($('.sparkbox').height(), $('.sparkbox').width() / 10); }, 500);
    //});

    //sparklinedraw($('.sparkbox').height() - 1, $('.sparkbox').width() / 10);

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

            case "Disturbances":
                $.each(gridchildren.children, function (key, value) {
                    if ($(value).data("gridstatus") != "0") {
                        $(value).show();
                    }
                    else {
                        $(value).hide();
                    }
                });

                break;

            case "NoDisturbances":
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

            case "None":
                $.each(gridchildren.children, function (key, value) {
                    $(value).hide();
                });

                break;
            default:
                break;
        }

        resizeMatrixCells(currentTab);

    }

    if (mapormatrix == "Map") {

        var map = getMapInstance(currentTab);

        switch (thecontrol.value) {

            case "All":
                if (currentTab == "TrendingData") {
                    $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                        $(marker).show();
                    });
                }
                else {
                    $.each(map.markers, function (key, value) {
                        value.show();
                    });
                }
                break;

            case "None":
                if (currentTab == "TrendingData") {
                    $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                        $(marker).hide();
                    });
                }
                else {
                    $.each(map.markers, function (key, value) {
                        value.hide();
                    });
                }
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

            case "Disturbances":
                $.each(map.markers, function (key, value) {
                    if (value.args.marker_status > 0) {
                        value.show();
                    } else {
                        value.hide();
                    }
                });
                break;

            case "NoDisturbances":
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
                if (currentTab == "TrendingData") {
                    $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                        if ($.inArray($(marker).children().attr('id'), selectedIDs) > -1)
                            $(marker).show();
                        else
                            $(marker).hide();
                    });
                }
                else {
                    $.each(map.markers, function (key, value) {
                        if ($.inArray(value.args.marker_name + "|" + value.args.marker_id, selectedIDs) > -1) {
                            value.show();
                        } else {
                            value.hide();
                        }
                    });
                }
                break;

            case "Sags":
                var selectedIDs = GetCurrentlySelectedSites();
                if (currentTab == "TrendingData") {
                    $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                        if ($(marker).children().children().attr('fill') === '#996633')
                            $(marker).show();
                        else
                            $(marker).hide();
                    });
                }
                else {
                    $.each(map.markers, function (key, value) {
                        if ($.inArray(value.args.marker_name + "|" + value.args.marker_id, selectedIDs) > -1) {
                            value.show();
                        } else {
                            value.hide();
                        }
                    });
                }
                break;

            case "Swells":
                var selectedIDs = GetCurrentlySelectedSites();
                if (currentTab == "TrendingData") {
                    $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                        if ($(marker).children().children().attr('fill') === '#ff0000')
                            $(marker).show();
                        else
                            $(marker).hide();
                    });
                }
                else {
                    $.each(map.markers, function (key, value) {
                        if ($.inArray(value.args.marker_name + "|" + value.args.marker_id, selectedIDs) > -1) {
                            value.show();
                        } else {
                            value.hide();
                        }
                    });
                }
                break;

            case "RecievedData":
                $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') !== '#000000')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                
                break;

            case "NoData":
                $.each($(contourMap.getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#000000')
                        $(marker).show();
                    else
                        $(marker).hide();
                });

                break;

            default:
                break;


        }
    }

    if (mapormatrix == "Values") {

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showHeatmap(thecontrol, string ) {
    var i = 0;

    var map = getMapInstance(currentTab);
    var datefrom = getMapHeaderDate("From");
    var dateto = getMapHeaderDate("To");

    switch (thecontrol.value) {

        case "EventCounts":
            getEventsHeatmapCounts(currentTab, datefrom, dateto, string);
            break;

        case "MinimumSags":
            getEventsHeatmapSags(currentTab, datefrom, dateto);
            break;

        case "MaximumSwells":
            getEventsHeatmapSwell(currentTab, datefrom, dateto);
            break;

        case "TrendingCounts":
            stopAnimatedHeatmap();
            getTrendingHeatmapCounts(currentTab, datefrom, dateto, string);
            $('#HeatmapControlsTrending').hide();
            break;

        case "THD":
            $('#HeatmapControlsTrending').show();
            break;

        case "DisturbanceCounts":
            getDisturbancesHeatmapCounts(currentTab, datefrom, dateto, string);
            break;

        case "AnimateDisturbancecounts":
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

function plotMapLocations(locationdata, newTab, thedatefrom , thedateto, filter) {

    //$("#mapHeader" + newTab + "From")[0].innerHTML = thedatefrom;
    //$("#mapHeader" + newTab + "To")[0].innerHTML = thedateto;

    var markerBounds = new google.maps.LatLngBounds();
    var selectedIDs = GetCurrentlySelectedSites();

    $(".spark_pie").remove();

    var map = getMapInstance(newTab);

    $.each(map.markers, function(key, value) {
        value.setMap(null);
        value.remove();
    });

    map.markers = [];

    var drawCount = 0;

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
                div_id: 'site_' + value.id + '_sparkline_' + newTab,
                drawListener: function () {
                    drawCount++;

                    if (drawCount == locationdata.d.length)
                        showSparkLines(thedatefrom, thedateto);
                }
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
    //showSparkLines(thedatefrom, thedateto);

    selectsitesonmap(null, filter);

    showSiteSet($("#selectSiteSet" + currentTab)[0]);
};

function plotContourMapLocations(locationdata, newTab, thedatefrom, thedateto, filter) {
    var selectedIDs = GetCurrentlySelectedSites();

    $(contourMap.getPanes().markerPane).children().remove()
    var markers = [];
    $.each(locationdata.Locations, function (index, data) {
        var color = 'rgb(0,255,0)'; // green
        if (data[$('#trendingDataTypeSelection').val()] === null) color = '#000000'  // black  
        else if (data[$('#trendingDataTypeSelection').val()] < 0.8) color = '#996633';  //dark brown
        else if (data[$('#trendingDataTypeSelection').val()] > 1.2) color = '#ff0000';       //bright red 

        var html = '<svg height="12" width="12" id="'+data.name+'|'+data.id+'">' +
                        '<circle cx="6" cy ="6" r="4" stroke="black" stroke-width="1" fill="' + color + '"/>' +
                   '</svg>';

        var popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + data.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Average:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(data.Average).toFixed(2) + "&nbsp;</td></tr>";
        popup += "<tr><td>Minimum:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(data.Minimum).toFixed(2) + "&nbsp;</td></tr>";
        popup += "<tr><td>Maximum:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(data.Maximum).toFixed(2) + "&nbsp;</td></tr>";
        popup += "</table>";

        var circleIcon = L.divIcon({ className: 'leafletCircle', html: html });

        var marker = L.marker([data.Latitude, data.Longitude], { icon: circleIcon }).addTo(contourMap).bindPopup(popup);

        marker.on('click', function (event) {
            if (!event.originalEvent.ctrlKey) {
                $('#siteList').multiselect("uncheckAll");
            }

            if ($('#siteList').multiselect("option").multiple) {

                $('#siteList').multiselect("widget").find(":checkbox").each(function () {
                    if (this.value == data.id) {
                        this.click();
                    }

                });

                selectsitesincharts();

            } else {
                $('#siteList').multiselect("widget").find(":radio[value='" + data.id+ "']").each(function () { this.click(); });
                $('#siteList').multiselect('refresh');
            }

        });

        marker.on('mouseover', function (event) {
            marker.openPopup();
        });

        marker.on('mouseout', function (event) {
            marker.closePopup();
        });
        if ($.inArray(data.name + "|" + data.id, selectedIDs) > -1)
            markers.push(marker);
    });

    markerGroup = new L.featureGroup(markers);
    contourMap.fitBounds(markerGroup.getBounds());

    var timeoutVal;
    contourMap.off('boxzoomend');
    contourMap.on('boxzoomend', function (event) {
        $('#siteList').multiselect("uncheckAll");

        $.each(locationdata, function (index, data) {
            if(data.Latitude >= event.boxZoomBounds._southWest.lat && data.Latitude <= event.boxZoomBounds._northEast.lat 
                && data.Longitude >= event.boxZoomBounds._southWest.lng && data.Longitude <= event.boxZoomBounds._northEast.lng) {
                if ($('#siteList').multiselect("option").multiple) {

                    $('#siteList').multiselect("widget").find(":checkbox").each(function () {
                        if (this.value == data.id) {
                            this.click();
                        }

                    });
                } else {
                    $('#siteList').multiselect("widget").find(":radio[value='" + data.id + "']").each(function () { this.click(); });
                    $('#siteList').multiselect('refresh');
                }

            }
        });

        clearTimeout(timeoutVal);
        timeoutVal = setTimeout(function () {
            selectsitesincharts();
        }, 500);

    });
    
    showSiteSet($('#selectSiteSet' + currentTab)[0]);
    plotContourMap(locationdata);
};


function plotContourMap(data) {
    var topLeft = contourMap.latLngToLayerPoint(L.latLng(data.MaxLatitude, data.MinLongitude));
    var bottomRight = contourMap.latLngToLayerPoint(L.latLng(data.MinLatitude, data.MaxLongitude));
    var iconSize = L.point(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

    var contourIcon = L.icon({
        iconUrl: data.URL,
        iconAnchor: [0, 0],
        iconSize: iconSize,
        className: 'contourIcon'
    });

    L.marker([data.MaxLatitude, data.MinLongitude], { icon: contourIcon, clickable: false }).addTo(contourMap);

    contourMap.on('zoomstart', function () {
        $('.contourIcon').hide();
    });

    contourMap.on('zoomend', function () {
        var topLeft = contourMap.latLngToLayerPoint(L.latLng(data.MaxLatitude, data.MinLongitude));
        var bottomRight = contourMap.latLngToLayerPoint(L.latLng(data.MinLatitude, data.MaxLongitude));
        var iconSize = L.point(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        $('.contourIcon').width(iconSize.x).height(iconSize.y);
        $('.contourIcon').show();
    });

    $('.info.legend.leaflet-control').remove();
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];
        div.innerHTML += "<div ><h4>Legend</h4></div>" +
            "<div><h6>" + $('#trendingDataTypeSelection').val() + ' ' + $('#trendingDataSelection').val() + '</h6></div>';
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = data.ColorDomain.length - 1; i >= 0; i -= 1) {
            if (i === data.ColorDomain.length - 1) {
                div.innerHTML +=
                    '<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> >' + data.ColorDomain[data.ColorDomain.length - 1].toFixed(2)+ '</div>';
            }
            else if (i == 0) {
                div.innerHTML +=
                    '<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> <' + data.ColorDomain[i].toFixed(2) + '</div>';
            }
            else if( i % 2 !== 0){
                div.innerHTML +=
                    '<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> ' +  data.ColorDomain[i - 1].toFixed(2) + '&ndash;' + data.ColorDomain[i + 1].toFixed(2) + '</div>';
            }
        }

        div.innerHTML += '</div>';

        return div;
    };

    legend.addTo(contourMap);



}

//////////////////////////////////////////////////////////////////////////////////////////////

function LoadHeatmapLeaflet(data) {
    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 1,
        "scaleRadius": true,
        "maxOpacity": .5,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'Latitude',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'Longitude',
        // which field name in your data represents the data value - default "value"
        valueField: $('#trendingDataTypeSelection').val()
    };

    var testData = { data: data };
    var heatmapLayer = new HeatmapOverlay(cfg);
    var heatmap = L.layerGroup().addLayer(heatmapLayer).addTo(contourMap);
    heatmapLayer.setData(testData);
    L.control.layers().addOverlay(heatmap, "Heatmap layer");
}


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

        case "Disturbances":
            populateDivWithBarChart('getDisturbancesForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        case "Faults":
            populateDivWithBarChart('getFaultsForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
            
            break;

        case "Trending":
            populateDivWithBarChart('getTrendingForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

            break;

        case "TrendingData":
            populateDivWithErrorBarChart('getTrendingDataForPeriod', 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);

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
    
    selectsitesincharts();

    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, "undefined");
}

function manageTabsByDateForClicks(theNewTab, thedatefrom, thedateto, filter) {

    if ((thedatefrom == "") || (thedateto == "")) return;

    currentTab = theNewTab;

    reflowContents(theNewTab);

    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, filter);
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

    var thedatefrom = $.datepicker.formatDate("mm/dd/yy", $('#datePickerFrom').datepicker('getDate'));
    var thedateto = $.datepicker.formatDate("mm/dd/yy", $('#datePickerTo').datepicker('getDate'));
    var selectedIDs = GetCurrentlySelectedSites();

    var siteName = selectedIDs.length + " of " + $('#siteList')[0].length + " selected";

    var siteID = "";

    if (selectedIDs.length > 0) {

        var thedetails = selectedIDs[0].split('|');

        if (selectedIDs.length == 1) {
            siteName = thedetails[0];
        }

        $.each(selectedIDs, function (key, value) {
            thedetails = value.split('|');
            siteID += thedetails[1] + ",";
        });
    }

    var filterString = [];
    var leg = d3.selectAll('.legend');

    $.each(leg[0], function (i, d) {
        if ($(d).children('rect').css('fill') === 'rgb(128, 128, 128)')
            filterString.push($(d).children('text').text());
    });


    theparent.css("height", chartheight);

    var firstChild = $("#" + theparent[0].firstElementChild.id);

    firstChild.css("height", chartheight);
    if (currentTab === "TrendingData") {
        if ($('#Overview' + currentTab).children().length > 0)
            buildErrorBarChart(cache_ErrorBar_Data, 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
    }
    else {
        if ($('#Overview' + currentTab).children().length > 0)
            buildBarChart(cache_Graph_Data, 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
    }


    //console.log($('#Detail' + currentTab + 'Table').children());
    if($('#Detail' + currentTab + 'Table').children().length > 0)
        window["populate" + currentTab + "DivWithGrid"](cache_Table_Data, filterString);

        //window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);
    
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMapAndMatrix(newTab) {

    $("#datePickerFrom").datepicker("hide");
    $("#datePickerTo").datepicker("hide");

    var columnheight = $(window).height() - $('#tabs-' + newTab).offset().top - 25;

    $("#theMap" + newTab).css("height", columnheight /*- ($('#ContoursControlsTrending').css('display') === "none" ? 0 : $('#ContoursControlsTrending').height())*/);

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

    if($('#selectSiteSet' + currentTab).val() === "SelectedSites" )
        r = $('#siteList').val().length;
    else if ($('#selectSiteSet' + currentTab).val() === "All") 
        r = $('#siteList')[0].length;
    else {
        r = 0;
        $.each($('.matrix'), function (i, element) {
            if ($(element).is(':visible'))
                ++r;
        });
    }


    if (h > 0 && w > 0 && r > 0) {
        var columns = Math.floor(Math.sqrt(r));
        var rows = Math.ceil(r / columns);
        $(".matrix").css("width", (w / columns) - 4);
        $(".matrix").css("height", (h / rows) - 2);
        //$.each($(".sparkbox"), function (i, element) {
        //    $(element).css('height', '30%');
        //});

        if ($(".matrix").width() < 200) {
            $('.faultgridtitle').css("font-size", '10px');
        }
        else if ($(".matrix").width() < 1000) {
            $('.faultgridtitle').css("font-size", '20px');
        }
        else {
            $('.faultgridtitle').css("font-size", '30px');
        }

        $.event.trigger({ type: 'matrixResize', message: 'Matrix Resize', time: new Date() });

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
    
    if ($("#application-tabs").tabs("option", "active") !== getcurrentconfigsetting("CurrentTab"))
        $("#application-tabs").tabs("option", "active", getcurrentconfigsetting("CurrentTab"));
    else 
        manageTabsByDate(currentTab, contextfromdate, contexttodate);

    $("#mapGrid")[0].value = getcurrentconfigsetting("MapGrid");
    $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

    selectmapgrid($("#mapGrid")[0]);
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
            selectsitesonmap(null, "undefined");
            selectsitesincharts();
        },
        minWidth: 250, selectedList: 1, noneSelectedText: "Select Site", cssClass: '.multiselectText'
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

    //$('#selectHeatmapDisturbances').multiselect();
}

//////////////////////////////////////////////////////////////////////////////////////////////
function loadSeverityDropdown() {
    //$('#severityList').multiselect();

}

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

    currentTab = "Overview-Today";

    $("#application-tabs").tabs({
        active: getcurrentconfigsetting("CurrentTab"),
        heightStyle: "100%",
        widthStyle: "99%",

        activate: function (event, ui) {
            stopAnimatedHeatmap();
            var newTab = currentTab = ui.newTab.attr('li', "innerHTML")[0].getElementsByTagName("a")[0].innerHTML;
            if (newTab.indexOf("Overview") > -1) {
                $('#headerStrip').hide();
                showOverviewPage(currentTab);
            }
            else {
                var mapormatrix = $("#mapGrid")[0].value;
                $('#headerStrip').show();
                manageTabsByDate(newTab, contextfromdate, contexttodate);
                $("#mapGrid")[0].value = mapormatrix;
                selectmapgrid($("#mapGrid")[0]);

            }

            
        }
    });

        

    datafromdate = getcurrentconfigsetting("DataFromDate");
    datatodate = getcurrentconfigsetting("DataToDate");

    contextfromdate = getcurrentconfigsetting("ContextFromDate");
    contexttodate = getcurrentconfigsetting("ContextToDate");

    initializeDatePickers(datafromdate, datatodate);
    getMeters();
    loadsitedropdown();
    initiateTimeRangeSlider();

    resizeMapAndMatrix(currentTab);
    if (currentTab.indexOf("Overview") > -1) {
        $('#headerStrip').hide();
        showOverviewPage(currentTab);

    } else {
        $('#headerStrip').show();
        manageTabsByDate(currentTab, contextfromdate, contexttodate);


        $("#application-tabs").tabs("option", "active", getcurrentconfigsetting("CurrentTab"));
        $("#mapGrid")[0].value = getcurrentconfigsetting("MapGrid");
        $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

        selectmapgrid($("#mapGrid")[0]);
    }

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
    if (themap === null) return;
    var heat_data = new google.maps.MVCArray();
    //console.log(heat_data);
    var accumulatedmax = 0;

    $.each(data, function (key, value) {
        //console.log(value);
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

function loadLeafletMap(theDiv) {

    if (contourMap === null) {
        contourMap = L.map(theDiv, {
            center: [35.0456, -85.3097],
            zoom: 6,
            minZoom: 2,
            maxZoom: 15,
        });

        mapLink =
            '<a href="http://openstreetmap.org">OpenStreetMap</a>';

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            }).addTo(contourMap);

        $('.leaflet-control-attribution.leaflet-control').remove();
        $('.leaflet-control-zoom').children().remove();
    }
}

function showType(thecontrol) {
    plotContourMapLocations(cache_Map_Matrix_Data.d, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To, null);
}

function showTrendingData(thecontrol) {
    var mapormatrix = $("#mapGrid")[0].value;

    manageTabsByDate(currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);
    $("#mapGrid")[0].value = mapormatrix;
    selectmapgrid($("#mapGrid")[0]);
}

function initiateTimeRangeSlider() {
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 1440,
        step: 15,
        values: [0, 1440],
        slide: function (e, ui) {
            var hours1 = Math.floor(ui.values[0] / 60);
            var minutes1 = ui.values[0] - (hours1 * 60);

            if (hours1.length == 1) hours1 = '0' + hours1;
            if (minutes1.length == 1) minutes1 = '0' + minutes1;
            if (minutes1 == 0) minutes1 = '00';
            if (hours1 >= 12) {
                if (hours1 == 12) {
                    hours1 = hours1;
                    minutes1 = minutes1 + " PM";
                } else {
                    hours1 = hours1 - 12;
                    minutes1 = minutes1 + " PM";
                }
            } else {
                hours1 = hours1;
                minutes1 = minutes1 + " AM";
            }
            if (hours1 == 0) {
                hours1 = 12;
                minutes1 = minutes1;
            }



            $('.slider-time').html(hours1 + ':' + minutes1);

            var hours2 = Math.floor(ui.values[1] / 60);
            var minutes2 = ui.values[1] - (hours2 * 60);

            if (hours2.length == 1) hours2 = '0' + hours2;
            if (minutes2.length == 1) minutes2 = '0' + minutes2;
            if (minutes2 == 0) minutes2 = '00';
            if (hours2 >= 12) {
                if (hours2 == 12) {
                    hours2 = hours2;
                    minutes2 = minutes2 + " PM";
                } else if (hours2 == 24) {
                    hours2 = 11;
                    minutes2 = "59 PM";
                } else {
                    hours2 = hours2 - 12;
                    minutes2 = minutes2 + " PM";
                }
            } else {
                hours2 = hours2;
                minutes2 = minutes2 + " AM";
            }

            $('.slider-time2').html(hours2 + ':' + minutes2);
        }
    });
}

function loadContourAnimationData() {
    var dateFrom = new Date($('#mapHeaderTrendingDataTo').text() + ' ' + $('.slider-time').text() + ' UTC').toUTCString();
    var dateTo = new Date($('#mapHeaderTrendingDataTo').text() + ' ' + $('.slider-time2').text() + ' UTC').toUTCString();
    var meters = "";
    $.each($('#siteList').multiselect("getChecked").map(function () { return this.value; }), function (index, data) {
        if (index === 0)
            meters = data;
        else
            meters += ',' + data;
    });

    var thedatasent = "{'targetDateFrom':'" + dateFrom + 
                    "', 'targetDateTo':'" + dateTo +
                    "', 'measurementType':'" + $('#trendingDataSelection').val() +
                    "', 'stepSize':'" + $('#contourAnimationStepSelect').val() +
                    "', 'meterID':'" + meters +
                    "', 'dataType':'" + $('#tredingDataTypeSelection').val() +
                    "', 'userName':'" + postedUserName + "'}";
    $.ajax({
        type: "POST",
        url: './mapService.asmx/getContourAnimations',
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            //var startTime = new Date(data.d[0].Date);
            //var contourData = [{ Date: startTime, d: [] }];
            //var contourDateIndex = 0;
            //$.each(data.d, function (index, d) {
            //    if (new Date(d.Date).getTime() === startTime.getTime())
            //        contourData[contourDateIndex].d.push(d);
            //    else {
            //        startTime = new Date(d.Date);
            //        contourData.push({ Date: startTime, d: [] });
            //        contourData[++contourDateIndex].d.push(d)
            //    }
            //});

            //cache_Contour_Data = contourData;
            runContourAnimation(data.d);
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });



}

function runContourAnimation(contourData) {
    var d = new Date(contourData.Date + ' UTC');
    if ($('#weatherCheckbox').prop('checked')) {
        var wmsLayer = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?", { layers: "nexrad-n0r-wmst", transparent: true, format: 'image/png', time: new Date(d.setMinutes(d.getMinutes() - d.getMinutes()%5)).toISOString() }).addTo(contourMap);
    }
    var progressBarIndex = 0;
    $('.contourControl').css('width', '500px');
    $('#progressBar').show();

    var index = 0
    $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());
    plotContourMapLocations(contourData.Infos[index++], null, null, null, null);

    var interval;

    $('#button_play').off('click');
    $('#button_play').on('click', function () {
        interval = setInterval(function () {

            if (index == contourData.Infos.length) {
                clearInterval(interval);
                index = 0;
                $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());
            }
            else
                if ($('#weatherCheckbox').prop('checked')) {
                    d = new Date(contourData.Infos[index].Date + ' UTC');
                    wmsLayer.setParams({ time: new Date(d.setMinutes(d.getMinutes() - d.getMinutes() % 5)).toISOString() }, false);
                }
                progressBarIndex = Math.ceil(index / contourData.Infos.length * 100);
                $('#contourAnimationInnerBar').css('width', progressBarIndex + '%');
                $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

                plotContourMapLocations(contourData.Infos[index++], null, null, null, null);
        }, 3000);
    });

    $('#button_stop').off('click');
    $('#button_stop').on('click', function () {
        clearInterval(interval);
        $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

    });

    $('#button_bw').off('click');
    $('#button_bw').on('click', function () {
        --index;
        $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

    });

    $('#button_fbw').off('click');
    $('#button_fbw').on('click', function () {
        index = 0;
        $('#contourAnimationInnerBar').css('width', 0 + '%');
        $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

    });

    $('#button_fw').off('click');
    $('#button_fw').on('click', function () {
        ++index;
        $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

    });

    $('#button_ffw').off('click');
    $('#button_ffw').on('click', function () {
        index = contourData.length;
        $('#contourAnimationInnerBar').css('width', 100 + '%');
        $('#progressbarLabel').html(new Date(contourData.Infos[index].Date).getUTCHours() + ':' + (new Date(contourData.Infos[index].Date).getMinutes() < 10 ? '0' : '') + new Date(contourData.Infos[index].Date).getMinutes());

    });
}

function stepSelectionChange(thecontrol) {
    $('#slider-range').slider("option", "step", parseInt(thecontrol.value));
}

function showOverviewPage(tab) {
    var columnHeight = $(window).height() - $('#tabs-' + currentTab).offset().top;
    $('#tabs-'+tab).css('height', columnHeight);
    //$('#overviewDate').text(new Date(new Date().setDate(new Date().getDate() - 1)).toDateString());

}
/// EOF