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


var globalcolors = ['#90ed7d', '#434348', '#ff0000', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
var globalcolorsEvents = ['#0000FF', '#00FFF4', '#FFFF00', '#FF9600', '#FF2800', '#C00000'];

var javascriptversion = "13";

var usersettings = {
    lastSetting: {},
    uisettings: []
};

var applicationsettings = {};

var cache_Meters = null;
var meterList = null;

// define MeterListClass object in a terrible way so that IE11 will accept it...
var MeterListClass = function(meterList){
    this.list = deepCopy(meterList);

    $.each(this.list, function (_, meter) {
        meter.Selected = true;
        meter.MeterGroups = [0];
        meter.Displayed = true;
    });
};

MeterListClass.prototype.selected = function(){
    return $.grep(this.list, function (a) { if (a.Selected) return a }).map(function(a){ return a.Name + "|" + a.ID});
};

MeterListClass.prototype.selectedIds = function() {
    return $.grep(this.list, function (a) { if (a.Selected) return a }).map(function (a) { return a.ID });
};

MeterListClass.prototype.displayedIds = function () {
    return $.grep(this.list, function (a) { if (a.Selected) return a }).map(function (a) { return a.ID });
};

MeterListClass.prototype.ids = function () {
    return this.list.map(function (a) { return a.ID });
};

MeterListClass.prototype.selectedIdsString = function () {
    return this.selectedIds().join(',');
};

MeterListClass.prototype.count = function () {
    return this.list.length;
};

MeterListClass.prototype.selectedCount = function () {
    return this.selectedIds().length;
};

MeterListClass.prototype.unselectAll = function () {
    $.each(this.list, function (_, meter) {
        meter.Selected = false;
    });
};

MeterListClass.prototype.resetDisplayAll = function () {
    $.each(this.list, function (_, meter) {
        meter.Selected = false;
        meter.Displayed = false;
    });
};

MeterListClass.prototype.setDisplayed = function (id, boolean) {
    var index = this.indexOf(id);
    this.list[index].Displayed = boolean;
};

MeterListClass.prototype.setSelected = function (id, boolean) {
    var index = this.indexOf(id);
    this.list[index].Selected = boolean;
};


MeterListClass.prototype.selectById = function (id) {
    $.each(this.list, function (_, meter) {
        if(meter.ID == id)
        meter.Selected = true;
    });
};

MeterListClass.prototype.indexOf = function (id) {
    return this.list.findIndex(function (a) { return a.ID == id });
};

MeterListClass.prototype.addMeterGroup = function (meterId, meterGroupId) {
    var index = this.indexOf(meterId);
    if(this.list[index].MeterGroups.indexOf(meterGroupId) < 0)
        this.list[index].MeterGroups.push(meterGroupId);
};

MeterListClass.prototype.addMeter = function (meter) {
    meter.Selected = true;
    meter.MeterGroups = [0];
    meter.Displayed = true;
    
    if (this.indexOf(meter.ID) < 0)
        this.list.push(meter);
};



var cache_Map_Matrix_Data = null;
var cache_Map_Matrix_Data_Date_From = null;
var cache_Map_Matrix_Data_Date_To = null;

// Billy's cached data
var cache_Graph_Data = null;
var cache_ErrorBar_Data = null;
var cache_Table_Data = null;
var cache_Contour_Data = null;
var cache_Sparkline_Data = null; 
var brush = null;
var cache_Last_Date = null;
var cache_Meter_Filter = null;
var cache_MagDur_Data = null;

var leafletMap = {'MeterActivity': null, 'Overview-Today': null, 'Overview-Yesterday': null, Events: null, Disturbances: null, Extensions: null,Trending: null, TrendingData: null, Faults: null, Breakers: null, Completeness: null, Correctness: null, ModbusData: null};
var markerGroup = null;
var contourLayer = null;
var contourOverlay = null;
var mapMarkers = {Events: [], Disturbances: [], Trending: [], TrendingData: [], Faults: [], Breakers: [], Completeness: [], Correctness: [], Extensions: []};
var currentTab = null;
var disabledList = {
    Events: { "Interruption": false, "Fault": false, "Sag": false, "Transient": false, "Swell": false, "Other": false },
    Disturbances: {"5": false, "4": false, "3": false, "2": false, "1": false, "0": false},
    Trending: { "Alarm": false, "OffNormal": false},
    TrendingData: {},
    Faults: { "500 kV": false, "300 kV": false, "230 kV": false, "135 kV": false, "115 kV": false, "69 kV": false, "46 kV": false, "0 kV": false},
    Breakers: {"Normal" : false, "Late": false, "Indeterminate": false},
    Completeness: {"> 100%": false, "98% - 100%": false, "90% - 97%": false, "70% - 89%": false, "50% - 69%": false, ">0% - 49%": false, "0%": false},
    Correctness: { "> 100%": false, "98% - 100%": false, "90% - 97%": false, "70% - 89%": false, "50% - 69%": false, ">0% - 49%": false, "0%": false},
    Extensions: {}
};

var yearBeginMoment = moment().month(yearBegin.split(' ')[0]).startOf('month').date(yearBegin.split(' ')[1]).utc();
var nowMoment = moment.utc();
var dateRangeOptions = {
    "timePicker": false,
    "timePicker24Hour": false,
    "timePickerSeconds": false,
    "locale": {
        "format": 'MM/DD/YYYY'
    },
    "showDropdowns": true,
    "autoApply": true,
    "alwaysShowCalendars": true,
    "minDate": "01/01/1990",
    "maxDate": "12/31/2030",
    "ranges": {
        //'1 Day': [moment().utc().startOf('day'), moment().utc().endOf('day')],
        'Last 3 Days': [moment().utc().startOf('day').subtract(2, 'days'), moment().utc().endOf('day')],
        'Last 7 Days': [moment().utc().startOf('day').subtract(6, 'days'), moment().utc().endOf('day')],
        'Last 30 Days': [moment().utc().startOf('day').subtract(29, 'days'), moment().utc().endOf('day')],
        'Last 90 Days': [moment().utc().startOf('day').subtract(89, 'days'), moment().utc().endOf('day')],
        'Last 365 Days': [moment().utc().startOf('day').subtract(364, 'days'), moment().utc().endOf('day')],
        'Month To Date': [moment().utc().startOf('month'), moment().utc().endOf('day')],
        'Last Month': [moment().utc().subtract(1, 'months').startOf('month'), moment().utc().subtract(1, 'months').endOf('month')],
        'Year To Date': [(nowMoment >= yearBeginMoment ? yearBeginMoment.clone() : yearBeginMoment.clone().subtract(1,'years')), moment().utc().endOf('day')],
        'Last Year': [(nowMoment >= yearBeginMoment ? yearBeginMoment.clone().subtract(1, 'years') : yearBeginMoment.clone().subtract(2, 'years')),
                       (nowMoment >= yearBeginMoment ? yearBeginMoment.clone() : yearBeginMoment.clone().subtract(1, 'years'))],
    },
    "startDate": moment().utc().subtract(29, 'days').startOf('day'),
    "endDate": moment.utc().endOf('day')
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
var heatmapCache = [];

var postedUserName = "";
var globalContext = "custom";

//////////////////////////////////////////////////////////////////////////////////////////////

Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

//////////////////////////////////////////////////////////////////////////////////////////////

function setMapHeaderDate(datefrom, dateto) {
    if (globalContext == "custom") {
        $("#mapHeader" + currentTab + "From").show();
        $("#mapHeader" + currentTab + "Divider").show();
        $("#mapHeader" + currentTab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + currentTab + "To").text(moment(dateto).utc().format('MM/DD/YY'));
        $('.contextWindow').text('Date Range');
        $('.stepOutBtn').attr('disabled', true)
    }
    else if (globalContext == "day") {
        $("#mapHeader" + currentTab + "From").hide();
        $("#mapHeader" + currentTab + "Divider").hide();
        $("#mapHeader" + currentTab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + currentTab + "To").text(moment(dateto).utc().format('MM/DD/YY'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY'));
        $('.stepOutBtn').attr('disabled', false)
    }
    else if (globalContext == "hour") {
        $("#mapHeader" + currentTab + "From").hide();
        $("#mapHeader" + currentTab + "Divider").hide();
        $("#mapHeader" + currentTab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + currentTab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:00'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:00'));
        $('.stepOutBtn').attr('disabled', false)

    }
    else if (globalContext == "minute") {
        $("#mapHeader" + currentTab + "From").hide();
        $("#mapHeader" + currentTab + "Divider").hide();
        $("#mapHeader" + currentTab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + currentTab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:mm'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:mm'));
        $('.stepOutBtn').attr('disabled', false)
    }
    else if (globalContext == "second") {
        $("#mapHeader" + currentTab + "From").hide();
        $("#mapHeader" + currentTab + "Divider").hide();
        $("#mapHeader" + currentTab + "From").text(moment(datefrom).utc().format('MM/DD/YY'));
        $("#mapHeader" + currentTab + "To").text(moment(dateto).utc().format('MM/DD/YY  HH:mm:ss'));
        $('.contextWindow').text(moment(datefrom).utc().format('MM/DD/YY HH:mm:ss'));
        $('.stepOutBtn').attr('disabled', false)
    }

}

function setGlobalContext(leftToRight) {
    var contexts = ['custom', 'day', 'hour', 'minute', 'second'];
    if (leftToRight)
    {
        if(contexts.indexOf(globalContext) < contexts.length - 1)
            globalContext = contexts[contexts.indexOf(globalContext) + 1];
    }
    else {
        if (contexts.indexOf(globalContext) > 0)
            globalContext = contexts[contexts.indexOf(globalContext) - 1];
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////

function loadDataForDate() {
    if (currentTab != null) {

        if (globalContext == "custom") {
            contextfromdate = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
            contexttodate = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        }
        else if (globalContext == "day") {
            contextfromdate = moment(contextfromdate).utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
            contexttodate = moment(contextfromdate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        }
        else if (globalContext == "hour") {
            contextfromdate = moment(contextfromdate).utc().startOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
            contexttodate = moment(contextfromdate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        }
        else if (globalContext == "minute") {
            contextfromdate = moment(contextfromdate).utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
            contexttodate = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        }
        else if (globalContext == "second") {
            contextfromdate = moment(contextfromdate).utc().startOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
            contexttodate = moment(contextfromdate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        }
        else {
            contextfromdate = moment(contextfromdate).utc();
            contexttodate = moment(contextfromdate).utc();
        }


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
    if(thecontrol != null){
        $('.mapGrid').val($(thecontrol).val());
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
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectsitesincharts() {

    selectiontimeout = null;

    var sitename = meterList.selectedCount() + " of " + meterList.count() + " selected";
    var thesiteidlist = "";

    if (meterList.selectedCount() > 0) {

        var thedetails = meterList.selected()[0].split('|');

        if (meterList.selectedCount() == 1) {
            sitename = thedetails[0];
        }

        $.each(meterList.selected(), function (key, value) {
            thedetails = value.split('|');
            thesiteidlist += thedetails[1] + ",";
        });
    }

    if (cache_Last_Date !== null) {
        getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, thesiteidlist, cache_Last_Date);
    } else {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    ManageLocationClick(thesiteidlist);  
}


//////////////////////////////////////////////////////////////////////////////////////////////
// The following functions are for getting Table data and populating the tables
function getTableDivData(thedatasource, thediv, siteID, theDate) {
    dataHub.getDetailsForSites(siteID, theDate, userId, currentTab, $('#contourColorScaleSelect').val(), globalContext).done(function (data) {
        var json = $.parseJSON(data)
        cache_Table_Data = json;

        var filterString = [];
        var leg = d3.selectAll('.legend');

        $.each(leg[0], function (i, d) {
            if ($(d).children('rect').css('fill') === 'rgb(128, 128, 128)')
                filterString.push($(d).children('text').text());
        });
        window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);
    });
}

function populateFaultsDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }
    $('#DockDetailFaults').css('width', '100%');

    var filteredData = [];
    var includeCauseCode = false;
    if (data != null) {

        $.each(data, function (i, d) {
            if (!disabledList[currentTab][d.voltage + ' kV']) {
                filteredData.push(d);

                if (d.causecode !== undefined)
                    includeCauseCode = true;
            }
        });

        var columns = [];

        columns.push({
            field: 'theinceptiontime',
            headerText: 'Start Time',
            headerStyle: 'width: 15%',
            bodyStyle: 'width: 15%; height: 20px',
            bodyClass: '',
            sortable: true,
            content: function (row, options, td) {
                if (row.notecount > 0)
                    td.addClass('note');

                return "<a href='" + xdaInstance + "/Workbench/Event.cshtml?EventID=" + row.theeventid + "' style='color: blue' target='_blank'>" + row.theinceptiontime + "</a>";
            }
        });

        columns.push({ field: 'thelinename', headerText: 'Line', headerStyle: 'width: 40%', bodyStyle: 'width: 40%; height: 20px', sortable: true });

        if (includeCauseCode)
            columns.push({ field: 'causecode', headerText: 'Cause', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true });

        columns.push({ field: 'voltage', headerText: 'kV', headerStyle: 'width: 6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });
        columns.push({ field: 'thefaulttype', headerText: 'Type', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });
        columns.push({ field: 'thecurrentdistance', headerText: 'Miles', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });
        columns.push({ field: 'locationname', headerText: 'Location', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true });
        columns.push({ field: 'OpenSEE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSEEButton_html });
        columns.push({ field: 'FaultSpecifics', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeFaultSpecificsButton_html });
        columns.push({ headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px;text-align: center', content: function (row) { return '<button onclick="openNoteModal(' + row.theeventid + ')"><span class="glyphicon glyphicon-pencil" title="Add Notes."></span></button>'; } });

        fixNumbers(data, ['voltage', 'thecurrentdistance']);

        $('#Detail' + currentTab + "Table").puidatatable({
            scrollable: true,
            scrollHeight: '100%',
            columns: columns,
            datasource: filteredData
        });
    }
}

function openResultsModal(row){

}

function openNoteModal(eventId) {
    $('#previousNotes').remove();
    dataHub.getNotesForEvent(eventId).done(function (data) {
        $('#faultId').text(eventId);
        if (data.length > 0)
            $('#previousNotesDiv').append('<table id="previousNotes" class="table" ><tr><th style="width: 70%">Note</th><th style="width: 20%">Time</th><th style="width: 10%"></th></tr></table>')
        $.each(data, function (i, d) {
            $('#previousNotes').append('<tr id="row' + d.ID + '"><td id="note'+d.ID+'">' + d.Note + '</td><td>' + moment(d.TimeStamp).format("MM/DD/YYYY HH:mm:ss") + '</td><td><button onclick="editNote(' + d.ID +')"><span class="glyphicon glyphicon-pencil" title="Edit this note.  Ensure you save after pushing this button or you will lose your note."></span></button><button onclick="removeNote(' + d.ID + ')"><span class="glyphicon glyphicon-remove" title="Remove this note"></span></button></td></tr>');
        });

        $('#note').val('');
        $('#notesModal').modal('show');
    });
}

function saveNote() {
    dataHub.saveNoteForEvent($('#faultId').text(), $('#note').val(), userId);
}

function removeNote(id) {
    dataHub.removeEventNote(id);
    $('#row' +id).remove()
}

function editNote(id) {
    $('#note').val($('#note' + id).text());
    dataHub.removeEventNote(id);
}

function populateCorrectnessDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (data != null) {
        $.each(data, function (i, d) {
            var flag = false;
            $.each($.grep(Object.keys(disabledList[currentTab]), function (d) { return disabledList[currentTab][d] }), function (j, e) {
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
}

function populateCompletenessDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    if (data != null) {
        var filteredData = [];
        $.each(data, function (i, d) {
            var flag = false;
            $.each($.grep(Object.keys(disabledList[currentTab]), function (d) { return disabledList[currentTab][d] }), function (j, e) {
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
}

function populateEventsDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail'+ currentTab +'Table"></div>');
    }

    var filteredData = [];
    if (data != null ) {

        $.each(data, function (i, d) {
            var sum = 0;
            $.each(Object.keys(d), function (index, key) {
                if (key != "EventID" && key != "Site" & !disabledList[currentTab][key]) {
                    sum += parseInt(d[key]);
                }
            });
            if (sum > 0)
                filteredData.push(d);
        });

        var tableObject = {
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                { field: 'EventID', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterEventsByLine(' + row.EventID + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.Site + '</button>' } },
            ],
            datasource: filteredData
        };
        if (data.length > 0) {
            $.each(Object.keys(data[0]), function (i, d) {
                if (d != "MeterID" && d != "EventID" && d != "Site" && !disabledList[currentTab][d]) {
                    tableObject.columns.push({
                        field: d,
                        headerText: d,
                        headerStyle: 'width: 12%; ',
                        bodyStyle: 'width: 12%; height: 20px; ',
                        sortable: true
                    });
                }
            });
        }

        $('#Detail' + currentTab + "Table").puidatatable(tableObject);
    }
}

function populateExtensionsDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (data != null) {

        $.each(data, function (i, d) {
            var sum = 0;
            $.each(Object.keys(d), function (index, key) {
                if (key != "EventID" && key != "Site" & !disabledList[currentTab][key]) {
                    sum += parseInt(d[key]);
                }
            });
            if (sum > 0)
                filteredData.push(d);
        });

        var tableObject = {
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                { field: 'EventID', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterExtensionsByLine(' + row.EventID + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.Site + '</button>' } },
            ],
            datasource: filteredData
        };
        if (data.length > 0) {
            $.each(Object.keys(data[0]), function (i, d) {
                if (d != "MeterID" && d != "EventID" && d != "Site" && !disabledList[currentTab][d]) {
                    tableObject.columns.push({
                        field: d,
                        headerText: d,
                        headerStyle: 'width: 12%; ',
                        bodyStyle: 'width: 12%; height: 20px; ',
                        sortable: true
                    });
                }
            });
        }

        $('#Detail' + currentTab + "Table").puidatatable(tableObject);
    }
}

function populateDisturbancesDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    var filteredData = [];
    if (data != null) {
        $.each(data, function (i, d) {
            var sum = 0;
            $.each(Object.keys(d), function (index, key) {
                if (key != "MeterID" && key != "EventID" && key != "Site" & !disabledList[currentTab][key]) {
                    sum += parseInt(d[key]);
                }
            });
            if (sum > 0)
                filteredData.push(d);
        });
        
        var tableObject = {
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                { field: 'EventID', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterDisturbancesByLine(' + row.EventID + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.Site + '</button>' } },
            ],
            datasource: filteredData
        }

        if (data.length > 0) {
            $.each(Object.keys(data[0]), function (i, d) {
                if (d != "MeterID" && d != "EventID" && d != "Site" && !disabledList[currentTab][d]) {
                    tableObject.columns.push({
                        field: d,
                        headerText: d,
                        headerStyle: 'width: 12%; ',
                        bodyStyle: 'width: 12%; height: 20px; ',
                        sortable: true
                    });
                }
            });
        }


        $('#Detail' + currentTab + "Table").puidatatable(tableObject);
    }
}

function populateBreakersDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    if (data != null) {
        var filteredData = [];
        $.each(data, function (i, d) {
            if ($.grep(Object.keys(disabledList[currentTab]), function (d) { return disabledList[currentTab][d] }).indexOf(d.operationtype) < 0)
                filteredData.push(d);
        });


        fixNumbers(data, ['timing', 'statustiming', 'speed']);

        $('#Detail' + currentTab + "Table").puidatatable({
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                {
                    field: 'energized', headerText: 'TCE Time', headerStyle: 'width: 140px', bodyStyle: 'width: 140px; height: 20px', sortable: true, content:
                                  function (row) {
                                      var title = "";
                                      var bgColor = "initial";

                                      if (row.chatter != 0) {
                                          title = "title='Status bit chatter detected'";
                                          bgColor = "yellow";
                                      }

                                      if (row.dcoffset != 0) {
                                          title = "title='DC offset logic applied'";
                                          bgColor = "aqua";
                                      }

                                      return "<a href='" + xdaInstance + "/Workbench/Breaker.cshtml?EventID=" + row.theeventid + "' " + title + " style='background-color: " + bgColor + ";color: blue' target='_blank'>" + row.energized + "</a>";
                                  }
                },
                { field: 'breakernumber', headerText: 'Breaker', headerStyle: 'width: 80px', bodyStyle: 'width: 80px; height: 20px', sortable: true },
                { field: 'linename', headerText: 'Line', headerStyle: 'width: auto', bodyStyle: 'width: auto; height: 20px', sortable: true },
                { field: 'phasename', headerText: 'Phase', headerStyle: 'width: 75px', bodyStyle: 'width: 75px; height: 20px', sortable: true },
                { field: 'timing', headerText: 'Timing', headerStyle: 'width: 80px', bodyStyle: 'width: 80px; height: 20px', sortable: true },
                { field: 'statustiming', headerText: 'Status Timing', headerStyle: 'width: 80px', bodyStyle: 'width: 80px; height: 20px', sortable: true },
                { field: 'speed', headerText: 'Speed', headerStyle: 'width: 75px', bodyStyle: 'width: 75px; height: 20px', sortable: true },
                { field: 'operationtype', headerText: 'Operation', headerStyle: 'width: 100px', bodyStyle: 'width: 100px; height: 20px', sortable: true },
                { field: 'OpenSEE', headerText: '', headerStyle: 'width: 50px', bodyStyle: 'width: 50px; padding: 0; height: 20px', content: makeOpenSEEButton_html },
            ],
            datasource: filteredData
        });
    }
}

function populateTrendingDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    if (data != null) {
        var filteredData = [];
        $.each(data, function (i, d) {
            if ($.grep(Object.keys(disabledList[currentTab]), function (d) { return disabledList[currentTab][d] }).indexOf(d.eventtype) < 0)
                filteredData.push(d);
        });


        fixNumbers(data, ['HarmonicGroup', 'eventcount']);

        $('#Detail' + currentTab + "Table").puidatatable({
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                { field: 'sitename', headerText: 'Name', headerStyle: 'width: 25%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
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
}

function populateTrendingDataDivWithGrid(data) {
    if ($('#Detail' + currentTab + 'Table').children().length > 0) {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    if(data != null){
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
//////////////////////////////////////////////////////////////////////////

function getFormattedDate(date) {
    if(globalContext == "day")
        return moment(date).utc().format('YYYY-MM-DDTHH:00') + 'Z';
    else if (globalContext == "hour")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm') + 'Z';
    else if (globalContext == "minute")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else if (globalContext == "second")
        return moment(date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    else
        return moment(date).utc().format('YYYY-MM-DDT00:00:00') + 'Z';
}

//////////////////////////////////////////////////////////////////////////////////////////////
function stepOut() {
    setGlobalContext(false);
    loadDataForDate();
}

function populateDivWithBarChart(thediv, siteID, thedatefrom, thedateto) {
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
    var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom": globalContext);

    
    window.dataHub['getDataForPeriod'](siteID, thedatefrom, thedateto, postedUserName, currentTab, context).done(function (data) {
        if (data !== null) {

            var graphData = { graphData: [], keys: [], colors: [] };

            var dates = $.map(data.Types[0].Data, function (d) { return d.Item1 });

            $.each(dates, function (i, date) {
                var obj = {};
                var total = 0;
                obj["Date"] = Date.parse(date);
                $.each(data.Types, function (j, type) {
                    obj[type.Name] = type.Data[i].Item2;
                    total += type.Data[i].Item2;
                });
                obj["Total"] = total;
                graphData.graphData.push(obj);

            });

            data.Types.forEach(function (d) {
                graphData.keys.push(d.Name);
                graphData.colors.push(d.Color);
            });


            cache_Graph_Data = graphData;

            if (thediv === "Overview") {

            } else if (thediv === "TrendingData") {

            } else
                buildBarChart(graphData, thediv, siteID, data.StartDate, data.EndDate, context);
        }
    });

    if (currentTab == "Disturbances") {
        dataHub.getVoltageMagnitudeData(siteID, thedatefrom, thedateto, context).done(function (data) {
            cache_MagDur_Data = data;
            buildMagDurChart(data, thediv + "MagDur")
        })
    }
    
}

function buildBarChartPlotly(data, thediv, siteID, thedatefrom, thedateto) {
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];

    if (brush === null) {
        brush = d3.svg.brush()
    }

    buildChart(data, thediv, thedatefrom, thedateto);
    buildOverChart(data, thediv, thedatefrom, thedateto);


    function buildChart(data, thediv, thedatefrom, thedateto) {
        var fields = [];
        var startDate = new Date(thedatefrom);
        var endDate = new Date(thedateto);
        var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Days" : globalContext);

        $.each(data.keys, function (i, key) {
            fields.push({
                x: data.graphData.map(function (a) {
                    var now = new Date(a.Date);
                    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
                    return utc
                }),
                y: data.graphData.map(function (a) { return a[key] }),
                name: key,
                marker: {
                    color: data.colors[i],
                },
                type: 'bar'
            });
        });

        var tickFormat;
        var xAxisLabel;
        if (context == 'day') {
            tickFormat = Plotly.d3.time.format.utc("%H");
            xAxisLabel = 'Hours';
        }
        else if (context == 'hour') {
            tickFormat = Plotly.d3.time.format.utc("%M");
            xAxisLabel = 'Minutes';
        }
        else if (context == 'minute' || context == 'second') {
            tickFormat = Plotly.d3.time.format.utc("%S");
            xAxisLabel = 'Seconds';
        }
        else {
            tickFormat = Plotly.d3.time.format.utc("%b-%d");
            xAxisLabel = 'Days';
        }
        var layout = {
            xaxis: {
                title: xAxisLabel,
                type: 'date',
                tickFormat: tickFormat,
                range: [new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000).getTime(), new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000).getTime()]
            },
            yaxis: {
                title: currentTab + ' Counts',
                range: [0]
            },
            barmode: 'stack'
        };
        $('#' + thediv).children().remove();
        Plotly.newPlot(thediv, fields.reverse(), layout);

        $('#' + thediv).off('plotly_click');
        $('#' + thediv).on('plotly_click', function (event, data) {
            var thedate = getFormattedDate(data.Date);
            contextfromdate = thedate;
            contexttodate = thedate;
            var filter = [];
            //$.each(legend.selectAll("rect"), function (i, element) {
            //    if ($(this).css('fill') !== 'rgb(128, 128, 128)')
            //        filter.push(element[0].__data__);
            //});

            manageTabsByDateForClicks(currentTab, thedate, thedate, null);
            cache_Last_Date = thedate;
        });
    }
    function buildOverChart(data, thediv, thedatefrom, thedateto) {
        var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Days" : globalContext);
        var startDate = new Date(thedatefrom);
        var endDate = new Date(thedateto);
        var chartData = [{
            x: data.graphData.map(function (a) {
                var now = new Date(a.Date);
                var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
                return utc
            }),
            y: data.graphData.map(function (a) {
                var total = 0;
                $.each(Object.keys(a), function (index, key) {
                    if(key != 'Date')
                        total += parseInt(a[key]);
                });
                return total;
            }),
            type: 'bar',
            hoverinfo: 'none',
            marker: {
                color: 'black'
            }
        }];

        var layout = {
            autosize: false,
            width: $('#' + thediv + 'Overview').width(),
            height: $('#' + thediv + 'Overview').height() - 15,
            margin: {
                l: 50,
                r: 50,
                b: 15,
                t: 0,
                pad: 0
            },
            xaxis: {
                type: 'date',
                showline: true,
                tickFormat: Plotly.d3.time.format.utc("%b-%d"),
                range: [new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000).getTime(), new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000).getTime()],
                fixedrange: true

            },
            yaxis: {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showline: false,
                autotick: true,
                ticks: '',
                showticklabels: false,
                fixedrange: true
            }
        };
        $('#' + thediv + 'Overview').children().remove();
        Plotly.newPlot(thediv + 'Overview', chartData, layout, { displayModeBar: false });

        //$('#' + thediv + 'Overview').off('plotly_selected');
        //$('#' + thediv + 'Overview').on('plotly_selected', function (event, clickData) {
        //    if (clickData == undefined)
        //        buildChart(data, thediv, thedatefrom, thedateto)
        //    else {
        //        var newGraphData = {
        //            colors: data.colors,
        //            graphData: $.grep(data.graphData, function (a) { if (a.Date >= Date.parse(clickData.range.x[0]) && a.Date < Date.parse(clickData.range.x[1])) return a; }),
        //            keys: data.keys
        //        }
        //        buildChart(newGraphData, thediv, clickData.range.x[0], clickData.range.x[1])
        //    }
        //});
        brush.on("brush", brushed);

        var svg = d3.select("#" + thediv + 'Overview').select('svg');
        svg.append("g").attr("class", "x brush").call(brush).selectAll("rect").attr("y", -6).attr("height", $("#" + thediv + 'Overview').height() + 7);  // +7 is magic number for styling

        function brushed() {

        }
    }

}

function buildBarChart(data, thediv, siteID, thedatefrom, thedateto) {
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
    var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom" : globalContext);

    $('#' + thediv).children().remove();
    $('#' + thediv + 'Overview').children().remove();
    var YaxisLabel = "";
    var XaxisLabel = "";
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
    var date1 = moment(thedatefrom);
    var date2 = moment(thedateto);
    var numSamples;
    var x;
    var xOverview;
    var xAxisOverview;

    //container sizing variables
    var margin = { top: 20, right: 125, bottom: 20, left: 60 },
        width = $('#' + thediv).width() - margin.left - margin.right,
        height = $('#' + thediv).height() - margin.top - margin.bottom,
        marginOverview = { top: 10, right: margin.right, bottom: 20, left: margin.left },
        heightOverview = $('#' + thediv + 'Overview').height() - marginOverview.top - marginOverview.bottom;

    // axis definition and construction
    var y = d3.scale.linear().range([height, 0]);
    var binsScale = d3.scale.ordinal().domain(d3.range(30)).rangeBands([0, width], 0.1, 0.05);
    var yOverview = d3.scale.linear().range([heightOverview, 0]);
    var color = d3.scale.ordinal().range(data.colors.reverse()).domain(data.keys.reverse());
    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2d"));

    if (context == 'day') {
        numSamples = 24;
        x = d3.time.scale.utc().domain([date1,date2]).range([0, width]);
        xOverview = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom").ticks((numSamples < 12 ? numSamples : 12)).tickFormat(d3.time.format.utc('%H'));
        XaxisLabel = 'Hours';
    }
    else if (context == 'hour') {
        numSamples = 60;
        x = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xOverview = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom").ticks((numSamples < 12 ? numSamples : 12)).tickFormat(d3.time.format.utc('%M'));
        XaxisLabel = 'Minutes';
    }
    else if (context == 'minute' || context == 'second') {
        numSamples = 60;
        x = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xOverview = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom").ticks((numSamples < 12 ? numSamples : 12)).tickFormat(d3.time.format.utc('%S'));
        XaxisLabel = 'Seconds';
    }
    else {
        numSamples = Math.ceil(moment.duration(date2.utc().endOf('day').diff(date1.utc())).asDays());
        x = xOverview = d3.time.scale.utc().domain([date1, date2]).range([0, width]);
        xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom").ticks((numSamples < 10 ? numSamples : 10)).tickFormat(d3.time.format.utc('%m/%d'));
        XaxisLabel = 'Days';
    }


    // graph initialization

    var svg = d3.select("#" + thediv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svgOverview = d3.select("#" + thediv + 'Overview').append("svg")
        .attr("width", width + marginOverview.left + marginOverview.right)
        .attr("height", heightOverview + marginOverview.top + marginOverview.bottom);

    var main = null, overview = null, legend = null;

    if (brush === null) {
        brush = d3.svg.brush()
    }
        
     brush.x(xOverview).on("brush", brushed);
    y.domain([0, d3.max(chartData, function (d) { return d.Total; })]);
    yOverview.domain(y.domain());

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
            return moment(d.Date) >= moment(brush.extent()[0]) && moment(d.Date) < moment(brush.extent()[1]);
        }));
    }
    else {
        series = stack(chartData);
    }
    var overviewSeries = stack(chartData);
    
    buildMainGraph(series, date1, date2);
    buildOverviewGraph(overviewSeries);


    //// d3 Helper Functions
    function buildMainGraph(data, startDate, endDate) {
        $('#' + thediv).children().remove();
        svg = d3.select("#" + thediv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

        var xAxis;
        var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
        var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom" : globalContext);

        if (context == 'day' ) {
            numSamples = moment.duration(endDate.diff(startDate)).asHours();
            xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(numSamples).tickFormat(d3.time.format.utc('%H'));
        }
        else if (context == 'hour' ) {
            numSamples = moment.duration(endDate.diff(startDate)).asMinutes();
            xAxis = d3.svg.axis().scale(x).orient("bottom").ticks((numSamples < 12 ? numSamples : 12)).tickFormat(d3.time.format.utc('%M'));
        }
        else if (context == 'minute' || context == 'second') {
            numSamples = moment.duration(endDate.diff(startDate)).asSeconds();
            xAxis = d3.svg.axis().scale(x).orient("bottom").ticks((numSamples < 12 ? numSamples : 12)).tickFormat(d3.time.format.utc('%S'));
        }
        else {
            numSamples = Math.ceil(moment.duration(endDate.utc().endOf('day').diff(startDate.utc())).asDays());
            x = d3.time.scale.utc().domain([startDate, endDate]).range([0, width]);
            xAxis = d3.svg.axis().scale(x).orient("bottom").ticks((numSamples < 10 ? numSamples : 10)).tickFormat(d3.time.format.utc('%m/%d'));
        }

        y.domain([0, d3.max(data, function (d) {
            return d3.max(d, function (e) {
                return e[1]
            });
        })]);

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

        if (context != "custom" && tabsForDigIn.indexOf(currentTab) >= 0) {
            var btnBar = d3.select("#" + thediv).append("div")
                .attr("id", "btnBar")
                .attr("class", "modebar modebar--hover")
                .style("position", "absolute")
                .style("display", "table-row")
                .style("top", "0")
                .style("left", ($('#Overview' + currentTab).width() / 2 ) + "px");

            btnBar.append("div")
                .attr("class", "modebar-group")
                .style("display", "table-cell")
                .style("padding", "2px")
                .append("a")
                .attr("id", "graphMoveBackwardBtn")
                .attr("class", "modebar-btn")
                .attr("onclick", "moveGraphBackward()")
                .attr("title", "Step back by 1 " + context)
                .style("cursor", "pointer")
                .append("span")
                .attr("class", "glyphicon glyphicon-backward");

            btnBar.append("div")
                .attr("class", "modebar-group")
                .style("display", "table-cell")
                .style("padding", "2px")
                .append("a")
                .attr("id", "stepOutBtn")
                .attr("class", "modebar-btn")
                .attr("onclick", "stepOut()")
                .style("cursor", "pointer")
                .text("Step Out ");

            btnBar.append("div")
                .attr("class", "modebar-group")
                .style("display", "table-cell")
                .style("padding", "2px")
                .append("a")
                .attr("id", "graphMoveForwardBtn")
                .attr("class", "modebar-btn")
                .attr("onclick", "moveGraphForward()")
                .attr("title", "Step forward by 1 " + context)
                .style("cursor", "pointer")
                .append("span")
                .attr("class", "glyphicon glyphicon-forward")

        }

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
                    return x(moment(d.data.Date));
                })
                .attr("width", function () {
                    return width / numSamples;
                })
                .attr("y", function (d) {
                    return y((d[1]? d[1]: 0));
                })
                .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                .style("fill", function (d, e, i) {
                    return color(series[i].key);
                })
                .style("cursor", "pointer");

        main.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("y", 10)
            .attr("x", -margin.left)
            .attr("dy", ".71em")
            .text(XaxisLabel);

        main.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", ".71em")
            .text(YaxisLabel);

        var tooltip = d3.select('#' + thediv).append('div')
            .attr('class', 'hidden tooltip');

        bar.on('mousemove', function (d, f, g) {
            var mouse = d3.mouse(svg.node()).map(function (e) {
                return parseInt(e);
            });
            var html = "<table><tr><td>Date: </td><td style='text-align: right'>" + getFormattedDate(d.data.Date) + "</td></tr>";
            var dKeys = d3.keys(d.data).filter(function (key) { return key !== 'Date' && key !== 'Total' && key !== 'newTotal' && key !== 'Disabled' && key !== 'Values' && key.indexOf('Disabled') < 0 }).reverse();
            dKeys.forEach(function (data, i) {
                html += "<tr><td>" + data + "</td><td style='text-align: right'>" + (data === "Date" ? getFormattedDate(d.data.Date) : d.data[data]) + "</td></tr>";
            });
            html += "</table>";

            tooltip.classed('hidden', false)
            .html(html)
            .attr('style', (width - mouse[0] < $('.tooltip').width() ? 'right:' + (width - mouse[0] + margin.left + $('.tooltip').width()) : 'left:' + (mouse[0] + 15)) + 'px; bottom:' + (height - mouse[1]) + 'px');
        });

        bar.on('mouseout', function () {
            tooltip.classed('hidden', true);
        });

        bar.on('click', function (d) {
            var thedate = getFormattedDate(d.data.Date);
            contextfromdate = thedate;
            contexttodate = thedate;
            var filter = [];
            $.each(legend.selectAll("rect"), function (i, element) {
                if ($(this).css('fill') !== 'rgb(128, 128, 128)')
                    filter.push(element[0].__data__);
            });
            
            manageTabsByDateForClicks(currentTab, thedate, thedate, filter);
            cache_Last_Date = thedate;
        });

        buildLegend();
    }

    function buildOverviewGraph(data) {

        $.each(data[0], function (index, element) {
                var total = 0
                $.each(Object.keys(element.data), function (i, a) {
                    if (a != 'Date' && a != 'Total')
                        total += parseInt(element.data[a])
                })
                element.data.newTotal = total;
            });

        yOverview.domain([0, d3.max(data, function (d) {
            return d3.max(d, function (e) {
                return e.data.newTotal
            });
        })]);

        overview = svgOverview.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

        var layersArea = overview.append("g")
                    .attr("class", "layers");

        var layers = layersArea.selectAll(".layer").data(data)
            .enter().append("g")
                .attr("class", layerClass);

        var bar = layers.selectAll("rect").data(function (d) { return d;  })
            .enter().append("rect")
                .attr("x", function (d) { return xOverview(moment(d.data.Date)); })
                .attr("width", function () { return width / numSamples; })
                .attr("y", function (d) {
                    return yOverview(d.data.newTotal);
                })
                .attr("height", function (d) { return heightOverview - yOverview(d.data.newTotal); })
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
            .attr("transform", function (d, i) { return "translate(140," + (i + 1) * 20 + ")"; });

        var disabledLegendFields = [];

        if (!disabledList.hasOwnProperty(currentTab)) disabledList[currentTab] = {};

        legend.append("rect")
            .attr("x", width + -65)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d, i, e) {
                if (!disabledList[currentTab].hasOwnProperty(d)) disabledList[currentTab][d] = false;

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
                }
                toggleSeries(d, $(this).css('fill') === 'rgb(128, 128, 128)');
                window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);
                resizeMatrixCells(currentTab);
                showSiteSet($("#selectSiteSet" + currentTab)[0]);
                if ($("#map" + currentTab + "Grid")[0].value == "Map" && (currentTab === 'Disturbances' || currentTab === 'Events' || currentTab === 'Trending')) {
                    var legendFields = color.domain().slice().filter(function (a) { return $.map(disabledList[currentTab], function (data, key) { if (data) return key }).indexOf(a) < 0 });
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

    }

    //called when selection is chosen on overview map
    function brushed() {
        var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
        var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom" : globalContext);

        var startDate;
        var endDate;

        if (brush.empty()) {
            startDate = moment(thedatefrom);
            endDate = moment(thedateto);
        }
        else{
            startDate = moment(brush.extent()[0]);
            endDate = moment(brush.extent()[1]);
        }

        if (context == 'day') {
            if (startDate.minutes() > 29)
                startDate.add(1, 'hour').startOf('hour');
            else
                startDate.startOf('hour');

            if (endDate.minutes() > 29)
                endDate.add(1, 'hour').startOf('hour');
            else
                endDate.startOf('hour');
        }
        else if (context == 'hour') {
            if (startDate.seconds() > 29)
                startDate.add(1, 'minute').startOf('minute');
            else
                startDate.startOf('minute');

            if (endDate.seconds() > 29)
                endDate.add(1, 'minute').startOf('minute');
            else
                endDate.startOf('minute');
        }
        else if (context == 'minute' || context == 'second') {
            if (startDate.milliseconds() > 500)
                startDate.add(1, 'second').startOf('second');
            else
                startDate.startOf('second');

            if (endDate.milliseconds() > 500)
                endDate.add(1, 'second').startOf('second');
            else
                endDate.startOf('second');
        }
        else {
            if (startDate.hour() > 11)
                startDate.add(1, 'day').startOf('day');
            else
                startDate.startOf('day');

            if (endDate.hour() > 1)
                endDate.add(1, 'day').startOf('day');
            else
                endDate.startOf('day');
        }


        x.domain([startDate, endDate]);

        main.selectAll("g").remove();

        var newData = deepCopy(cache_Graph_Data.graphData);
        var tempKeys = cache_Graph_Data.keys;

        $.each(newData, function (i, d) {
            $.each(tempKeys, function (j, k) {
                if (disabledList[currentTab][k] === true)
                    newData[i][k] = 0;

            });

        });
        var stackedData;

        if (brush.empty())
            stackedData = stack(newData);
        else
            stackedData = stack(newData.filter(function (d) {
                return moment(d.Date) >= startDate && moment(d.Date) < endDate;
            }));

        buildMainGraph(stackedData, startDate, endDate);
    }

    //Toggles a certain series.
    function toggleSeries(seriesName, isDisabling) {
        var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
        var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom" : globalContext);

        var newData = deepCopy(cache_Graph_Data.graphData);

        var tempKeys = cache_Graph_Data.keys;
        disabledList[currentTab][seriesName] = isDisabling;

        $.each(newData, function (i, d) {
            $.each(tempKeys, function (j, k) {
                if (disabledList[currentTab][k] === true)
                    newData[i][k] = 0;

            });

        });

        var thedatefrom;
        var thedateto;

        if (context == "custom") {
            thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc();
            thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc();
        }
        else if (tabsForDigIn.indexOf(currentTab) >= 0 && context == "day") {
            thedatefrom = moment(contextfromdate).utc().startOf('day');
            thedateto = moment(contextfromdate).utc().endOf('day');
        }
        else if (tabsForDigIn.indexOf(currentTab) >= 0 && context == "hour") {
            thedatefrom = moment(contextfromdate).utc().startOf('hour');
            thedateto = moment(contextfromdate).utc().endOf('hour');
        }
        else if (tabsForDigIn.indexOf(currentTab) >= 0 && context == "minute") {
            thedatefrom = moment(contextfromdate).utc().startOf('minute');
            thedateto = moment(contextfromdate).utc().endOf('minute');
        }
        else if (tabsForDigIn.indexOf(currentTab) >= 0 && context == "second") {
            thedatefrom = moment(contextfromdate).utc().startOf('second');
            thedateto = moment(contextfromdate).utc().endOf('second');
        }
        else {
            thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc();
            thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc();
        }

        $.jStorage.set('disabledList', disabledList)
        var stackedData = stack((!brush.empty() ? newData.filter(function (d) { return d.Date > new Date(brush.extent()[0]).setHours(0, 0, 0, 0) && d.Date < new Date(brush.extent()[1]).setHours(0, 0, 0, 0); }) : newData));
        var overviewStackedData = stack(newData);
        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
        main.selectAll("g").remove();
        buildMainGraph(stackedData, thedatefrom, thedateto);
        overview.selectAll("g").remove();
        buildOverviewGraph(overviewStackedData, thedatefrom, thedateto);
    }


}

function moveGraphBackward() {
    if (globalContext == "day") {
        contextfromdate = moment(contextfromdate).utc().startOf('day').subtract(1,'days').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "hour") {
        contextfromdate = moment(contextfromdate).utc().startOf('hour').subtract(1, 'hours').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "minute") {
        contextfromdate = moment(contextfromdate).utc().startOf('minute').subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "second") {
        contextfromdate = moment(contextfromdate).utc().startOf('second').subtract(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }


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

function moveGraphForward() {
    if (globalContext == "day") {
        contextfromdate = moment(contextfromdate).utc().startOf('day').add(1, 'days').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "hour") {
        contextfromdate = moment(contextfromdate).utc().startOf('hour').add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "minute") {
        contextfromdate = moment(contextfromdate).utc().startOf('minute').add(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "second") {
        contextfromdate = moment(contextfromdate).utc().startOf('second').add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextfromdate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }


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

// Deep copies an obj
function deepCopy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object") ? deepCopy(v) : v;
    }
    return output;
}

//////////////////////////////////////////////////////////////////////////////////////////////
function populateDivWithErrorBarChart(thedatasource, thediv,  siteID, thedatefrom, thedateto) {
    dataHub.getTrendingDataForPeriod(siteID, $('#contourColorScaleSelect').val(), thedatefrom, thedateto, postedUserName).done(function (data) {
        cache_ErrorBar_Data = data;
        buildErrorBarChart(data, thediv, siteID, thedatefrom, thedateto);
    }).fail(function (msg) {
        alert(msg);
    });
}

function buildErrorBarChart(data, thediv, siteID, thedatefrom, thedateto) {
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
        graphData[0].data.push([new Date(point.Date).getTime(), point.Maximum]);
        graphData[1].data.push([new Date(point.Date).getTime(), point.Average]);
        graphData[2].data.push([new Date(point.Date).getTime(), point.Minimum]);
        graphData[3].data.push([new Date(point.Date).getTime(), mid, mid - point.Minimum, point.Maximum - mid]);
    });


    //Set mins and maxes
    var xMin = new Date(thedatefrom).getTime();
    var xMax = new Date(thedateto).getTime();

    $('#' + thediv).empty();
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
            var thedate = getFormattedDate($.plot.formatDate($.plot.dateGenerator(item.datapoint[0], { timezone: "utc" }), "%m/%d/%Y"));
            manageTabsByDateForClicks(currentTab,thedate, thedate, null);
            cache_Last_Date = thedate;

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

function buildMagDurChart(data, thediv) {
    var companyTrace = [{
        x: [],
        y: [],
        name: 'Disturbances',
        text: [],
        type: 'scatter',
        mode: 'markers'
    }];
    $.each(data, function (i, d) {
        companyTrace[0].x.push(d.DurationSeconds);
        companyTrace[0].y.push(d.PerUnitMagnitude * 100);
        companyTrace[0].text.push(d.EventID)
    });

    var layout = {
        title: 'Disturbance Magnitude Duration Scatter Plot',
        hovermode: 'closest',
        xaxis: { title: 'Duration (Seconds)', type: 'log', autorange: true, autotick: false, tickvals: [0, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]/*, range: [-3, 4] */ },
        yaxis: { side: 'left', overlaying: 'y', anchor: 'x', title: 'Voltage Magnitude(% of Nominal)'/*, range: [0, 150]*/ },
    };

    dataHub.getCurves().done(function (curves) {

        var curveIds = [];
        $.each(curves, function (index, points) {
            if (curveIds.indexOf(points.ID) < 0)
                curveIds.push(points.ID);
        });
        var lines = []
        $.each(curveIds, function (index, id) {
            companyTrace.push({
                x: $.map(curves, function (curve) { if (curve.ID == id) return parseFloat(curve.DurationSeconds) }),
                y: $.map(curves, function (curve) { if (curve.ID == id) return parseFloat(curve.PerUnitMagnitude) * 100 }),
                name: $.map(curves, function (curve) { if (curve.ID == id) return curve.Name })[0], type: 'scatter', mode: 'lines',
                visible: ($.map(curves, function (curve) { if (curve.ID == id) return curve.Visible })[0] ? true : 'legendonly')
            });
        });

        var plot = Plotly.newPlot(thediv, companyTrace, layout);

        $('#'+ thediv).off('plotly_click');
        $('#'+ thediv).on('plotly_click', function (event, data) {
            window.open(homePath + "Main/OpenSEE?eventid=" + data.points[0].fullData.text[data.points[0].pointNumber] + "&faultcurves=1");
        });
    });

    $(window).off('resize');
    $(window).on('resize', function () {
        Plotly.purge(thediv);
        buildMagDurChart(cache_MagDur_Data, thediv)
    });


}

//////////////////////////////////////////////////////////////////////////////////////////////

function getLocationsAndPopulateMapAndMatrix(currentTab, datefrom, dateto, string) {
    cache_Map_Matrix_Data = null;
    cache_Map_Matrix_Data_Date_From = null;
    cache_Map_Matrix_Data_Date_To = null;
    var url = homePath + "mapService.asmx/getLocations" + currentTab;

    var thedatasent;
    if (currentTab == "TrendingData") {
        thedatasent = {
            contourQuery: {
                StartDate: datefrom,
                EndDate: dateto,
                DataType: $('#trendingDataTypeSelection').val(),
                ColorScaleName: $('#contourColorScaleSelect').val(),
                UserName: postedUserName,
                MeterIds: meterList.selectedIdsString()
            }
        };
    }

    if (currentTab != 'TrendingData') {
        dataHub.getMeterLocations(datefrom, dateto, meterList.selectedIdsString(), currentTab, userId, globalContext).done(function (data) {
            data.JSON = JSON.parse(data.Data);
            cache_Map_Matrix_Data_Date_From = datefrom;
            cache_Map_Matrix_Data_Date_To = dateto;
            cache_Map_Matrix_Data = data;
            plotMapLocations(data, currentTab, datefrom, dateto);
            plotGridLocations(data, currentTab, datefrom, dateto, string);
        }).fail(function (msg) {
            alert(msg);
        });
    }
    else {
        dataHub.getLocationsTrendingData(thedatasent.contourQuery).done(function (data) {
            cache_Map_Matrix_Data_Date_From = data.DateFrom;
            cache_Map_Matrix_Data_Date_To = data.DateTo;
            cache_Map_Matrix_Data = data;
            data.JSON = data.Locations;
            plotMapLocations(data, currentTab, data.DateFrom, data.DateTo, string);
            plotGridLocations(data, currentTab, data.DateFrom, data.DateTo, string);
        }).fail(function (msg) {
            alert(msg);
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridMatrix(data, siteID, siteName, colors) {
    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).empty();

    $(matrixItemID).unbind('click');

    $(matrixItemID)[0].title = siteName + " ";

    $(matrixItemID).append("<div style='font-size: 1em'><div class='faultgridtitle'>" + siteName + "</div>");

    var theGridColor = getColorsForTab(data, colors);

    $(matrixItemID).css("background-color", theGridColor);

    if (parseInt(data.Count) > 0) {
        DrawGridSparklines(data, siteID, siteName, matrixItemID, colors);
    }

    $(matrixItemID).click(function (e) {

        if (!e.shiftKey && !e.ctrlKey ) {
            meterList.unselectAll()
        }

        var thisselectedindex = meterList.indexOf(siteID)


        $.each(meterList.list,function (i,item) {

            if (e.shiftKey) {

                if (thisselectedindex > lastselectedindex) {
                    if ((i >= lastselectedindex) && (i <= thisselectedindex)) {
                        if (item.Selected == false) item.Selected = true;
                    } else {
                        if (item.Selected == true) item.Selected = false;
                    }
                } else {
                    if ((i >= thisselectedindex) && (i <= lastselectedindex)) {
                        if (item.Selected == false) item.Selected = true;
                    } else {
                        if (item.Selected == true) item.Selected = false;
                    }
                }
            } else if (i == thisselectedindex) {
                item.Selected = true;
                return (false);
            }
        });

        if (!e.shiftKey && !e.ctrlKey) {
            lastselectedindex = thisselectedindex;
        }

        updateGridWithSelectedSites();

        if (e.ctrlKey) {
            if (selectiontimeout != null) clearTimeout(selectiontimeout);
            selectiontimeout = setTimeout('selectsitesincharts()', 100);
        } else {


            if ($('#deviceFilterList').val() != 'ClickEvent') {
                cache_Meter_Filter = $('#deviceFilterList').val();
                $('#deviceFilterList').append(new Option('Click Event', 'ClickEvent'));
                $('#deviceFilterList').val('ClickEvent');

            }

            selectsitesincharts();
        }

        $('#meterSelected').text(meterList.selectedCount());

    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function updateGridWithSelectedSites() {
    if (meterList == null) return;

    $('#theMap' + currentTab).find('.leafletCircle').addClass('circleButtonBlack');

    meterList.list.forEach(function (item) {
        var matrixItemID = "#" + "matrix_" + item.ID + "_box_" + currentTab;
        if (item.Selected) {
            $(matrixItemID).removeClass('matrixButtonBlack').addClass('matrixButton');
            $('#theMap' + currentTab).find('.leafletCircle').children('[id*=' + item.Name.replace(/[^A-Za-z0-9]/g, '') + ']').parent().removeClass('circleButtonBlack')
        } else {
            $(matrixItemID).removeClass('matrixButton').addClass('matrixButtonBlack');
        }


    });
}

//////////////////////////////////////////////////////////////////////////////////////////////
function DrawGridSparklines(data, siteID, siteName, matrixItemID, colors) {
    switch (currentTab) {
        case "Events":
        case "Disturbances":
        case "Breakers":
            populateGridSparklines(data, siteID, siteName, colors);
            break;
        case "Faults":
            $(matrixItemID).append("<div unselectable='on' class='faultgridcount'>" + data.Count + "</div>");
            $(matrixItemID)[0].title = siteName + " Faults: " + data.Count;
            break;
        case "Completeness":
        case "Correctness":
            populateGridSparklineDataQuality(data, siteID, siteName, true, colors);
            break;  
        case "Trending":
        case "TrendingData":
        default:
            break;
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////
    
function populateGridSparklineDataQuality(data, siteID, siteName, makespark, colors) {
    var sparkvalues = [];

    var colorMap = [];

    var completeness = parseInt(data.GoodPoints) + parseInt(data.LatchedPoints) + parseInt(data.NoncongruentPoints) + parseInt(data.UnreasonablePoints);

    sparkvalues = [parseInt(data.ExpectedPoints), completeness, parseInt(data.DuplicatePoints)];

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    var colorMap = ["#FF0000","#00FF00","#0000FF"]

    if (!makespark) return;
    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(sparkvalues, {
        type: 'bar',
        tooltipFormatter: function (sp, options, fields) {
            var thetitle = "";
            thetitle += "<table class='table' style='margin-right: 10px'>";
            thetitle += "<tr><td colspan=2 align='center'>" + data.Name + "</td></tr>";
            thetitle += "<tr><td><span style='color: #ff0000'>&#9679;</span> Expected:</td><td align='right'>" + data.ExpectedPoints + "</td></tr>";
            thetitle += "<tr><td><span style='color: #00ff00'>&#9679;</span> Received:</td><td align='right'>" + completeness + "</td></tr>";
            thetitle += "<tr><td><span style='color: #0000ff'>&#9679;</span> Duplicate:</td><td align='right'>" + data.DuplicatePoints + "</td></tr>";
            thetitle += "</table>";
            return (thetitle);
        }
    });

}
//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridSparklines(data, siteID, siteName, colors) {
    var sparkValues = {}; // = { "Interruption": { data: data[0], color: globalcolorsEvents[5] }, "Fault": { data: data[1], color: globalcolorsEvents[4] }, "Sag": { data: data[2], color: globalcolorsEvents[3] }, "Transient": { data: data[3], color: globalcolorsEvents[2] }, "Swell": { data: data[4], color: globalcolorsEvents[1] }, "Other": { data: data[5], color: globalcolorsEvents[0] } };
    $.each(Object.keys(data), function (i, key) {
        if (key != "Count" && key != "ID" && key != "Name" && key != "Latitude" && key != "Longitude")
            sparkValues[key] = { data: data[key], color: colors[key] };
    });

    var numbers = [];
    var color = [];
    $.each($.map(disabledList[currentTab], function (data, key) { if (!data) return key }), function (index, field) {
        if (sparkValues[field] != null) {
            numbers.push(parseInt(sparkValues[field].data));
            color.push(sparkValues[field].color);
        }
    });

    var matrixItemID = "#" + "matrix_" + siteID + "_box_" + currentTab;

    $(matrixItemID).append($("<div unselectable='on' class='sparkbox' id='" + "sparkbox_" + siteID + "_box_" + currentTab + "'/>"));

    $("#sparkbox_" + siteID + "_box_" + currentTab).sparkline(numbers, {
        type: 'bar',
        colorMap: color,
        tooltipFormatter: function (sparkline, options, fields) {
            var thetitle = "";
            thetitle += "<table class='table' style='margin-right: 10px'>";
            thetitle += "<tr><td colspan=2 align='center'>" + data.Name + "</td></tr>";
            $.each(Object.keys(data), function (i, key) {
                if (key != "Count" && key != "ID" && key != "Name" && key != "Latitude" && key != "Longitude")
                    thetitle += "<tr><td><span style='color:"+colors[key]+"'>&#9679;</span>" + key + ":</td><td align='right'>" + data[key] + "</td></tr>";
            });
            thetitle += "</table>";
            return thetitle
        }
    });

}

//////////////////////////////////////////////////////////////////////////////////////////////

function showSiteSet(thecontrol) {

    var mapormatrix = $("#map" + currentTab + "Grid")[0].value;

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
                $('.matrixButton[id*=' + currentTab + ']').show();
                $('.matrixButtonBlack[id*='+ currentTab +']').hide();
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
                $('#theMap' + currentTab).find('.leafletCircle').show();
                $('#theMap' + currentTab).find('.leafletCircle.circleButtonBlack').hide();
                break;

            case "Sags":
                $.each($(leafletMap[currentTab].getPanes().markerPane).children(), function (index, marker) {
                    if ($(marker).children().children().attr('fill') === '#996633')
                        $(marker).show();
                    else
                        $(marker).hide();
                });
                break;

            case "Swells":
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

function plotGridLocations(locationdata, newTab, thedatefrom, thedateto) {
    /// Clear Matrix
    if ($("#theMatrix" + newTab)[0].childElementCount > 0) {
        $("#theMatrix" + newTab).empty();
    }

    // For each data unit, build containers, add to layer based on status
    $.each(locationdata.JSON, function (key, value) {
        var item = $("<div unselectable='on' class='matrix matrixButton noSelect' id='" + "matrix_" + value.ID + "_box_" + newTab + "'/>");

        item.data('gridstatus', value.Event_Count);
        item.data('siteid', value.name + "|" + value.ID);
        $("#theMatrix" + newTab).append(item);

    });

    /// Set Matrix Cell size
    cache_Sparkline_Data = locationdata;
    showSiteSet($("#selectSiteSet" + currentTab)[0]);
};

/////////////////////////////////////////////////////////////////////////////////////////

function plotMapLocations(locationdata, newTab, thedatefrom, thedateto) {
    if (leafletMap[currentTab] == null)
        loadLeafletMap('theMap' + currentTab);

    if (mapMarkers[currentTab].length !== 0) {
        $.each(mapMarkers[currentTab], function (i, m) { leafletMap[currentTab].removeLayer(m.marker) });
        mapMarkers[currentTab] = [];
    }


        $.each(locationdata.JSON, function (index, data) {
            var color = getColorsForTab(data, locationdata.Colors);

            var html = '<svg height="12" width="12" id="' + data.Name.replace(/[^A-Za-z0-9]/g, "") + '-' + data.ID + '">' +
                            '<circle cx="6" cy ="6" r="4" stroke="black" stroke-width="1" fill="' + color + '"/>' +
                       '</svg>';

            var popup = getLeafletLocationPopup(data);

            var circleIcon = L.divIcon({ className: 'leafletCircle', html: html });

            var marker = L.marker([data.Latitude, data.Longitude], { icon: circleIcon }).addTo(leafletMap[currentTab]).bindPopup(popup);

            marker.on('click', function (event) {
                if (!event.originalEvent.ctrlKey) {
                    meterList.unselectAll();
                    $('#theMap' + currentTab).find('.leafletCircle').addClass('circleButtonBlack');

                }

                $.each(meterList, function (i, item) {
                    if (item.ID == data.ID) {
                        item.Selected = true;
                    }

                });

                if ($('#deviceFilterList').val() != 'ClickEvent') {
                    cache_Meter_Filter = $('#deviceFilterList').val();
                    $('#deviceFilterList').append(new Option('Click Event', 'ClickEvent'));
                    $('#deviceFilterList').val('ClickEvent');
                }

                $('#meterSelected').text(meterList.selectedCount());


                selectsitesincharts();

                $('#theMap' + currentTab).find('.leafletCircle').children('[id*=' + data.Name.replace(/[^A-Za-z0-9]/g, '') + ']').parent().removeClass('circleButtonBlack')


            });

            marker.on('mouseover', function (event) {
                marker.openPopup();
            });

            marker.on('mouseout', function (event) {
                marker.closePopup();
            });

            if ($.inArray(data.Name + "|" + data.ID, meterList.selected()) > -1)
                mapMarkers[currentTab].push({ id: data.ID, marker: marker });
        });

        // Hack: if displaying an overlay for animation,
        //       do not automatically fit bounds
        if (!locationdata.URL) {
            markerGroup = new L.featureGroup(mapMarkers[currentTab].map(function (a) { return a.marker; }));
            if(markerGroup.getBounds().isValid())
                leafletMap[currentTab].fitBounds(markerGroup.getBounds());
            leafletMap[currentTab].setMaxBounds(L.latLngBounds(L.latLng(-180, -270), L.latLng(180, 270)));
            $('#contourAnimationResolutionSelect').val(leafletMap[currentTab].getZoom())

        }
        
        if(currentTab == "TrendingData"){
            leafletMap["TrendingData"].off('zoomend');
            leafletMap["TrendingData"].on('zoomend', function (event) {
                if (leafletMap["TrendingData"] != null)
                    $('#contourAnimationResolutionSelect').val(leafletMap["TrendingData"].getZoom())
            });
        }

        var timeoutVal;
        leafletMap[currentTab].off('boxzoomend');
        leafletMap[currentTab].on('boxzoomend', function (event) {
            meterList.unselectAll()
            $('#theMap' + currentTab).find('.leafletCircle').addClass('circleButtonBlack');

            $.each(locationdata.JSON, function (index, data) {
                if (data.Latitude >= event.boxZoomBounds._southWest.lat && data.Latitude <= event.boxZoomBounds._northEast.lat
                    && data.Longitude >= event.boxZoomBounds._southWest.lng && data.Longitude <= event.boxZoomBounds._northEast.lng) {
                    
                    $.each(meterList.list, function (_, item) {
                        if (item.ID == data.ID) {
                            item.Selected = true;
                        }

                    });
                    
                    $('#theMap' + currentTab).find('.leafletCircle').children('[id*=' + data.Name.replace(/[^A-Za-z0-9]/g, '') + ']').parent().removeClass('circleButtonBlack')
                }
            });

            if ($('#deviceFilterList').val() != 'ClickEvent') {
                cache_Meter_Filter = $('#deviceFilterList').val();
                $('#deviceFilterList').append(new Option('Click Event', 'ClickEvent'));
                $('#deviceFilterList').val('ClickEvent');
            }

            $('#meterSelected').text(meterList.selectedCount());

            clearTimeout(timeoutVal);
            timeoutVal = setTimeout(function () {
                selectsitesincharts();
            }, 500);

        });


    //}
    showSiteSet($('#selectSiteSet' + currentTab)[0]);
    plotMapPoints(locationdata, thedatefrom, thedateto);
};

/////////////////////////////////////////////////////////////////////////////////////////////////
function getColorsForTab(dataPoint, colors) {
    var color = '#000000';

    if (currentTab === "TrendingData") {
        color = 'rgb(0,255,0)'; // green
        if (dataPoint[$('#trendingDataTypeSelection').val()] === null) color = '#000000'  // black  
    }
    else if (currentTab === "Correctness") {
        var percentage = (parseFloat(dataPoint.GoodPoints) / (parseFloat(dataPoint.GoodPoints) + parseFloat(dataPoint.LatchedPoints) + parseFloat(dataPoint.UnreasonablePoints) + parseFloat(dataPoint.NoncongruentPoints)) * 100).toFixed(2);
        if (colors == undefined || dataPoint.Count == 0) color = '#0000FF';
        else if (percentage > 100) color = colors["> 100%"];
        else if (percentage <= 100 && percentage >= 98) color = colors["98% - 100%"];
        else if (percentage < 98 && percentage >= 90) color = colors["90% - 97%"];
        else if (percentage < 90 && percentage >= 70) color = colors["70% - 89%"];
        else if (percentage < 70 && percentage >= 50) color = colors["50% - 69%"];
        else if (percentage < 50 && percentage > 0) color = colors[">0% - 49%"];
        else if (percentage < 0) color = colors["0%"];    
        else color = '#0000FF';
    }
    else if (currentTab == "Completeness") {
        var percentage = ((parseFloat(dataPoint.GoodPoints) + parseFloat(dataPoint.LatchedPoints) + parseFloat(dataPoint.UnreasonablePoints) + parseFloat(dataPoint.NoncongruentPoints)) / parseFloat(dataPoint.ExpectedPoints) * 100).toFixed(2);

        if (colors == undefined || dataPoint.Count == 0) {
            color = '#0000FF';
        } else if (percentage > 100) {
            color = colors["> 100%"];
        } else if (percentage <= 100 && percentage >= 98) {
            color = colors["98% - 100%"];
        } else if (percentage < 98 && percentage >= 90) {
            color = colors["90% - 97%"];
        } else if (percentage < 90 && percentage >= 70) {
            color = colors["70% - 89%"];
        } else if (percentage < 70 && percentage >= 50) {
            color = colors["50% - 69%"];
        } else if (percentage < 50 && percentage > 0) {
            color = colors[">0% - 49%"];
        } else if(percentage < 0){
            color = colors["0%"];
        }
        else
            color = '#0000FF';

    }
    else if (currentTab === "Breakers") {
        if (colors == undefined) color = '#0000FF';
        else if (dataPoint["No Operation"] > 0)
            color = colors["No Operation"];
        else if (dataPoint["Normal"] > 0)
            color = colors["Normal"];
        else if (dataPoint["Late"] > 0)
            color = colors["Late"];
        else if (dataPoint["Indeterminate"] > 0)
            color = colors["Indeterminate"];
        else
            color = '#0E892C';


    }
    else if (currentTab === "Trending") {
        if (colors == undefined || dataPoint.AlarmCount == 0)
            color = '#0E892C';
        else if(dataPoint.Alarm > 0)
            color = colors['Alarm'];
        else 
            color = colors['Offnormal']
    }

    else if (currentTab === "Faults") {
        if (colors == undefined || dataPoint.Count == 0)
            color = '#0E892C';
        else 
            color = '#CC3300';
    }
    else if (currentTab === "Disturbances") {

        if (colors == undefined || dataPoint.Count == 0)
            color = '#0E892C';
        else if (dataPoint["5"] > 0)
            color = colors["5"];
        else if (dataPoint["4"] > 0)
            color = colors["4"];
        else if (dataPoint["3"] > 0)
            color = colors["3"];
        else if (dataPoint["2"] > 0)
            color = colors["2"];
        else if (dataPoint["1"] > 0)
            color = colors["1"];
        else if (dataPoint["0"] > 0)
            color = colors["0"];
    }
    else if (currentTab === "Events") {
        if (colors == undefined || dataPoint.Count == 0)
            color = '#0E892C';
        else if (dataPoint.Fault > 0)
            color = colors["Fault"];
        else if (dataPoint.Interruption > 0)
            color = colors["Interruption"];
        else if (dataPoint.Sag > 0)
            color = colors["Sag"];
        else if (dataPoint.Swell > 0)
            color = colors["Swell"];
        else if (dataPoint.Other > 0)
            color = colors["Other"];
        else 
            color = '#0E892C';
    }
    else if (currentTab === "Extensions") {
        if (colors == undefined || dataPoint.Count == 0)
            color = '#0E892C';
        else
            color = '#CC3300';
    }

    return color;

}

//////////////////////////////////////////////////////////////////////////////////////////////////
function getLeafletLocationPopup(dataPoint) {
    var popup;
    popup = "<table><tr><td>Site:&nbsp;</td><td style='text-align: right'>&nbsp;" + dataPoint.Name + "&nbsp;</td></tr>";
    $.each(Object.keys(dataPoint), function (i, key) {
        if (key != "ID" && key != "Name" && key != "Longitude" && key != "Latitude" && key != "Data" && dataPoint[key] != null )
            popup += "<tr><td>"+ key +":&nbsp;</td><td style='text-align: right'>&nbsp;" + ( dataPoint[key].toString().indexOf('.') < 0 ? dataPoint[key] : dataPoint[key].toFixed(4)) + "&nbsp;</td></tr>";
    });
    popup += "</table>";

    return popup;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
function plotMapPoints(data, thedatefrom, thedateto) {
    $('.contourControl').hide();
    var thedatasent;

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
                    UserName: postedUserName,
                    MeterIds: 0
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
    else {
        $.each(Object.keys(data.Colors), function(i, key){
            $('#innerLegend').append('<div class="row"><i style="background: ' + data.Colors[key]+ '"></i> ' + key + '</div>');
        });
        $('#innerLegend').append('<div class="row"><i style="background: #0E892C"></i>None</div>');
        LoadHeatmapLeaflet(data);
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

function showHeatmap(thecontrol) {
    if ($(thecontrol).val() == "MinimumSags" || $(thecontrol).val() == "MaximumSwell") {
        dataHub.getLocationsHeatmap(contextfromdate, contexttodate, meterList.selectedIdsString(), $(thecontrol).val()).done(function (data) {
            data.JSON = JSON.parse(data.Data);
            LoadHeatmapLeaflet(data);
        });
    }
    else {
        if(cache_Map_Matrix_Data != null)
            LoadHeatmapLeaflet(cache_Map_Matrix_Data);
        else {
            if (currentTab != "TrendingData") {
                dataHub.getMeterLocations(contextfromdate, contexttodate, meterList.selectedIdsString(), currentTab, userId).done(function (data) {
                    data.JSON = JSON.parse(data.Data);
                    LoadHeatmapLeaflet(data);
                });
            }
            else {

            }
        }
    }

}

function LoadHeatmapLeaflet(thedata) {
    var GLOBE_WIDTH = 256; // a constant in Google's map projection
    var west = (markerGroup.getBounds()._southWest != undefined? markerGroup.getBounds()._southWest.lng: 84.3880);
    var east = (markerGroup.getBounds()._northEast != undefined ? markerGroup.getBounds()._northEast.lng : 84.3880);
    var angle = east - west;
    if (angle < 0) {
        angle += 360;
    }

    var zoom = Math.round(Math.log(($('#theMap' + currentTab).width() < 500 ? 500 : $('#theMap' + currentTab).width()) * 360 / angle / GLOBE_WIDTH) / Math.LN2);
    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 50 / Math.pow(2, (zoom > 13 ? 13 : zoom )),
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
        valueField: 'status'
    };

    $(leafletMap[currentTab].getPanes().overlayPane).children().remove();
    var testData = { data: thedata.JSON.filter(function (currentValue, index, array) { return currentValue.Count > 0; }), min: 1, max: 100 };
    var heatmapLayer = new HeatmapOverlay(cfg);
    var heatmap = L.layerGroup().addLayer(heatmapLayer).addTo(leafletMap[currentTab]);
    heatmapLayer.setData(testData);
    L.control.layers().addOverlay(heatmap, "Heatmap layer");
}

function ManageLocationClick(siteID) {
    var thedatefrom;
    var thedateto;

    if (globalContext == "custom") {
        thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
    }
    else if (globalContext == "day") {
        thedatefrom = moment(contextfromdate).utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        thedateto = moment(contextfromdate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "hour") {
        thedatefrom = moment(contextfromdate).utc().startOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        thedateto = moment(contextfromdate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "minute") {
        thedatefrom = moment(contextfromdate).utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        thedateto = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "second") {
        thedatefrom = moment(contextfromdate).utc().startOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        thedateto = moment(contextfromdate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else {
        thedatefrom = moment(contextfromdate).utc();
        thedateto = moment(contextfromdate).utc();
    }

    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];

    if ((thedatefrom == "") || (thedateto == "")) return;

    if (currentTab == "TrendingData")
        populateDivWithErrorBarChart('getTrendingDataForPeriod', 'Overview' + currentTab, siteID, thedatefrom, thedateto);
    else
    {
        populateDivWithBarChart('Overview' + currentTab, siteID, thedatefrom, thedateto);
    }

}

//////////////////////////////////////////////////////////////////////////////////////////////

function manageTabsByDate(theNewTab, thedatefrom, thedateto) {

    var eventDataTabs = ["Events", "Disturbances", "Faults", "Breakers", 'Extensions'];

    if ((thedatefrom == "") || (thedateto == "")) return;

    if (eventDataTabs.indexOf(theNewTab) < 0 && globalContext != "custom" && globalContext != "day")
        globalContext = "day";

    currentTab = theNewTab;
    var barChartStartDate = thedatefrom, tableDate = thedatefrom;

    setMapHeaderDate(thedatefrom, thedateto);
    if (globalContext == "second") {
        var thing = thedatefrom.split('');
        thing.splice(thedatefrom.length - 3, 2, '0', '0');
        barChartStartDate = thing.join('');
    }
    

    if (eventDataTabs.indexOf(currentTab) < 0) {
        barChartStartDate = thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
    }
    resizeMapAndMatrix(theNewTab);

    if (globalContext != "custom")
        getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, meterList.selectedIdsString(), tableDate);
    else {
        if ($('#Detail' + currentTab + 'Table').children().length > 0) {
            var parent = $('#Detail' + currentTab + 'Table').parent();
            $('#Detail' + currentTab + 'Table').remove();
            $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
        }

    }

    if(currentTab != "TrendingData")
        populateDivWithBarChart('Overview' + currentTab, meterList.selectedIdsString(), barChartStartDate, thedateto);
    else
        populateDivWithErrorBarChart('getTrendingDataForPeriod', 'Overview' + currentTab, meterList.selectedIdsString(), thedatefrom, thedateto)
    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, "undefined");
}

function manageTabsByDateForClicks(theNewTab, thedatefrom, thedateto, filter) {
    if ((thedatefrom == "") || (thedateto == "")) return;
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
    
    if (tabsForDigIn.indexOf(theNewTab) >= 0 || globalContext == "custom")
        setGlobalContext(true);

    currentTab = theNewTab;
    var barChartStartDate = thedatefrom;

    setMapHeaderDate(thedatefrom, thedateto);

    getTableDivData('getDetailsForSites' + currentTab, 'Detail' + currentTab, meterList.selectedIdsString(), thedatefrom);
    if(tabsForDigIn.indexOf(currentTab) >= 0 && globalContext != 'second')
        populateDivWithBarChart('Overview' + currentTab, meterList.selectedIdsString(), thedatefrom, thedateto);
    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, filter);

}


//////////////////////////////////////////////////////////////////////////////////////////////

function reflowContents(newTab) {
    resizeMapAndMatrix(newTab);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeDocklet(theparent, chartheight) {
    var thedatefrom;
    var thedateto;
    var barDateFrom;
    var barDateTo;
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];


    if (globalContext == "custom") {
        barDateFrom = thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        barDateTo = thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
    }
    else if (tabsForDigIn.indexOf(currentTab) >= 0 && globalContext == "day") {
        barDateFrom = thedatefrom = moment(contextfromdate).utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        barDateTo = thedateto = moment(contextfromdate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (tabsForDigIn.indexOf(currentTab) >= 0 && globalContext == "hour") {
        barDateFrom = thedatefrom = moment(contextfromdate).utc().startOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        barDateTo = thedateto = moment(contextfromdate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (tabsForDigIn.indexOf(currentTab) >= 0 && globalContext == "minute") {
        barDateFrom = thedatefrom = moment(contextfromdate).utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        barDateTo = thedateto = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (tabsForDigIn.indexOf(currentTab) >= 0 && globalContext == "second") {
        thedatefrom = moment(contextfromdate).utc().startOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        thedateto = moment(contextfromdate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        barDateFrom = moment(contextfromdate).utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        barDateTo = moment(contextfromdate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";

    }
    else {
        barDateFrom = thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        barDateTo = thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
    }


    var siteName = meterList.selectedCount() + " of " + meterList.count() + " selected";

    var siteID = "";

    if (meterList.selectedCount() > 0) {

        var thedetails = meterList.selected()[0].split('|');

        if (meterList.selectedCount() == 1) {
            siteName = thedetails[0];
        }

        $.each(meterList.selected(), function (key, value) {
            thedetails = value.split('|');
            siteID += thedetails[1] + ",";
        });
    }

    theparent.css("height", chartheight);

    var firstChild = $("#" + theparent[0].firstElementChild.id);

    firstChild.css("height", chartheight - 100);
    if (currentTab === "TrendingData") {
        if ($('#Overview' + currentTab).children().length > 0 && cache_ErrorBar_Data !== null)
            buildErrorBarChart(cache_ErrorBar_Data, 'Overview' + currentTab, siteID, thedatefrom, thedateto);
    }
    else {
        if ($('#Overview' + currentTab).children().length > 0 && cache_Graph_Data !== null)
            buildBarChart(cache_Graph_Data, 'Overview' + currentTab, siteID, barDateFrom, barDateTo);
    }

    if($('#Detail' + currentTab + 'Table').children().length > 0 && cache_Table_Data !== null)
        window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);    
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMapAndMatrix(newTab) {
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
        var onResize = function () {
            markerGroup = new L.featureGroup(mapMarkers[currentTab].map(function (a) { return a.marker; }));
            if (markerGroup.getBounds().isValid())
                leafletMap[currentTab].fitBounds(markerGroup.getBounds());
        };

        // Hack: If the map does need to resize, onResize must be called twice.
        //       Otherwise, it only needs to be called once.
        leafletMap[currentTab].on('resize', onResize);
        try{
            leafletMap[currentTab].invalidateSize(true);
        }
        catch(ex){

        }
        leafletMap[currentTab].off('resize', onResize);
        onResize();
    }
    resizeMatrixCells(newTab);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMatrixCells(newTab) {
    var h = $("#theMatrix" + newTab).height();
    var w = $("#MapMatrix" + newTab).width();
    var r = meterList.count();

    if($('#selectSiteSet' + currentTab).val() === "SelectedSites" )
        r = meterList.selectedCount();
    else if ($('#selectSiteSet' + currentTab).val() === "All") 
        r = meterList.count();
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
          $.each(cache_Sparkline_Data.JSON, (function (key, value) {
              populateGridMatrix(value, value.ID, value.Name, cache_Sparkline_Data.Colors);
          }));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializeDatePickers(datafromdate , datatodate) {

    dateRangeOptions.startDate = moment(datafromdate).utc();
    dateRangeOptions.endDate = moment(datatodate).utc();

    $('#dateRange').daterangepicker(dateRangeOptions, function (start, end, label) {
        $('#dateRangeSpan').html(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
        
        // Move global context back to custom range
        for (var i = 0; i < 5; ++i)
            setGlobalContext(false);

        loadDataForDate();
    });

    $('#dateRangeSpan').html(dateRangeOptions.startDate.format('MM/DD/YYYY') + ' - ' + dateRangeOptions.endDate.format('MM/DD/YYYY'));

}

function moveDateBackward() {
    var startDate = $('#dateRange').data('daterangepicker').startDate.clone().startOf('day');
    var endDate = $('#dateRange').data('daterangepicker').endDate.clone().endOf('day');
    var duration = moment.duration(endDate.diff(startDate));

    // Move global context back to custom range
    for (var i = 0; i < 5; ++i)
        setGlobalContext(false);

    $('#dateRange').data('daterangepicker').setEndDate(startDate);
    $('#dateRange').data('daterangepicker').setStartDate(startDate.subtract(duration.asDays() - 1, 'days'));

    $('#dateRangeSpan').html($('#dateRange').data('daterangepicker').startDate.format('MM/DD/YYYY') + ' - ' + $('#dateRange').data('daterangepicker').endDate.format('MM/DD/YYYY'));
    loadDataForDate();
}

function moveDateForward() {
    var startDate = $('#dateRange').data('daterangepicker').startDate.clone().startOf('day');
    var endDate = $('#dateRange').data('daterangepicker').endDate.clone().endOf('day');
    var duration = moment.duration(endDate.diff(startDate));

    // Move global context back to custom range
    for (var i = 0; i < 5; ++i)
        setGlobalContext(false);

    $('#dateRange').data('daterangepicker').setStartDate(endDate);
    $('#dateRange').data('daterangepicker').setEndDate(endDate.add(duration.asDays() - 1, 'days'));

    $('#dateRangeSpan').html($('#dateRange').data('daterangepicker').startDate.format('MM/DD/YYYY') + ' - ' + $('#dateRange').data('daterangepicker').endDate.format('MM/DD/YYYY'));
    loadDataForDate();
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

function showContent() {

    $("#loginContent").css("visibility", "hidden");
    $("#ApplicationContent").css("visibility", "visible");
    $("#logout_button").css("visibility", "visible");
    buildPage();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getMeters(meterGroup) {
    if (meterGroup == "ClickEvent") {
        $(window).trigger("meterSelectUpdated");
        return;
    }

    dataHub.getMeters(meterGroup, postedUserName).done(function (data) {

        data.sort(function (a, b) {
            if (a.Name.toLowerCase() < b.Name.toLowerCase()) return -1;
            if (a.Name.toLowerCase() > b.Name.toLowerCase()) return 1;
            return 0;
        });

        cache_Meters = data;

        if(meterList == null)
            meterList = new MeterListClass(data);
        else {
            meterList.resetDisplayAll();

            $.each(data, function (_, d) {
                if(meterList.indexOf(d.ID) >= 0)
                {
                    meterList.setSelected(d.ID, true);
                    meterList.setDisplayed(d.ID, true);
                    meterList.addMeterGroup(d.ID, meterGroup);
                }
                else
                {
                    meterList.addMeter(d);
                    meterList.addMeterGroup(d.ID, meterGroup);
                }

            });
        }

        $('#meterSelected').text(meterList.selectedCount());
        $(window).trigger("meterSelectUpdated");
    }).fail(function (msg) {
        alert(msg);
    })
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectMeterGroup(thecontrol) {
    mg = $('#deviceFilterList').val();

    getMeters(mg);

    $.each(Object.keys(leafletMap), function (i, key) {
        if (leafletMap[key]) {
            mapMarkers[key].forEach(function (d) { leafletMap[key].removeLayer(d.marker) });
            mapMarkers[key] = [];
            leafletMap[key] = null;
            var parent = $('#theMap' + key).parent();
            $('#theMap' + key).remove();
            $(parent).append('<div id="theMap' + key + '"></div>');
        }
    });

    var newTab = currentTab;
    if (newTab.indexOf("Overview") > -1) {
    }
    else if (newTab === "MeterActivity") {
    }
    else if (newTab === "ModbusData") {
    }
    else if (newTab === "HistorianData") {
    }
    else {
        cache_Graph_Data = null;
        cache_ErrorBar_Data = null;
        cache_Sparkline_Data = null;
        var mapormatrix = $("#map" + currentTab + "Grid")[0].value;
        $(window).one("meterSelectUpdated", function () {
            manageTabsByDate(newTab, contextfromdate, contexttodate);
        });

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

    $(window).on('hubConnected', function () {
        showContent();
    })
});

//////////////////////////////////////////////////////////////////////////////////////////////

function loadsitedropdown() {

}

//////////////////////////////////////////////////////////////////////////////////////////////
function loadSettingsAndApply() {
        // Turn Off Features

        applicationsettings = dashSettings;

        $.each(dashSettings, (function (key, value) {
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

        //$(window).trigger("settingsLoaded");
}
  
//////////////////////////////////////////////////////////////////////////////////////////////

function buildPage() {

    loadSettingsAndApply();

    $(document).bind('contextmenu', function (e) { return false; });

    $.blockUI({ css: { border: '0px' } });

    $(document).ajaxStart(function () {
        timeout = setTimeout(function () {
            $.blockUI({ message: '<div unselectable="on" class="wait_container"><img alt="" src="' + homePath + '/Images/ajax-loader.gif" /><br><div unselectable="on" class="wait">Please Wait. Loading...</div></div>' });
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


    $(window).on('resize', function () { if (currentTab != 'MeterActivity') resizeMapAndMatrix(currentTab); });

    var savedDisabledList = $.jStorage.get("disabledList");
    if (savedDisabledList != null) {
        $.each(Object.keys(savedDisabledList), function (_, key) {
            $.each(Object.keys(savedDisabledList[key]), function (_, key2) {
                if (!disabledList.hasOwnProperty(key))
                    disabledList[key] = {}

                disabledList[key][key2] = savedDisabledList[key][key2]
            });
        });
    }
    else
        $.jStorage.set("disabledList", disabledList)

    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: 400
    });

    $('#settingsModal').on('shown.bs.modal', function () {
        $('.grid').masonry('layout');
    });

    $('#filterExpressionHelp').mouseenter(function(e){
        $.jsPanel({
            paneltype: {
                tooltip: true,
                mode: 'semisticky',
                connector: true
            },
            position: {
                my: 'center-bottom',
                at: 'center-top',
                of: e.target
            },
            contentSize: { width: 400, height: 400 },
            theme: 'blue',
            headerTitle: 'Filter Expression Help',
            callback: function (panel) {
                panel.content.css('padding', '10px');
                panel.css('z-index','2000')
                if ($(window).scrollTop() > parseInt(panel.css('top'))) {
                    panel.reposition({ my: 'center-top', at: 'center-bottom', of: e.target });
                }

                var content = "<p>Filter expressions can be used to limit the number of monitors for a monitor (meter) group.  The syntax is like a SQL WHERE expression.  The operators are:</p><ul><li><code>=</code> operator to equate an attribute</li><li> the <code>LIKE</code> operator to do a compare</li><li> the <code>%</code> or <code>*</code> operator are used as a wild card</li></ul> " +
                              "<p>The available fields for filtering are associted with a monitor (meter) are: </p><ul><li>Name</li><li>Alias</li><li>ShortName</li><li>AssetKey</li><li>MeterLocationID</li></ul>" +
                              "<p>Examples:</p> <ul><li><code>Alias = 'Greenville'</code></li><li><code>Name LIKE 'DFR%'</code></li><li><code>ShortName LIKE '%ville'</code></li></ul>"

                panel.content.append(content)

            }
        });
    });

    // Settings modal jscolor and enable change events
    $('.modal-body input').change(function (event) {
        var tab = $(event.currentTarget).parent().parent().parent().parent().parent().parent().find('h4').text();
        var value = $(event.currentTarget).parent().parent().text().trim();
        var boolean = $(event.currentTarget).parent().parent().find('[type=checkbox]').prop('checked');
        var field;
        if ($(event.currentTarget).attr('id').indexOf('enable') > -1){
            tab += "Chart";
            field = "enable";
        }
        else if ($(event.currentTarget).attr('id').indexOf('tab') > -1){
            tab = "DashTab";
            field = "tab";
        }
        else if ($(event.currentTarget).attr('id').indexOf('color') > -1) {
            tab += "ChartColors";
            value += ',#' + $(event.currentTarget).val();
            field = "color";
        }

        var id = parseInt($(event.currentTarget).attr('id').split(field)[1]);

        dataHub.updateDashSettings(id, tab, value, boolean, userId);
    });

    $("#application-tabs").tabs({
        heightStyle: "100%",
        widthStyle: "99%",

        activate: function (event, ui) {
            var newTab = currentTab = ui.newTab.attr('li', "innerHTML")[0].getElementsByTagName("a")[0].innerHTML;
            if (newTab.indexOf("Overview") > -1) {
                $('#headerStrip').hide();
                showOverviewPage(currentTab);
            }
            else if (newTab === "MeterActivity") {
                $('#headerStrip').hide();
                showMeterActivity();
            }
            else if (newTab === "ModbusData") {
                $('#headerStrip').hide();
                showModbusData();
            }
            else if (newTab === "HistorianData") {
                showHistorianData();
            }
            else {             
                cache_Graph_Data = null;
                cache_ErrorBar_Data = null;
                cache_Sparkline_Data = null;
                var mapormatrix = $("#map" + currentTab + "Grid")[0].value;
                $('#headerStrip').show();
                $(".mapGrid").val(mapormatrix);
                selectmapgrid($("#map" + currentTab + "Grid")[0]);
                loadDataForDate();
            }


        }
    });

    loadsitedropdown();

    currentTab = defaultView.Tab;


    if (defaultView.DateRange < 0) {
        datafromdate = moment(defaultView.FromDate).utc().format('MM/DD/YYYY');
        datatodate = moment(defaultView.ToDate).utc().format('MM/DD/YYYY');
        contextfromdate = moment(defaultView.FromDate).utc().format('MM/DD/YYYY');
        contexttodate = moment(defaultView.ToDate).utc().format('MM/DD/YYYY');

    }
    else {
        datafromdate = moment(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[defaultView.DateRange]][0]).utc().format('MM/DD/YYYY');
        datatodate = moment(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[defaultView.DateRange]][1]).utc().format('MM/DD/YYYY');
        contextfromdate = datafromdate;
        contexttodate = datatodate;

    }


    initializeDatePickers(datafromdate, datatodate);
    initiateTimeRangeSlider();
    initiateColorScale();
    getMeters(defaultView.DeviceFilterID);

    if (currentTab.indexOf("Overview") > -1) {
        $('#headerStrip').hide();
        showOverviewPage(currentTab);

    }
    else if (currentTab === "MeterActivity") {
        $('#headerStrip').hide();
        showMeterActivity();
    }
    else if (currentTab === "ModbusData") {
        $('#headerStrip').hide();
        showModbusData();
    }
    else if (currentTab === "HistorianData") {
        $('#headerStrip').hide();
        showHistorianData();
    }
    else {
        $(".mapGrid").val(defaultView.MapGrid);
        $('#headerStrip').show();

        $(window).one("meterSelectUpdated", function () {
            $("#application-tabs").tabs("option", "active", ($('#application-tabs li a').map(function (i, a) { return $(a).text(); }).get()).indexOf(currentTab));
            selectmapgrid($("#map" + currentTab + "Grid")[0]);
            resizeMapAndMatrix(currentTab);
        });
    }

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

        var mapLink =
            '<a href="https://openstreetmap.org">OpenStreetMap</a>';

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
                                            '<option value="15">(High Res)15</option>' +
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
                                            '<option value="2">(Low Res)2</option>' +
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
        contourOverlay.setUrl(homePath + contourInfo.URL);
    else
        contourOverlay = L.imageOverlay(homePath + contourInfo.URL, bounds).addTo(leafletMap[currentTab]);
}

function showType(thecontrol) {
    plotMapLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To, null);
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
    $.each(meterList.selectedIds(), function (index, data) {
        if (index === 0)
            meters = data;
        else
            meters += ',' + data;
    });

    var xMax = leafletMap[currentTab].latLngToContainerPoint(markerGroup.getBounds()._northEast).x;
    var xMin = leafletMap[currentTab].latLngToContainerPoint(markerGroup.getBounds()._southWest).x;
    var yMax = leafletMap[currentTab].latLngToContainerPoint(markerGroup.getBounds()._southWest).y;
    var yMin = leafletMap[currentTab].latLngToContainerPoint(markerGroup.getBounds()._northEast).y;

    var pixels = (xMax - xMin) * (yMax - yMin);
    var oneGigInPixels = 1024 * 1024 * 1024 * 4;

    if (pixels > oneGigInPixels) {
        if(!confirm("Your image will exceed 1 GB and could fail. Would you like to continue?"))
            return;
    }

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
            IncludeWeather: $('#weatherCheckbox:checked').length > 0,
            MeterIds: 0
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
        info.JSON = info.Locations;
    });

    var index = 0
    update();

    function update() {
        var info = contourData.Infos[index];
        var progressBarIndex = Math.round(index / (contourData.Infos.length - 1) * 100);
        $('#tabs-' + currentTab + ' #contourProgressBar').attr('value', progressBarIndex);
        $('#tabs-' + currentTab + ' #progressDate').text(contourData.Infos[index].Date);
        plotMapLocations(info, null, null, null, null);
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

    var mapormatrix = $("#map" + currentTab + "Grid")[0].value;

    manageTabsByDate(currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);
    $(".mapGrid").val(mapormatrix);
    selectmapgrid($("#map" + currentTab + "Grid")[0]);
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
    var meterSelections = deepCopy(meterList.list).sort(function (a, b) {
        return a.ID - b.ID;
    }).map(function (a) {
        return a.Selected;
    });

    var base64Selections = '';

    for (var i = 0; i < meterSelections.length; i += 6) {
        var mapIndex =
            (meterSelections[i + 0] ? 32 : 0) +
            (meterSelections[i + 1] ? 16 : 0) +
            (meterSelections[i + 2] ?  8 : 0) +
            (meterSelections[i + 3] ?  4 : 0) +
            (meterSelections[i + 4] ?  2 : 0) +
            (meterSelections[i + 5] ?  1 : 0);

        base64Selections += '' + base64Map[mapIndex];
    }

    return base64Selections;
}

function showMagDur(theControl) {
    if ($(theControl).val() == 0) {
        $('#OverviewDisturbances').show()
        $('#OverviewDisturbancesMagDur').hide()
    }
    else {
        $('#OverviewDisturbances').hide()
        $('#OverviewDisturbancesMagDur').show()
        $(window).trigger('resize');
    }
}

function showDeviceFilter(word) {
    if (word == 'new') {
        $('#deviceFilterId').text('');
        $('#deviceFilterName').val('');
        $('#filterExpression').val('');
        $('#deviceFilterMeterGroup').val(0);

        $('#deviceFilterModal').modal().show();
        $('#showDeviceFilterSaveBtn').show();
        $('#showDeviceFilterEditBtn').hide();
        $('#showDeviceFilterDeleteBtn').hide();
    }
    else if (word == 'edit' && $('#deviceFilterList').val() != 0) {
        dataHub.queryDeviceFilterRecord($('#deviceFilterList').val()).done(function (data) {
            $('#deviceFilterId').text(data.ID);
            $('#deviceFilterName').val(data.Name);
            $('#filterExpression').val(data.FilterExpression);
            $('#deviceFilterMeterGroup').val(data.MeterGroupID);

            $('#deviceFilterModal').modal().show();
            $('#showDeviceFilterSaveBtn').hide();
            $('#showDeviceFilterEditBtn').show();
            $('#showDeviceFilterDeleteBtn').show();
        });
    }
}

function saveDeviceFilter(word) {
    if (word == 'new') {
        var record = {
            Name: $('#deviceFilterName').val(),
            UserAccount: postedUserName,
            FilterExpression: $('#filterExpression').val(),
            MeterGroupID: $('#deviceFilterMeterGroup').val()
        }

        dataHub.addDeviceFilter(record).done(function (data) {
            $('#deviceFilterList').append(new Option(record.Name, data));
        });

    }
    else if (word == 'edit') {
        var record = {
            ID: $('#deviceFilterId').text(),
            Name: $('#deviceFilterName').val(),
            UserAccount: postedUserName,
            FilterExpression: $('#filterExpression').val(),
            MeterGroupID: $('#deviceFilterMeterGroup').val()
        }

        dataHub.editDeviceFilter(record).done(function (data) {
            $('#deviceFilterList').children().filter('option[value=' + record.ID + ']').remove();
            $('#deviceFilterList').append(new Option(record.Name, record.ID));
        });


    }
    else if (word == 'delete') {
        dataHub.deleteDeviceFilter($('#deviceFilterId').text()).done(function () {
            $('#deviceFilterList').children().filter('option[value=' + $('#deviceFilterId').text() + ']').remove();
        });
    }
}

function previewDeviceFilter() {
    dataHub.deviceFilterPreview($('#deviceFilterMeterGroup').val(), $('#filterExpression').val(), postedUserName).done(function (data) {
        var html = "<div>Total: "+ data.length +"<ul style='height: 300px; overflow-y:scroll'>";
        $.each(data, function (i, d) {
            html += "<li>"+ d.Name +"</li>";
        });
        html += "</ul></div>"
        var myPanel = $.jsPanel({
            headerTitle: "Preview Meter List",
            content: html,
            contentSize: {
                width: 300,
                height: 300
            },
            callback: function (panel) {
                panel.css('z-index', '2000')
            }
        });
    });
}

function useSelectedMeters() {
    $('#deviceFilterMeterGroup').val(0)
    $('#filterExpression').val('ID IN (' + meterList.selectedIdsString() + ')');
}

function saveView() {
    $.jsPanel({
        paneltype: 'modal',
        headerTitle: 'Save View',
        theme: 'success',
        show: 'animated fadeInDownBig',
        content: '<label>View Name:</label><input type="text" id="viewName" class="form-control" maxlength="10" /><input id="isDefault" type="checkbox"/>Default<button class="btn btn-primary pull-right">Submit</button>',
        callback: function (panel) {
            $("input:first", this).focus();
            $("button", this.content).click(function () {
                if ($('#deviceFilterList').val() == 'ClickEvent') {
                    var record = {
                        Name: $('#viewName').val(),
                        UserAccount: postedUserName,
                        FilterExpression: 'ID IN (' + meterList.selectedIdsString() + ')',
                        MeterGroupID: $('#deviceFilterMeterGroup').val()
                    }

                    r = {
                        Name: $('#viewName').val(),
                        UserAccount: postedUserName,
                        DateRange: Object.keys(dateRangeOptions.ranges).indexOf($('#dateRange').data('daterangepicker').chosenLabel),
                        FromDate: contextfromdate,
                        ToDate: contexttodate,
                        Tab: currentTab,
                        DeviceFilterID: $('#deviceFilterList').val(),
                        MapGrid: $('#map' + currentTab + 'Grid').val(),
                        IsDefault: $('#isDefault').prop('checked')
                    }


                    dataHub.addDeviceFilter(record).done(function (data) {
                        $('#deviceFilterList').append(new Option(record.Name, data));
                        r.DeviceFilterID = data;
                        dataHub.addSavedViews(r).done(function (d) {
                            $('#viewSelect').append(new Option(r.Name, d));
                            panel.close()
                        });

                    });


                }
                else {
                    record = {
                        Name: $('#viewName').val(),
                        UserAccount: postedUserName,
                        DateRange: Object.keys(dateRangeOptions.ranges).indexOf($('#dateRange').data('daterangepicker').chosenLabel),
                        FromDate: contextfromdate,
                        ToDate: contexttodate,
                        Tab: currentTab,
                        DeviceFilterID: $('#deviceFilterList').val(),
                        MapGrid: $('#map' + currentTab + 'Grid').val(),
                        IsDefault: $('#isDefault').prop('checked')
                    }

                    dataHub.addSavedViews(record).done(function (data) {
                        $('#viewSelect').append(new Option(record.Name, data));
                        panel.close()
                    });
                }

            });
        }
    });
}

function deleteView() {
    if ($('#viewSelect').val() != 0) {
        dataHub.deleteSavedViews($('#viewSelect').val()).done(function () {
            $('#viewSelect :selected').remove();
        });
    }

}

function selectView(theControl) {
    if($(theControl).val() != 0){
        dataHub.querySavedViewsRecord($(theControl).val()).done(function (record) {
            $('#deviceFilterList').val(record.DeviceFilterID);
            //selectMeterGroup(null);
            //$($('a.ui-tabs-anchor:contains("' + record.Tab + '")')).click();
            $('#map' + record.Tab + 'Grid').val(record.MapGrid);
            selectmapgrid($('#map' + record.Tab + 'Grid')[0]);
            contextfromdate = moment(record.FromDate).utc().startOf('day').format('YYYY-MM-DD') + "T00:00:00Z";
            contexttodate = moment(record.ToDate).utc().startOf('day').format('YYYY-MM-DD') + "T00:00:00Z";
            if (record.DateRange < 0) {
                $('#dateRange').data('daterangepicker').setStartDate(moment(record.FromDate).utc().format('MM/DD/YYYY'));
                $('#dateRange').data('daterangepicker').setEndDate(moment(record.ToDate).utc().format('MM/DD/YYYY'));
                $('#dateRangeSpan').html($('#dateRange').data('daterangepicker').startDate.format('MM/DD/YYYY') + ' - ' + $('#dateRange').data('daterangepicker').endDate.format('MM/DD/YYYY'));
            }
            else {
                $('#dateRange').data('daterangepicker').setStartDate(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[record.DateRange]][0]);
                $('#dateRange').data('daterangepicker').setEndDate(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[record.DateRange]][1]);
                $('#dateRangeSpan').html($('#dateRange').data('daterangepicker').startDate.format('MM/DD/YYYY') + ' - ' + $('#dateRange').data('daterangepicker').endDate.format('MM/DD/YYYY'));

            }


            if(record.Tab != currentTab)
                $($('a.ui-tabs-anchor:contains("' + record.Tab + '")')).click();
            else
                loadDataForDate();
        });
    }
}

/// EOF