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
        columnWidth: '.grid2-sizer'
    });

    $(window).resize(function () {
        $('.grid2').masonry('layout');
    });

    // add charts and graphs
    buildDashboardCharts(whichday);

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
        
            // add charts and graphs to each Masonry.GridItem...
            //$('#today-downloads') // *
            buildOverviewDownloads(sourcedate, whichday);

            //$('#today-faults') // **
            buildOverviewFaults(sourcedate, whichday);

            //$('#today-log')
            buildOverviewLog(sourcedate, whichday);

            //$('#today-voltages') // ***
            buildOverviewVoltages(sourcedate, whichday);
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
        $('#' + whichday + '-downloads').append('<h3 style="text-allign: left; color: darkblue">Event Files: <span></span> </h3>');
        $('#' + whichday + '-downloads').append('<table class="table table-striped table-condensed" id="' + whichday + '-downloads-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"> </table>');
        $('#' + whichday + '-downloads-table').append('<tr><th style="text-align: center; color: darkblue"><h4>Meters</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-meters"></h3></td></tr>');
        $('#' + whichday + '-downloads-table').append('<tr><th style="text-align: center; color: darkblue"><h4>Lines</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lines"></h3></td></tr>');

        dataHub.queryFileGroupCount(sourcedate, 'dd', 1).done(function (data) {
            var element = $('#' + whichday + '-downloads span').first();
            if (data === undefined) {
            }
            else {
                $(element).append(data);
            }
            // last thing - resize
            $(window).resize();
        });

        dataHub.queryMeterCount(sourcedate, 'dd', 1).done(function (data) {
            $('#' + whichday + '-meters').append(data);
        });

        dataHub.queryLineCount(sourcedate, 'dd', 1).done(function (data) {
            $('#' + whichday + '-lines').append(data);
        });
    }

    //function buildOverviewDownloads(sourcedate, whichday) {
    //    //$('#' + whichday + '-downloads') // * // history OR today
    //    // for today this is the contents of - grid2.grid2-item id = grid2-item-Today-1 
    //    // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-1
    //    $('#' + whichday + '-downloads').puidatatable({
    //        columns: [
    //            { field: 'Meters', headerText: 'Meters' },
    //            { field: 'Lines', headerText: 'Lines' }
    //        ],
    //        datasource: []
    //    });
    //    dataHub.queryFileGroupCount(sourcedate, 'dd', 1).done(function (data) {
    //        var element = $('#' + whichday + '-downloads span').first();
    //        if (data === undefined) {
    //        }
    //        else {
    //            $(element).append(data);
    //        }
    //        // last thing - resize
    //        $(window).resize();
    //    });
    //    dataHub.queryMeterCount(sourcedate, 'dd', 1).done(function (data) {
    //        $('#' + whichday + '-meters').append(data);
    //    });
    //    dataHub.queryLineCount(sourcedate, 'dd', 1).done(function (data) {
    //        $('#' + whichday + '-lines').append(data);
    //    });
    //}

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

    function buildOverviewLog(sourcedate, whichday) {

        ////$('#' + whichday + '-log') // * // history OR today
        //// for today this is the contents of - grid2.grid2-item id = grid2-item-Today-3 
        //// for history this is not show in any grid2-item

        // -- PRIME UI IMPLEMENTATION --
        // --------------------------------------------------------------------------------------------------------------------
        $('#' + whichday + '-log').append('<h3 style="text-allign: left; color: black">Disturbance Log: <span></span></h3>');
        $('#' + whichday + '-log').append('<div id="' + whichday + '-log-table"> </div>');
        dataHub.queryFaultSummarysForOverviewRecords(sourcedate, 'dd', 1).done(function (data) {
            // PRIME UI
            $('#' + whichday + '-log-table').puidatatable({
                caption: 'Disturbance Log',
                columns: [
                    { field: 'EventID', headerText: 'Event' },
                    { field: 'FaultType', headerText: 'Type' },
                    { field: 'StartTime', headerText: 'Time', content: function (row) { return moment(row.StartTime).format('HH:mm') } },
                    { field: 'MeterName', headerText: 'Meter' },
                    { field: 'LineName', headerText: 'Line' },
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

    function buildOverviewVoltages(sourcedate, whichday) {
        //$('#' + whichday + '-voltages') // * // history OR today
        // for today this is the contents of - grid2.grid2-item id = grid2-item-Today-4 
        // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-5
        var severityTrace;

        $('#' + whichday + '-voltages').append('<h3 style="text-allign: left; color: #834a05">Voltages Disturbance: <span></span></h3>');

        // all disturbances (no severity condition :: 
        //dataHub.queryDisturbanceSeverityRecords(sourcedate, 'dd', 1, 0).done(function (data) {
        dataHub.getDisturbanceSeverityByHourOfDay(sourcedate).done(function (data) {

            var element = $('#' + whichday + '-voltages span').first();

            $(element).append(data.length);

            cache_Overview_Disturbance_Data = data;

            var mycounter = 0;
            var trace1b = {
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
            var trace2b = {
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
            var trace3b = {
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
            var trace4b = {
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
            var trace5b = {
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
            var trace6b = {
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

            var d3 = Plotly.d3;
            var WIDTH_IN_PERCENT_OF_PARENT = 98,
                HEIGHT_IN_PERCENT_OF_PARENT = 98;
            var gd3 = d3.select('#' + whichday + '-voltages')
                .append('div')
                .style({
                    width: WIDTH_IN_PERCENT_OF_PARENT + '%',
                    'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

                    height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
                    'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
                });
            var gd = gd3.node();

            var chartdatab = [trace1b, trace2b, trace3b, trace4b, trace5b, trace6b];

            var chartlayout = { barmode: 'stack',
                                title: 'Showing Mock Data for Voltage Disturbances',
                                font: { size: 10 },
                                xaxis: {
                                    title: 'Hours',
                                    tickmode: 'auto',
                                    nticks: '24',
                                    tickfont: { size: 8 }
                                    
                                },
                                yaxis: {
                                    title: 'Quanty.',
                                    tickmode: 'auto',
                                    nticks: '10',
                                    tickfont: { size: 8}}
            };

            Plotly.plot(gd, chartdatab, chartlayout);

            window.onresize = function () {
                Plotly.Plots.resize(gd);
            };
            // last thing - resize
            $(window).resize();
        });


        dataHub.queryDisturbanceSeverityRecords(sourcedate, 'dd', 1, 4).done(function (data) {

            cache_Overview_Severity_Data = data;

            //Plotly.newPlot();

            // last thing - resize
            $(window).resize();
        });

        //Plotly.d3.json('https://plot.ly/~DanielCarrera/13.json', function(figure){
        //    var trace = {
        //        x: figure.data[0].x, y: figure.data[0].y, z: figure.data[0].z,
        //        type: 'contour', autocolorscale: false,
        //        colorscale: [[0,"rgb(  0,  0,  0)"],[0.3,"rgb(230,  0,  0)"],[0.6,"rgb(255,210,  0)"],[1,"rgb(255,255,255)"]],
        //        reversescale: true, zmax: 2.5, zmin: -2.5
        //};
        //var layout = {
        //    xaxis: { title: 'Disturbances' },
        //    yaxis: { title: 'Hours' }
        //};
        //Plotly.newPlot('jsObjectReference','data','layout);
        //Plotly.plot('jsObjectReference','data','layout);
        //Plotly.purge(thediv);
        //var layout = {
        //    xaxis: { title: 'Disturbances' },
        //    yaxis: { title: 'Hours' }
        //};
        //Plotly.newPlot('jsObjectReference','data','layout);
        //Plotly.plot('jsObjectReference','data','layout);
        //Plotly.purge(thediv);
    }

    function buildOverviewAlarms(sourcedate, whichday) {

        //$('#' + whichday + '-voltages') // * // history OR today
        // for today this is not displayed in any grid2-item 
        // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-2

        var jeffe = 0;
        jeffe += 1;

    // last thing - resize
        $(window).resize();
    }

    function buildOverviewOffNormal(sourcedate, whichday) {

        //$('#' + whichday + '-voltages') // * // history OR today
        // for today this is not displayed in any grid2-item 
        // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-3

        var jeffe = 0;
        jeffe += 1;

        // last thing - resize
        $(window).resize();
    }

    function buildOverviewThiryDay(sourcedate, whichday) {

        //$('#' + whichday + '-voltages') // * // history OR today
        // for today this is not displayed in any grid2-item 
        // for history this is the contents of - grid2.grid2-item id = grid2-item-Yesterday-4

        // four (40 small bar charts that display
        // one)- the number of PQ meters with alarms for each day, over the past thirty days
        // two)- the number of PQ meters with off-normal for each day, over the past thirty days
        // three)- the the number of severity 4 & 5 disturbances for each day, over the past thirty days
        // four)- the the number of faults for each day, over the past thirty days

        var jeffe = 0;
        jeffe += 1;

        // last thing - resize
        $(window).resize();
    }
}

