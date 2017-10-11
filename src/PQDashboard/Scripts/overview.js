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
//  04/19/2017 - JP Hyder
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////

var cache_OverviewLog_Data = null;
var cache_Overview_Disturbance_Data = null;
var cache_Overview_Severity_Data = null;

var cache_Overview_ThirtyDay_AllAlarms = null;
var cache_Overview_ThirtyDay_OffNormalAlarms = null;
var cache_Overview_ThirtyDay_Disturbances = null;
var cache_Overview_ThirtyDay_Faults = null;

// Settings
var updateInterval = 300000;
var rowsPerPage = 23;

function showOverviewPage(tab) {
    var whichday = 'history';
    var whichGrid = 'Yesterday';

    if (currentTab === 'Overview-Today' && currentTab != 'Overview-Yesterday') {
        whichday = 'today';
        whichGrid = 'Today';
    }

    $('#overviewYesterdayDate').text(moment().subtract(1,'days').format('dddd, MMMM Do YYYY'));
    $('#overviewTodayDate').text(moment().format('LLLL'));

    $('.grid2').masonry({
        iemSelector: '.grid2-item',
        columnWidth: '.grid2-sizer',
        percentPosition: true,
        horizontalOrder: true
    });

    // Select all divs with id=overviewContainer since both overview-today and overview-yesterday have divs with the same id's
    $('div[id^="overviewContainer"]').css('min-height', $(window).height() - $('#tabs-' + currentTab).offset().top);

    $(window).resize(function () {
        $('.grid2').masonry('layout');
    });

    // add charts and graphs

    buildDashboardCharts(whichday);
    refresh = setInterval(
    function () {
        buildDashboardCharts(whichday);
    }, updateInterval);
}

function buildDashboardCharts(whichday) {
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

    if (currentTab === 'Overview-Today') {

        $('#today-downloads').children().remove();
        $('#today-faults').children().remove();
        $('#today-log').children().remove();
        $('#today-voltages').children().remove();
        $('#today-voltages-chart').children().remove();
        $('#today-meter-activity').children().remove();
        $('#today-files').children().remove();

        // add charts and graphs to each Masonry.GridItem...
        //$('#today-downloads') // *
        buildOverviewDownloads(sourcedate, whichday);

        //$('#today-faults') // **
        buildOverviewFaults(sourcedate, whichday);

        //$('today-files')
        buildOverviewFiles(sourcedate, whichday);

        //$('#today-log')
        buildOverviewLog(sourcedate, whichday);

        //$('#today-voltages') // ***
        buildOverviewVoltages(sourcedate, whichday);

        buildOverviewMeterActivity(sourcedate, whichday);
    };

    if (currentTab === 'Overview-Yesterday') {

        sourcedate = null;
        sourcedate = new Date(new Date().setDate(new Date().getDate() - 1));

        // test dev - remove after test dev
        sourcedate = testDate.getFullYear().toString() + '-' + (testDate.getMonth().toString().length < 2 ? '0' + testDate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (testDate.getDate().toString().length < 2 ? '0' + testDate.getDate().toString() : testDate.getDate().toString());

        $('#history-downloads').children().remove();
        $('#history-alarms').children().remove();
        $('#history-offnormal').children().remove();
        $('#history-thirtyday').children().remove();
        $('#history-voltages').children().remove();
        $('#history-voltages-chart').children().remove();
        $('#history-faults').children().remove();

        // add charts and graphs to each Masonry.GridItem...
        //$('#history-downloads') // *
        buildOverviewDownloads(sourcedate, whichday);

        //$('#history-alarms')
        buildOverviewAlarms(sourcedate, whichday);
        //$('#history-offnormal')
        buildOverviewOffNormal(sourcedate, whichday)
        //$('#history-thirtyday')
        buildOverviewThiryDay(sourcedate, whichday)

        //$('#history-voltages') // ***
        buildOverviewVoltages(sourcedate, whichday);

        //$('#history-faults') // **
        buildOverviewFaults(sourcedate, whichday);
    };
}

function buildOverviewDownloads(sourcedate, whichday) {

    //$('#' + whichday + '-downloads') // * // history OR today
    // for today this is the contents of - grid2.grid2-item id = grid2-item-Today-1 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-1
    //$('#' + whichday + '-downloads').append('<h3 style="text-allign: left; color: darkblue">Event Files: <span></span> </h3>');
    //$('#' + whichday + '-downloads').append('<table class="table table-striped table-condensed" id="' + whichday + '-downloads-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"></table>');
    //$('#' + whichday + '-downloads-table').append('</tr><tr><th style="text-align: center; color: darkblue"><h4>Meters</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-meters"></h3></td></tr>');
    //$('#' + whichday + '-downloads-table').append('<tr><th style="text-align: center; color: darkblue"><h4>Lines</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lines"></h3></td></tr>');

    var filegroupCount;
    var metersDownloadedFromCount;
    var totalMeterCount;
    var lineCount;

    dataHub.queryFileGroupCount(sourcedate, 'dd', 1).done(function (data) {
        filegroupCount = data;
        dataHub.queryMeterCount(sourcedate, 'dd', 1).done(function (data) {
            metersDownloadedFromCount = data;
            dataHub.queryTotalMeterCount().done(function (data) {
                totalMeterCount = data;
                dataHub.queryLineCount(sourcedate, 'dd', 1).done(function (data) {
                    lineCount = data;
                    var data = [{
                        values: [metersDownloadedFromCount, totalMeterCount - metersDownloadedFromCount],
                        labels: ['Download', 'No Download'],
                        marker: {
                            colors: ['orange', 'silver']
                        },
                        showlegend: false,
                        sort: false,
                        direction: "clockwise",
                        rotation: 90,
                        name: 'Download Percentage',
                        hoverinfo: 'label+percent+value',
                        textinfo: 'none',
                        hole: .65,
                        type: 'pie'
                    }];

                    var layout = {
                        annotations: [
                            {
                                font: {
                                    size: 20
                                },
                                showarrow: false,
                                text: Math.round(metersDownloadedFromCount / totalMeterCount * 1000) / 10 + '%',
                                xref: 'paper',
                                xanchor: 'center',
                                x: 0.5,
                                yref: 'paper',
                                yanchor: 'center',
                                y: 0.5
                            }
                        ],
                        margin: {
                            l: 0,
                            r: 0,
                            t: 0,
                            b: 0
                        }
                    };

                    Plotly.newPlot('downloadsChart', data, layout);

                    var text = filegroupCount + ' event files downloaded from ' + metersDownloadedFromCount + ' meters, from a total of ' + totalMeterCount + ' meters on ' + lineCount + ' electrical elements.'
                    $('#' + whichday + '-downloads').append('<h3 style="text-allign: left;">' + text + '<span></span> </h3>');
                    $(window).resize();
                });
            })
        });
    });


}

function buildOverviewFaults(sourcedate, whichday) {

    //$('#' + whichday + '-faults') // * // history OR today
    // for today this is the contents of - grid2.grid2-item id = grid2-item-Today-2 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-6
    $('#' + whichday + '-faults').append('<h3 style="text-allign: left; color: #640701">Faults: <span></span></h3>');
    $('#' + whichday + '-faults').append('<table class="table table-striped table-condensed" id="' + whichday + '-faults-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"> </table>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>Line->Ground</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lineground"></h3></td></tr>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>Line->Line</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lineline"></h3></td></tr>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>All 3-Phase</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-threeline"></h3></td></tr>');

    dataHub.queryFaultSummaryCount(sourcedate, 'dd', 1).done(function (data) {
        var element = $('#' + whichday + '-faults span').first();
        if (data === undefined || data === null) {
        }
        else {
            $(element).append(data);
        }

        // last thing - resize
        $(window).resize();
    });

    dataHub.queryFaultSummaryGroundFaultCount(sourcedate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-lineground').append(data);
    });

    dataHub.queryFaultSummaryLineFaultCount(sourcedate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-lineline').append(data);
    });

    dataHub.queryFaultSummaryAllPhaseFaultCount(sourcedate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-threeline').append(data);
    });
}

function buildOverviewFiles(sourcedate, whichday) {
    //$('#' + whichday + '-files').append('<h3 style="text-allign: left; color: black">Files: <span></span></h3>');
    $('#' + whichday + '-files').append('<div id="' + whichday + '-files-table"> </div>');

    dataHub.queryFileGroupsForOverview(sourcedate, 'dd', 1).done(function (data) {
        // Filter out multiple files from FileGroup, I just need one file per FileGroup
        data = data.filter(function (file) { return data.findIndex(function (thing) { return thing.ID == file.ID }) == data.indexOf(file) });
        $('#' + whichday + '-files-table').puidatatable({
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
                    $(window).trigger('resize') }, 100);
            },
            expandableRows: true,
            rowExpandMode: 'single',
            expandedRowContent: function (row) {
                return fileGroupExpandableContent(row);
            },
        });

        // last thing - resize
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

function buildOverviewLog(sourcedate, whichday) {

    ////$('#' + whichday + '-log') // * // history OR today
    //// for today this is the contents of - grid2.grid2-item id = grid2-item-Today-3 
    //// for history this is not show in any grid2-item

    // -- PRIME UI IMPLEMENTATION --
    // --------------------------------------------------------------------------------------------------------------------
    //$('#' + whichday + '-log').append('<p style="text-align: right; color: silver">Click on time to display waveform</p>');
    $('#' + whichday + '-log').append('<div id="' + whichday + '-log-table"> </div>');
    dataHub.queryFaultSummarysForOverviewRecords(sourcedate, 'dd', 1).done(function (data) {
        // PRIME UI
        $('#' + whichday + '-log-table').puidatatable({
            paginator: {
                rows: rowsPerPage
            },
            columns: [
                {
                    field: 'StartTime', headerText: 'Time', content: function (row) {
                        return '<a href="' + xdaInstance + '/OpenSEE.cshtml?ID=' + row.EventID + '" style="color: Blue" target="_blank">' + moment(row.StartTime).format('HH:mm') + '</a>'
                    }
                },
                { field: 'MeterName', headerText: 'Meter' },
                { field: 'LineName', headerText: 'Line' },
                { field: 'FaultType', headerText: 'Type' },
                { field: 'Description', headerText: 'Descr' },
                { field: 'DurationSeconds', headerText: 'Duration' }
            ],
            datasource: data
        });
        //{ field: 'StartTime', headerText: 'Time', content: function (row) { return moment(row.StartTime).format('LT')} },
        //{ field: 'StartTime', headerText: 'Time', content: function (row) { return moment(row.StartTime).format('HH:mm:ss')} },
        // --------------------------------------------------------------------------------------------------------------------

        // last thing - resize
        $(window).resize();
    });
}

function buildOverviewMeterActivity(sourcedate, whichday) {
    $('#' + whichday + '-meter-activity').append('<div id="' + whichday + '-most-active-meters-table"> </div>');
    $('#' + whichday + '-meter-activity').append('<div id="' + whichday + '-least-active-meters-table"> </div>');

    $('#' + whichday + '-most-active-meters-table').puidatatable({
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

    $('#' + whichday + '-least-active-meters-table').puidatatable({
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

    $(window).resize();
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
        return '<a onClick="OpenWindowToMeterEventsByLineTwo(' + row.FirstEventID + ', \'' + context +'\')" style="color: blue">' + events + '<a>'
    }
    else {
        return '<a>' + events + '</a>';
    }
}
function buildOverviewVoltages(sourcedate, whichday) {
    //$('#' + whichday + '-voltages') // * // history OR today
    // for today this is the contents of - grid2.grid2-item id = grid2-item-Today-4 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-5
    $('#' + whichday + '-voltages').append('<h3 style="text-allign: left; color: #834a05">Voltages Disturbance: <span></span></h3>');

    dataHub.getDisturbanceSeverityByHourOfDay(sourcedate).done(function (data) {

        var element = $('#' + whichday + '-voltages span').first();
        $(element).append(data.length);
        cache_Overview_Disturbance_Data = data;

        var mycounter = 0;
        var trace1 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level0;
            }),
            name: 'ZERO',
            type: 'bar'
        };

        mycounter = 0;
        var trace2 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level1;
            }),
            name: 'ONE',
            type: 'bar'
        };

        mycounter = 0;
        var trace3 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level2;
            }),
            name: 'TWO',
            type: 'bar'
        };

        mycounter = 0;
        var trace4 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level3;
            }),
            name: 'THREE',
            type: 'bar'
        };

        mycounter = 0;
        var trace5 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level4;
            }),
            name: 'FOUR',
            type: 'bar'
        };

        mycounter = 0;
        var trace6 = {
            x: $.map(data, function (dat) {
                mycounter = mycounter + 1;
                return mycounter;
            }),
            y: $.map(data, function (dat) {
                return dat.Level5;
            }),
            name: 'FIVE',
            type: 'bar'
        };

        var chartdatab = [trace1, trace2, trace3, trace4, trace5, trace6];

        var chartlayout = {
            barmode: 'stack',
            title: 'Data for Voltage Disturbances',
            height: 400,
            font: { size: 10 },
            orientation: 'v',
            xaxis: {
                title: 'Hours',
                tickmode: 'auto',
                nticks: '24',
                tickfont: { size: 8 },
                tickangle: -45
            },
            yaxis: {
                title: 'Quanty.',
                tickmode: 'auto',
                nticks: '5',
                tickfont: { size: 8 }
            },
            bargap: 0.05,
            margin: {
                l: 50,
                r: 5,
                t: 30,
                b: 40,
                pad: 5,
                autoexpand: true
            }
        };

        Plotly.newPlot(whichday + '-voltages-chart', chartdatab, chartlayout, { displayModeBar: false });
        //Plotly.plot(gd, chartdatab, chartlayout, { displayModeBar: false });

        // last thing - resize
        $(window).resize();
    });
}

function buildOverviewAlarms(sourcedate, whichday) {

    //$('#' + whichday + '-voltages') // * // history OR today
    // for today this is not displayed in any grid2-item 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-2

    // last thing - resize
    $(window).resize();
}

function buildOverviewOffNormal(sourcedate, whichday) {

    //$('#' + whichday + '-voltages') // * // history OR today
    // for today this is not displayed in any grid2-item 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-3

    // last thing - resize
    $(window).resize();
}

function buildOverviewThiryDay(sourcedate, whichday) {

    //$('#' + whichday + '-thirtyday') // * // history OR today
    // for today this is not displayed in any grid2-item 
    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-4

    // four (4) small bar charts that display
    // one)- the number of PQ meters with alarms for each day, over the past thirty days
    //$('#' + whichday + '-thirtyday-Alarms') // * // history OR today
    buildOverviewThirtyDayAlarmsChart(sourcedate, whichday);
    // two)- the number of PQ meters with off-normal for each day, over the past thirty days
    //$('#' + whichday + '-thirtyday-OffNormal') // * // history OR today
    buildOverviewThirtyDayOffNormalChart(sourcedate, whichday);
    // three)- the the number of severity 4 & 5 disturbances for each day, over the past thirty days
    //$('#' + whichday + '-thirtyday-Disturbances') // * // history OR today
    buildOverviewThirtyDayDisturbanceChart(sourcedate, whichday);
    // four)- the the number of faults for each day, over the past thirty days
    //$('#' + whichday + '-thirtyday-Faults') // * // history OR today
    buildOverviewThirtyDayFaultChart(sourcedate, whichday);

    // last thing - resize
    $(window).resize();
}

function buildOverviewThirtyDayAlarmsChart(sourcedate, whichday) {

    // data query method
    // inside chart creation
    dataHub.getAlarmsForLast30Days(sourcedate).done(function (data) {
        //<div id="history-thirtyday-Alarms"> //'#history-thirtyday-Alarms'

        var mycounter = 0;
        var trace1 = {
            x: $.map(data, function (dat) {
                return dat.DayIndex;
            }),
            y: $.map(data, function (dat) {
                return dat.Alarms;
            }),
            name: 'Alarms',
            type: 'bar'
        };

        var chartdatab = [trace1];

        var chartlayout = {
            barmode: 'stack',
            font: { size: 8 },
            orientation: 'v',
            xaxis: {
                title: 'Alarms',
            },
            yaxis: {
                y0: 0,
                dy: 1,
            },
            bargap: 0.05,
            margin: {
                l: 25,
                r: 5,
                t: 5,
                b: 20,
                pad: 5,
                autoexpand: true
            }
        };

        Plotly.newPlot('history-thirtyday-a', chartdatab, chartlayout, { displayModeBar: false });

        // last thing - resize
        $(window).resize();
    });

    // last thing - resize
    $(window).resize();
}

function buildOverviewThirtyDayOffNormalChart(sourcedate, whichday) {

    dataHub.getOffNormalForLast30Days(sourcedate).done(function (data) {

        var mycounter = 0;
        var trace1 = {
            x: $.map(data, function (dat) {
                return dat.DayIndex;
            }),
            y: $.map(data, function (dat) {
                return dat.OffNormalAlarms;
            }),
            name: 'Off Norm',
            type: 'bar'
        };

        var chartdatab = [trace1];

        var chartlayout = {
            barmode: 'stack',
            font: { size: 8 },
            orientation: 'v',
            xaxis: {
                title: 'Off Norms',
            },
            yaxis: {
            },
            y0: 0,
            dy: 1,
            bargap: 0.05,
            margin: {
                l: 25,
                r: 5,
                t: 5,
                b: 20,
                pad: 5,
                autoexpand: true
            }
        };

        Plotly.newPlot('history-thirtyday-offnormal', chartdatab, chartlayout, { displayModeBar: false });

        // last thing - resize
        $(window).resize();
    });

    // last thing - resize
    $(window).resize();
}

function buildOverviewThirtyDayDisturbanceChart(sourcedate, whichday) {

    dataHub.getLevel4_5DisturbancesForLast30Days(sourcedate).done(function (data) {

        var mycounter = 0;
        var trace1 = {
            x: $.map(data, function (dat) {
                return dat.DayIndex;
            }),
            y: $.map(data, function (dat) {
                return dat.Disturbance_Count;
            }),
            name: 'Dists',
            type: 'bar'
        };

        var chartdatab = [trace1];

        var chartlayout = {
            barmode: 'stack',
            font: { size: 8 },
            orientation: 'v',
            xaxis: {
                title: 'Disturbances',
            },
            yaxis: {
            },
            y0: 0,
            dy: 1,
            bargap: 0.05,
            margin: {
                l: 25,
                r: 5,
                t: 5,
                b: 25,
                pad: 5,
                autoexpand: true
            }
        };

        Plotly.newPlot('history-thirtyday-disturbances', chartdatab, chartlayout, { displayModeBar: false });

        // last thing - resize
        $(window).resize();
    });

    // last thing - resize
    $(window).resize();
}

function buildOverviewThirtyDayFaultChart(sourcedate, whichday) {

    dataHub.getAllFaultsForLast30Days(sourcedate).done(function (data) {

        var mycounter = 0;
        var trace1 = {
            x: $.map(data, function (dat) {
                return dat.DayIndex;
            }),
            y: $.map(data, function (dat) {
                return dat.FaultCount;
            }),
            name: 'Dists',
            type: 'bar'
        };

        var chartdatab = [trace1];

        var chartlayout = {
            barmode: 'stack',
            font: { size: 8 },
            orientation: 'v',
            xaxis: {
                title: 'Faults',
            },
            yaxis: {
            },
            y0: 0,
            dy: 1,
            bargap: 0.05,
            margin: {
                l: 25,
                r: 5,
                t: 5,
                b: 20,
                pad: 5,
                autoexpand: true
            }
        };

        Plotly.newPlot('history-thirtyday-faults', chartdatab, chartlayout, { displayModeBar: false });

        // last thing - resize
        $(window).resize();
    });

    // last thing - resize
    $(window).resize();
}