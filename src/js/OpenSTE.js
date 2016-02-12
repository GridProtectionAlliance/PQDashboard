//******************************************************************************************************
//  OpenSEEStack.js - Gbtc
//
//==================================================================
//  Copyright © 2014 Electric Power Research Institute, Inc. 
//  The embodiments of this Program and supporting materials may be ordered from:
//                Electric Power Software Center (EPSC)
//                9625 Research Drive
//                Charlotte, NC 28262 USA
//                Phone: 1-800-313-3774
//                Email: askepri@epri.com
//  THIS NOTICE MAY NOT BE REMOVED FROM THE PROGRAM BY ANY USER THEREOF.
//==================================================================
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  09/17/2015 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////
// Global

var globalcolors = ['#ff0000', '#FF9600', '#90ed7d', '#f7a35c', '#FF9600', '#ff0000'];

    var postedchannelid = "";
    var posteddate = "";
    var postedmeterid = "";
    var postedmeasurementtype = "";
    var postedcharacteristic = "";
    var postedphasename = "";
    var postedmetername = "";
    var postedlinename = "";

//////////////////////////////////////////////////////////////////////////////////////////////

    function buildPage() {

        $.blockUI({ css: { border: '0px' } });

        $(document).ajaxStart(function() {
            $.blockUI({
                message: '<div class="wait_container"><img alt="" src="./images/ajax-loader.gif" /><br><div class="wait">Please Wait. Loading...</div></div>'
            });
        });

        $(document).ajaxStop(function() {
            $.unblockUI();
        });

        $(window).on('resize', function () {
            resizecontents();
        });

        $("#MeasurementType").multiselect({ minWidth: 200, noneSelectedText: "Type", selectedList: 1, multiple: false });
        $("#MeasurementCharacteristic").multiselect({ minWidth: 200, noneSelectedText: "Characteristic", selectedList: 1, multiple: false });
        $("#Phase").multiselect({ minWidth: 200, noneSelectedText: "Phase", selectedList: 1, multiple: false });
        $("#Period").multiselect({ minWidth: 70, noneSelectedText: "Period", selectedList: 1, multiple: false });

        $("#MeasurementType")[0].change = function (event, ui) {
            selectMeasure(this);
        };
        $("#MeasurementCharacteristic")[0].change = function (event, ui) {
            selectMeasure(this);
        };
        $("#Phase")[0].change = function (event, ui) {
            selectMeasure(this);
        };
        $("#Period")[0].change = function (event, ui) {
            selectMeasure(this);
        };
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    function resizecontents() {
        var columnheight = $(window).height() - 110;
        resizeDocklet($("#DockWaveformTrending"), columnheight);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    function resizeDocklet(theparent, chartheight) {

        theparent.css("height", chartheight);

        var Child = $("#WaveformTrending");

        Child.css("height", chartheight);

        var chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    $(document).ready(function () {

        postedchannelid = $("#postedchannelid")[0].innerHTML;
        posteddate = $("#posteddate")[0].innerHTML;
        postedmeterid = $("#postedmeterid")[0].innerHTML;
        postedmeasurementtype = $("#postedmeasurementtype")[0].innerHTML;
        postedcharacteristic = $("#postedcharacteristic")[0].innerHTML;
        postedphasename = $("#postedphasename")[0].innerHTML;
        postedmetername = $("#postedmetername")[0].innerHTML;
        postedlinename = $("#postedlinename")[0].innerHTML;

        buildPage();

        PopulateTrendingWaveformDropdowns();

        // Lets build a label for this chart
        var label = "";
        label += postedmetername + " - ";
        label += postedlinename + " - ";
        label += postedmeasurementtype + " - ";
        label += postedcharacteristic + " - ";
        label += postedphasename + " - ";
        label += posteddate;
        label += " for a Day";

        populateDivWithLineChartByChannelID("getTrendsforChannelIDDate", "WaveformTrending", postedchannelid, posteddate, label);
        resizecontents();
    });

	//////////////////////////////////////////////////////////////////////////////////////////////

    function populateDivWithLineChartByChannelID(thedatasource, thediv, thechannelid, thedate, label) {

        var options = {
            colors: globalcolors,
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        radius: 2
                    },
                turboThreshold: 0
                }
            },
            chart: {
                type: 'line',
                zoomType: 'x',
                panning: true,
                panKey: 'shift',
                renderTo: thediv
            },
            credits: {
                enabled: false
            },
            title: {
                text: label,
                style: { "color": "#333333", "fontSize": "12px" }
            },
            xAxis: {
                type: 'datetime',
                categories: [],

                labels: {
                    style: {
                        fontSize: '8px'
                    },
                    rotation: -45,
                    enabled: true
                }
            },
            yAxis: {

                title: {
                    text: 'Trend Magnitude'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontsize: '.3em',
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {

                itemStyle: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '10px'
                },

                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderWidth: 0
            }
            //tooltip: {
            //    //positioner: function () {
            //    //    return { x: 2, y: 12 };
            //    //},
            //    //formatter: function () {

            //    //    var tooltipstring = "";

            //    //    if (typeof (this.point.low) != 'undefined' && typeof (this.point.high) != 'undefined') {
            //    //        tooltipstring = '<b>' + this.series.name + ' : ' + this.point.low.toFixed(3) + ' - ' + this.point.high.toFixed(3) + '</b>';
            //    //    } else {
            //    //        tooltipstring = '<b>' + this.series.name + ' @ ' + this.x + ' : ' + this.y.toFixed(3) + '</b>';
            //    //    }

            //    //    return tooltipstring;
            //    //},
            //    shadow: false,
            //    borderWidth: 0,
            //    backgroundColor: 'rgba(255,255,255,0)'
            //}
        };

        var thedatasent = "{'ChannelID':'" + thechannelid + "', 'targetDate':'" + thedate + "'}";

        var chart = new Highcharts.Chart(options);
        chart.showLoading('Loading, please wait...');

        $.ajax({
            type: "POST",
            url: './eventService.asmx/' + thedatasource,
            data: thedatasent,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            success: function (data) {
                if (data.d == null) {
                    chart.hideLoading();
                    return;
                }

                options.xAxis.categories = data.d.xAxis;

                $.each(data.d.data[2].data, (function (key, value) {

                    data.d.data[2].data[key] = [data.d.xAxis[key], data.d.data[4].data[key], data.d.data[2].data[key]];

                }));

                data.d.data[2].linkedTo = 2;
                data.d.data[2].name = 'Range';
                options.series = data.d.data;
                options.series[3].lineWidth = 0;
                options.series[4].showInLegend = false;

                chart = new Highcharts.Chart(options);
                chart.series[4].hide();
                chart.series[5].hide();
                chart.series[1].hide();

                if (data.d.data[6].data.length == 0) {
                    chart.series[6].hide();
                    options.series[6].showInLegend = false;
                }

                chart.hideLoading();
            },
            failure: function (msg) {
                alert(msg);
            },
            async: true
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function PopulateTrendingWaveformDropdowns() {

        //$("#trendingWaveformHeader")[0].innerHTML = $("#trendingDetailHeader")[0].innerHTML;
        //populateDivWithLineChartByChannelID('getTrendsforChannelIDDate', 'Waveform' + currentTab, postedchannelid, posteddate, datarow.eventtype, datarow.sitename + " - " + datarow.eventtype + " - " + datarow.measurementtype + " - " + datarow.characteristic + " - " + datarow.phasename + " for " + theDate);
        populateTrendingMetric('MeasurementType', postedmeterid, posteddate, postedmeasurementtype);
        populateTrendingMetric('MeasurementCharacteristic', postedmeterid, posteddate, postedcharacteristic);
        populateTrendingMetric('Phase', postedmeterid, posteddate, postedphasename);
        setTrendingMetric("Period", "Day");
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function setTrendingMetric(metric, value) {

        // Disable change event on dropdown to be populated.
        var temp = $('#' + metric)[0].change;
        $('#' + metric)[0].change = null;

        $('#' + metric).val(value);

        $('#' + metric).multiselect("refresh");

        // Restore change event on completion
        $('#' + metric)[0].change = temp;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    function selectMeasure(obj, thedate) {

        ////Get selected row index so we can get details
        //var selectedrowindexes = $('#DetailTrending').jqxGrid('getselectedrowindexes');
        //// If nothing selected, return
        //if (selectedrowindexes.length == 0) return;
        //// get array of data from grid for currently selected row
        //var thedetails = $('#DetailTrending').jqxGrid('getrowdata', selectedrowindexes[0]);
        //// If thedate passed in is null, use heirarchical contextual date
        //if (thedate == null) thedate = $("#trendingDetailHeader")[0].innerHTML;


        // Get Day, Week, Month
        var theperiod = $("#Period").val();
        // obj is the control instance, sent only when the control itself fires selectMeasure.
        if (obj != null) {
            switch (obj.id) {
                case ("MeasurementType"):
                    populateTrendingMetric('MeasurementCharacteristic', postedmeterid, posteddate);
                    populateTrendingMetric('Phase', postedmeterid, posteddate);
                    break;

                case ("MeasurementCharacteristic"):
                    populateTrendingMetric('Phase', postedmeterid, posteddate);
                    break;
            }
        }

        var MeasurementType = $("#MeasurementType").val();
        var MeasurementCharacteristic = $("#MeasurementCharacteristic").val();
        var Phase = $("#Phase").val();

        // If all exist, then let's act
        if (MeasurementType && MeasurementCharacteristic && Phase) {

            // Lets build a label for this chart
            var label = "";
            label += postedmetername + " - ";
            label += postedlinename + " - ";
            label += $("#MeasurementType")[0][$("#MeasurementType")[0].selectedIndex].innerHTML + " - ";
            label += $("#MeasurementCharacteristic")[0][$("#MeasurementCharacteristic")[0].selectedIndex].innerHTML + " - ";
            label += $("#Phase")[0][$("#Phase")[0].selectedIndex].innerHTML + " - ";
            label += posteddate;
            label += " for " + $("#Period")[0][$("#Period")[0].selectedIndex].innerHTML;

            populateDivWithLineChartByCharacteristics('getTrends', 'WaveformTrending', "THESITENAME", postedmeterid, posteddate, MeasurementType, MeasurementCharacteristic, Phase, theperiod, label);
        }
    }
//////////////////////////////////////////////////////////////////////////////////////////////
    function populateDivWithLineChartByCharacteristics(thedatasource, thediv, siteName, siteID, thedate, MeasurementType, MeasurementCharacteristic, Phase, Period, label) {

        var options = {
            colors: globalcolors,
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        radius: 2
                    },
                    turboThreshold: 0
                }
            },
            //tooltip: {
            //    positioner: function () {
            //        return { x: 2, y: 12 };
            //    },
            //    formatter: function () {

            //        var tooltipstring = "";

            //        if (typeof (this.point.low) != 'undefined' && typeof (this.point.high) != 'undefined') {
            //            tooltipstring = '<b>' + this.series.name + ' : ' + this.point.low.toFixed(3) + ' - ' + this.point.high.toFixed(3) + '</b>';
            //        } else {
            //            tooltipstring = '<b>' + this.series.name + ' @ ' + this.x + ' : ' + this.y.toFixed(3) + '</b>';
            //        }

            //        return tooltipstring;
            //    },
            //    shadow: false,
            //    borderWidth: 0,
            //    backgroundColor: 'rgba(255,255,255,0)'
            //},
            chart: {
                panning: true,
                panKey: 'shift',
                type: 'line',
                zoomType: 'x',
                renderTo: thediv
            },
            credits: {
                enabled: false
            },
            title: {
                text: label,
                style: { "color": "#333333", "fontSize": "12px" }
            },
            xAxis: {
                categories: [],
                labels: {
                    style: {
                        fontSize: '8px'
                    },
                    rotation: -45,
                    enabled: true
                }
            },
            yAxis: {

                title: {
                    text: 'Trend Magnitude'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontsize: '.3em',
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderWidth: 0
            }
        };

        var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + thedate + "' , 'MeasurementType':'" + MeasurementType + "' , 'MeasurementCharacteristic':'" + MeasurementCharacteristic + "' , 'Phase':'" + Phase + "' , 'Period':'" + Period + "'}";

        var chart = new Highcharts.Chart(options);
        chart.showLoading('Loading, please wait...');

        $.ajax({
            type: "POST",
            url: './eventService.asmx/' + thedatasource,
            data: thedatasent,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            success: function (data) {

                options.xAxis.categories = data.d.xAxis;

                $.each(data.d.data[2].data, (function (key, value) {

                    data.d.data[2].data[key] = [data.d.xAxis[key], data.d.data[4].data[key], data.d.data[2].data[key]];

                }));

                data.d.data[2].linkedTo = 2;
                data.d.data[2].name = 'Range';
                options.series = data.d.data;
                options.series[3].lineWidth = 0;
                options.series[4].showInLegend = false;

                chart = new Highcharts.Chart(options);
                chart.series[4].hide();
                chart.series[5].hide();
                chart.series[1].hide();

                if (data.d.data[6].data.length == 0) {
                    chart.series[6].hide();
                    options.series[6].showInLegend = false;
                }

                chart.hideLoading();

            },
            failure: function (msg) {
                alert(msg);
            },
            async: true
        });
    }
//////////////////////////////////////////////////////////////////////////////////////////////
    function populateTrendingMetric(metric, siteID, theDate, desiredvalue) {

        var thedatasent = "";
        var theMeasurementType = "";
        var theMeasurementCharacteristic = "";

        switch (metric) {
            case "MeasurementType":
                thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
                break;

            case "MeasurementCharacteristic":
                theMeasurementType = $("#MeasurementType").val();
                if (theMeasurementType == null) {
                    $("#MeasurementCharacteristic").empty();
                    $("#MeasurementCharacteristic").multiselect("refresh");
                    $("#Phase").empty();
                    $("#Phase").multiselect("refresh");
                    return;
                }

                thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theMeasurementType + "'}";
                break;

            case "Phase":

                theMeasurementType = $("#MeasurementType").val();
                if (theMeasurementType == null) {
                    $("#MeasurementCharacteristic").empty();
                    $("#MeasurementCharacteristic").multiselect("refresh");
                    return;
                }

                theMeasurementCharacteristic = $("#MeasurementCharacteristic").val();
                if (theMeasurementCharacteristic == null) {
                    $("#Phase").empty();
                    $("#Phase").multiselect("refresh");
                    return;
                }

                thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theMeasurementType + "', 'theCharacteristic':'" + theMeasurementCharacteristic + "'}";
                break;

        }

        $.ajax({
            type: "POST",
            url: './eventService.asmx/' + metric,
            data: thedatasent,
            desiredvalue: desiredvalue,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            success: function (data) {

                // Disable change event on dropdown to be populated.
                var temp = $('#' + metric)[0].change;
                $('#' + metric)[0].change = null;
                //

                $('#' + metric).empty();

                if (data.d.length > 0) {
                    $.each(data.d, (function (key, value) {
                        var selected = "";
                        if (value.Item2 == desiredvalue) {
                            selected = "selected";
                        }
                        SelectAdd(metric, value.Item1, value.Item2, selected);
                    }));

                }

                $('#' + metric).multiselect("refresh");

                // Restore change event on completion
                $('#' + metric)[0].change = temp;
                //

            },
            failure: function (msg) {
                alert(msg);
            },
            async: false
        });

    }

    //////////////////////////////////////////////////////////////////////////////////////////////

    function SelectAdd(theControlID, theValue, theText, selected) {

        var exists = false;

        $('#' + theControlID + ' option').each(function () {
            if (this.innerHTML == theText) {
                exists = true;
                return false;
            }
        });

        if (!exists) {
            $('#' + theControlID).append("<option value='" + theValue + "' " + selected + ">" + theText + "</option>");
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////
/// EOF