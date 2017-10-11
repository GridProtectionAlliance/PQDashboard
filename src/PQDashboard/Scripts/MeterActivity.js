//******************************************************************************************************
//  overview.js - Gbtc
//
//  Copyright © 2017, Grid Protection Alliance.  All Rights Reserved.
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
//  06/29/2017 - Stephen Jenks
//       Generated original version of source code.
//
//******************************************************************************************************
"use strict";

// Settings
var updateInterval = 300000;
var rowsPerPage = 23;
var autoUpdate = setInterval(
    function () {
        buildMeterActivityTables();
    }, updateInterval);

var momentFormat = "YYYY/MM/DD HH:mm:ss";
var dateTimeFormat = "yyyy/MM/dd HH:mm:ss";

function showMeterActivity() {
    $('.grid2').masonry({
        iemSelector: '.grid2-item',
        columnWidth: '.grid2-sizer',
        percentPosition: true,
        horizontalOrder: true
    });

    // Select all divs with id=overviewContainer since both overview-today and overview-yesterday have divs with the same id's
    $('div[id^="meterActivityContainer"]').css('min-height', $(window).height() - $('#tabs-' + currentTab).offset().top);

    $(window).resize(function () {
        $('.grid2').masonry('layout');
    });

    // add charts and graphs
    buildMeterActivityTables();
}

function buildMeterActivityTables() {
    var sourcedate = null;
    dataHub.getXdaTime(dateTimeFormat).done(function (date) {
        sourcedate = moment(date);

        //=======================================================================================
        // test dev - remove after test dev
        //testDate = moment.utc("2014-06-10");
        //sourcedate = testDate;
        // test dev - remove after test dev
        //=======================================================================================

        $('#meter-activity').children().remove();
        $('#meter-activity-files').children().remove();

        // add charts and graphs to each Masonry.GridItem...
        buildMeterActivity(sourcedate);
        buildMeterActivityFiles(sourcedate);
    });
}

function buildMeterActivity(sourcedate) {
    $('#meter-activity').append('<div id="most-active-meters-table"> </div>');
    $('#meter-activity').append('<div id="least-active-meters-table"> </div>');

    $('#most-active-meters-table').puidatatable({
        caption: 'Most Active Meters',
        lazy: true,
        responsive: true,
        emptyMessage: "No Meters with events in the last 30 days",
        columns: [
            { field: 'AssetKey', headerText: 'Asset Key', content: function (row) { return createMeterActivityAssetKeyContent(row) } },
            { field: 'Events24Hours', headerText: 'Files (Events) 24H', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '24h', sourcedate) } },
            { field: 'Events7Days', headerText: 'Files (Events) 7D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '7d', sourcedate) } },
            { field: 'Events30Days', headerText: 'Files (Events) 30D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '30d', sourcedate) } }
        ],

        datasource: function (callback, ui) {
            var $this = this;
            dataHub.queryMeterActivity(sourcedate, ui.sortField != null ? ui.sortField : "Events24Hours", 11, false, ui.sortOrder == 1 ? true : false).done(function (data) {
                callback.call($this, data);
            })
        }
    });

    $('#least-active-meters-table').puidatatable({
        caption: 'Least Active Meters',
        lazy: true,
        responsive: true,
        emptyMessage: "No meters found",
        columns: [
            { field: 'AssetKey', headerText: 'Asset Key', content: function (row) { return createMeterActivityAssetKeyContent(row); } },
            { field: 'Events30Days', headerText: 'Files (Events) 30D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '30d', sourcedate) } },
            { field: 'Events90Days', headerText: 'Files (Events) 90D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '90d', sourcedate) } },
            { field: 'Events180Days', headerText: 'Files (Events) 180D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, '180d', sourcedate) } }
        ],

        datasource: function (callback, ui) {
            var $this = this;
            dataHub.queryMeterActivity(sourcedate, ui.sortField != null ? ui.sortField : "Events30Days", 10, true, ui.sortOrder == 1 ? true : false).done(function (data) {
                callback.call($this, data);
            })
        }
    });
}

function createMeterActivityAssetKeyContent(row) {
    var tooltip = 'Name: ' + row.Name + '; ID: ' + row.ID;
    return '<span title="' + tooltip + '">' + row.AssetKey + '</span>'
}

function createMeterActivityEventsContent(row, context, sourcedate) {
    var events;
    var files;

    if (context == '24h'){
        events = row.Events24Hours;
        files = row.FileGroups24Hours
    }
    else if (context == '7d'){
        events = row.Events7Days;
        files = row.FileGroups7Days
    }
    else if (context == '30d'){
        events = row.Events30Days;
        files = row.FileGroups30Days
    }
    else if (context == '90d'){
        events = row.Events90Days;
        files = row.FileGroups90Days
    }
    else if (context == '180d'){
        events = row.Events180Days;
        files = row.FileGroups180Days
    }
    else{
        events = 0;

    }

    if (events > 0) {
        return '<a onClick="OpenWindowToMeterEventsByLineTwo(' + row.FirstEventID + ', \'' + context + '\', \'' + sourcedate.format(momentFormat) + '\')" style="color: blue">' + files + ' (' + events + ')<a>'
    }
    else {
        return '<a>' + events + '</a>';
    }
}

function buildMeterActivityFiles(sourcedate) {
    $('#meter-activity-files').append('<div id="meter-activity-files-table"> </div>');
    var begindate;
    begindate = sourcedate.clone();
    begindate.subtract(1, 'd');
    dataHub.queryFileGroupsForOverview(begindate, sourcedate).done(function (data) {

        $('#meter-activity-files-table').puidatatable({
            responsive: true,
            paginator: {
                rows: rowsPerPage
            },
            columns: [
                { rowToggler: true, bodyStyle: 'width:36px', headerStyle: 'width:36px' },
                { field: 'ProcessingStartTime', headerText: 'Start Time', content: function (row) { return moment(row.ProcessingStartTime).format("YYYY/MM/DD HH:mm") }, headerStyle: 'width: 140px', sortable: true },
                { field: 'FilePath', headerText: 'Short FileGroup Name (Hover to See Full Name)', content: function (row) { return buildFileGroupContent(row) } }
            ],
            datasource: data,
            rowExpand: function (event, data) {
                setTimeout(function () { $(window).trigger('resize') }, 100);
            },
            rowCollapse: function (event, data) {
                setTimeout(function () {
                    $(window).trigger('resize')
                }, 100);
            },
            expandableRows: true,
            rowExpandMode: 'single',
            expandedRowContent: function (row) {
                return fileGroupExpandableContent(row);
            },
            emptyMessage: "No files processed within the last 24 hours"
        });

        $(window).resize();
    });
}

function buildFileGroupContent(row) {
    var filepathParts = row.FilePath.split('\\');
    var fullFilename = filepathParts[filepathParts.length - 1];
    var filenameWithoutExtension = fullFilename.split('.')[0];
    var filenameParts = filenameWithoutExtension.split(',');
    var shortFilename = "";

    // This is to eliminate the timestamp in the fullFilename for the shortFilename
    var inTimestamp = true;
    for (var i = 0; i < filenameParts.length; i++) {
        if (inTimestamp) {
            if (!(/^-?\d/.test(filenameParts[i]))) {
                inTimestamp = false;
                shortFilename += filenameParts[i];
            }
        }
        else {
            shortFilename += ',' + filenameParts[i];
        }
    }

    if (shortFilename == "") {
        shortFilename = filenameWithoutExtension;
    }

    var html = '<a href="' + xdaInstance + '/Workbench/DataFiles.cshtml" title="' + fullFilename + '" style="color: Blue" target="_blank">' + shortFilename + '</a>';

    return html;
}

function fileGroupExpandableContent(row) {
    var html = '<div><table id="' + row.ID + '-expandableContent"><tr><th>Line</th><th>Start Time</th><th>Type</th></tr>';
    dataHub.queryFileGroupEvents(row.ID).done(function (data) {
        $.each(data, function (index, value) {
            var xdaLink = xdaInstance + '/OpenSEE.cshtml?ID=' + value.ID;
            $('#' + row.ID + '-expandableContent').append('<tr><td><a style="color: Blue" href="' + xdaLink + '" target="_blank">' + value.LineName + '</a></td><td>' + moment(value.StartTime).format('MM/DD/YY HH:MM:SS') + '</td><td>' + value.EventTypeName + '</td></tr>');
        });
        html += '</table></div>';
    });

    return html;
}