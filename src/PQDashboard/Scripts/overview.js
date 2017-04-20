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

                    if (myheightNew <= $('#grid2-item-Today-' + iterator).height())
                    {
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

    $(window).resize();

    // - 
    buildDashboardCharts();
}

function buildDashboardCharts() {



}

