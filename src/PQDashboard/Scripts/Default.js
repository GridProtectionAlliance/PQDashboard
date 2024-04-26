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

var meterList = null;

// define MeterListClass object in a terrible way so that IE11 will accept it...
var MeterListClass = function(meterList, assetGroupList, parentID){
    this.Meters = deepCopy(meterList);
    this.AssetGroups = deepCopy(assetGroupList);
    this.ParentID = parentID;

    $.each(this.Meters, function (_, meter) {
        meter.Selected = true;
        meter.Displayed = true;
    });

    $.each(this.AssetGroups, function (_, meter) {
        meter.Selected = true;
        meter.Displayed = true;
    });

};

MeterListClass.prototype.selected = function(){
    return this.Meters.filter(function (a) { return a.Selected }).map(function(a){ return a.Name + "|" + a.ID});
};

MeterListClass.prototype.selectedIds = function () {
    var meters = this.Meters.filter(function (a) { return a.Selected }).map(function (a) { return a.ID });
    var subMeters = this.AssetGroups.filter(function (a) { return a.Selected }).map(function (a) { return a.SubID }).flat();
    return meters.concat(subMeters).filter(function (value, index, self) { return self.indexOf(value) === index });
};

MeterListClass.prototype.selectedIdsString = function () {
    return this.selectedIds().join(',');
};

MeterListClass.prototype.count = function () {
    return this.Meters.length + this.AssetGroups.length;
};

MeterListClass.prototype.MeterIdsString = function () {
    return this.Meters.map(function (a) { return a.ID }).join(',');
}

MeterListClass.prototype.MeterIsSelected = function (id) {
    var index = this.indexOf(id);
    return this.Meters[index].Selected;
}

MeterListClass.prototype.selectedCount = function () {
    return this.Meters.filter(function (a) { return a.Selected }).length + this.AssetGroups.filter(function (a) { return a.Selected }).length;
};

MeterListClass.prototype.unselectAll = function () {
    $.each(this.Meters, function (_, meter) {
        meter.Selected = false;
    });
    $.each(this.AssetGroups, function (_, assetGroup) {
        assetGroup.Selected = false;
    });

};

MeterListClass.prototype.resetDisplayAll = function () {
    $.each(this.Meters, function (_, meter) {
        meter.Selected = false;
        meter.Displayed = false;
    });
};

MeterListClass.prototype.setDisplayed = function (id, boolean) {
    var index = this.indexOf(id);
    this.Meters[index].Displayed = boolean;
};

MeterListClass.prototype.setSelected = function (id, boolean) {
    var index = this.indexOf(id);
    this.Meters[index].Selected = boolean;
};

MeterListClass.prototype.setSelected = function (item, boolean) {
    if (item.Type == 'AssetGroup') {
        var index = this.AssetGroups.findIndex(function (a) { return a.ID == item.ID});
        this.AssetGroups[index].Selected = boolean;
    }
    else {
        var index = this.Meters.findIndex(function (a) { return a.ID == item.ID });
        this.Meters[index].Selected = boolean;
    }
};


MeterListClass.prototype.selectById = function (id) {
    $.each(this.Meters, function (_, meter) {
        if(meter.ID == id)
        meter.Selected = true;
    });
};

MeterListClass.prototype.indexOf = function (id) {
    return this.Meters.findIndex(function (a) { return a.ID == id });
};

MeterListClass.prototype.getListOfGrids = function () {
    return this.AssetGroups.map(function (a) { return { ID: a.ID, Name: a.Name, Type: 'AssetGroup', Selected: a.Selected, SubID: a.SubID } }).concat(this.Meters.map(function (a) { return { ID: a.ID, Name: a.Name, Type: 'Meter', Selected: a.Selected } }));
};

var cache_Map_Matrix_Data = null;
var cache_Map_Matrix_Data_Date_From = null;
var cache_Map_Matrix_Data_Date_To = null;

// Billy's cached data
var cache_Graph_Data = null;
var cache_ErrorBar_Data = null;
var cache_Table_Data = null;
var cache_Sparkline_Data = null; 
var brush = null;
var cache_Last_Date = null;
var cache_Meter_Filter = null;
var cache_MagDur_Data = null;

var urlParams = new URLSearchParams(window.location.search);

function updateUrlParams(param, value) {
    urlParams.set(param, value.toLowerCase());
    history.pushState(null, null, "?" + urlParams.toString());
}

var leafletMap = {'MeterActivity': null, Events: null, Disturbances: null, Extensions: null,Trending: null, TrendingData: null, Faults: null, Breakers: null, Completeness: null, Correctness: null};
var markerGroup = null;
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

var globalContext = "custom";

//////////////////////////////////////////////////////////////////////////////////////////////

Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

//////////////////////////////////////////////////////////////////////////////////////////////

function getContextTimeRange() {
    var format = "YYYY-MM-DDTHH:mm:ss";
    var start;
    var end;

    if (globalContext === "custom") {
        var dateRangePicker = $("#dateRange").data("daterangepicker");
        start = dateRangePicker.startDate.format(format);
        end = dateRangePicker.endDate.clone().startOf("day").add(1, 'd').format(format);
    } else {
        var startMoment = moment(contextfromdate).utc().startOf(globalContext);
        start = startMoment.format(format);
        end = startMoment.add(1, globalContext[0]).format(format);
    }

    return {
        Start: start,
        End: end
    };
}

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

    updateUrlParams('context', globalContext);
}
//////////////////////////////////////////////////////////////////////////////////////////////

function loadDataForDate() {
    if (currentTab != null) {

        if (globalContext == "custom") {
            contextfromdate = $('#dateRange').data('daterangepicker').startDate.format('YYYY-MM-DD') + "T00:00:00Z";
            contexttodate = $('#dateRange').data('daterangepicker').endDate.format('YYYY-MM-DD') + "T00:00:00Z";
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
            //cache_Sparkline_Data = null;
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
                plotGridLocations(cache_Map_Matrix_Data, currentTab);  
            }
            $.sparkline_display_visible();
            if(cache_Sparkline_Data != null)
                updateGridWithSelectedSites();
        }
        else if (thecontrol.selectedIndex === 0) {
            //$("#AnimationControlTrending").hide();
            $("#theMap" + currentTab).show();
            $("#theMatrix" + currentTab).hide();
            resizeMapAndMatrix(currentTab);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectsitesincharts() {

    selectiontimeout = null;

    if (cache_Last_Date !== null) {
        getTableDivData(meterList.selectedIdsString(), cache_Last_Date);
    } else {
        var parent = $('#Detail' + currentTab + 'Table').parent();
        $('#Detail' + currentTab + 'Table').remove();
        $(parent).append('<div id="Detail' + currentTab + 'Table"></div>');
    }

    ManageLocationClick(meterList.selectedIdsString());  
}


//////////////////////////////////////////////////////////////////////////////////////////////
// The following functions are for getting Table data and populating the tables
function getTableDivData(siteID, theDate) {
    $.post(homePath + 'api/'+currentTab+'/TableData', { siteId: siteID, targetDate: theDate, colorScale: $('#contourColorScaleSelect').val(), context: globalContext }, function (data) {
        cache_Table_Data = data;

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
    var includeFTT = false;
    if (data != null) {

        $.each(data, function (i, d) {
            if (!disabledList[currentTab][d.voltage + ' kV']) {
                filteredData.push(d);

                if (d.causecode !== undefined)
                    includeCauseCode = true;

                if (d.ftt !== undefined)
                    includeFTT = true;
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

        columns.push({ field: 'AssetName', headerText: 'Asset', headerStyle: 'width: 20%', bodyStyle: 'width: 24%; height: 20px', sortable: true });
        columns.push({ field: 'AssetType', headerText: 'Asset Type', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true });

        if (includeCauseCode)
            columns.push({ field: 'causecode', headerText: 'Cause', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true });

        columns.push({ field: 'voltage', headerText: 'kV', headerStyle: 'width: 6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });
        columns.push({ field: 'thefaulttype', headerText: 'Type', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });

        columns.push({
            field: 'TreeFaultResistance', headerText: 'Calc. Cause', headerStyle: 'width:  10%', bodyStyle: 'width:  6%; height: 20px', sortable: true,
            content: function (row, options, td) {
                let cause = "unknown";
                let highFound = false;
                let medFound = false;

                if (row.LowPrefaultCurrentRatio != undefined) {
                    if (row.LowPrefaultCurrentRatio <= 0.1) {
                        highFound = true;
                        cause = "Break";
                    } else if (row.LowPrefaultCurrentRatio <= 0.5) {
                        medFound = true;
                        cause = "Break??";
                    }
                }
                if (row.LightningMilliseconds != undefined) {
                    if (row.LightningMilliseconds <= 2) {
                        if (highFound)
                            return cause + "?";
                        highFound = true;
                        cause = "Lightning";
                    } else if (!highFound && !medFound) {
                        medFound = true;
                        cause = "Lightning??";
                    }
                }
                if (row.TreeFaultResistance != undefined) {
                    if (row.TreeFaultResistance > 20) {
                        if (highFound)
                            return cause + "?";
                        highFound = true;
                        cause = "Tree";
                    } else if (row.TreeFaultResistance > 10 && !highFound && !medFound) {
                        medFound = true;
                        cause = "Tree??";
                    }
                }
                if (row.GroundCurrentRatio != undefined) {
                    if (row.GroundCurrentRatio <= 0.1) {
                        if (highFound)
                            return cause + "?";
                        highFound = true;
                        cause = "Slap/Debris";
                    } else if (row.GroundCurrentRatio <= 0.5 && !highFound && !medFound) {
                        medFound = true;
                        cause = "Slap/Debris??";
                    }
                }
                if (row.PrefaultThirdHarmonic != undefined) {
                    if (row.PrefaultThirdHarmonic > 0.3) {
                        if (highFound)
                            return cause + "?";
                        highFound = true;
                        cause = "Arrester";
                    } else if (row.PrefaultThirdHarmonic > 0.2 && !highFound && !medFound) {
                        medFound = true;
                        cause = "Arrester??";
                    }
                }
                if (row.InceptionDistanceFromPeak != undefined) {
                    if (row.InceptionDistanceFromPeak <= 15) {
                        if (highFound)
                            return cause + "?";
                        highFound = true;
                        cause = "Insulator";
                    } else if (row.InceptionDistanceFromPeak <= 30 && !highFound && !medFound) {
                        medFound = true;
                        cause = "Insulator??";
                    }
                }

                return cause;
            }});

        columns.push({ field: 'thecurrentdistance', headerText: 'Miles', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true });
        columns.push({ field: 'locationname', headerText: 'Location', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true });
        columns.push({ field: 'OpenSEE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSEEButton_html });

        if (includeFTT)
            columns.push({ field: 'ftt', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeFTTButton_html });

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

function openNoteModal(eventId) {
    $('#previousNotes').remove();

    $.get(homePath + 'api/PQDashboard/GetNotesForEvent?id=' + eventId, function (data) {
        $('#faultId').text(eventId);
        if (data.length > 0)
            $('#previousNotesDiv').append('<table id="previousNotes" class="table" ><tr><th style="width: 70%">Note</th><th style="width: 20%">Time</th><th style="width: 10%"></th></tr></table>')
        $.each(data, function (i, d) {
            $('#previousNotes').append('<tr id="row' + d.ID + '"><td id="note' + d.ID + '">' + d.Note + '</td><td>' + moment(d.TimeStamp).format("MM/DD/YYYY HH:mm:ss") + '</td><td><button onclick="editNote(' + d.ID + ')"><span class="glyphicon glyphicon-pencil" title="Edit this note.  Ensure you save after pushing this button or you will lose your note."></span></button><button onclick="removeNote(' + d.ID + ')"><span class="glyphicon glyphicon-remove" title="Remove this note"></span></button></td></tr>');
        });

        $('#note').val('');
        $('#notesModal').modal('show');
    });
}

function saveNote() {
    $.post(homePath + 'api/PQDashboard/SaveNoteForEvent', { id: $('#faultId').text(), note: $('#note').val(), userId: userName }, function () {
        openNoteModal($('#faultId').text())
    });
}

function removeNote(id) {
    $.post(homePath + 'api/PQDashboard/RemoveEventNote', { id: id, note: '', userId: userName });
    $('#row' +id).remove()
}

function editNote(id) {
    $('#note').val($('#note' + id).text());
    $.post(homePath + 'api/PQDashboard/RemoveEventNote', { id: id, note: '', userId: userName });
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


        fixNumbers(data, ['Expected', 'Received', 'Completeness']);

        $('#Detail' + currentTab + "Table").puidatatable({
            scrollable: true,
            scrollHeight: '100%',
            columns: [
                { field: 'thesite', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true },
                { field: 'Expected', headerText: 'Expected', headerStyle: 'width: 12%', bodyStyle: 'width: 12%; height: 20px', sortable: true },
                { field: 'Received', headerText: 'Received', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
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
                { field: 'Site', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterEventsByLine(' + row.MeterID +');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open in SEBrowser">' + row.Site + '</button>' } },
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
                { field: 'Site', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterExtensionsByLine(' + row.EventID + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.Site + '</button>' } },
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
                { field: 'Site', headerText: 'Name', headerStyle: 'width: 35%', bodyStyle: 'width: 35%; height: 20px', sortable: true, content: function (row) { return '<button class="btn btn-link" onClick="OpenWindowToMeterDisturbancesByLine(' + row.EventID + ');" text="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch Events List Page">' + row.Site + '</button>' } },
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
                                  function (row, options, td) {

                                      var title = "";
                                      var bgColor = "initial";

                                      if (row.dcoffset != 0) {
                                          title = "title='DC offset logic applied'";
                                          bgColor = "aqua";
                                      }

                                      var a = "<a href='" + xdaInstance + "/Workbench/Breaker.cshtml?EventID=" + row.theeventid + "' " + title + " style='background-color: " + bgColor + ";color: blue' target='_blank'>" + row.energized + "</a>";
                                      var svg = "";

                                      if (row.chatter != 0)
                                          svg = "<svg style='position: absolute; top: 0; right: 0' width='10' height='10'><path d='M0 0 L10 0 L10 10 Z' fill='red'><title>Status bit chatter detected</title></path></svg>";

                                      return a + svg;
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
                { headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px;text-align: center', content: function (row) { return '<button onclick="openNoteModal(' + row.theeventid + ')"><span class="glyphicon glyphicon-pencil" title="Add Notes."><span style="color: green; position: sticky; bottom: 0">' + (row.notecount > 0 ? '*' : '') +'</span></span></button>'; } }

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
    brush.clear();
    loadDataForDate();
}

function populateDivWithBarChart(thediv, siteID, thedatefrom, thedateto) {
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
    var context = (tabsForDigIn.indexOf(currentTab) < 0 ? "Custom": globalContext);

    $.post(homePath + "api/"+currentTab+"/BarChart", { siteID: siteID, targetDateFrom: thedatefrom, targetDateTo: thedateto, context: context}, function (data) {
        if (data !== null) {

            var graphData = { graphData: [], keys: [], colors: [] };

            var dates = $.map(data.Types[0].Data, function (d) { return d.m_Item1 });

            $.each(dates, function (i, date) {
                var obj = {};
                var total = 0;
                obj["Date"] = moment.utc(date)._d.getTime();
                $.each(data.Types, function (j, type) {
                    obj[type.Name] = type.Data[i].m_Item2;
                    total += type.Data[i].m_Item2;
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
        $.post(homePath + "api/Disturbances/MagDur", { meterIds: siteID, startDate: thedatefrom, endDate: thedateto, context: context }, function (data) {
            cache_MagDur_Data = data;
            buildMagDurChart(data, thediv + "MagDur")
        });
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

        // Step out and next and back buttons within bar chart
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
            //$(tooltip).addClass('hidden')

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
            brush.clear();
            manageTabsByDateForClicks(currentTab, thedate, thedate, filter);
            cache_Last_Date = thedate;
            updateUrlParams('contextDate', thedate);
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
        //cache_Sparkline_Data = null;
    }

    updateUrlParams('contextDate', contextfromdate);
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
        //cache_Sparkline_Data = null;
    }

    updateUrlParams('contextDate', contextfromdate);
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
function populateDivWithErrorBarChart(thediv, siteID, thedatefrom, thedateto) {
    $.post(homePath + 'api/TrendingData/ErrorBarChart', { siteID: siteID, colorScale: $('#contourColorScaleSelect').val(), targetDateFrom: thedatefrom, targetDateTo: thedateto}, function (data) {
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
            unloadMapMetricAnimation(false);
            var thedate = getFormattedDate($.plot.formatDate($.plot.dateGenerator(item.datapoint[0], { timezone: "utc" }), "%m/%d/%Y"));
            contextfromdate = thedate;
            contexttodate = thedate;
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

    $.get(homePath + 'api/PQDashboard/GetCurves',function (curves) {

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
            window.open(openSEEInstance + "?eventid=" + data.points[0].fullData.text[data.points[0].pointNumber] + "&faultcurves=1");
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
                DataType: "All",
                ColorScaleName: $('#contourColorScaleSelect').val(),
                UserName: userId,
                MeterIds: meterList.selectedIdsString()
            }
        };
    }

    if (currentTab != 'TrendingData') {
        $.post(homePath + 'api/'+currentTab +'/Location', { targetDateFrom: datefrom, targetDateTo: dateto, meterIds: meterList.selectedIdsString(), context: globalContext}, function (data) {
            cache_Map_Matrix_Data_Date_From = datefrom;
            cache_Map_Matrix_Data_Date_To = dateto;
            cache_Map_Matrix_Data = data;
            plotMapLocations(data, currentTab, datefrom, dateto);
            plotGridLocations(data, currentTab);

        });
    }
    else {
        $.post(homePath + 'api/TrendingData/Location', thedatasent.contourQuery, function (data) {
            cache_Map_Matrix_Data_Date_From = data.DateFrom;
            cache_Map_Matrix_Data_Date_To = data.DateTo;
            cache_Map_Matrix_Data = data;
            data.Data = data.Locations;
            plotMapLocations(data, currentTab, data.DateFrom, data.DateTo, string);
            plotGridLocations(data, currentTab);
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateGridMatrix(data, siteID, siteName, colors) {
    var matrixItemID = data.item;

    $(matrixItemID).empty();

    $(matrixItemID).unbind('click');

    $(matrixItemID)[0].title = siteName + " ";

    $(matrixItemID).append("<div style='font-size: 2em'><div class='faultgridtitle'>" + fitTextToWidth(siteName, $('.faultgridtitle').css('font'), $(matrixItemID).width() - 20) + "</div>");

    var theGridColor = getColorsForTab(data, colors);

    $(matrixItemID).css("background-color", theGridColor);

    if (parseInt(data.Count) > 0) {
        DrawGridSparklines(data, siteID, siteName, matrixItemID, colors);
    }

    $(matrixItemID).click(function (e) {

        var gridList = meterList.getListOfGrids();
        var thisselectedindex = gridList.findIndex(function (a) { return a.ID == siteID && a.Name == siteName });
        var selectedGrid = gridList[thisselectedindex];

        if (!e.shiftKey && !e.ctrlKey && selectedGrid.Type == 'AssetGroup') {
            $('#meterGroupSelect').val(selectedGrid.ID);
            $('#meterGroupSelect').trigger('change');
            return;
        }
        else if (!e.shiftKey && !e.ctrlKey ) {
            meterList.unselectAll()
        }


        $.each(gridList, function (i,item) {

            if (e.shiftKey) {

                if (thisselectedindex > lastselectedindex) {
                    if ((i >= lastselectedindex) && (i <= thisselectedindex)) {
                        if (item.Selected == false) meterList.setSelected( item, true);
                    } else {
                        if (item.Selected == true) meterList.setSelected(item, false);
                    }
                } else {
                    if ((i >= thisselectedindex) && (i <= lastselectedindex)) {
                        if (item.Selected == false) meterList.setSelected(item, true);
                    } else {
                        if (item.Selected == true) meterList.setSelected(item, false);
                    }
                }
            } else if (i == thisselectedindex) {
                if (e.ctrlKey)
                    meterList.setSelected(item, !item.Selected);
                else {
                    meterList.setSelected(item, true);
                    return (false);
                }
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

            selectsitesincharts();
        }

        $('#meterSelected').text(meterList.selectedCount());

    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function updateGridWithSelectedSites() {
    if (meterList == null) return;
    
    $('#theMap' + currentTab).find('.leafletCircle').addClass('circleButtonBlack');

    meterList.getListOfGrids().forEach(function (item) {
        var record = cache_Sparkline_Data.Data.find(function (a) { return a.ID == item.ID && a.Name == item.Name });
        var matrixItemID = record.item;
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

    var matrixItemID = data.item;

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

    var matrixItemID = data.item;

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

function plotGridLocations(locationdata, newTab) {
    /// Clear Matrix
    if ($("#theMatrix" + newTab)[0].childElementCount > 0) {
        $("#theMatrix" + newTab).empty();
    }
    var data = {};
    data.Colors = locationdata.Colors;
    data.Data = [];

    $.each(meterList.getListOfGrids(), function (index, value) {
        var item;
        if (value.Selected) {
            item = $("<div unselectable='on' class='matrix matrixButton noSelect'/>");
        }
        else {
            item = $("<div unselectable='on' class='matrix matrixButtonBlack noSelect'/>");
        }

        if (value.Type == 'AssetGroup') {
            var records = locationdata.Data.filter(function (a) { return value.SubID.indexOf(a.ID) >= 0 });
            var record = {
                ID: value.ID,
                Name: value.Name,
                Longitude: records.map(function (a) { return a.Longitude }).reduce(function (a, b) { return a + b }, 0) / records.length,
                Latitude: records.map(function (a) { return a.Latitude }).reduce(function (a, b) { return a + b }, 0) / records.length,
                item: item
            };

            var keys = Object.keys(locationdata.Data[0]).filter(function (a) { return a != "ID" && a != "Name" && a != "Longitude" && a != "Latitude" && a != "item" });
            $.each(keys, function (i, k) {
                record[k] = records.map(function (a) { return a[k] }).reduce(function (a, b) { return a + b }, 0);
            });
            data.Data.push(record);
        }
        else {
            var record = locationdata.Data.find(function (a) { return a.ID == value.ID});
            if (record == null) {
                record = cache_Sparkline_Data.Data.find(function (a) { return a.ID == value.ID && a.Name == value.Name});
            }
            record.item = item;
            data.Data.push(record);

        }

        item.data('gridstatus', value.Event_Count);
        item.data('siteid', value.name + "|" + value.ID);
        $("#theMatrix" + newTab).append(item);

    });

    /// Set Matrix Cell size
    cache_Sparkline_Data = data;
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


        $.each(locationdata.Data, function (index, data) {
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

                $.each(meterList.Meters, function (i, item) {
                    if (item.ID == data.ID) {
                        item.Selected = true;
                    }

                });

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
        }

        var timeoutVal;
        leafletMap[currentTab].off('boxzoomend');
        leafletMap[currentTab].on('boxzoomend', function (event) {
            meterList.unselectAll()
            $('#theMap' + currentTab).find('.leafletCircle').addClass('circleButtonBlack');

            $.each(locationdata.Data, function (index, data) {
                if (data.Latitude >= event.boxZoomBounds._southWest.lat && data.Latitude <= event.boxZoomBounds._northEast.lat
                    && data.Longitude >= event.boxZoomBounds._southWest.lng && data.Longitude <= event.boxZoomBounds._northEast.lng) {
                    
                    $.each(meterList.Meters, function (_, item) {
                        if (item.ID == data.ID) {
                            item.Selected = true;
                        }

                    });
                    
                    $('#theMap' + currentTab).find('.leafletCircle').children('[id*=' + data.Name.replace(/[^A-Za-z0-9]/g, '') + ']').parent().removeClass('circleButtonBlack')
                }
            });

            $('#meterSelected').text(meterList.selectedCount());

            clearTimeout(timeoutVal);
            timeoutVal = setTimeout(function () {
                selectsitesincharts();
            }, 500);

        });


    //}
    showSiteSet($('#selectSiteSet' + currentTab)[0]);

    var timeRange = getContextTimeRange();
    queryAndPlotMapMetrics(timeRange.Start, timeRange.End);
};

/////////////////////////////////////////////////////////////////////////////////////////////////
function getColorsForTab(dataPoint, colors) {
    var color = '#000000';

    if (currentTab === "TrendingData") {
        var isBlack =
            dataPoint.Average === null &&
            dataPoint.Maximum === null &&
            dataPoint.Minimum === null;

        color = isBlack ? "#000000" : "rgb(0, 255, 0)";
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
        else if (dataPoint.RecloseIntoFault > 0)
            color = colors["Fault"];
        else if (dataPoint.Interruption > 0)
            color = colors["Interruption"];
        else if (dataPoint.BreakerOpen > 0)
            color = colors["BreakerOpen"];
        else if (dataPoint.Sag > 0)
            color = colors["Sag"];
        else if (dataPoint.Swell > 0)
            color = colors["Swell"];
        else if (dataPoint.Transient > 0)
            color = colors["Transient"];
        else if (dataPoint.Snapshot > 0)
            color = colors["Snapshot"];
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
var mapMetricData = {};
var mapMetricRanges = {};
var updateMapMetricSizeRange = true;
var updateMapMetricColorRange = true;
var mapMetricAnimationLoaded = false;

function queryAndPlotMapMetrics(thedatefrom, thedateto) {
    if (currentTab === "TrendingData" && globalContext === "day")
        $(".animationControl").show();
    else
        unloadMapMetricAnimation(true);

    var tab = $("#tabs-" + currentTab);
    var sizeMetricType = tab.find(".mapMetricSizeType").val();
    var colorMetricType = tab.find(".mapMetricColorType").val();

    var query = {
        meterIDs: meterList.selectedIds(),
        startTime: thedatefrom,
        endTime: thedateto,
        sizeMetricType: sizeMetricType,
        colorMetricType: colorMetricType
    };

    $.ajax({
        type: "POST",
        url: homePath + 'api/PQDashboard/GetMapMetrics',
        data: JSON.stringify(query),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            mapMetricData = data;

            if (updateMapMetricSizeRange) {
                mapMetricRanges.Largest = data.Largest;
                mapMetricRanges.Smallest = data.Smallest;
            }

            if (updateMapMetricColorRange) {
                mapMetricRanges.Red = data.Red;
                mapMetricRanges.Green = data.Green;
            }

            updateMapMetrics(data.MapMetrics, mapMetricRanges);
            updateMapLegend(mapMetricRanges);
        },
        failure: function (msg) {
            console.error.log(msg);
        },
        global: false,
        async: true
    });
}

function updateMapMetrics(mapMetrics, mapMetricRanges) {
    var id = "CircleLayer";
    var map = leafletMap[currentTab];

    map.eachLayer(function (layer) {
        if (layer.options.id && layer.options.id === id)
            map.removeLayer(layer);
    });

    var mapMatrix = $("#MapMatrix" + currentTab);
    var width = mapMatrix.width();
    var height = mapMatrix.height();

    var minRadius = 10;
    var maxRadius = Math.min(width, height) / 20;

    var radiusFactory = d3.scaleLinear()
        .domain([mapMetricRanges.Smallest, mapMetricRanges.Largest])
        .range([minRadius, maxRadius])
        .clamp(true);

    var hueFactory = d3.scaleLinear()
        .domain([mapMetricRanges.Green, mapMetricRanges.Red])
        .range([120, 0])
        .clamp(true);

    $.each(mapMetrics, function (_, metric) {
        if (metric.SizeValue === null)
            return;

        var lat = metric.Latitude;
        var lng = metric.Longitude;
        var radius = radiusFactory(metric.SizeValue);
        var color = "gray";

        if (metric.ColorValue !== null) {
            var hue = hueFactory(metric.ColorValue);
            color = "hsl(" + hue + ", 80%, 50%)";
        }

        var options = {
            id: id,
            radius: radius,
            stroke: false,
            fillColor: color,
            fillOpacity: 0.5,
            interactive: false
        };

        var circle = L.circleMarker([lat, lng], options);
        circle.addTo(map);
    });
}

function updateMapLegend(mapMetricRanges) {
    var tab = $("#tabs-" + currentTab);
    var largestInput = tab.find(".mapMetricLargest");
    var smallestInput = tab.find(".mapMetricSmallest");
    largestInput.val(mapMetricRanges.Largest);
    smallestInput.val(mapMetricRanges.Smallest);

    var redInput = tab.find(".mapMetricRed");
    var greenInput = tab.find(".mapMetricGreen");
    redInput.val(mapMetricRanges.Red);
    greenInput.val(mapMetricRanges.Green);
}

function mapMetricTypeChanged(source) {
    var element = $(source);

    if (element.hasClass("mapMetricSizeType"))
        updateMapMetricSizeRange = true;

    if (element.hasClass("mapMetricColorType"))
        updateMapMetricColorRange = true;

    var timeRange = getContextTimeRange();
    queryAndPlotMapMetrics(timeRange.Start, timeRange.End);
}

function mapMetricRangeChanged(source) {
    var element = $(source);
    var value = Number(element.val());

    if (isNaN(value))
        return;

    if (element.hasClass("mapMetricLargest")) {
        mapMetricRanges.Largest = value;
        updateMapMetricSizeRange = false;
    }

    if (element.hasClass("mapMetricSmallest")) {
        mapMetricRanges.Smallest = value;
        updateMapMetricSizeRange = false;
    }

    if (element.hasClass("mapMetricRed")) {
        mapMetricRanges.Red = value;
        updateMapMetricColorRange = false;
    }

    if (element.hasClass("mapMetricGreen")) {
        mapMetricRanges.Green = value;
        updateMapMetricColorRange = false;
    }

    updateMapMetrics(mapMetricData.MapMetrics, mapMetricRanges);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ManageLocationClick(siteID) {
    var thedatefrom;
    var thedateto;

    if (currentTab == "TrendingData") {
        thedatefrom = moment($('#dateRange').data('daterangepicker').startDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        thedateto = moment($('#dateRange').data('daterangepicker').endDate._d.toISOString()).utc().format('YYYY-MM-DD') + "T00:00:00Z";
        populateDivWithErrorBarChart('getTrendingDataForPeriod', 'Overview' + currentTab, siteID, thedatefrom, thedateto);
        return;
    }

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

    populateDivWithBarChart('Overview' + currentTab, siteID, thedatefrom, thedateto);
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
        getTableDivData(meterList.selectedIdsString(), tableDate);
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
        populateDivWithErrorBarChart('Overview' + currentTab, meterList.selectedIdsString(), thedatefrom, thedateto)
    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, "undefined");
}

function manageTabsByDateForClicks(theNewTab, thedatefrom, thedateto, filter) {
    if ((thedatefrom == "") || (thedateto == "")) return;
    var tabsForDigIn = ['Events', 'Disturbances', 'Faults', 'Breakers', 'Extensions'];
    
    if (tabsForDigIn.indexOf(theNewTab) >= 0 || globalContext == "custom")
        setGlobalContext(true);

    currentTab = theNewTab;

    setMapHeaderDate(thedatefrom, thedateto);

    getTableDivData(meterList.selectedIdsString(), thedatefrom);
    if(tabsForDigIn.indexOf(currentTab) >= 0 && globalContext != 'second')
        populateDivWithBarChart('Overview' + currentTab, meterList.selectedIdsString(), thedatefrom, thedateto);
    getLocationsAndPopulateMapAndMatrix(theNewTab, thedatefrom, thedateto, filter);

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

    theparent.css("height", chartheight);

    var firstChild = $("#" + theparent[0].firstElementChild.id);

    firstChild.css("height", chartheight - 100);
    if (currentTab === "TrendingData") {
        if ($('#Overview' + currentTab).children().length > 0 && cache_ErrorBar_Data !== null)
            buildErrorBarChart(cache_ErrorBar_Data, 'Overview' + currentTab, meterList.selectedIdsString(), thedatefrom, thedateto);
    }
    else {
        if ($('#Overview' + currentTab).children().length > 0 && cache_Graph_Data !== null)
            buildBarChart(cache_Graph_Data, 'Overview' + currentTab, meterList.selectedIdsString(), barDateFrom, barDateTo);
    }

    if($('#Detail' + currentTab + 'Table').children().length > 0 && cache_Table_Data !== null)
        window["populate" + currentTab + "DivWithGrid"](cache_Table_Data);    
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizeMapAndMatrix(newTab) {
    var columnheight = $(window).height() - $('#tabs-' + newTab).offset().top - 25;

    if (document.getElementById("mapEventsGrid").selectedIndex === 1)
        $("#theMatrix" + newTab).css("height", columnheight);
    else
        $("#theMap" + newTab).css("height", columnheight);

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
          $.each(cache_Sparkline_Data.Data, (function (key, value) {
              populateGridMatrix(value, value.ID, value.Name, cache_Sparkline_Data.Colors);
          }));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializeDatePickers(datafromdate , datatodate) {

    dateRangeOptions.startDate = moment(datafromdate).utc();
    dateRangeOptions.endDate = moment(datatodate).utc();

    $('#dateRange').daterangepicker(dateRangeOptions, function (start, end, label) {
        updateUrlParams('startDate', start.format('MM/DD/YYYY'));
        updateUrlParams('endDate', end.format('MM/DD/YYYY'));

        $('#dateRangeSpan').html(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
        
        // Move global context back to custom range
        for (var i = 0; i < 5; ++i)
            setGlobalContext(false);

        loadDataForDate();
    });

    $('#dateRangeSpan').html(dateRangeOptions.startDate.format('MM/DD/YYYY') + ' - ' + dateRangeOptions.endDate.format('MM/DD/YYYY'));

}

function moveDateBackward() {
    var dateRangePicker = $("#dateRange").data("daterangepicker");
    var startDate = dateRangePicker.startDate.clone();
    var endDate = dateRangePicker.endDate.clone().startOf("day").add(1, "days");
    var duration = moment.duration(endDate.diff(startDate));

    // Move global context back to custom range
    for (var i = 0; i < 5; ++i)
        setGlobalContext(false);

    var newEndExclusive = dateRangePicker.startDate;
    var newStartDate = newEndExclusive.clone().subtract(duration.asDays(), "days");
    var newEndDate = newEndExclusive.clone().subtract(1, "days").endOf("day");
    dateRangePicker.setStartDate(newStartDate);
    dateRangePicker.setEndDate(newEndDate);

    var formattedStartDate = dateRangePicker.startDate.format('MM/DD/YYYY');
    var formattedEndDate = dateRangePicker.endDate.format('MM/DD/YYYY');
    updateUrlParams('startDate', formattedStartDate);
    updateUrlParams('endDate', formattedEndDate);

    $('#dateRangeSpan').html(formattedStartDate + ' - ' + formattedEndDate);
    dateRangePicker.chosenLabel = 'Custom Range';
    loadDataForDate();
}

function moveDateForward() {
    var dateRangePicker = $("#dateRange").data("daterangepicker");
    var startDate = dateRangePicker.startDate.clone().startOf("day");
    var endDate = dateRangePicker.endDate.clone().startOf("day").add(1, "days");
    var duration = moment.duration(endDate.diff(startDate));

    // Move global context back to custom range
    for (var i = 0; i < 5; ++i)
        setGlobalContext(false);

    var newStartInclusive = dateRangePicker.endDate.clone().startOf("day").add(1, "days");
    var newStartDate = newStartInclusive.clone();
    var newEndDate = newStartInclusive.clone().add(duration.asDays() - 1, "days").endOf("day");
    dateRangePicker.setStartDate(newStartDate);
    dateRangePicker.setEndDate(newEndDate);

    var formattedStartDate = dateRangePicker.startDate.format('MM/DD/YYYY');
    var formattedEndDate = dateRangePicker.endDate.format('MM/DD/YYYY');
    updateUrlParams('startDate', formattedStartDate);
    updateUrlParams('endDate', formattedEndDate);

    $('#dateRangeSpan').html(formattedStartDate + ' - ' + formattedEndDate);
    dateRangePicker.chosenLabel = 'Custom Range';
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

function getMeters(meterGroup) {

    updateUrlParams('assetGroup', meterGroup);

    $.post(homePath + 'api/PQDashboard/GetMeters', { deviceFilter: meterGroup, userName: userId }, function (data) {

        data.Meters.sort(function (a, b) {
            if (a.Name.toLowerCase() < b.Name.toLowerCase()) return -1;
            if (a.Name.toLowerCase() > b.Name.toLowerCase()) return 1;
            return 0;
        });

        data.AssetGroups.sort(function (a, b) {
            if (a.Name.toLowerCase() < b.Name.toLowerCase()) return -1;
            if (a.Name.toLowerCase() > b.Name.toLowerCase()) return 1;
            return 0;
        });


        meterList = new MeterListClass(data.Meters, data.AssetGroups, data.ParentAssetGroupID);

        if (meterList.ParentID != null)
            $('.gridStepOut').show();
        else
            $('.gridStepOut').hide();

        $('#meterSelected').text(meterList.selectedCount());
        $('#meterCount').text(meterList.count());
        $(window).trigger("meterSelectUpdated");
    }).fail(function (msg) {
        alert(msg);
    })
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectMeterGroup(thecontrol) {
    mg = $('#meterGroupSelect').val();

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
    else {
        cache_Graph_Data = null;
        cache_ErrorBar_Data = null;
        //cache_Sparkline_Data = null;
        var mapormatrix = $("#map" + currentTab + "Grid")[0].value;
        $(window).one("meterSelectUpdated", function () {
            manageTabsByDate(newTab, contextfromdate, contexttodate);
        });

    }


}


//////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    buildPage();
});

//////////////////////////////////////////////////////////////////////////////////////////////

function buildPage() {

    $(document).bind('contextmenu', function (e) { return false; });

    $.blockUI({ css: { border: '0px' } });

    $(document).ajaxStart(function () {
        timeout = setTimeout(function () {
            $.blockUI({ message: '<div unselectable="on" class="wait_container"><img alt="" src="' + homePath + 'Images/ajax-loader.gif" /><br><div unselectable="on" class="wait">Please Wait. Loading...</div></div>' });
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

            resizeMapAndMatrix(newTab);
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
        icon.closest(".portlet").find(".portlet-content").slideToggle(function () { 0, resizeMapAndMatrix(currentTab); });
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

    $("#application-tabs").tabs({
        heightStyle: "100%",
        widthStyle: "99%",
        activate: function (event, ui) {
            var newTab = ui.newTab.attr('li', "innerHTML")[0].getElementsByTagName("a")[0].innerHTML;
            if(newTab === "Event Search") {
                window.open(seBrowserInstance.replace(/\/$/, "") + "/EventSearch");

                $("#application-tabs").tabs("option", "active", ($('#application-tabs li a').map(function (i, a) { return $(a).text().toLowerCase(); }).get()).indexOf(currentTab.toLowerCase()));
                return;
            }

            currentTab = newTab.replace(/\s/g, "");
            
            if (newTab.indexOf("Overview") > -1) {
                $('#headerStrip').hide();
                showOverviewPage(currentTab);
            }
            else {             
                cache_Graph_Data = null;
                cache_ErrorBar_Data = null;
                //cache_Sparkline_Data = null;
                var mapormatrix = $("#map" + currentTab + "Grid")[0].value;
                $('#headerStrip').show();
                $(".mapGrid").val(mapormatrix);
                selectmapgrid($("#map" + currentTab + "Grid")[0]);
                loadDataForDate();
                updateUrlParams('tab', currentTab);
            }
        }
    });

    currentTab = (urlParams.get('tab') != null ? urlParams.get('tab') : defaultView.Tab);
    globalContext = (urlParams.get('context') != null ? urlParams.get('context') : "custom");
    var assetGroup = (urlParams.get('assetGroup') != null ? urlParams.get('assetGroup') : mg.toString());
    $("#meterGroupSelect").val(assetGroup);

    if (urlParams.get('startDate') != null) {
        datafromdate = urlParams.get('startDate');
        datatodate = urlParams.get('endDate');
    }
    else if (defaultView.DateRange < 0) {
        datafromdate = moment(defaultView.FromDate).utc().format('MM/DD/YYYY');
        datatodate = moment(defaultView.ToDate).utc().format('MM/DD/YYYY');
    }
    else {
        datafromdate = moment(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[defaultView.DateRange]][0]).utc().format('MM/DD/YYYY');
        datatodate = moment(dateRangeOptions.ranges[Object.keys(dateRangeOptions.ranges)[defaultView.DateRange]][1]).utc().format('MM/DD/YYYY');
    }

    var contextDate = urlParams.get('contextDate');
    if (globalContext == "custom") {
        contextfromdate = datafromdate;
        contexttodate = datatodate;
    }
    else if (contextDate == null) {
        globalContext = "custom"
        contextfromdate = datafromdate;
        contexttodate = datatodate;

    }
    else if (globalContext == "day") {
        contextfromdate = moment(contextDate).utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextDate).utc().endOf('day').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "hour") {
        contextfromdate = moment(contextDate).utc().startOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextDate).utc().endOf('hour').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "minute") {
        contextfromdate = moment(contextDate).utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextDate).utc().endOf('minute').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else if (globalContext == "second") {
        contextfromdate = moment(contextDate).utc().startOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
        contexttodate = moment(contextDate).utc().endOf('second').format('YYYY-MM-DDTHH:mm:ss') + "Z";
    }
    else {
        contextfromdate = moment(contextDate).utc();
        contexttodate = moment(contextDate).utc();
    }



    initializeDatePickers(datafromdate, datatodate);
    initiateTimeRangeSlider();
    initiateColorScale();
    getMeters(assetGroup);

    if (currentTab.indexOf("Overview") > -1) {
        $('#headerStrip').hide();
        showOverviewPage(currentTab);

    }
    else if (currentTab === "Event Search") {

    }
    else {
        $(".mapGrid").val(defaultView.MapGrid);
        $('#headerStrip').show();

        $(window).one("meterSelectUpdated", function () {
            var tabSearchText = "tabs" + currentTab;

            var tabIndex = $("#application-tabs li")
                .map(function (_, a) { return $(a).attr("id").toLowerCase(); })
                .get()
                .indexOf(tabSearchText.toLowerCase());

            $("#application-tabs").tabs("option", "active", tabIndex);
            selectmapgrid($("#map" + currentTab + "Grid")[0]);
            resizeMapAndMatrix(currentTab);
        });
    }

}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadLeafletMap(theDiv) {
    function addAnimationControl() {
        var animationControl = L.control({ position: 'bottomleft' });

        animationControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info animationControl');
            
            div.innerHTML =
                '<div id="AnimationControlTrending">' +
                    '<div class="row" style="width: 100%; margin: auto">' +
                        '<div class="" style="float: left; margin-right: 4px;">' +
                            '<table>' +
                                '<tr>' +
                                    '<td colspan="1">Size Metric</td>' +
                                    '<td colspan="1">' +
                                        '<select class="animationSizeMetricType form-control" style="width: 100%">' +
                                            '<option value="MaximumVoltageRMS">Maximum Voltage RMS</option>' +
                                            '<option value="MinimumVoltageRMS">Minimum Voltage RMS</option>' +
                                            '<option value="AverageVoltageRMS" selected>Average Voltage RMS</option>' +
                                            '<option value="MaximumVoltageTHD">Maximum Voltage THD</option>' +
                                            '<option value="MinimumVoltageTHD">Minimum Voltage THD</option>' +
                                            '<option value="AverageVoltageTHD">Average Voltage THD</option>' +
                                            '<option value="MaximumShortTermFlicker">Maximum Short Term Flicker</option>' +
                                            '<option value="MinimumShortTermFlicker">Minimum Short Term Flicker</option>' +
                                            '<option value="AverageShortTermFlicker">Average Short Term Flicker</option>' +
                                        '</select>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td colspan="1">Color Metric</td>' +
                                    '<td colspan="1">' +
                                        '<select class="animationColorMetricType form-control" style="width: 100%">' +
                                            '<option value="MaximumVoltageRMS">Maximum Voltage RMS</option>' +
                                            '<option value="MinimumVoltageRMS">Minimum Voltage RMS</option>' +
                                            '<option value="AverageVoltageRMS" selected>Average Voltage RMS</option>' +
                                            '<option value="MaximumVoltageTHD">Maximum Voltage THD</option>' +
                                            '<option value="MinimumVoltageTHD">Minimum Voltage THD</option>' +
                                            '<option value="AverageVoltageTHD">Average Voltage THD</option>' +
                                            '<option value="MaximumShortTermFlicker">Maximum Short Term Flicker</option>' +
                                            '<option value="MinimumShortTermFlicker">Minimum Short Term Flicker</option>' +
                                            '<option value="AverageShortTermFlicker">Average Short Term Flicker</option>' +
                                        '</select>' +
                                    '</td>' +
                                '</tr>' +
                                '<tr><td colspan="2">' +
                                    '<select class="form-control" id="animationStepSelect" onchange="stepSelectionChange(this);">' +
                                        '<option value="60">60 min</option>' +
                                        '<option value="30">30 min</option>' +
                                        '<option value="20">20 min</option>' +
                                        '<option selected="selected" value="15">15 min</option>' +
                                        '<option value="10">10 min</option>' +
                                        '<option value="5">5 min</option>' +
                                        '<option value="1">1 min</option>' +
                                    '</select>' +
                                '</td></tr>' +
                                '<tr><td colspan="2">' +
                                    '<div id="time-range">' +
                                        '<div class="sliders_step1">' +
                                            '&nbsp;<div class="slider-range"></div> ' +
                                        '</div>' +
                                        '<p><span class="slider-time">12:00 AM</span> - <span class="slider-time2">12:00 AM</span></p>' +
                                    '</div>' +
                                '</td></tr>' +
                                '<tr><td colspan="2">' +
                                    '<button class="btn btn-default form-control" onclick="loadMapMetricAnimation()">Load Data</button>' +
                                '</td></tr>' +
                            '</table>' +
                        '</div>' +
                        '<div class="" id="progressBar" style="float: left; margin-left: 40px; display: none">' +
                            '<table style="width: 100%">' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td><span id="progressDate"></span></td></tr>' +
                                '<tr><td style="width: 100%">' +
                                        '<progress id="animationProgressBar" style ="width: 100%" value="0" max ="100"></progress>' +
                                '</td></tr>' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td>&nbsp;</td></tr>' +
                                '<tr><td style="width: 100%; text-align: center">' +
                                            '<div class="player text-center" id="animationPlayerButtons">' +
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

        animationControl.addTo(leafletMap[currentTab]);
        initiateTimeRangeSlider();

        $('.animationControl').hide();
        animationControl.getContainer().addEventListener('mouseover', function () {
            leafletMap[currentTab].dragging.disable();
            leafletMap[currentTab].doubleClickZoom.disable();
            leafletMap[currentTab].touchZoom.disable();
            leafletMap[currentTab].scrollWheelZoom.disable();
            leafletMap[currentTab].boxZoom.disable();
            leafletMap[currentTab].keyboard.disable();
        });

        animationControl.getContainer().addEventListener('mouseout', function () {
            leafletMap[currentTab].dragging.enable();
            leafletMap[currentTab].doubleClickZoom.enable();
            leafletMap[currentTab].touchZoom.enable();
            leafletMap[currentTab].scrollWheelZoom.enable();
            leafletMap[currentTab].boxZoom.enable();
            leafletMap[currentTab].keyboard.enable();
        });
    }

    if (leafletMap[currentTab] === null) {
        leafletMap[currentTab] = L.map(theDiv, {
            center: [35.0456, -85.3097],
            zoom: 6,
            maxZoom: arcGis.BaseLayer.length == 0 ? 15 : 20,
            zoomControl: false,
            attributionControl: false
        });

        var mapLink =
            '<a href="https://openstreetmap.org">OpenStreetMap</a>';

        if (arcGis.BaseLayer.length == 0)
            L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            }).addTo(leafletMap[currentTab]);
        else
            L.tileLayer(
                arcGis.BaseLayer, {
            }).addTo(leafletMap[currentTab]);


        var customLayer = L.geoJson(null, {
            style: function (feature) {
                // my custom filter function
                return {
                    color: '#' + feature.properties.stroke,
                    weight: feature.properties['stroke-width'],
                    opacity: feature.properties['stroke-opacity'],
                    'fill-color': '#' + feature.properties.stroke
                };
            },
            onEachFeature: function (feature, layer) {
                var popupContent = feature.properties.name + ":<br>" + feature.properties.description;

                layer.bindPopup(popupContent);
            }
        });

        if (kmlData != null) {
            loadDoc("/KML/" + kmlData.Value, function (data) {
                if (data == null) return;

                if ($(data.responseXML.getElementsByTagName('description')[0]).contents().text()) {
                    var legend = L.control({ position: 'topright' });

                    legend.onAdd = function (map) {

                        var div = L.DomUtil.create('div', 'info legend');

                        div.innerHTML = $(data.responseXML.getElementsByTagName('description')[0]).contents().text();

                        return div;
                    };

                    legend.addTo(leafletMap[currentTab]);
                }
                var myLayer = omnivore.kml.parse(data.responseText, null, customLayer).on('ready', function (data) { console.log(data) });
                leafletMap[currentTab].addLayer(myLayer);

            });
        }

        if (currentTab === "TrendingData")
            addAnimationControl();

        addEsriLayers();
        addMapLegend();
    }
}

function addEsriLayers() {
    if (arcGis.BaseUri == "") return;

    const baseURI = new URL("/arcgis/rest/services/" + arcGis.Folder + "/" + arcGis.ServiceName + "/MapServer", arcGis.BaseUri).toString();

    $.getJSON(baseURI + "/layers?f=pjson&callback=?",
        function (layerData) {
            const layerIDs = JSON.parse(`[${arcGis.ServiceLayers}]`);
            let gisLayers = {};
            $.each(layerData.layers, function (index, layer) {
                // If servicelayers are specified, then don't add non-specified layers to map
                if (arcGis.ServiceLayers == '' || layerIDs.findIndex(function (id) { return id === layer.id; }) >= 0)
                    gisLayers[layer.name] = L.esri.dynamicMapLayer({ url: baseURI, layers: [layer.id] });
            });
            L.control.layers(null, gisLayers).addTo(leafletMap[currentTab]);
        }
    );
}

function addMapLegend() {
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var selectedMetric = "EventCount";

        if (currentTab === "Disturbances")
            selectedMetric = "SagMinimum";

        var trendingTabs = [
            "Trending",
            "TrendingData",
            "Completeness",
            "Correctness"
        ];

        if (trendingTabs.indexOf(currentTab) >= 0)
            selectedMetric = "AverageVoltageRMS";

        function selectedState(metric) {
            if (metric === selectedMetric)
                return "selected";
        }

        // Inserting whitespace between any of these three
        // divs would unintentionally add horizontal space,
        // causing the renderer to word-wrap them
        // instead of placing them side-by-side
        var circleSizeDiv =
            "<div style='width: calc(50% - 5px); display: inline-block'>" +
            "    <div class='row'>" +
            "        <select class='mapMetricSizeType smallbutton' style='width: 100%' onchange='mapMetricTypeChanged(this)'>" +
            "            <option value='EventCount' " + selectedState("EventCount") + ">Event Count</option>" +
            "            <option value='SagCount' " + selectedState("SagCount") + ">Sag Count</option>" +
            "            <option value='SwellCount' " + selectedState("SwellCount") + ">Swell Count</option>" +
            "            <option value='InterruptionCount' " + selectedState("InterruptionCount") + ">Interruption Count</option>" +
            "            <option value='SagMinimum' " + selectedState("SagMinimum") + ">Sag Minimum</option>" +
            "            <option value='SwellMaximum' " + selectedState("SwellMaximum") + ">Swell Maximum</option>" +
            "            <option value='MaximumVoltageRMS' " + selectedState("MaximumVoltageRMS") + ">Maximum Voltage RMS</option>" +
            "            <option value='MinimumVoltageRMS' " + selectedState("MinimumVoltageRMS") + ">Minimum Voltage RMS</option>" +
            "            <option value='AverageVoltageRMS' " + selectedState("AverageVoltageRMS") + ">Average Voltage RMS</option>" +
            "            <option value='MaximumVoltageTHD' " + selectedState("MaximumVoltageTHD") + ">Maximum Voltage THD</option>" +
            "            <option value='MinimumVoltageTHD' " + selectedState("MinimumVoltageTHD") + ">Minimum Voltage THD</option>" +
            "            <option value='AverageVoltageTHD' " + selectedState("AverageVoltageTHD") + ">Average Voltage THD</option>" +
            "            <option value='MaximumShortTermFlicker' " + selectedState("MaximumShortTermFlicker") + ">Maximum Short Term Flicker</option>" +
            "            <option value='MinimumShortTermFlicker' " + selectedState("MinimumShortTermFlicker") + ">Minimum Short Term Flicker</option>" +
            "            <option value='AverageShortTermFlicker' " + selectedState("AverageShortTermFlicker") + ">Average Short Term Flicker</option>" +
            "        </select>" +
            "    </div>" +
            "    <div class='row'><input class='mapMetricLargest' type='textbox' style='width: 100%' onchange='mapMetricRangeChanged(this)'></div>" +
            "    <div class='row'>" +
            "        <svg width='10' height='40' style='margin: 3px 10px; display: block'>" +
            "            <circle class='mapLegendCircle' cx='5' cy='5' r='5' />" +
            "            <circle class='mapLegendCircle' cx='5' cy='15' r='4' />" +
            "            <circle class='mapLegendCircle' cx='5' cy='25' r='3' />" +
            "            <circle class='mapLegendCircle' cx='5' cy='35' r='2' />" +
            "        </svg>" +
            "    </div>" +
            "    <div class='row'><input class='mapMetricSmallest' type='textbox' style='width: 100%' onchange='mapMetricRangeChanged(this)'></div>" +
            "</div>";

        var circleSpacerDiv =
            "<div style='width: 10px; display: inline-block'></div>";

        var circleColorDiv =
            "<div style='width: calc(50% - 5px); display: inline-block'>" +
            "    <div class='row'>" +
            "        <select class='mapMetricColorType smallbutton' style='width: 100%' onchange='mapMetricTypeChanged(this)'>" +
            "            <option value='EventCount' " + selectedState("EventCount") + ">Event Count</option>" +
            "            <option value='SagCount' " + selectedState("SagCount") + ">Sag Count</option>" +
            "            <option value='SwellCount' " + selectedState("SwellCount") + ">Swell Count</option>" +
            "            <option value='InterruptionCount' " + selectedState("InterruptionCount") + ">Interruption Count</option>" +
            "            <option value='SagMinimum' " + selectedState("SagMinimum") + ">Sag Minimum</option>" +
            "            <option value='SwellMaximum' " + selectedState("SwellMaximum") + ">Swell Maximum</option>" +
            "            <option value='MaximumVoltageRMS' " + selectedState("MaximumVoltageRMS") + ">Maximum Voltage RMS</option>" +
            "            <option value='MinimumVoltageRMS' " + selectedState("MinimumVoltageRMS") + ">Minimum Voltage RMS</option>" +
            "            <option value='AverageVoltageRMS' " + selectedState("AverageVoltageRMS") + ">Average Voltage RMS</option>" +
            "            <option value='MaximumVoltageTHD' " + selectedState("MaximumVoltageTHD") + ">Maximum Voltage THD</option>" +
            "            <option value='MinimumVoltageTHD' " + selectedState("MinimumVoltageTHD") + ">Minimum Voltage THD</option>" +
            "            <option value='AverageVoltageTHD' " + selectedState("AverageVoltageTHD") + ">Average Voltage THD</option>" +
            "            <option value='MaximumVoltageShortTermFlicker' " + selectedState("MaximumVoltageShortTermFlicker") + ">Maximum Short Term Flicker</option>" +
            "            <option value='MinimumVoltageShortTermFlicker' " + selectedState("MinimumVoltageShortTermFlicker") + ">Minimum Short Term Flicker</option>" +
            "            <option value='AverageVoltageShortTermFlicker' " + selectedState("AverageVoltageShortTermFlicker") + ">Average Short Term Flicker</option>" +
            "        </select>" +
            "    </div>" +
            "    <div class='row'><input class='mapMetricRed' type='textbox' style='width: 100%' onchange='mapMetricRangeChanged(this)'></div>" +
            "    <div class='row'><div style='width: 10px; height: 40px; margin: 3px 10px; background: linear-gradient(red, yellow, green)'></div></div>" +
            "    <div class='row'><input class='mapMetricGreen' type='textbox' style='width: 100%' onchange='mapMetricRangeChanged(this)'></div>" +
            "</div>";

        var innerLegendID = currentTab + "-innerLegend";

        div.innerHTML +=
            "<h4><button class='btn btn-link' style='padding: 0;' data-toggle='collapse' data-target='#" + innerLegendID + "'><u>Legend</u></button></h4>" +
            "<div id='" + innerLegendID + "' class='collapse'>" + circleSizeDiv + circleSpacerDiv + circleColorDiv + "</div>";

        return div;
    };

    legend.addTo(leafletMap[currentTab]);

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

function loadDoc(file, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
        }
    };
    xhttp.open("GET", file, true);
    xhttp.send();
}

function showType(thecontrol) {
    plotMapLocations(cache_Map_Matrix_Data, currentTab, cache_Map_Matrix_Data_Date_From, cache_Map_Matrix_Data_Date_To);
}

function initiateTimeRangeSlider() {
    $("#tabs-TrendingData .slider-range").slider({
        range: true,
        min: 0,
        max: 1440,
        step: 15,
        values: [0, 1440],
        slide: function (e, ui) {
            var startTime = moment.utc(0).add(ui.values[0], "minutes").format("hh:mm A");
            var endTime = moment.utc(0).add(ui.values[1], "minutes").format("hh:mm A");
            $("#tabs-TrendingData .slider-time").html(startTime);
            $("#tabs-TrendingData .slider-time2").html(endTime);
        }
    });
}

function loadMapMetricAnimation() {
    var timeRange = getContextTimeRange();
    var animationDate = moment.utc(timeRange.Start).startOf("day");

    var slider = $("#tabs-TrendingData .slider-range");
    var sliderTimeStart = slider.slider("values", 0);
    var sliderTimeEnd = slider.slider("values", 1);

    var interval = $("#animationStepSelect").val();
    var startTime = animationDate.clone().add(sliderTimeStart, "minutes").toISOString();
    var endTime = animationDate.clone().add(sliderTimeEnd, "minutes").toISOString();
    var sizeMetricType = $(".animationSizeMetricType").val();
    var colorMetricType = $(".animationColorMetricType").val();

    var query = {
        animationInterval: interval,
        meterIDs: meterList.selectedIds(),
        startTime: startTime,
        endTime: endTime,
        sizeMetricType: sizeMetricType,
        colorMetricType: colorMetricType
    };

    $.blockUI({ message: '<div unselectable="on" class="wait_container"><div unselectable="on" class="wait">Please Wait. Loading...</div><br><div id="loadAnimationProgressBar" class="progressBar"><div id="loadAnimationProgressInnerBar" class="progressInnerBar"><div id="loadAnimationProgressLabel" class="progressBarLabel">0%</div></div></div><br><button class="btn btn-default btn-cancel">Cancel</button><br></div>' });

    $.ajax({
        type: "POST",
        url: homePath + "api/PQDashboard/MapMetricAnimation/Build",
        data: JSON.stringify(query),
        contentType: "application/json; charset=utf-8",
        cache: true,
        success: function (queryID) {
            var animationQuery = {
                id: queryID,
                cancelled: false
            };

            $('.btn-cancel').click(function () {
                animationQuery.cancelled = true;
                $.unblockUI();
            });

            loopForAnimation(animationQuery);
        },
        error: function (xhr) {
            var alertText = "Error building map metric animation.";
            var err = xhr.responseJSON;
            $.unblockUI();

            if (!err)
                err = xhr.responseText;

            if (err) {
                console.log(err);
                alertText += "\nSee console for details.";
            }

            alert(alertText);
        },
        global: false,
        async: true
    });
}

function loopForAnimation(animationQuery) {
    var queryID = animationQuery.id;

    $.ajax({
        type: "GET",
        url: homePath + 'api/PQDashboard/MapMetricAnimation/Progress/' + queryID,
        cache: true,
        success: function (progress) {
            var percent = Math.round(progress * 100);
            $('#loadAnimationProgressInnerBar').css('width', percent + '%');
            $('#loadAnimationProgressLabel').text(percent + '%');

            if (percent < 100 && !animationQuery.cancelled)
                setTimeout(loopForAnimation, 100, animationQuery);
            else if (!animationQuery.cancelled)
                getMapMetricAnimationFrames(animationQuery);
        },
        error: function (xhr) {
            var alertText = "Error loading map metric animation progress.";
            var err = xhr.responseJSON;
            $.unblockUI();

            if (!err)
                err = xhr.responseText;

            if (err) {
                console.log(err);
                alertText += "\nSee console for details.";
            }

            alert(alertText);
        },
        global: false,
        async: true
    });
}

function getMapMetricAnimationFrames(animationQuery) {
    var queryID = animationQuery.id;

    $.ajax({
        type: "GET",
        url: homePath + 'api/PQDashboard/MapMetricAnimation/Data/' + queryID,
        cache: true,
        success: function (animationData) {
            if (animationQuery.cancelled)
                return;

            $.unblockUI();
            runMapMetricAnimation(animationData);
        },
        error: function (xhr) {
            var alertText = "Error loading map metric animation.";
            var err = xhr.responseJSON;
            $.unblockUI();

            if (!err)
                err = xhr.responseText;

            if (err) {
                console.log(err);
                alertText += "\nSee console for details.";
            }

            alert(alertText);
        },
        global: false,
        async: true
    });
}

function runMapMetricAnimation(animationData) {
    $('#tabs-TrendingData .animationControl').css('width', '500px');
    $('#tabs-TrendingData #progressBar').show();

    var index = 0
    function update() {
        var frame = animationData.Frames[index];

        var progressBarIndex = Math.round(index / (animationData.Frames.length - 1) * 100);
        $('#tabs-' + currentTab + ' #animationProgressBar').attr('value', progressBarIndex);
        $('#tabs-' + currentTab + ' #progressDate').text(frame.Date);

        mapMetricData = frame.MapMetrics;
        updateMapMetrics(mapMetricData, mapMetricRanges);
    }

    mapMetricRanges.Largest = animationData.Largest;
    mapMetricRanges.Smallest = animationData.Smallest;
    mapMetricRanges.Red = animationData.Red;
    mapMetricRanges.Green = animationData.Green;
    updateMapLegend(mapMetricRanges);
    update();

    var interval;
    $('#tabs-TrendingData #animationProgressBar').off('click');
    $('#tabs-TrendingData #animationProgressBar').on('click', function (event) {
        var progressBarindex = event.offsetX / $(this).width();
        index = Math.round((animationData.Frames.length - 1) * progressBarindex);
        update();
    });
    $('#tabs-TrendingData #button_play').off('click');
    $('#tabs-TrendingData #button_play').on('click', function () {
        clearInterval(interval);
        $('#contourColorScaleSelect').on('change', function () { clearInterval(interval) });
        $('#application-tabs a').on('click', function () { clearInterval(interval) });

        interval = setInterval(function () {
            index++;

            if (index >= animationData.Frames.length) {
                index = 0;
                update();
                clearInterval(interval);
            }
            else {
                update();
            }
        }, 1000);
    });

    $('#tabs-TrendingData #button_stop').off('click');
    $('#tabs-TrendingData #button_stop').on('click', function () {
        clearInterval(interval);
    });

    $('#tabs-TrendingData #button_bw').off('click');
    $('#tabs-TrendingData #button_bw').on('click', function () {
        if (index > 0) {
            --index;
            update();
        }
    });

    $('#tabs-TrendingData #button_fbw').off('click');
    $('#tabs-TrendingData #button_fbw').on('click', function () {
        if (index > 0) {
            index = 0;
            update();
        }
    });

    $('#tabs-TrendingData #button_fw').off('click');
    $('#tabs-TrendingData #button_fw').on('click', function () {
        if (index < animationData.Frames.length - 1) {
            ++index;
            update();
        }
    });

    $('#tabs-TrendingData #button_ffw').off('click');
    $('#tabs-TrendingData #button_ffw').on('click', function () {
        if (index < animationData.Frames.length - 1) {
            index = animationData.Frames.length - 1;
            update();
        }
    });

    $(".mapMetricSizeType").hide();
    $(".mapMetricColorType").hide();
    mapMetricAnimationLoaded = true;
}

function unloadMapMetricAnimation(hideControl) {
    var wasLoaded = mapMetricAnimationLoaded;

    $('#tabs-TrendingData .animationControl').css('width', '');
    $('#tabs-TrendingData #progressBar').hide();

    if (hideControl)
        $(".animationControl").hide();

    $(".mapMetricSizeType").show();
    $(".mapMetricColorType").show();
    mapMetricAnimationLoaded = false;

    if (wasLoaded) {
        var timeRange = getContextTimeRange();
        queryAndPlotMapMetrics(timeRange.Start, timeRange.End);
    }
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
    unloadMapMetricAnimation(false);

    var mapormatrix = $("#map" + currentTab + "Grid")[0].value;

    var timeRange = getContextTimeRange();
    manageTabsByDate(currentTab, timeRange.Start, timeRange.End);
    $(".mapGrid").val(mapormatrix);
    selectmapgrid($("#map" + currentTab + "Grid")[0]);
}

function getBase64MeterSelection() {
    var meterSelections = meterList.selectedIds().sort(function (a, b) { return a - b })

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

function displayTextWidth(text, font) {
    var myCanvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
    var context = myCanvas.getContext("2d");
    context.font = font;

    var metrics = context.measureText(text);
    return metrics.width;
};

function fitTextToWidth(text, font, width) {
    var tempText = text;
    var newString = '';

    while (displayTextWidth(newString, font) < width && tempText.length > 0 ) {
        newString += tempText[0];
        tempText = tempText.slice(1, tempText.length);
    }

    return newString;
}
/// EOF