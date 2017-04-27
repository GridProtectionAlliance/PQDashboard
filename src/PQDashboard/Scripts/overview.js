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

function showOverviewPage(tab) {
    $('#overviewYesterdayDate').text(new Date(new Date().setDate(new Date().getDate() - 1)).toDateString());
    $('#overviewTodayDate').text(new Date(new Date().setDate(new Date().getDate())).toDateString());

    $('.grid2').masonry({
        itemSelector: '.grid2-item',
        columnWidth: 300,
        gutter: 4
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

            if (ovtodayWidth > (1200 + leftrightoffset)) {
                var iterator = 1;
                while (iterator <= 4) {

                    if (myheightNew <= $('#grid2-item-Today-' + iterator).height()) {
                        myheightNew += $('#grid2-item-Today-' + iterator).height();
                    }
                    iterator++;
                }
            }
            else if (ovtodayWidth <= (1200 + leftrightoffset) & ovtodayWidth > (600 + leftrightoffset)) {
                var iterator = 2;
                while (iterator <= 4) {

                    myheightNew += $('#grid2-item-Today-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovtodayWidth <= (600 + leftrightoffset)) {
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

            if (ovyesterdayWidth > (1200 + leftrightoffset)) {

                var iterator = 1;
                while (iterator <= 6) {

                    if (myheightNew <= $('#grid2-item-Yesterday-' + iterator).height()) {
                        myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    }
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (1200 + leftrightoffset) & ovyesterdayWidth > (900 + leftrightoffset)) {
                var iterator = 3;
                while (iterator <= 4) {

                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (900 + leftrightoffset) & ovyesterdayWidth > (600 + leftrightoffset)) {

                var iterator = 2;
                while (iterator <= 6) {

                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();
                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (600 + leftrightoffset) & ovyesterdayWidth > (300 + leftrightoffset)) {
                var iterator = 1;
                while (iterator <= 6) {

                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();

                    iterator++;
                }
            }
            else if (ovyesterdayWidth <= (300 + leftrightoffset)) {
                var iterator = 1;
                while (iterator <= 6) {

                    myheightNew += $('#grid2-item-Yesterday-' + iterator).height();

                    iterator++;
                }
            }
        }
        $('#tabs-' + currentTab).css('height', myheightNew);
    });

    // add charts and graphs
    buildDashboardCharts();


    // last thing - resize
    //$(window).resize();   

}

function buildDashboardCharts() {

    if (currentTab === 'Overview-Today') {

        var sourcedate = new Date(new Date().setDate(new Date().getDate()));
        sourcedate = new Date(2014,6,20);
        var testDate = '2014-06-20';
        testdate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());

        $('#today-downloads').children().remove();
        $('#today-faults').children().remove();
        $('#today-log').children().remove();
        $('#today-voltages').children().remove();

        dataHub.queryFileGroupCount(testDate, 'dd', 1).done(function (data) {
            //    // add charts and graphs

            //$('#today-downloads') // *
            $('#today-downloads').append('<h4 style="text-allign: left; color: darkblue">Event Files  ' + data + ' files.</h4>');
            $('#today-downloads').append('<table id="today-downloads-table" style="width: 100%; border: 2px; padding: 5px; border-spacing: 5px"> </table>');
            $('#today-downloads-table').append('<tr><th style="text-align: right; color: darkblue"> Meters </th><td style="text-align: right"> <h4 id="today-meters"></h4> </td></tr>');
            $('#today-downloads-table').append('<tr><th style="text-align: right; color: darkblue"> Lines </th><td style="text-align: right"> <h4 id="today-lines"></h4> </td></tr>');

            //$('#today-faults') // **
            //$('#today-log')
            //$('#today-voltages') // ***

            // last thing - resize
            $(window).resize();
        });
        
        dataHub.queryFileGroupCount().done(function (data) {
            // day, dd, d
            // last thing - resize
            $(window).resize();
        });

        dataHub.queryEventCount(testDate, 'd', 1).done(function (data) {

            // last thing - resize
            $(window).resize();
        });

        dataHub.queryMeterCount(testDate, 'd', 1).done(function (data) {
            $('#today-meters').append(data);

            // last thing - resize
            $(window).resize();
        });

        dataHub.queryLineCount(testDate, 'day', 1).done(function (data) {
            $('#today-lines').append(data);

            // last thing - resize
            $(window).resize();
        });

        // add charts and graphs

        //$('#today-downloads') // *
        //$('#today-faults') // **
        //$('#today-log')
        //$('#today-voltages') // ***
    };

    if (currentTab === 'Overview-Yesterday') {

        var sourcedate = new Date(new Date().setDate(new Date().getDate() -1));
        sourcedate = new Date(2014, 6, 20);
        var testDate = '2014-06-20';
        testdate = sourcedate.getFullYear().toString() + '-' + (sourcedate.getMonth().toString().length < 2 ? '0' + sourcedate.getMonth().toString() : sourcedate.getMonth().toString()) + '-' + (sourcedate.getDate().toString().length < 2 ? '0' + sourcedate.getDate().toString() : sourcedate.getDate().toString());


        $('#history-downloads').children().remove();
        $('#history-alarms').children().remove();
        $('#history-offnormal').children().remove();
        $('#history-thirtyday').children().remove();
        $('#history-voltages').children().remove();
        $('#history-faults').children().remove();

        //$('#history-downloads') // *
        dataHub.queryFileGroupCount(testDate, 'dd', 1).done(function (data) {

            // last thing - resize
            $(window).resize();
        });

        dataHub.queryMeterCount(testDate, 'd', 1).done(function (data) {

            // last thing - resize
            $(window).resize();
        });

        dataHub.queryLineCount(testDate, 'day', 1).done(function (data) {
            $('#today-lines').append(data);

            // last thing - resize
            $(window).resize();
        });
        //$('#history-alarms')
        //$('#history-offnormal')
        //$('#history-thirtyday')
        //$('#history-voltages') // ***
        //$('#history-faults') // **
    };


}

