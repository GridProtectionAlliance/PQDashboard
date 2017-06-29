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

// Settings
var updateInterval = 300000;
var rowsPerPage = 23;
var autoUpdate = setInterval(
    function () {
        buildMeterActivityTables();
    }, updateInterval);

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
    sourcedate = new Date(new Date().setDate(new Date().getDate()));

    //=======================================================================================
    // test dev - remove after test dev
    var testDate = null;
    testDate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());
    testDate = null;
    testDate = new Date(2014, 6, 10);
    sourcedate = testDate.getFullYear().toString() + '-' + (testDate.getMonth().toString().length < 2 ? '0' + testDate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (testDate.getDate().toString().length < 2 ? '0' + testDate.getDate().toString() : testDate.getDate().toString());
    // test dev - remove after test dev
    //=======================================================================================

    $('#meter-activity').children().remove();
    $('#meter-activity-files').children().remove();

    // add charts and graphs to each Masonry.GridItem...
    buildMeterActivity(sourcedate);
    buildMeterActivityFiles(sourcedate);
}

function buildMeterActivity(sourcedate) {
    $('#meter-activity').append('<div id="most-active-meters-table"> </div>');
    $('#meter-activity').append('<div id="least-active-meters-table"> </div>');

    $('#most-active-meters-table').puidatatable({
        caption: 'Most Active Meters',
        lazy: true,
        responsive: true,
        columns: [
            { field: 'AssetKey', headerText: 'Asset Key', content: function (row) { return createMeterActivityAssetKeyContent(row) } },
            { field: 'Events24Hours', headerText: 'Events 24H', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'day') } },
            { field: 'Events7Days', headerText: 'Events 7D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'week') } },
            { field: 'Events30Days', headerText: 'Events 30D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'month') } },
        ],

        datasource: function (callback, ui) {
            $this = this;
            dataHub.queryMeterActivity(sourcedate, ui.sortField, 11, false).done(function (data) {
                callback.call($this, data);
            })
        }
    });

    $('#least-active-meters-table').puidatatable({
        caption: 'Least Active Meters',
        lazy: true,
        responsive: true,
        columns: [
            { field: 'AssetKey', headerText: 'Asset Key', content: function (row) { return createMeterActivityAssetKeyContent(row); } },
            { field: 'Events24Hours', headerText: 'Events 24H', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'day') } },
            { field: 'Events7Days', headerText: 'Events 7D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'week') } },
            { field: 'Events30Days', headerText: 'Events 30D', sortable: true, headerStyle: "width: 125px", content: function (row) { return createMeterActivityEventsContent(row, 'month') } },
        ],

        datasource: function (callback, ui) {
            var $this = this;
            dataHub.queryMeterActivity(sourcedate, ui.sortField, 11, true).done(function (data) {
                callback.call($this, data);
            })
        }
    });
}

function createMeterActivityAssetKeyContent(row) {
    var tooltip = 'Name: ' + row.Name + '; ID: ' + row.ID;
    return '<span title="' + tooltip + '">' + row.AssetKey + '</span>'
}

function createMeterActivityEventsContent(row, context) {
    var events

    if (context == 'day')
        events = row.Events24Hours;
    else if (context == 'week')
        events = row.Events7Days;
    else
        events = row.Events30Days;

    if (events > 0) {
        return '<a onClick="OpenWindowToMeterEventsByLineTwo(' + row.FirstEventID + ', \'' + context + '\')" style="color: blue">' + events + '<a>'
    }
    else {
        return '<a>' + events + '</a>';
    }
}

function buildMeterActivityFiles(sourcedate) {
    $('#meter-activity-files').append('<div id="meter-activity-files-table"> </div>');

    dataHub.queryFileGroupsForOverview(sourcedate, 'dd', 1).done(function (data) {
        // Filter out multiple files from FileGroup, I just need one file per FileGroup
        data = data.filter(function (file) { return data.findIndex(function (thing) { return thing.ID == file.ID }) == data.indexOf(file) });
        $('#meter-activity-files-table').puidatatable({
            responsive: true,
            paginator: {
                rows: rowsPerPage
            },
            columns: [
                { rowToggler: true, bodyStyle: 'width:36px', headerStyle: 'width:36px' },
                { field: 'DataStartTime', headerText: 'Start Time', content: function (row) { return moment(row.DataStartTime).format('MM/DD HH:mm') }, headerStyle: 'width: 100px' },
                { field: 'FilePath', headerText: 'Short FileGroup Name (Hover to See Full Name)', content: function (row) { return buildFileGroupContent(row) } },
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
            responsive: true,
        });

        $(window).resize();
    });
}

function buildFileGroupContent(row) {
    var filepath = row.FilePath.split('\\');
    var fullFilename = filepath[filepath.length - 1].split('.')[0];
    var filenameParts = fullFilename.split(',');
    var shortFilename = "";
    var inTimestamp = true;
    for (var i = 0; i < filenameParts.length; i++) {
        if (inTimestamp) {
            if (!(/^-?\d/.test(filenameParts[i]))) {
                inTimestamp = false;
                shortFilename += filenameParts[i];
            }
        }
        else {
            shortFilename += filenameParts[i];
        }
    }

    var html = '<a href="' + xdaInstance + '/Workbench/DataFiles.cshtml" title="' + fullFilename + '" style="color: Blue" target="_blank">' + shortFilename + '</a>';

    return html;
}

function fileGroupExpandableContent(row) {
    var html = '<div><table id="' + row.ID + '-expandableContent"><tr><th>Line</th><th>Start Time</th><th>Type</th></tr>'
    dataHub.queryFileGroupEvents(row.ID).done(function (data) {
        $.each(data, function (index, value) {
            var xdaLink = xdaInstance + '/OpenSEE.cshtml?ID=' + value.ID
            $('#' + row.ID + '-expandableContent').append('<tr><td><a style="color: Blue" href="' + xdaLink + '" target="_blank">' + value.LineName + '</a></td><td>' + moment(value.StartTime).format('MM/DD/YY HH:MM:SS') + '</td><td>' + value.EventTypeName + '</td></tr>')
        });
        html += '</table></div>';
    });

    return html;
}