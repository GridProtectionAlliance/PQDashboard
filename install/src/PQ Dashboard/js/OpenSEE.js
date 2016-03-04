//******************************************************************************************************
//  OpenSEE.js - Gbtc
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
//  12/18/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////
// Global

    var loadingPanel = null;

    var postedEventId = "";
    var postedEventName = "";
    var postedMeterId = "";
    var postedDate = "";
    var postedEventDate = "";
    var postedMeterName = "";


//////////////////////////////////////////////////////////////////////////////////////////////

    function siteSelectAdd(theControlID, theValue, theText, selected) {

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

    function populateDivWithLineChartByInstanceID(thedatasource, thediv, theeventinstance, label) {

        var options = {
            plotOptions: {
                series: {
                    turboThreshold: 0,
                    animation: false,
                    marker: {
                        radius: 0
                    },

                    point: {
                        events: {
                            mouseOver: function () {
                                var tooltiphtml = $('#draggable')[0].innerHTML;
                                $('#draggable').html(tooltiphtml + '<hr><table><tr><td class="dot" style="background: ' + this.series.color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + this.series.name + ':</b></td><td><b>' + this.y.toFixed(3) + '</b></td></tr></table>');
                            }
                        }
                    },
                    events: {
                        mouseOut: function () {

                        }
                    }
                }
            },
            chart: {
                type: 'line'
                , zoomType: 'xy'
                , renderTo: thediv
                , reflow: true
                , alignThresholds: true
                , panning: true
                , panKey: 'shift'
            },

            credits: {
                enabled: false
            },
            title: {
                text: label,
                style: { "color": "#333333", "fontSize": "12px" }
            },
            xAxis: {
                categories: []
            },
            yAxis: [{
                title: { text: 'Voltage' }, gridLineWidth: 0
            }, {
                title: { text: 'Current' }, opposite: true
            }],
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                y: 50,
                symbolwidth: 8,
                symbolPadding: 1,
                padding: 3,
                itemMarginTop: 5,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {

                formatter: function () {
                    var floatingDiv = $('#draggable');
                    if (floatingDiv.is(':hidden')) {
                        var w = $(window);
                        floatingDiv.css({
                            'top': Math.abs(((w.height() - floatingDiv.outerHeight()) / 2) + w.scrollTop()),
                            'left': Math.abs(((w.width() - floatingDiv.outerWidth()) / 2) + w.scrollLeft())
                        });
                        floatingDiv.show();
                    }
                    var tooltiphtml = '<table><tr><td colspan="3" align="center"><b>+ ' + this.x + ' Seconds</b></td></tr>';
                    $.each(this.points, (function (key, value) {
                        tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + value.series.color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.series.name + ':</b></td><td><b> ' + value.y.toFixed(3) + '</b></td></tr>';
                    }));
                    tooltiphtml += '</table>';
                    floatingDiv.html(tooltiphtml);
                    return false;
                },
                valueDecimals: 3,
                crosshairs: [{
                    color: 'green',
                    dashStyle: 'solid'
                }, {
                    color: 'green',
                    dashStyle: 'solid'
                }],
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.60)'
            }
        };

        var thedatasent = "{'EventInstanceID':'" + theeventinstance + "'}";

        var chart = new Highcharts.Chart(options);
        chart.showLoading('Loading, please wait...');

        $.ajax({
            type: "POST",
            url: './signalService.asmx/' + thedatasource,
            data: thedatasent,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            success: function (data) {

                options.yAxis[0].title.text = data.d.Yaxis0name;
                options.yAxis[1].title.text = data.d.Yaxis1name;

                options.xAxis.tickPixelInterval = 0;
                options.xAxis.tickInterval = 1000;
                options.xAxis.pointInterval = 1000;
                options.xAxis.categories = data.d.xAxis;
                options.series = data.d.data;
                chart = new Highcharts.Chart(options);

                $.each(chart.series, (function (key, value) {
                    if (value.name.indexOf("Max") == 0) value.hide();
                    if (value.name.indexOf("Min") == 0) value.hide();
                }));

                chart.hideLoading();
                chart.exportSVGElements[0].toFront();
            },
            failure: function (msg) {
                alert(msg);
            },
            async: true
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function PopulateEventWaveformDropdowns(themeterid, theDate) {
 
    var tempvalue = 0;
    if (postedEventName != "") {
        tempvalue = postedEventName;
        postedEventName = "";
    }
    populateEventMetric('EventTypes', themeterid, theDate, tempvalue);

    tempvalue = 0;
    if (postedEventDate != "") {
        tempvalue = postedEventDate;
        postedEventDate = "";
    }
    populateEventMetric('EventInstances', themeterid, theDate, tempvalue);

    selectEventMeasure(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ResetWaveformDiv() {
    $('#WaveformEvents')[0].innerHTML = "";

    $("#EventTypes").empty();
    $("#EventTypes").multiselect("refresh");

    $("#EventInstances").empty();
    $("#EventInstances").multiselect("refresh");

    $('#draggable').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectEventMeasure(obj, thedate) {


    //postedEventId = $("#postedEventId")[0].innerHTML;
    //postedMeterId = $("#postedMeterId")[0].innerHTML;
    //postedDate = $("#postedDate")[0].innerHTML;
    //postedEventType = $("#postedEventType")[0].innerHTML;
    //postedEventDate = $("#postedEventDate")[0].innerHTML;

    // obj is the control instance, sent only when the control itself fires selectMeasure.
    if (obj != null) {

        switch (obj.id) {
            case ("EventTypes"):

                populateEventMetric('EventInstances', postedMeterId, postedDate);
                break;
        }
    }

    var EventType = $("#EventTypes").val();
    var EventInstance = $("#EventInstances").val();
    var EventCurve = $("#EventCurve").val();

    // If all exist, then let's act
    if (EventType && EventInstance && EventCurve) {

        // Lets build a label for this chart
        var label = "";
        label += postedMeterName + " - ";
        label += $("#EventTypes")[0][$("#EventTypes")[0].selectedIndex].innerHTML + " - ";
        label += postedDate + " - ";
        label += $("#EventInstances")[0][$("#EventInstances")[0].selectedIndex].innerHTML;

        if (EventCurve == "Values") {
            populateDivWithLineChartByInstanceID("getSignalDataByID", 'WaveformEvents', EventInstance, label);
        }

        if (EventCurve == "Curves") {
            populateDivWithLineChartByInstanceID("getFaultCurveDataByID", 'WaveformEvents', EventInstance, label);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateEventMetric(metric, siteID, theDate, desiredvalue) {

    var thedatasent = "";

    var theEventType = "";
    var theEventInstance = "";

    switch (metric) {
        case "EventTypes":
            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
            break;

        case "EventInstances":
            theEventType = $("#EventTypes").val();
            if (theEventType == null) {
                $("#EventInstances").empty();
                $("#EventInstances").multiselect("refresh");
                $("#EventChannel").empty();
                $("#EventChannel").multiselect("refresh");
                return;
            }

            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theEventType + "'}";
            break;

        case "EventChannels":

            theEventType = $("#EventTypes").val();
            if (theEventType == null) {
                $("#EventInstances").empty();
                $("#EventInstances").multiselect("refresh");
                return;
            }

            theEventInstance = $("#EventInstances").val();
            if (theEventInstance == null) {
                $("#EventChannel").empty();
                $("#EventChannel").multiselect("refresh");
                return;
            }

            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theEventType + "', 'theEventInstance':'" + theEventInstance + "'}";
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
                    siteSelectAdd(metric, value.Item1, value.Item2, selected);
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

        $("#draggable").draggable({scroll: false});

        $('#draggable').hide();

        $(window).on('resize', function () {
            resizecontents();
        });

    $("#EventTypes").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false });
    $("#EventInstances").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false });
    $("#EventCurve").multiselect({noneSelectedText: "Select", selectedList: 1, multiple: false });

    // Event Mining
    $("#EventTypes")[0].change = function (event, ui) {
        selectEventMeasure(this);
    };
    $("#EventInstances")[0].change = function (event, ui) {
        selectEventMeasure(this);
    };
    $("#EventCurve")[0].change = function (event, ui) {
        selectEventMeasure(this);
    };

}

//////////////////////////////////////////////////////////////////////////////////////////////

    $(document).ready(function () {
        buildPage();



        postedEventId = $("#postedEventId")[0].innerHTML;
        postedEventName = $("#postedEventName")[0].innerHTML;
        postedMeterId = $("#postedMeterId")[0].innerHTML;
        postedDate = $("#postedDate")[0].innerHTML;
        postedEventDate = $("#postedEventDate")[0].innerHTML;
        postedMeterName = $("#postedMeterName")[0].innerHTML;

        if (postedMeterId != "") {
            ResetWaveformDiv();
            resizecontents();
            PopulateEventWaveformDropdowns(postedMeterId, postedDate);
        } else {
            $.unblockUI();
        }
    });

//////////////////////////////////////////////////////////////////////////////////////////////
    function resizecontents() {

        var columnheight = $(window).height() - 110;

        resizeDocklet($("#DockWaveformEvents"), columnheight);

    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function resizeDocklet(theparent, chartheight) {

        theparent.css("height", chartheight);

        var firstChild = $("#" + theparent[0].firstElementChild.id);

        firstChild.css("height", chartheight);

        var chart = firstChild.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }
    }
/// EOF