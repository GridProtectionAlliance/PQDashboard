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

function showOverviewPage(tab) {
    $('#overviewYesterdayDate').text(moment().subtract(1,'days').format('dddd, MMMM Do YYYY'));
    $('#overviewTodayDate').text(moment().format('LLLL'));

    $('.grid2').masonry({
        iemSelector: '.grid2-item',
        columnWidth: '.grid2-sizer'
    });

    var heightNew = 0;
    var ovtodayHeight = $('#tabs-Overview-Today').height();
    var ovyesterdayHeight = $('#tabs-Overview-Yesterday').height();

    if (currentTab != 'Overview-Today') {
        heightNew = ovyesterdayHeight;
        if (ovtodayHeight > 1 & ovyesterdayHeight <= ovtodayHeight) {
            heightNew = ovtodayHeight;
        }
        $('#tabs-' + tab).css('height', heightNew);
    }
    else if (currentTab === 'Overview-Today') {
        heightNew = ovtodayHeight;
        $('#tabs-' + 'Overview-Today').css('height', heightNew);
    }

    $(window).resize(function () {
        $('.grid2').masonry('layout');

        var myheightNew = 0;

        if (currentTab === 'Overview-Today') {
            var ovtodayWidth = $('#tabs-Overview-Today').width();
            var leftrightoffset = $('#grid2Today').offset().left * 2.0;
            var grid2width = $('#grid2Today').width();

            myheightNew = ($('#tabs-Overview-Today').offset().top) + 60;

            if (ovtodayWidth > (1197 + leftrightoffset)) {
                var iterator = 1;
                while (iterator <= 4) {

                    if (myheightNew <= $('#grid2-item-Today-' + iterator).height()) {
                        myheightNew += $('#grid2-item-Today-' + iterator).height();
                    }
                    iterator++;
                }
            }
            else if (ovtodayWidth <= (1197 + leftrightoffset) & ovtodayWidth > (597 + leftrightoffset)) {
                var iterator = 2;
                while (iterator <= 4) {
                    myheightNew += $('#grid2-item-Today-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovtodayWidth <= (597 + leftrightoffset)) {
                var iterator = 1;
                while (iterator <= 4) {
                    myheightNew += $('#grid2-item-Today-' + iterator).height();
                    iterator++;
                }
            }
        }

        if (currentTab === 'Overview-Yesterday') {
            var ovyesterdayWidth = $('#tabs-Overview-Yesterday').width();
            var leftrightoffset = $('#grid2Yesterday').offset().left * 2.0;
            var grid2width = $('#grid2Yesterday').width();

            myheightNew = ($('#tabs-Overview-Yesterday').offset().top) + 60;

            if (ovyesterdayWidth > (1197 + leftrightoffset)) {
                var iterator = 4;
                while (iterator <= 6) {
                    if (myheightNew <= $('#grid2-item-Yesterday-' + iterator).height()) {
                        myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    }
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (1197 + leftrightoffset) & ovyesterdayWidth > (897 + leftrightoffset)) {
                var iterator = 4;
                while (iterator <= 6) {
                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (897 + leftrightoffset) & ovyesterdayWidth > (597 + leftrightoffset)) {
                var iterator = 2;
                while (iterator <= 6) {
                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (597 + leftrightoffset)/* & ovyesterdayWidth > (299 + leftrightoffset)*/) {
                var iterator = 1;
                while (iterator <= 6) {
                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    iterator++;
                }
            }
        }
        $('#tabs-' + currentTab).css('height', myheightNew);
    });

    var whichday = 'history';
    if (currentTab === 'Overview-Today') {
        whichday = 'today';
    }

    // add charts and graphs
    buildDashboardCharts(whichday);
}

function buildDashboardCharts(whichday) {

    if (currentTab === 'Overview-Today') {

        var testDate = '2014-06-10';
        var sourcedate = new Date(new Date().setDate(new Date().getDate()));
        testDate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());

        sourcedate = new Date(2014, 6, 10);
        testDate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());

        $('#today-downloads').children().remove();
        $('#today-faults').children().remove();
        $('#today-log').children().remove();
        $('#today-voltages').children().remove();
        
        // add charts and graphs

        //$('#today-downloads') // *
        buildOverviewDownloads(testDate, whichday);
        //$('#today-downloads') // *

        //$('#today-faults') // **
        buildOverviewFaults(testDate, whichday);
        //$('#today-faults') // **

        //$('#today-log')
        buildOverviewLog(testDate, whichday);
        //$('#today-log')

        //$('#today-voltages') // ***
        buildOverviewVoltages(testDate, whichday);
        //$('#today-voltages') // ***
    };

    if (currentTab === 'Overview-Yesterday') {

        var testDate = '2014-06-10';
        var sourcedate = new Date(new Date().setDate(new Date().getDate() - 1));
        testDate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());

        sourcedate = new Date(2014, 6, 10);
        testDate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());

        $('#history-downloads').children().remove();
        $('#history-alarms').children().remove();
        $('#history-offnormal').children().remove();
        $('#history-thirtyday').children().remove();
        $('#history-voltages').children().remove();
        $('#history-faults').children().remove();

        //$('#history-downloads') // *
        buildOverviewDownloads(testDate, whichday);
        //$('#history-downloads') // *

        //$('#history-alarms')
        //$('#history-offnormal')
        //$('#history-thirtyday')

        //$('#history-voltages') // ***
        buildOverviewVoltages(testDate, whichday);
        //$('#history-voltages') // ***

        //$('#history-faults') // **
        buildOverviewFaults(testDate, whichday);
        //$('#history-faults') // **
    };
}

function buildOverviewDownloads(testDate, whichday) {

    //$('#' + whichday + '-downloads') // * // history OR today
    $('#' + whichday + '-downloads').append('<h3 style="text-allign: left; color: darkblue">Event Files: <span></span> </h3>');
    $('#' + whichday + '-downloads').append('<table class="table table-striped" id="' + whichday + '-downloads-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"> </table>');
    $('#' + whichday + '-downloads-table').append('<tr><th style="text-align: center; color: darkblue"><h4>Meters</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-meters"></h3></td></tr>');
    $('#' + whichday + '-downloads-table').append('<tr><th style="text-align: center; color: darkblue"><h4>Lines</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lines"></h3></td></tr>');


    dataHub.queryFileGroupRecords(testDate, 'dd', 1).done(function (data) {
        var element = $('#' + whichday + '-downloads span').first();
        if (data === undefined) {
            //$(element).append('Query Failed!');
            //showInfoMessage('Query Failed!', 10000);
            //showErrorMessage('Query Failed!', 10000);
        }
        else {
            $(element).append(data.length);
        }
        // last thing - resize
        $(window).resize();
    });

    dataHub.queryMeterCount(testDate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-meters').append(data);
        // last thing - resize
        $(window).resize();
    });

    dataHub.queryLineCount(testDate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-lines').append(data);
        // last thing - resize
        $(window).resize();
    });
}

function buildOverviewFaults(testDate, whichday) {

    //$('#' + whichday + '-faults') // * // history OR today
    $('#' + whichday + '-faults').append('<h3 style="text-allign: left; color: #640701">Faults: <span></span></h3>');
    $('#' + whichday + '-faults').append('<table class="table table-striped" id="' + whichday + '-faults-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"> </table>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>Line->Ground</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lineground"></h3></td></tr>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>Line->Line</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-lineline"></h3></td></tr>');
    $('#' + whichday + '-faults-table').append('<tr><th style="text-align: center; color: #640701"><h4>All 3-Phase</h4></th><td style="text-align: center;color: black"><h3 id="' + whichday + '-threeline"></h3></td></tr>');


    dataHub.queryFaultSummaryRecords(testDate, 'dd', 1).done(function (data) {
        var element = $('#' + whichday + '-faults span').first();
        if (data === undefined || data === null) {
            //$(element).append('Query Failed!');
        }
        else {
            $(element).append(data);
            cache_OverviewLog_Data = data;
        }
        // last thing - resize
        $(window).resize();
    });

    dataHub.queryFaultSummaryGroundFaultCount(testDate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-lineground').append(data);
        // last thing - resize
        $(window).resize();
    });

    dataHub.queryFaultSummaryLineFaultCount(testDate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-lineline').append(data);
        // last thing - resize
        $(window).resize();
    });

    dataHub.queryFaultSummaryAllPhaseFaultCount(testDate, 'dd', 1).done(function (data) {
        $('#' + whichday + '-threeline').append(data);
        // last thing - resize
        $(window).resize();
    });
}

function buildOverviewLog(testDate, whichday) {
    var jeffe = 0;
    jeffe += 1;
}

function buildOverviewVoltages(testDate, whichday) {
    var jeffe = 0;
    jeffe += 1;
}

