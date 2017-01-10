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
//  08/24/2016 - William Ernest
//       Removed jqwidgets, highcharts, google and replaced with primeui, d3, flot, leaflet
//******************************************************************************************************
//////////////////////////////////////////////////////////////////////////////////////////////
// Global

var base64Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');

var globalcolorsBreakers = ['#90ed7d', '#434348', '#ff0000'];
var globalcolorsTrending = ['#434348', '#ff0000'];

var globalcolors = ['#90ed7d', '#434348', '#ff0000', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
var globalcolorsFaults = [ '#2b908f', '#e4d354', '#f15c80', '#8085e9', '#f7a35c', '#90ed7d', '#434348', '#ff0000'];
//var globalcolorsEvents = ['#C00000', '#FF2800', '#FF9600', '#FFFF00', '#00FFF4', '#0000FF'];
var globalcolorsEvents = ['#0000FF', '#00FFF4', '#FFFF00', '#FF9600', '#FF2800', '#C00000'];

var d3Colors = {
    Interruption: '#C00000',
    Fault: '#FF2800',
    Sag: '#FF9600',
    Transient: '#FFFF00',
    Swell: '#00FFF4',
    Other: '#0000FF',
    5: '#C00000',
    4: '#FF2800',
    3: '#FF9600',
    2: '#FFFF00',
    1: '#00FFF4',
    0: '#0000FF'
}

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
var cache_Sparkline_Data = null; 
var brush = null;
var cache_Last_Date = null;
var leafletMap = {'Overview-Today': null, 'Overview-Yesterday': null, Events: null, Disturbances: null, Trending: null, TrendingData: null, Faults: null, Breakers: null, Completeness: null, Correctness: null, ModbusData: null};
var markerGroup = null;
var contourLayer = null;
var contourOverlay = null;
var mapMarkers = {Events: [], Disturbances: [], Trending: [], TrendingData: [], Faults: [], Breakers: [], Completeness: [], Correctness: []};
var currentTab = null;
var disabledList = {
    Events: { "Interruption": false, "Fault": false, "Sag": false, "Transient": false, "Swell": false, "Other": true },
    Disturbances: {"5": false, "4": false, "3": false, "2": false, "1": false, "0": false},
    Trending: { "Alarm": false, "OffNormal": false},
    TrendingData: {},
    Faults: { "500 kV": false, "300 kV": false, "230 kV": false, "135 kV": false, "115 kV": false, "69 kV": false, "46 kV": false, "0 kV": false},
    Breakers: {"Normal" : false, "Late": false, "Indeterminate": false},
    Completeness: {"> 100%": false, "98% - 100%": false, "90% - 97%": false, "70% - 89%": false, "50% - 69%": false, ">0% - 49%": false, "0%": true},
    Correctness: { "> 100%": false, "98% - 100%": false, "90% - 97%": false, "70% - 89%": false, "50% - 69%": false, ">0% - 49%": false, "0%": true }
};
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
        
    $("#mapHeader" + currentTab + "From")[0].innerHTML = (new  Date(datefrom).getMonth() + 1)+ '/' + new Date(datefrom).getDate() + '/' + new Date(datefrom).getFullYear() ;
    $("#mapHeader" + currentTab + "To")[0].innerHTML = (new Date(dateto).getMonth() + 1) + '/' + new Date(dateto).getDate() + '/' + new Date(dateto).getFullYear();
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

        cache_Map_Matrix_Data_Date_From = contextfromdate;
        cache_Map_Matrix_Data_Date_To = contexttodate;

        if (contextfromdate === contexttodate) {
            cache_Last_Date = contexttodate;
        }
        else {
            cache_Last_Date = null;
            cache_Table_Data = null;
            cache_Sparkline_Data = null;
        }

        setMapHeaderDate(contextfromdate, contexttodate);
        manageTabsByDate(currentTab, contextfromdate, contexttodate);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectmapgrid(thecontrol) {
    if (thecontrol.selectedIndex === 1) {
        $("#theMatrix" + currentTab).show();
        $("#theMap" + currentTab).hide();
        if (cache_Map_Matrix_Data != null) {
            plotGridLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);  
        }
        $.sparkline_display_visible();
        updateGridWithSelectedSites();
    }
     else if (thecontrol.selectedIndex === 0) {
        //$("#ContoursControlsTrending").hide();
        $("#theMap" + currentTab).show();
        $("#theMatrix" + currentTab).hide();
        resizeMapAndMatrix(currentTab);
    }
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

function selectsitesonmap() {

}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateLocationDropdownWithSelection( ax, ay, bx, by ) {
            
    var thedatasent = "{'ax':'" + ax + "', 'ay':'" + ay + "', 'bx':'" + bx + "', 'by':'" + by + "', 'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: homePath +'mapService.asmx/getMeterIDsForArea',
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
    var thedatasent = "{'siteID':'" + siteID + "'" +
                    (currentTab === "TrendingData" ? ", 'colorScale': '" + $('#contourColorScaleSelect').val() + "'" : "") +
                    ", 'targetDate':'" + theDate + "'" +
                    ", 'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: homePath +'eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            var json = $.parseJSON(data.d)
            cache_Table_Data = json;

            var filterString = [];
            var leg = d3.selectAll('.legend');

            $.each(leg[0], function (i, d) {
                if ($(d).children('rect').css('fill') === 'rgb(128, 128, 128)')
                    filterString.push($(d).children('text').text());
            });
            window["populate" + currentTab + "DivWithGrid"](cache_Table_Data, filterString);
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

    fixNumbers(data, ['voltage', 'thecurrentdistance']);

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

    fixNumbers(data, ['Latched', 'Unreasonable', 'Noncongruent', 'Correctness']);

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
            { field: 'Latched', headerText: 'Latched', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true, content: function (row) { return row.Latched.toFixed(0) + '%'; } },
            { field: 'Unreasonable', headerText: 'Unreasonable', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return row.Unreasonable.toFixed(0) + '%'; } },
            { field: 'Noncongruent', headerText: 'Noncongruent', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return row.Noncongruent.toFixed(0) + '%'; } },
            { field: 'Correctness', headerText: 'Correctness', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return row.Correctness.toFixed(0) + '%'; } },
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

    fixNumbers(data, ['Expected', 'Received', 'Duplicate', 'Completeness']);

    $('#Detail' + currentTab + "Table").puidatatable({
        scrollable: true,
        scrollHeight: '100%',
        columns: [
            { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
            { field: 'Expected', headerText: 'Expected', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true },
            { field: 'Received', headerText: 'Received', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return row.Received.toFixed(0) + '%'; } },
            { field: 'Duplicate', headerText: 'Duplicate', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true, content: function (row) { return row.Duplicate.toFixed(0) + '%'; } },
            { field: 'Completeness', headerText: 'Complete', headerStyle: 'width: 10%', bodyStyle: 'width:  10%; height: 20px', sortable: true, content: function (row) { return row.Completeness.toFixed(0) + '%'; } },
            { field: 'ChannelCompleteness', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeChannelCompletenessButton_html }
        ],
        datasource: filteredData
    });
}

function populateEventsDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail'+ currentTab +'Table"></div>');
    }

    var filteredData = [];
    if (data !== null && disabledFields !== null) {
        $.each(data, function (i, d) {
            var otherFields = ["theeventid" , "themeterid", "thesite", undefined, "others"];
            var fixedDisabledFields = disabledFields.map(function(x) { return x.toLowerCase() + 's'});
            var sum = 0;
            for (var key in d) {
                if (fixedDisabledFields.indexOf(key) == -1 && otherFields.indexOf(key) == -1)
                    sum += parseInt(d[key]);
            }
            if (sum > 0)
                filteredData.push(d);
        });
    } else {
        filteredData = data;
    }


    fixNumbers(filteredData, ['interruptions', 'faults', 'sags', 'swells', 'others']);

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
        datasource: filteredData
    });

}

function populateDisturbancesDivWithGrid(data, disabledFields) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    fixNumbers(data, ['5', '4', '3', '2', '1', '0']);

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

    fixNumbers(data, ['timing', 'speed']);

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

    fixNumbers(data, ['HarmonicGroup', 'eventcount']);

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

    fixNumbers(data, ['Minimum', 'Maximum', 'Average']);

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
            { field: 'OpenSTE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: function (row) { return makeOpenSTEButton_html(row); }}
        ],
        datasource: data
    });
}

function fixNumbers(data, numFields) {
    if (data != null) {
        $.each(data, function (_, obj) {
            $.each(numFields, function (_, field) {
                obj[field] = Number(obj[field]);
            });
        });
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// The following function are for making button links to another page and opening another page
function filterMakeFaultSpecificsButton_html(id) {
    var return_html = "";
    if (id.eventtype == "Fault") {
        return_html = makeFaultSpecificsButton_html(id);
    }
    return (return_html);
}

function makeFaultSpecificsButton_html(id) {
    var return_html = "";
    return_html += '<div style="width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open Fault Detail Window">';
    return_html += '<img src="images/faultDetailButton.png" /></button></div>';
return (return_html);
}

function OpenWindowToFaultSpecifics(id) {
    var datarow = id;
    var popup = window.open(homePath + "FaultSpecifics.aspx?eventid=" + id, id + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}

function makeOpenSEEButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button></div>';
    return (return_html);
}

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

function OpenWindowToOpenSTE(url, id) {
    var popup = window.open(homePath + url, id + "openSTE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}


function OpenWindowToOpenSEE(id) {
    var url = homepath + "/Main/OpenSEE?eventid=" + id;

    if (currentTab === "Breakers")
        url += "&breakerdigitals=1";
    else
        url += "&faultcurves=1";

    var popup = window.open(homePath + url, id + "openSEE");
    return false;
}

function makeChannelDataQualityButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataQuality(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dqDetailButton.png" /></button></div>';
    return (return_html);
}

function makeChannelCompletenessButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToChannelDataCompleteness(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Channel Data Quality Details Page">';
    return_html += '<img src="images/dcDetailButton.png" /></button></div>';
    return (return_html);
}

function makeMeterEventsByLineButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToMeterEventsByLine(' + id.theeventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">';
    return_html += '<img src="images/eventDetailButton.png" /></button></div>';
    return (return_html);
}

function OpenWindowToMeterEventsByLine(id) {
    var popup = window.open(homePath + "Main/MeterEventsByLine?eventid=" + id, id + "MeterEventsByLine");
    return false;
}

function OpenWindowToMeterDisturbancesByLine(id) {
    var popup = window.open(homePath + "MeterDisturbancesByLine.aspx?eventid=" + id, id + "MeterDisturbancesByLine", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}


function OpenWindowToChannelDataQuality(id) {
    var popup = window.open(homePath + "ChannelDataQuality.aspx?eventid=" + id, id + "ChannelDataQuality", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

function OpenWindowToChannelDataCompleteness(id) {
    var popup = window.open(homePath + "ChannelDataCompleteness.aspx?eventid=" + id, id + "ChannelDataCompleteness", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

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
    window['dataHub'][thedatasource](siteID, thedatefrom, thedateto, postedUserName).done(function (data) {
        var dateDiff = (new Date(thedateto).getTime() - new Date(thedatefrom).getTime()) / 1000 / 60 / 60 / 24;
        if (data !== null) {

            var graphData = { graphData: [], keys: [], colors: [] };

            for (var i = 0, j = 0; i < dateDiff; ++i) {
                var obj = {};
                var total = 0;
                obj["Date"] = Date.parse(data.StartDate) + i * 24 * 60 * 60 * 1000;
                if (data.Types[0].Data[j] !== undefined && obj["Date"] == Date.parse(data.Types[0].Data[j].Item1)) {
                    data.Types.forEach(function (d) {
                        obj[d.Name] = d.Data[j].Item2;
                        total += d.Data[j].Item2;
                    });
                    ++j;
                } else {
                    data.Types.forEach(function (d) {
                        obj[d.Name] = 0;
                        total += 0;
                    });
                }
                obj["Total"] = total;
                graphData.graphData.push(obj);

            }

     
            data.Types.forEach(function (d) {
                graphData.keys.push(d.Name);
                graphData.colors.push(d.Color);
            });


            cache_Graph_Data = graphData;

            if (thediv === "Overview") {

            } else if (thediv === "TrendingData") {

            } else
                buildBarChart(graphData, thediv, siteName, siteID, thedatefrom, thedateto);
        }
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
    var chartData = deepCopy(data.graphData);

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
    var color = d3.scale.ordinal().range(data.colors.reverse()).domain(data.keys.reverse());

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

    var numSamples = chartData[0].length;
    var seriesClass = function (seriesName) { return "series-" + seriesName.toLowerCase(); };
    var layerClass = function (d) { return "layer " + seriesClass(d.key); };

    var stack = d3.stack()
        .keys(data.keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var series = null;

    var tempKeys = data.keys;

    $.each(chartData, function (i, d) {
        $.each(tempKeys, function (j, k) {
            if (disabledList[currentTab][k] === true)
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
            return d;
        })
            .enter().append("rect")
                .attr("x", function (d) {
                    return x(d.data.Date);
                })
                .attr("width", function () {
                    return width / numSamples;
                })
                .attr("y", function (d) {
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
        if(currentTab === "Events")
            disabledList[currentTab]["Other"] = true;

        legend.append("rect")
            .attr("x", width + -65)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d, i, e) {
                if (disabledList[currentTab][d]) {
                    return '#808080';
                }
                return color(d);
            })
            .style("cursor", "pointer")
            .on("click", function (d, i) {
                disabledList[currentTab][d] = !disabledList[currentTab][d];
                if (disabledList[currentTab][d]) {
                    $(this).css('fill', 'rgb(128, 128, 128)');
                }
                else {
                    $(this).css('fill', color(d));
                    disabledLegendFields = disabledLegendFields.filter(function (word) { return word !== d });
                }

                toggleSeries(d, $(this).css('fill') === 'rgb(128, 128, 128)');
                window["populate" + currentTab + "DivWithGrid"](cache_Table_Data, $.map(disabledList[currentTab], function (data, key) { if (data) return key }));
                resizeMatrixCells(currentTab);
                showSiteSet($("#selectSiteSet" + currentTab)[0]);
                if ($('#mapGrid')[0].value == "Map" && (currentTab === 'Disturbances' || currentTab === 'Events' || currentTab === 'Trending')) {
                    var legendFields = color.domain().slice().filter(function (a) { return $.map(disabledList[currentTab], function (data, key) { if (data) return key }).indexOf(a) < 0 });
                    showHeatmap(document.getElementById('selectHeatmap' + currentTab), legendFields);
                }

            });

        legend.append("text")
            .attr("x", width - 40)
            .attr("y", 9)
            .attr("width", 40)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) {
                return d;
            });

        if (currentTab === "Events")
            toggleSeries("Other", true);
    }

    //called when selection is chosen on overview map
    function brushed() {
        if (brush.empty())
            return;


        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
        main.selectAll("g").remove();

        var newData = deepCopy(cache_Graph_Data.graphData);
        var tempKeys = cache_Graph_Data.keys;

        $.each(newData, function (i, d) {
            $.each(tempKeys, function (j, k) {
                if (disabledList[currentTab][k] === true)
                    newData[i][k] = 0;

            });

        });

        var stackedData = stack(newData.filter(function (d) {
            return d.Date > new Date(brush.extent()[0]).setHours(0, 0, 0, 0) && d.Date < new Date(brush.extent()[1]).setHours(0, 0, 0, 0);
        }));


        buildMainGraph(stackedData);


    }

    //Toggles a certain series.
    function toggleSeries(seriesName, isDisabling) {

        var newData = deepCopy(cache_Graph_Data.graphData);

        var tempKeys = cache_Graph_Data.keys;
        disabledList[currentTab][seriesName] = isDisabling;

        $.each(newData, function (i, d) {
            $.each(tempKeys, function (j, k) {
                if (disabledList[currentTab][k] === true)
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
    dataHub.getTrendingDataForPeriod(siteID, $('#contourColorScaleSelect').val(), thedatefrom, thedateto, postedUserName).done(function (data) {
        cache_ErrorBar_Data = data;
        buildErrorBarChart(data, thediv, siteName, siteID, thedatefrom, thedateto);
    }).fail(function (msg) {
        alert(msg);
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
            var thedate = $.plot.formatDate($.plot.dateGenerator(item.datapoint[0], { timezone: "utc" }), "%m/%d/%Y");

            var html = '<div>' + thedate + '</div>';
            html += '<div>' + item.series.label + ': <span style="font-weight:bold">' + (item.series.label !== 'Range' ? parseFloat(item.datapoint[1]).toFixed(3) : (item.datapoint[1] - item.datapoint[2]).toFixed(3) + ' - ' + (item.datapoint[1] + item.datapoint[3]).toFixed(3)) + '</span></div>';
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
            $('.contourControl').show();
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
    var url = homePath + "mapService.asmx/getLocationsHeatmapSwell";

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
            //var map = getMapInstance(currentTab);
            LoadHeatmapLeaflet(data.d);

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
    var url = homePath + "mapService.asmx/getLocationsHeatmapSags";

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
            //var map = getMapInstance(currentTab);
            LoadHeatmapLeaflet(data.d);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getEventsHeatmapCounts(currentTab, datefrom, dateto, severities) {
    var thedatasent = {
        targetDateFrom: datefrom,
        targetDateTo: dateto,
        meterGroup: $('#meterGroupSelect').val(),
        severityFilter: severities.toString()
    };
    //var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "', 'severityFilter':'" + severities + "'}";
    var url = homePath + "mapService.asmx/getLocations" + currentTab + "HeatmapCounts";

    heatmap_Cache_Date_From = null;
    heatmap_Cache_Date_To = null;
    heatmapCache = null;

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
            //var map = getMapInstance(currentTab);
            LoadHeatmapLeaflet(data.d);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getDisturbancesHeatmapCounts(currentTab, datefrom, dateto, severities) {
    var thedatasent = {
        targetDateFrom: datefrom,
        targetDateTo: dateto,
        meterGroup: $('#meterGroupSelect').val(),
        severityFilter: severities.toString()
    };

    var thedatasent = "{'targetDateFrom':'" + datefrom + "' , 'targetDateTo':'" + dateto + "' , 'userName':'" + postedUserName + "', 'severityFilter':'" + severities+"'}";
    var url = homePath + "mapService.asmx/getLocations" + currentTab + "HeatmapCounts";
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
        data: JSON.stringify(thedatasent),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            LoadHeatmapLeaflet(data.d);
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
    var url = homePath + "mapService.asmx/getLocations" + currentTab + "HeatmapCounts";
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
            LoadHeatmapLeaflet(data.d);
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////
function getLocationsAndPopulateMapAndMatrix(currentTab, datefrom, dateto, string) {
    var url = homePath + "mapService.asmx/getLocations" + currentTab;
    var thedatasent = "{'targetDateFrom':'" + datefrom + "'" +
        (currentTab === "TrendingData" ? ", 'measurementType': '" + $('#trendingDataSelection').val() + "'" : "") +
        " , 'targetDateTo':'" + dateto +
        "' , 'meterGroup':" + $('#meterGroupSelect').val() + "" +
        (currentTab === "TrendingData" ? ", 'dataType': '" + $('#trendingDataTypeSelection').val() + "'" : "") + "}";

    if (currentTab !== "TrendingData") {
        thedatasent = {
            targetDateFrom: datefrom,
            targetDateTo: dateto,
            meterGroup: $('#meterGroupSelect').val()
        };
    } else {
        thedatasent = {
            contourQuery: {
                StartDate: datefrom,
                EndDate: dateto,
                DataType: $('#trendingDataTypeSelection').val(),
                ColorScaleName: $('#contourColorScaleSelect').val(),
                UserName: postedUserName,
                meterGroup: $('#meterGroupSelect').val()
            }
        };
        
    }

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
            cache_Map_Matrix_Data_Date_From = this.datefrom;
            cache_Map_Matrix_Data_Date_To = this.dateto;
            cache_Map_Matrix_Data = data;

            plotContourMapLocations(data.d, currentTab, this.datefrom, this.dateto, string);
            plotGridLocations(data, currentTab, this.datefrom, this.dateto, string);

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getStatusColorForGridElement( data ) {
    
    switch (currentTab) {
        case "Events":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0)
                return ("#0E892C");
            if (data[0] > 0 && !disabledList[currentTab]["Interruption"])  // Interruptions
                return (globalcolorsEvents[5]);
            if (data[1] > 0 && !disabledList[currentTab]["Fault"])  // Faults
                return (globalcolorsEvents[4]);
            if (data[2] > 0 && !disabledList[currentTab]["Sag"])  // Sags
                return (globalcolorsEvents[3]);
            if (data[3] > 0 && !disabledList[currentTab]["Transient"])  // Transients
                return (globalcolorsEvents[2]);
            if (data[4] > 0 && !disabledList[currentTab]["Swell"])  // Swells
                return (globalcolorsEvents[1]);
            if (data[5] > 0 && !disabledList[currentTab]["Other"])   // Others
                return (globalcolorsEvents[0]);
            else return ("#0E892C");
            break;
        case "Disturbances":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) 
                return ("#0E892C");
            if (data[5] > 0 && !disabledList[currentTab]["5"])  // 5
                return (globalcolorsEvents[5]);
            if (data[4] > 0 && !disabledList[currentTab]["4"])  // 4
                return (globalcolorsEvents[4]);
            if (data[3] > 0 && !disabledList[currentTab]["3"])  // 3
                return (globalcolorsEvents[3]);
            if (data[2] > 0 && !disabledList[currentTab]["2"])  // 2
                return (globalcolorsEvents[2]);
            if (data[1] > 0 && !disabledList[currentTab]["1"])  // 1
                return (globalcolorsEvents[1]);
            if (data[0] > 0 && !disabledList[currentTab]["0"])  // 0
                return (globalcolorsEvents[0]);
            else return ("#0E892C");
            break;
        case "Completeness":
            //[0]ExpectedPoints
            //[1]GoodPoints
            //[2]LatchedPoints
            //[3]UnreasonablePoints
            //[4]NoncongruentPoints
            //[5]DuplicatePoints

            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0)
                return (globalcolorsDQ[0]);
            if (data[0] == 0 || data[1] == 0)
                return ("#CCCCCC");

            var percentage = Math.floor(((data[1] + data[2] + data[3] +data[4]) / data[0]) * 100);
            if (percentage > 100 && !disabledList[currentTab]["> 100%"])
                return (globalcolorsDQ[6]);
            if (percentage >= 98 && !disabledList[currentTab]["98% - 100%"])
                return (globalcolorsDQ[5]);
            if (percentage >= 90 && !disabledList[currentTab]["90% - 97%"])
                return (globalcolorsDQ[4]);
            if (percentage >= 70 && !disabledList[currentTab]["70% - 89%"])
                return (globalcolorsDQ[3]);
            if (percentage >= 50 && !disabledList[currentTab]["50% - 69%"])
                return (globalcolorsDQ[2]);
            if (percentage > 0 && !disabledList[currentTab][">0% - 49%"])
                return (globalcolorsDQ[1]);
            if (!disabledList[currentTab]["0%"]) return (globalcolorsDQ[0]);
            return (globalcolorsDQ[0]);
            break;

        case "Correctness":
            //[0]ExpectedPoints
            //[1]GoodPoints
            //[2]LatchedPoints
            //[3]UnreasonablePoints
            //[4]NoncongruentPoints
            //[5]DuplicatePoints
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 0 && data[4] == 0 && data[5] == 0) 
                return (globalcolorsDQ[0]);
            if (data[0] == 0 || data[1] == 0) 
                return ("#CCCCCC");

            var percentage = Math.floor((data[1]/(data[1] + data[2] + data[3] + data[4])) * 100);
            if (percentage > 100 && !disabledList[currentTab]["> 100%"])
                return (globalcolorsDQ[6]);
            if (percentage >= 98 && !disabledList[currentTab]["98% - 100%"])
                return (globalcolorsDQ[5]);
            if (percentage >= 90 && !disabledList[currentTab]["90% - 97%"])
                return (globalcolorsDQ[4]);
            if (percentage >= 70 && !disabledList[currentTab]["70% - 89%"])
                return (globalcolorsDQ[3]);
            if (percentage >= 50 && !disabledList[currentTab]["50% - 69%"])
                return (globalcolorsDQ[2]);
            if (percentage > 0 && !disabledList[currentTab][">0% - 49%"])
                return (globalcolorsDQ[1]);
            if (!disabledList[currentTab]["0%"]) return (globalcolorsDQ[0]);
            return (globalcolorsDQ[0]);
            break;

        case "Trending":
                    
            if (data[0] == 0 && data[1] == 0) 
                return ("#339933");
            else if (data[1] > 0 && data[0] > 0) 
                return ("#FF7700");
            else if (data[0] > 0 && data[1] == 0 && !disabledList[currentTab]["Alarm"])
                return ("#FF0000");
            else if (data[1] > 0 && data[0] == 0 && !disabledList[currentTab]["OffNormal"])
                return ("#FFCC00");
            else return ("#339933");
            break;


        case "TrendingData":
            if ($('#trendingDataTypeSelection').val() === "Average") {
                if (data[2] !== null) return ("#0E892C");
            }
            else if ($('#trendingDataTypeSelection').val() === "Minimum") {
                if (data[1] !== null) return ("#0E892C");
            }
            else if ($('#trendingDataTypeSelection').val() === "Maximum") {
                if (data[0] !== null) return ("#0E892C");
            }
            break;

        case "Faults":
            if (data[0] == 0) 
                return ("#0E892C");
            if (data[0] > 0)  // Faults
                return ("#FF0000");
            break;


        case "Breakers":
            if (data[0] == 0 && data[1] == 0 && data[2] == 0 ) 
                return ("#0E892C");
            if (data[0] > 0 && !disabledList[currentTab]["Normal"])  // Normal
                return (globalcolors[0]);

            if (data[1] > 0 && !disabledList[currentTab]["Late"])  // Late
                return (globalcolors[1]);

            if (data[2] > 0 && !disabledList[currentTab]["Indeterminate"])  // Indeterminate
                return (globalcolors[2]);
            else return ("#0E892C");
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
    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        height: parseInt($(matrixItemID).height() * .4),
        barWidth: parseInt($(matrixItemID).width() / (data.length * 2)),
        siteid: siteName,
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
        height: parseInt($(matrixItemID).height() * .4),
        barWidth: parseInt($(matrixItemID).width() / (data.length * 2)),
        siteid: siteName,
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

     var sparkValues = { "Interruption": { data: data[0], color: globalcolorsEvents[5] }, "Fault": { data: data[1], color: globalcolorsEvents[4] }, "Sag": { data: data[2], color: globalcolorsEvents[3] }, "Transient": { data: data[3], color: globalcolorsEvents[2] }, "Swell": { data: data[4], color: globalcolorsEvents[1] }, "Other": { data: data[5], color: globalcolorsEvents[0] } };
     var numbers = [];
     var colors = [];
     $.each($.map(disabledList[currentTab], function (data, key) { if (!data) return key }), function (index, field) {
            numbers.push(sparkValues[field].data);
            colors.push(sparkValues[field].color);
     });

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
            thetitle += "<tr><td>Interruptions</td><td align='right'>" + data[5] + "</td></tr>";
            thetitle += "<tr><td>Faults</td><td align='right'>" + data[4] + "</td></tr>";
            thetitle += "<tr><td>Sags</td><td align='right'>" + data[3] + "</td></tr>";
            thetitle += "<tr><td>Transients</td><td align='right'>" + data[2] + "</td></tr>";
            thetitle += "<tr><td>Swells</td><td align='right'>" + data[1] + "</td></tr>";
            thetitle += "<tr><td>Others</td><td align='right'>" + data[0] + "</td></tr>";
            thetitle += "</table>";
            return (thetitle);
        }
    });

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(numbers, {
        type: 'bar',
        height: parseInt($(matrixItemID).height() * .4),
        barWidth: parseInt($(matrixItemID).width() / (data.length * 2)),
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: colors,

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

function populateGridSparklineDisturbances(data, siteID, siteName) {
    var sparkValues = { "5": { data: data[5], color: globalcolorsEvents[5] }, "4": { data: data[4], color: globalcolorsEvents[4] }, "3": { data: data[3], color: globalcolorsEvents[3] }, "2": { data: data[2], color: globalcolorsEvents[2] }, "1": { data: data[1], color: globalcolorsEvents[1] }, "0": { data: data[0], color: globalcolorsEvents[0] } };
    var numbers = [];
    var colors = [];
    $.each($.map(disabledList[currentTab], function (data, key) { if (!data) return key }).sort(function (a, b) { return b - a;}), function (index, field) {
            numbers.push(sparkValues[field].data);
            colors.push(sparkValues[field].color);
    });

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

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(numbers, {
        type: 'bar',
        height: parseInt($(matrixItemID).height() * .4),
        barWidth: parseInt($(matrixItemID).width() / (data.length * 2)),
        siteid: siteName,
        //datadate: thedate,
        borderWidth: 0,
        nullColor: '#f5f5f5',
        zeroColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        colorMap: colors,

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
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklineBreakers(data, siteID, siteName) {

    var sparkValues = { "Indeterminate": { data: data[2], color: globalcolors[0] }, "Late": { data: data[1], color: globalcolors[1] }, "Normal": { data: data[2], color: globalcolors[2] } };
    var numbers = [];
    var colors = [];
    $.each($.map(disabledList[currentTab], function (data, key) { if (!data) return key }).sort(function (a, b) { return b - a; }), function (index, field) {
        numbers.push(sparkValues[field].data);
        colors.push(sparkValues[field].color);
    });
    var  colorMap = globalcolors; //['#FF0000', '#CC6600', '#FF8800'];

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    $(matrixItemID)[0].title = siteName + "\nNormal: " + data[0] + "\nLate: " + data[1] + "\nIndeterminate: " + data[2];

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkValues, {
        type: 'bar',
        height: parseInt($(matrixItemID).height() * .4),
        barWidth: parseInt($(matrixItemID).width() / (data.length * 2)),
        siteid: siteName,
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
                    if ($(value).css('background-color') != "rgb(14, 137, 44)" && $(value).css('background-color') != "#0E892C")
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
                    if ($(value).css('background-color') != "rgb(14, 137, 44)" && $(value).css('background-color') != "#0E892C") {
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

            case "RecievedData":
                $.each(gridchildren.children, function (key, value) {
                    if ($(value).css('background-color') != "rgb(0, 0, 0)") {
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

            case "NoData":
                $.each(gridchildren.children, function (key, value) {
                    if ($(value).css('background-color') != "rgb(0, 0, 0)") {
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
        switch (thecontrol.value) {
            case "All":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    $(marker).show();
                });
                break;

            case "None":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    $(marker).hide();
                });
                break;


            case "Events":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') !== '#0E892C')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "NoEvents":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#0E892C')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "Disturbances":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') !== '#0E892C')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "NoDisturbances":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#0E892C')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "SelectedSites":
                var selectedIDs = GetCurrentlySelectedSites();
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($.inArray($(marker).children().attr('id').replace('-', '|'), selectedIDs) > -1)
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "Sags":
                var selectedIDs = GetCurrentlySelectedSites();
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#996633')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "Swells":
                var selectedIDs = GetCurrentlySelectedSites();
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#ff0000')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "RecievedData":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') !== '#000000')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                
                break;

            case "NoData":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
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
            getTrendingHeatmapCounts(currentTab, datefrom, dateto, string);
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
    /// Clear Matrix
    if ($("#theMatrix" + newTab)[0].childElementCount > 0) {
        $("#theMatrix" + newTab).empty();
    }

    var selectedIDs = GetCurrentlySelectedSites();

    // For each data unit, build containers, add to layer based on status
    $.each(locationdata.d.Locations, function (key, value) {
        var theindex = $.inArray(value.name + "|" + value.id, selectedIDs);
 
        var item;

        if (theindex > -1) {
            item = $("<div unselectable='on' class='matrix matrixButton noselect' id='" + "matrix_" + value.id + "_box_" + newTab + "'/>");

        } else {
            item = $("<div unselectable='on' class='matrix matrixButtonBlack noselect' id='" + "matrix_" + value.id + "_box_" + newTab + "'/>");
        }

        item.data('gridstatus', value.status);
        item.data('siteid', value.name + "|" + value.id);
        $("#theMatrix" + newTab).append(item);

    });

    /// Set Matrix Cell size
    cache_Sparkline_Data = locationdata.d.Locations;
    //resizeMatrixCells(newTab);

    //$.each(locationdata.d.Locations, (function (key, value) {
    //    populateGridMatrix(value.data, value.id, value.name);
    //}));

    showSiteSet($("#selectSiteSet" + currentTab)[0]);
};

/////////////////////////////////////////////////////////////////////////////////////////
/// creates markers for each geocoordinate
/// Builds location dropdown
/// Builds sparklines
/// Builds Heatmap


function plotContourMapLocations(locationdata, newTab, thedatefrom, thedateto, filter) {
    var selectedIDs = GetCurrentlySelectedSites();
    if (leafletMap[currentTab] !== null){
        $.each(locationdata.Locations, function (index, data) {
            $('#' + data.name.replace(/[^A-Za-z0-9]/g, "") + '-' + data.id + ' circle').attr('fill', getLeafletLocationColors(data));
            $.each(mapMarkers[currentTab], function (mmIndex, object) {
                if(object.id === data.id)
                    object.marker.getPopup().setContent(getLeafletLocationPopup(data))
            });
        });
    }
    else {
        loadLeafletMap('theMap' + currentTab);

        $.each(locationdata.Locations, function (index, data) {
            var color = getLeafletLocationColors(data);

            var html = '<svg height="12" width="12" id="' + data.name.replace(/[^A-Za-z0-9]/g, "") + '-' + data.id + '">' +
                            '<circle cx="6" cy ="6" r="4" stroke="black" stroke-width="1" fill="' + color + '"/>' +
                       '</svg>';

            var popup = getLeafletLocationPopup(data);

            var circleIcon = L.divIcon({ className: 'leafletCircle', html: html });

            var marker = L.marker([data.Latitude, data.Longitude], { icon: circleIcon }).addTo(leafletMap[currentTab]).bindPopup(popup);

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
                    $('#siteList').multiselect("widget").find(":radio[value='" + data.id + "']").each(function () { this.click(); });
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
                mapMarkers[currentTab].push({ id: data.id, marker: marker });
        });

        // Hack: if displaying an overlay for animation,
        //       do not automatically fit bounds
        if (!locationdata.URL) {
            markerGroup = new L.featureGroup(mapMarkers[currentTab].map(function (a) { return a.marker; }));
            if(markerGroup.getBounds().isValid())
                leafletMap[currentTab].fitBounds(markerGroup.getBounds());
            leafletMap[currentTab].setMaxBounds(L.latLngBounds(L.latLng(-180,-270), L.latLng(180,270)));
        }

        var timeoutVal;
        leafletMap[currentTab].off('boxzoomend');
        leafletMap[currentTab].on('boxzoomend', function (event) {
            $('#siteList').multiselect("uncheckAll");

            $.each(locationdata.Locations, function (index, data) {
                if (data.Latitude >= event.boxZoomBounds._southWest.lat && data.Latitude <= event.boxZoomBounds._northEast.lat
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


    }
    showSiteSet($('#selectSiteSet' + currentTab)[0]);
    plotContourMap(locationdata, thedatefrom, thedateto);
};

/////////////////////////////////////////////////////////////////////////////////////////////////
function getLeafletLocationColors(dataPoint) {
    var color = '#000000';

    if (currentTab === "TrendingData") {
        color = 'rgb(0,255,0)'; // green
        if (dataPoint[$('#trendingDataTypeSelection').val()] === null) color = '#000000'  // black  
        //else if (dataPoint[$('#trendingDataTypeSelection').val()] < 0.8) color = '#996633';  //dark brown
        //else if (dataPoint[$('#trendingDataTypeSelection').val()] > 1.2) color = '#ff0000';       //bright red 
    }
    else if (currentTab === "Correctness" || currentTab === "Completeness") {
        var percentage = (dataPoint.data[1] / (dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4]) * 100).toFixed(2);

        if (dataPoint.data[0] == 0 && dataPoint.data[1] == 0 && dataPoint.data[2] == 0 && dataPoint.data[3] == 0 && dataPoint.data[4] == 0 && dataPoint.data[5] == 0) {
            color = ['#0000FF'];
        } else if (percentage > 100) {
            color = [globalcolorsDQ[6]];
        } else if (percentage <= 100 && percentage >= 98) {
            color = [globalcolorsDQ[5]];
        } else if (percentage < 98 && percentage >= 90) {
            color = [globalcolorsDQ[4]];
        } else if (percentage < 90 && percentage >= 70) {
            color = [globalcolorsDQ[3]];
        } else if (percentage < 70 && percentage >= 50) {
            color = [globalcolorsDQ[2]];
        } else if (percentage < 50 && percentage > 0) {
            color = [globalcolorsDQ[1]];
        } else {
            color = [globalcolorsDQ[0]];
        }
    }
    else if (currentTab === "Breakers") {
        if (dataPoint.data[0] === 0 && dataPoint.data[1] == 0 && dataPoint.data[2] == 0) {
            color = '#0E892C';
        } else {
            color = '#CC3300';
        }

    }
    else if (currentTab === "Trending") {
        if (dataPoint.data[0] === 0 && dataPoint.data[1] === 0) {
            color = '#0E892C';
        } else if(dataPoint.data[0] > 0){
            color = '#FF0000';
        } else if (dataPoint.data[1] > 0) {
            color = '#000000'
        }
    }

    else if (currentTab === "Faults") {
            if (dataPoint.status === 0) 
                color = '#0E892C';
            else 
                color = '#CC3300';
    }
    else if (currentTab === "Disturbances") {
        if (dataPoint.data[0] == 0 && dataPoint.data[1] == 0 && dataPoint.data[2] == 0 && dataPoint.data[3] == 0 && dataPoint.data[4] == 0 && dataPoint.data[5] == 0)
            color = '#0E892C';
        else if (dataPoint.data[5] > 0)
            color = globalcolorsEvents[5];
        else if (dataPoint.data[4] > 0)
            color = globalcolorsEvents[4];
        else if (dataPoint.data[3] > 0)
            color = globalcolorsEvents[3];
        else if (dataPoint.data[2] > 0)
            color = globalcolorsEvents[2];
        else if (dataPoint.data[1] > 0)
            color = globalcolorsEvents[1];
        else if (dataPoint.data[0] > 0)
            color = globalcolorsEvents[0];
    }
    else if (currentTab === "Events") {
        if (dataPoint.data[0] == 0 && dataPoint.data[1] == 0 && dataPoint.data[2] == 0 && dataPoint.data[3] == 0 && dataPoint.data[4] == 0 && dataPoint.data[5] == 0)
            color = '#0E892C';
        else if (dataPoint.data[0] > 0)
            color = globalcolorsEvents[5];
        else if (dataPoint.data[1] > 0)
            color = globalcolorsEvents[4];
        else if (dataPoint.data[2] > 0)
            color = globalcolorsEvents[3];
        else if (dataPoint.data[3] > 0)
            color = globalcolorsEvents[2];
        else if (dataPoint.data[4] > 0)
            color = globalcolorsEvents[1];
        else if (dataPoint.data[5] > 0)
            color = globalcolorsEvents[0];
    }
    return color;

}

//////////////////////////////////////////////////////////////////////////////////////////////////
function getLeafletLocationPopup(dataPoint) {
    var popup;
    if (currentTab === "TrendingData") {
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Average:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(dataPoint.Average).toFixed(2) + "&nbsp;</td></tr>";
        popup += "<tr><td>Minimum:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(dataPoint.Minimum).toFixed(2) + "&nbsp;</td></tr>";
        popup += "<tr><td>Maximum:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(dataPoint.Maximum).toFixed(2) + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Completeness") {
        var completepoints = dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4];
        var recieved = (completepoints / dataPoint.data[0] * 100).toFixed(2);
        var duplicate = (dataPoint.data[5] / dataPoint.data[0] * 100).toFixed(2);

        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Expected:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[0] + "&nbsp;</td></tr>";
        popup += "<tr><td>Recieved:&nbsp;</td><td style='text-align: right'>&nbsp;" + recieved + "&nbsp;</td></tr>";
        popup += "<tr><td>Duplicate:&nbsp;</td><td style='text-align: right'>&nbsp;" + duplicate + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Correctness") {
        var percentage = (dataPoint.data[1] / (dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4]) * 100).toFixed(2);

        var val1 = (dataPoint.data[2] / (dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4]) * 100).toFixed(2);
        var val2 = (dataPoint.data[3] / (dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4]) * 100).toFixed(2);
        var val3 = (dataPoint.data[4] / (dataPoint.data[1] + dataPoint.data[2] + dataPoint.data[3] + dataPoint.data[4]) * 100).toFixed(2);
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        if (dataPoint.data[0] == 0 && dataPoint.data[1] == 0 && dataPoint.data[2] == 0 && dataPoint.data[3] == 0 && dataPoint.data[4] == 0 && dataPoint.data[5] == 0) {
            popup += "<tr><td>No Data Available</td></tr>";
        } else {

            popup += "<tr><td>Latched:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(val1).toFixed(2) + "&nbsp;</td></tr>";
            popup += "<tr><td>Unreasonable:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(val2).toFixed(2) + "&nbsp;</td></tr>";
            popup += "<tr><td>Non-Congruent:&nbsp;</td><td style='text-align: right'>&nbsp;" + parseFloat(val3).toFixed(2) + "&nbsp;</td></tr>";
            popup += "</table>";
        }
    }
    else if (currentTab === "Breakers") {
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Normal:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[0] + "&nbsp;</td></tr>";
        popup += "<tr><td>Late:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[1] + "&nbsp;</td></tr>";
        popup += "<tr><td>Indeterminate:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[2] + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Faults") {
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Faults:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.status + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Disturbances") {
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>5:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[5] + "&nbsp;</td></tr>";
        popup += "<tr><td>4:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[4] + "&nbsp;</td></tr>";
        popup += "<tr><td>3:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[3] + "&nbsp;</td></tr>";
        popup += "<tr><td>2:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[2] + "&nbsp;</td></tr>";
        popup += "<tr><td>1:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[1] + "&nbsp;</td></tr>";
        popup += "<tr><td>0:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[0] + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Events") {
        popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
        popup += "<tr><td>Interruption:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[0] + "&nbsp;</td></tr>";
        popup += "<tr><td>Fault:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[1] + "&nbsp;</td></tr>";
        popup += "<tr><td>Sag:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[2] + "&nbsp;</td></tr>";
        popup += "<tr><td>Transient:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[3] + "&nbsp;</td></tr>";
        popup += "<tr><td>Swell:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[4] + "&nbsp;</td></tr>";
        popup += "<tr><td>Other:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[5] + "&nbsp;</td></tr>";
        popup += "</table>";

    }
    else if (currentTab === "Trending") {
            popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.name + "&nbsp;</td></tr>";
            popup += "<tr><td>Normal:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[0] + "&nbsp;</td></tr>";
            popup += "<tr><td>OffNormal:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.data[1] + "&nbsp;</td></tr>";
            popup += "</table>";

        }
    return popup;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
function plotContourMap(data, thedatefrom, thedateto) {
    $('.contourControl').hide();

    if (currentTab === "TrendingData") {

        if (data.URL)
            loadContourOverlay(data);
        else {
            thedatasent = {
                contourQuery: {
                    Meters: getBase64MeterSelection(),
                    StartDate: thedatefrom,
                    EndDate: thedateto,
                    DataType: $('#trendingDataTypeSelection').val(),
                    ColorScaleName: $('#contourColorScaleSelect').val(),
                    UserName: postedUserName
                }
            };

            loadContourLayer(thedatasent.contourQuery);

        }
        if (thedatefrom === thedateto)
            $('.contourControl').show();

    }

    $('.info.legend.leaflet-control').remove();
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];
        div.innerHTML += "<h4><button class='btn btn-link' style='padding: 0;'data-toggle='collapse' data-target='#innerLegend'><u>Legend</u></button></h4>" +
            "<div id='innerLegend' class='collapse'></div>";
        // loop through our density intervals and generate a label with a colored square for each interval
        return div;
    };

    legend.addTo(leafletMap[currentTab]);

    if (currentTab === "TrendingData") {
        for (var i = data.ColorDomain.length - 2; i >= 1; i -= 1) {
            if (i === data.ColorDomain.length - 2) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> >' + data.ColorDomain[i].toFixed(2) + '</div>');
            }
            else if (i == 1) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> <' + data.ColorDomain[i].toFixed(2) + '</div>');
            }
            else if (i % 2 !== 0) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> ' + data.ColorDomain[i - 1].toFixed(2) + '&ndash;' + data.ColorDomain[i + 1].toFixed(2) + '</div>');
            }
        }
    }
    else if (currentTab === "Breakers") {
        $('#innerLegend').append('<div class="row"><i style="background: #CC3300"></i> Breaker Events</div>');
        $('#innerLegend').append('<div class="row"><i style="background: #0E892C"></i> No Breaker Events</div>');
    }
    else if (currentTab === "Faults") {
        $('#innerLegend').append('<div class="row"><i style="background: #CC3300"></i> Faults</div>');
        $('#innerLegend').append('<div class="row"><i style="background: #0E892C"></i> No Faults</div>');
    }
    else if (currentTab === "Trending") {
        $('#innerLegend').append('<div class="row"><i style="background: #FF0000"></i> Normal</div>');
        $('#innerLegend').append('<div class="row"><i style="background: #000000"></i> OffNormal</div>');
        LoadHeatmapLeaflet(data);

    }

    else if (currentTab === "Disturbances") {
        for (var i = globalcolorsEvents.length - 1, j= 0; i >= 0; --i, ++j)
            $('#innerLegend').append('<div class="row"><i style="background: ' + globalcolorsEvents[i] + '"></i> ' + i + '</div>');
        LoadHeatmapLeaflet(data);
    }
    else if (currentTab === "Events") {
        var strings = ['Other', 'Swell', 'Transient', 'Sag', 'Fault', 'Interruption'];
        for (var i = globalcolorsEvents.length - 1; i >= 0; --i)
            $('#innerLegend').append('<div class="row"><i style="background: ' + globalcolorsEvents[i] + '"></i> ' +strings[i] + '</div>');
        LoadHeatmapLeaflet(data);
    }
    else {
        for (var i = data.ColorDomain.length - 1; i >= 0; --i) {
            if (i === data.ColorDomain.length - 1) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> >' + data.ColorDomain[i] + '</div>');
            }
            if (i == 0) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i].toString(16).slice(2) + '"></i> <' + data.ColorDomain[i] + '</div>');
            }
            else if (i % 2 === 0) {
                $('#innerLegend').append('<div class="row"><i style="background: #' + data.ColorRange[i-1].toString(16).slice(2) + '"></i> ' + data.ColorDomain[i-1] + '&ndash;' + data.ColorDomain[i] + '</div>');
            }
        }

    }

    legend.getContainer().addEventListener('mouseover', function () {
        leafletMap[currentTab].dragging.disable();
        leafletMap[currentTab].doubleClickZoom.disable();
        leafletMap[currentTab].touchZoom.disable();
        leafletMap[currentTab].scrollWheelZoom.disable();
        leafletMap[currentTab].boxZoom.disable();
        leafletMap[currentTab].keyboard.disable();
    });

    legend.getContainer().addEventListener('mouseout', function () {
        leafletMap[currentTab].dragging.enable();
        leafletMap[currentTab].doubleClickZoom.enable();
        leafletMap[currentTab].touchZoom.enable();
        leafletMap[currentTab].scrollWheelZoom.enable();
        leafletMap[currentTab].boxZoom.enable();
        leafletMap[currentTab].keyboard.enable();
    });


}

//////////////////////////////////////////////////////////////////////////////////////////////

function LoadHeatmapLeaflet(thedata) {
    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 1,
        "scaleRadius": false,
        "maxOpacity": .5,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // which field name in your data represents the latitude - default "lat"
        latField: 'Latitude',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'Longitude',
        // which field name in your data represents the data value - default "value"
        valueField: 'status'
    };

    $(leafletMap[currentTab].getPanes().overlayPane).children().remove();
    var testData = { data: thedata.Locations.filter(function (currentValue, index, array) { return currentValue.status > 0;}), min: 1, max: 100 };
    var heatmapLayer = new HeatmapOverlay(cfg);
    var heatmap = L.layerGroup().addLayer(heatmapLayer).addTo(leafletMap[currentTab]);
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

    //reflowContents(theNewTab);
    resizeMapAndMatrix(theNewTab);
    selectsitesincharts();

    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, "undefined");
    resizeMapAndMatrix(theNewTab);
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
        if ($('#Overview' + currentTab).children().length > 0 && cache_ErrorBar_Data !== null)
            buildErrorBarChart(cache_ErrorBar_Data, 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
    }
    else {
        if ($('#Overview' + currentTab).children().length > 0 && cache_Graph_Data !== null)
            buildBarChart(cache_Graph_Data, 'Overview' + currentTab, siteName, siteID, thedatefrom, thedateto);
    }


    //console.log($('#Detail' + currentTab + 'Table').children());
    if($('#Detail' + currentTab + 'Table').children().length > 0 && cache_Table_Data !== null)
        window["populate" + currentTab + "DivWithGrid"](cache_Table_Data, filterString);

        //window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);
    
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMapAndMatrix(newTab) {

    $("#datePickerFrom").datepicker("hide");
    $("#datePickerTo").datepicker("hide");

    var columnheight = $(window).height() - $('#tabs-' + newTab).offset().top - 25;

    $('#tabs-ModbusData').css('height', $(window).height() - $('#tabs-' + currentTab).offset().top);
    $('#tabs-HistorianData').css('height', $(window).height() - $('#tabs-' + currentTab).offset().top);

    $("#theMap" + newTab).css("height", columnheight);

    $("#theMatrix" + newTab).css("height", columnheight);

    var theuncollapsedcount = $("#Portlet1" + currentTab).closest(".column").children().children().find('.ui-icon-minusthick').length;

    if (theuncollapsedcount != 0) {
        var chartheight = (columnheight - 24) / theuncollapsedcount;
        resizeDocklet($("#DockOverview" + newTab), chartheight);
        resizeDocklet($("#DockDetail" + newTab), chartheight);
    }
    if (leafletMap[currentTab] !== null) {
        leafletMap[currentTab].invalidateSize(true);

        markerGroup = new L.featureGroup(mapMarkers[currentTab].map(function (a) { return a.marker; }));
        if (markerGroup.getBounds().isValid())
            leafletMap[currentTab].fitBounds(markerGroup.getBounds());
        //leafletMap[currentTab].setMaxBounds(L.latLngBounds(L.latLng(-180, -200), L.latLng(180, 200)));

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
    if (cache_Sparkline_Data !== null) {
          $.each(cache_Sparkline_Data, (function (key, value) {
              populateGridMatrix(value.data, value.id, value.name);
           }));
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
        if (($('#application-tabs li :visible').map(function (i, a) { return $(a).text(); }).get()).indexOf(value["CurrentTab"]) < 0) {
            initializesettings();
            return (false);
        }
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

    if (contextfromdate === contexttodate) {
        cache_Last_Date = contexttodate;
    }
    else {
        cache_Last_Date = null;
        cache_Table_Data = null;
    }

    var selectedsites = getcurrentconfigsetting("EventSiteDropdownSelected");
    if (selectedsites != null) {
        $('#siteList').multiselect("uncheckAll");
        $('#siteList').val(selectedsites);
    }
    else {
        $('#siteList').multiselect("checkAll");
    }

    $('#siteList').multiselect('refresh');
    
    if ($("#application-tabs").tabs("option", "active") !== ($('#application-tabs li a').map(function (i, a) { return $(a).text(); }).get()).indexOf(getcurrentconfigsetting("CurrentTab")))
        $("#application-tabs").tabs("option", "active", ($('#application-tabs li a').map(function (i, a) { return $(a).text(); }).get()).indexOf(getcurrentconfigsetting("CurrentTab")));
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
    thesetting["CurrentTab"] = $('#application-tabs li :visible').first().text();
    thesetting["MapGrid"] = "Grid";
    thesetting["EventSiteDropdownSelected"] = null;
    thesetting["staticPeriod"] = "PastMonth";

    usersettings["uisettings"].push(thesetting);

    var thesetting = {};
    thesetting["Name"] = "Last Session";
    thesetting["CurrentTab"] = $('#application-tabs li :visible').first().text();
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
    thesetting["CurrentTab"] = currentTab;
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

function getMeters(meterGroup) {
    dataHub.getMeters(meterGroup).done(function (data) {
        cache_Meters = data;
        updateMeterselect();
        $(window).trigger("meterSelectUpdated");
    }).fail(function (msg) {
        alert(msg);
    })
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

function selectMeterGroup(thecontrol) {
    mg = thecontrol.value;
    $('#siteList').children().remove();
    $('#siteList').multiselect('refresh');
    getMeters(mg);

    var newTab = currentTab;
    if (newTab.indexOf("Overview") > -1) {
        $('#headerStrip').hide();
        showOverviewPage(currentTab);
    }
    else if (newTab === "ModbusData") {
        showModbusData();
    }
    else if (newTab === "HistorianData") {
        showHistorianData();
    }
    else {
        cache_Graph_Data = null;
        cache_Errorbar_Data = null;
        cache_Sparkline_Data = null;
        var mapormatrix = $("#mapGrid")[0].value;
        $(window).one("meterSelectUpdated", function () {
            manageTabsByDate(newTab, contextfromdate, contexttodate);
            $("#mapGrid")[0].value = mapormatrix;
            selectmapgrid($("#mapGrid")[0]);
        });

    }


}
//////////////////////////////////////////////////////////////////////////////////////////////

function updateMeterselect() {
    $.each(cache_Meters, function (key, value) {
        SelectAdd("siteList", value.ID, value.Name, "selected");
    });
    $('#siteList').multiselect('refresh');

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


    $(window).on('hubConnected', function () {
        showContent();
    })
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
        minWidth: 250, selectedList: 1, noneSelectedText: "Select Site", cssClass: '.multiselectText'
    }).multiselectfilter();


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
function loadSettingsAndApply() {
    dataHub.getTabSettings(postedUserName).done(function (data) {
        var settings = eval(data);
        // Turn Off Features

        applicationsettings = settings;

        $.each(settings, (function (key, value) {
            if (value.Name == "DashTab") {
                if (value.Enabled == true) {
                    $(value.Value).show();
                } else {
                    $(value.Value).hide();
                }
            }


            if (value.Name == "DashImage") {

            }

        }));

        $(window).trigger("settingsLoaded");

    }).fail(function (msg) {
        alert(msg);
    });
}
  
//////////////////////////////////////////////////////////////////////////////////////////////

function buildPage() {

    loadSettingsAndApply();

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

    $(window).one("settingsLoaded", function () {

        currentTab = $('#application-tabs li :visible').first().text();

        $("#application-tabs").tabs({
            active: getcurrentconfigsetting("CurrentTab"),
            heightStyle: "100%",
            widthStyle: "99%",

            activate: function (event, ui) {
                var newTab = currentTab = ui.newTab.attr('li', "innerHTML")[0].getElementsByTagName("a")[0].innerHTML;
                if (newTab.indexOf("Overview") > -1) {
                    $('#headerStrip').hide();
                    showOverviewPage(currentTab);
                }
                else if (newTab === "ModbusData") {
                    showModbusData();
                }
                else if (newTab === "HistorianData") {
                    showHistorianData();
                }
                else {
                    cache_Graph_Data = null;
                    cache_Errorbar_Data = null;
                    cache_Sparkline_Data = null;
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
        getMeters(mg);
        loadsitedropdown();
        initiateTimeRangeSlider();
        initiateColorScale();


        resizeMapAndMatrix(currentTab);
        if (currentTab.indexOf("Overview") > -1) {
            $('#headerStrip').hide();
            showOverviewPage(currentTab);

        } else if (currentTab === "ModbusData") {
            showModbusData();
        }
        else if (currentTab === "HistorianData") {
            showHistorianData();
        }
        else {
            //cache_Graph_Data = null;
            //cache_Errorbar_Data = null;
            //cache_Sparkline_Data = null;
            //$('#headerStrip').show();
            //manageTabsByDate(currentTab, contextfromdate, contexttodate);


            $("#application-tabs").tabs("option", "active", ($('#application-tabs li a').map(function (i, a) { return $(a).text(); }).get()).indexOf(currentTab));
            $("#mapGrid")[0].value = getcurrentconfigsetting("MapGrid");
            $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

            selectmapgrid($("#mapGrid")[0]);
        }


    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadLeafletMap(theDiv) {

    if (leafletMap[currentTab] === null) {
        leafletMap[currentTab] = L.map(theDiv, {
            center: [35.0456, -85.3097],
            zoom: 6,
            minZoom: 2,
            maxZoom: 15,
            zoomControl: false,
            attributionControl: false
        });

        mapLink =
            '<a href="http://openstreetmap.org">OpenStreetMap</a>';

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            }).addTo(leafletMap[currentTab]);

        var contourControl = L.control({ position: 'bottomleft' });

        contourControl.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info contourControl'),
                labels = [];
            div.innerHTML =
                '<div id="ContoursControlsTrending">' +
                    '<div class="row" style="width: 100%; margin: auto">' +
                        '<div class="" style="float: left; margin-right: 4px;">' +
                            '<table>' +
                                '<tr>' +
                                    '<td colspan="1">' +
                                        '<div class="checkbox"><label><input type="checkbox" id="weatherCheckbox"/>Weather</label></div>' +
                                    '</td>' +
                                    '<td colspan="1">' +
                                        '<select class="form-control" id="contourAnimationResolutionSelect">' +
                                            '<option value="15">15</option>' +
                                            '<option value="14">14</option>' +
                                            '<option value="13">13</option>' +
                                            '<option value="12">12</option>' +
                                            '<option value="11">11</option>' +
                                            '<option value="10">10</option>' +
                                            '<option value="9">9</option>' +
                                            '<option value="8">8</option>' +
                                            '<option value="7">7</option>' +
                                            '<option selected="selected" value="6">6</option>' +
                                            '<option value="5">5</option>' +
                                            '<option value="4">4</option>' +
                                            '<option value="3">3</option>' +
                                            '<option value="2">2</option>' +
                                        '</select>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr><td colspan="2">' +
                                    '<select class="form-control" id="contourAnimationStepSelect" onchange="stepSelectionChange(this);">' +
                                        '<option value="60">60 min</option>' +
                                        '<option value="30">30 min</option>' +
                                        '<option value="20">20 min</option>' +
                                        '<option selected="selected" value="15">15 min</option>' +
                                        '<option value="10">10 min</option>' +
                                        '<option value="5">5 min</option>' +
                                        '<option value="1">1 min</option>' +
                                    '</select>' +
                                '</td></tr>' +
                                '<tr>' +
                                        '<td colspan="2">' +
                                        '<div id="time-range">' +
                                            '<div class="sliders_step1">' +
                                                '&nbsp;<div class="slider-range"></div> ' +
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
                                '<tr><td><span id="progressDate"></span></td></tr>' +
                                '<tr><td style="width: 100%">' +
                                        '<progress id="contourProgressBar" style ="width: 100%" value="0" max ="100"></progress>' +
                                '</td></tr>' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td style="width: 100%; text-align: center">' +
                                            '<div class="player text-center" id="contourPlayerButtons">' +
                                                '<button type="button" id="button_fbw" class="btn"><i class="fa fa-fast-backward"></i></button>' +
                                                '<button type="button" id="button_bw" class="btn"><i class="fa fa-backward"></i></button>' +
                                                '<button type="button" id="button_play" class="btn"><i class="fa fa-play"></i></button>' +
                                                '<button type="button" id="button_stop" class="btn"><i class="fa fa-stop"></i></button>' +
                                                '<button type="button" id="button_fw" class="btn"><i class="fa fa-forward"></i></button>' +
                                                '<button type="button" id="button_ffw" class="btn"><i class="fa fa-fast-forward"></i></button>' +
                                            '</div>' +
                                '</td></tr>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            
            return div;
        };

        contourControl.addTo(leafletMap[currentTab]);
        initiateTimeRangeSlider();

        $('.contourControl').hide();
        contourControl.getContainer().addEventListener('mouseover', function () {
            leafletMap[currentTab].dragging.disable();
            leafletMap[currentTab].doubleClickZoom.disable();
            leafletMap[currentTab].touchZoom.disable();
            leafletMap[currentTab].scrollWheelZoom.disable();
            leafletMap[currentTab].boxZoom.disable();
            leafletMap[currentTab].keyboard.disable();

        });

        contourControl.getContainer().addEventListener('mouseout', function () {
            leafletMap[currentTab].dragging.enable();
            leafletMap[currentTab].doubleClickZoom.enable();
            leafletMap[currentTab].touchZoom.enable();
            leafletMap[currentTab].scrollWheelZoom.enable();
            leafletMap[currentTab].boxZoom.enable();
            leafletMap[currentTab].keyboard.enable();

        });
    }
}

function loadContourLayer(contourQuery) {
    var tileURL = homePath + 'mapService.asmx/getContourTile?x={x}&y={y}&zoom={z}';

    $.each(contourQuery, function (key, value) {
        tileURL += '&' + key + '=' + encodeURIComponent(value);
    });

    if (contourOverlay) {
        leafletMap[currentTab].removeLayer(contourOverlay);
        contourOverlay = null;
    }

    if (contourLayer)
        contourLayer.setUrl(tileURL);
    else
        contourLayer = L.tileLayer(tileURL, { m: getBase64MeterSelection() }).addTo(leafletMap[currentTab]);
}

function loadContourOverlay(contourInfo) {
    var bounds = [[contourInfo.MaxLatitude, contourInfo.MinLongitude], [contourInfo.MinLatitude, contourInfo.MaxLongitude]];

    if (contourLayer) {
        leafletMap[currentTab].removeLayer(contourLayer);
        contourLayer = null;
    }

    if (contourOverlay)
        contourOverlay.setUrl(contourInfo.URL);
    else
        contourOverlay = L.imageOverlay(contourInfo.URL, bounds).addTo(leafletMap[currentTab]);
}

function showType(thecontrol) {
    plotContourMapLocations(cache_Map_Matrix_Data.d, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To, null);
}

function initiateTimeRangeSlider() {
    $('#tabs-' + currentTab + " .slider-range").slider({
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



            $('#tabs-' + currentTab + ' .slider-time').html(hours1 + ':' + minutes1);

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

            $('#tabs-' + currentTab + ' .slider-time2').html(hours2 + ':' + minutes2);
        }
    });
}

function loadContourAnimationData() {
    var dateFrom = new Date($('#mapHeaderTrendingDataTo').text() + ' ' + $('#tabs-' + currentTab + ' .slider-time').text() + ' UTC').toISOString();
    var dateTo = new Date($('#mapHeaderTrendingDataTo').text() + ' ' + $('#tabs-' + currentTab + ' .slider-time2').text() + ' UTC').toISOString();
    var meters = "";
    $.each($('#siteList').multiselect("getChecked").map(function () { return this.value; }), function (index, data) {
        if (index === 0)
            meters = data;
        else
            meters += ',' + data;
    });

    var thedatasent = {
        contourQuery: {
            Meters: getBase64MeterSelection(),
            StartDate: dateFrom,
            EndDate: dateTo,
            DataType: $('#trendingDataTypeSelection').val(),
            ColorScaleName: $('#contourColorScaleSelect').val(),
            UserName: postedUserName,
            StepSize: $('#contourAnimationStepSelect').val(),
            Resolution: $('#contourAnimationResolutionSelect').val(),
            IncludeWeather: $('#weatherCheckbox:checked').length > 0
        }
    };

    $.blockUI({ message: '<div unselectable="on" class="wait_container"><div unselectable="on" class="wait">Please Wait. Loading...</div><br><div id="loadAnimationProgressBar" class="progressBar"><div id="loadAnimationProgressInnerBar" class="progressInnerBar"><div id="loadAnimationProgressLabel" class="progressBarLabel">0%</div></div></div><br><button class="btn btn-default btn-cancel">Cancel</button><br></div>' });

    $.ajax({
        type: "POST",
        url: homePath + 'mapService.asmx/getContourAnimations',
        data: JSON.stringify(thedatasent),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            $('.btn-cancel').click(function () {
                data.d.Cancelled = true;
                cancelCall(data.d.AnimationID);
            });

            loopForAnimation(data.d);
        },
        failure: function (msg) {
            alert(msg);
        },
        global: false,
        async: true
    });
}

function loopForAnimation(animationData) {
    var message = {
        taskID: animationData.AnimationID
    };

    $.ajax({
        type: "POST",
        url: homePath + 'mapService.asmx/GetProgress',
        data: JSON.stringify(message),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            $('#loadAnimationProgressInnerBar').css('width', data.d + '%');
            $('#loadAnimationProgressLabel').text(data.d + '%');

            if (data.d < 100 && !animationData.Cancelled) {
                setTimeout(loopForAnimation, 100, animationData);
            } else if (!animationData.Cancelled) {
                $.unblockUI();
                runContourAnimation(animationData);
            }
        },
        failure: function (msg) {
            alert(msg);
        },
        global: false,
        async: true
    });
}

function runContourAnimation(contourData) {
    var d = new Date(contourData.Infos[0].Date + ' UTC');

    $('#tabs-' + currentTab + ' .contourControl').css('width', '500px');
    $('#tabs-' + currentTab + ' #progressBar').show();

    $.each(contourData.Infos, function (_, info) {
        info.ColorDomain = contourData.ColorDomain;
        info.ColorRange = contourData.ColorRange;
        info.MinLatitude = contourData.MinLatitude;
        info.MaxLatitude = contourData.MaxLatitude;
        info.MinLongitude = contourData.MinLongitude;
        info.MaxLongitude = contourData.MaxLongitude;
    });

    var index = 0
    update();

    function update() {
        var info = contourData.Infos[index];
        var progressBarIndex = Math.round(index / (contourData.Infos.length - 1) * 100);
        $('#tabs-' + currentTab + ' #contourProgressBar').attr('value', progressBarIndex);
        $('#tabs-' + currentTab + ' #progressDate').text(contourData.Infos[index].Date);
        plotContourMapLocations(info, null, null, null, null);
    }
    var interval;
    $('#tabs-' + currentTab + ' #contourProgressBar').off('click');
    $('#tabs-' + currentTab + ' #contourProgressBar').on('click', function (event) {
        var progressBarindex = event.offsetX / $(this).width();
        index = Math.round((contourData.Infos.length - 1) * progressBarindex);
        update();
    });
    $('#tabs-' + currentTab + ' #button_play').off('click');
    $('#tabs-' + currentTab + ' #button_play').on('click', function () {
        clearInterval(interval);
        $('#trendingDataTypeSelection').on('change', function () { clearInterval(interval) });
        $('#contourColorScaleSelect').on('change', function () { clearInterval(interval) });
        $('#application-tabs a').on('click', function () { clearInterval(interval) });

        interval = setInterval(function () {
            index++;

            if (index >= contourData.Infos.length) {
                index = 0;
                update();
                clearInterval(interval);
            }
            else {
                //if ($('#weatherCheckbox').prop('checked')) {
                //    d = new Date(contourData.Infos[index].Date + ' UTC');
                //    wmsLayer.setParams({ time: new Date(d.setMinutes(d.getMinutes() - d.getMinutes() % 5)).toISOString() }, false);
                //}
                update();
            }
        }, 1000);
    });

    $('#tabs-' + currentTab + ' #button_stop').off('click');
    $('#tabs-' + currentTab + ' #button_stop').on('click', function () {
        clearInterval(interval);
    });

    $('#tabs-' + currentTab + ' #button_bw').off('click');
    $('#tabs-' + currentTab + ' #button_bw').on('click', function () {
        if (index > 0) {
            --index;
            update();
        }
    });

    $('#tabs-' + currentTab + ' #button_fbw').off('click');
    $('#tabs-' + currentTab + ' #button_fbw').on('click', function () {
        if (index > 0) {
            index = 0;
            update();
        }
    });

    $('#tabs-' + currentTab + ' #button_fw').off('click');
    $('#tabs-' + currentTab + ' #button_fw').on('click', function () {
        if (index < contourData.Infos.length - 1) {
            ++index;
            update();
        }
    });

    $('#tabs-' + currentTab + ' #button_ffw').off('click');
    $('#tabs-' + currentTab + ' #button_ffw').on('click', function () {
        if (index < contourData.Infos.length - 1) {
            index = contourData.Infos.length - 1;
            update();
        }
    });
}

function stepSelectionChange(thecontrol) {
    $('.slider-range').slider("option", "step", parseInt(thecontrol.value));
}

function showOverviewPage(tab) {
    var columnHeight = $(window).height() - $('#tabs-' + currentTab).offset().top;
    $('#tabs-'+tab).css('height', columnHeight);
    //$('#overviewDate').text(new Date(new Date().setDate(new Date().getDate() - 1)).toDateString());

}

function initiateColorScale() {
    $.ajax({
        type: "POST",
        url: homePath + 'mapService.asmx/getColorScales',
        contentType: "application/json; charset=utf-8",
        cache: true,
        success: function (data) {
            $.each(data.d, function (i, d) {
                $('#contourColorScaleSelect').append(new Option(d, d));
            });
        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });

}

function showColorScale(thecontrol) {
    $('#tabs-' + currentTab + ' #progressBar').hide();
    $('#tabs-' + currentTab + ' .contourControl').css('width', '165px');

    var mapormatrix = $("#mapGrid")[0].value;

    manageTabsByDate(currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);
    $("#mapGrid")[0].value = mapormatrix;
    selectmapgrid($("#mapGrid")[0]);
}

function cancelCall(animationID) {
    $.unblockUI();

    $.ajax({
        type: "POST",
        data: { 'taskID': animationID },
        url: homePath + 'mapService.asmx/CancelCall',
        failure: function (msg) {
            alert(msg);
        },
        global: false,
        async: true
    });
}

function showModbusData() {
    $('#tabs-ModbusData').css('height', $(window).height() - $('#tabs-' + currentTab).offset().top);
    $('#modbusFrame').attr({
        //"src": "Main/GraphMeasurements",
        "src": historianConnection + '/GraphMeasurements.cshtml?ShowMenu=false',
        'width': '100%',
        'height': $(window).height() - $('#tabs-' + currentTab).offset().top
    });

    $(window).resize(function () {
        $('#modbusFrame').attr({
            'height': $(window).height() - $('#tabs-' + currentTab).offset().top
        });
    });


}

function showHistorianData() {
    $('#tabs-HistorianData').css('height', $(window).height() - $('#tabs-' + currentTab).offset().top);
    $('#historianFrame').attr({
        "src": historianConnection + '/TrendMeasurements.cshtml?ShowMenu=false',
        'width': '100%',
        'height': $(window).height() - $('#tabs-' + currentTab).offset().top
    });

    $(window).resize(function () {
        $('#historianFrame').attr({
            'height': $(window).height() - $('#tabs-' + currentTab).offset().top
        });
    });
}

function getBase64MeterSelection() {
    var meterSelections = $('#siteList').multiselect('widget').find('input:checkbox').sort(function (a, b) {
        return Number(a.value) - Number(b.value);
    }).map(function () {
        return $(this).is(':checked');
    }).get();

    var base64Selections = '';

    for (var i = 0; i < meterSelections.length; i += 6) {
        var mapIndex =
            (meterSelections[i + 0] ? 32 : 0) +
            (meterSelections[i + 1] ? 16 : 0) +
            (meterSelections[i + 2] ?  8 : 0) +
            (meterSelections[i + 3] ?  4 : 0) +
            (meterSelections[i + 4] ?  2 : 0) +
            (meterSelections[i + 5] ?  1 : 0);

        base64Selections += base64Map[mapIndex];
    }

    return base64Selections;
}

/// EOF