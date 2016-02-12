//******************************************************************************************************
//  OpenSEELines.js - Gbtc
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
//  01/12/2015 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////
// Global

    var loadingPanel = null;
    var postedEventId = "";
    var postedEventName = "";
    var postedLineId = "";
    var postedMeterId = "";
    var postedDate = "";
    var postedEventDate = "";
    var postedMeterName = "";
    var options1 = null;
    var options2 = null;
    var options3 = null;
    var defaultTickInterval = 1000;
    var currentTickInterval = defaultTickInterval;

//////////////////////////////////////////////////////////////////////////////////////////////

    function selectAdd(theControlID, theValue, theText, selected) {

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

    function computeTickInterval(xMin, xMax) {
        var zoomRange = xMax - xMin;
        return currentTickInterval;
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //explicitly set the tickInterval for the 3 charts - based on
    //selected range
    function setTickInterval(event) {
        var xMin = event.xAxis[0].min;
        var xMax = event.xAxis[0].max;
        computeTickInterval(xMin, xMax);
        options1.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
        options1.targetChart.xAxis[0].isDirty = true;
        options2.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
        options2.targetChart.xAxis[0].isDirty = true;
        options3.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
        options3.targetChart.xAxis[0].isDirty = true;
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //reset the extremes and the tickInterval to default values
    function unzoom() {

        if (options1 == null) return;
        if (options2 == null) return;
        if (options3 == null) return;

        if (typeof (options1.targetChart.xAxis) != 'undefined'){
            if (typeof (options2.targetChart.xAxis) != 'undefined') {
                if (typeof (options3.targetChart.xAxis) != 'undefined') {
                    options1.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                    options1.targetChart.xAxis[0].isDirty = true;
                    options2.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                    options2.targetChart.xAxis[0].isDirty = true;
                    options3.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                    options3.targetChart.xAxis[0].isDirty = true;
                    options1.targetChart.xAxis[0].setExtremes(null, null);
                    options2.targetChart.xAxis[0].setExtremes(null, null);
                    options3.targetChart.xAxis[0].setExtremes(null, null);
                }
            }
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function positionFloatingTooltipDiv() {
        
        var floatingDiv = $('#draggable');

        if (!floatingDiv.is(':hidden')) {
            var w = $(window);
            floatingDiv.css({
                'top': Math.abs(((w.height() - floatingDiv.outerHeight()) / 2) + w.scrollTop()),
                'left': Math.abs(((w.width() - floatingDiv.outerWidth()) / 2) + w.scrollLeft())
            });
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function populateDivWithLineChartByInstanceID(thedatasource, thediv, theeventinstance, label, datatype) {

        var options = {
            targetChart: {},
            plotOptions: {
                series: {
                    turboThreshold: 0,
                    animation: false,
                    marker: {
                        radius: 0
                    },

                    point: {
                        events: {
                            mouseOver: function() {
                                var tooltiphtml = $('#draggable')[0].innerHTML;
                                $('#draggable').html(tooltiphtml + '<hr><table><tr><td class="dot" style="background: ' + this.series.color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + this.series.name + ':</b></td><td><b>' + this.y.toFixed(3) + '</b></td></tr></table>');
                            }
                        }
                    },
                    events: {
                        mouseOut: function() {

                        }
                    }
                }
            },
            chart: {
                animation: false
                , marginLeft: 100
                , type: 'line'
                , zoomType: 'x'
                , renderTo: thediv
                , reflow: true
                , alignThresholds: true
                , panning: true
                , panKey: 'shift'
                , resetZoomButton: {
                    theme: {
                        display: 'none'
                    }
                }

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

                events: {

                    afterSetExtremes: function () {

                        if (!this.chart.options.chart.isZoomed) {
                            var xMin = this.chart.xAxis[0].min;
                            var xMax = this.chart.xAxis[0].max;

                            var zmRange = computeTickInterval(xMin, xMax);

                            options1.targetChart.xAxis[0].options.tickInterval = zmRange;
                            options1.targetChart.xAxis[0].isDirty = true;
                            options2.targetChart.xAxis[0].options.tickInterval = zmRange;
                            options2.targetChart.xAxis[0].isDirty = true;
                            options3.targetChart.xAxis[0].options.tickInterval = zmRange;
                            options3.targetChart.xAxis[0].isDirty = true;

                            options1.targetChart.options.chart.isZoomed = true;
                            options1.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options1.targetChart.options.chart.isZoomed = false;

                            options2.targetChart.options.chart.isZoomed = true;
                            options2.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options2.targetChart.options.chart.isZoomed = false;

                            options3.targetChart.options.chart.isZoomed = true;
                            options3.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options3.targetChart.options.chart.isZoomed = false;
                        }
                    }
                }
            },
            yAxis: [{
                title: { text: 'Voltage' }, gridLineWidth: 0
            }],
            legend: {
                width: 120,
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

                formatter: function() {
                    var floatingDiv = $('#draggable');
                    if (floatingDiv.is(':hidden')) {
                        floatingDiv.show();
                        positionFloatingTooltipDiv();
                    }
                    var theX = this.points[0].point.x;

                    var tooltiphtml = '<table><tr><td colspan="3" align="center"><b>+ ' + this.x + ' Seconds</b></td></tr>';

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">VOLTAGE (volts)</td></tr>';

                    $.each(options1.series, (function(key, value) {
                        if (typeof (value.data[theX]) != 'undefined') {
                            tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options1.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                        }
                    }));

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">CURRENT (amps)</td></tr>';

                    $.each(options2.series, (function(key, value) {
                        if (typeof (value.data[theX]) != 'undefined') {
                            tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options2.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                        }
                    }));

                    if (options3.series.length > 0) {
                        tooltiphtml += '<tr><td nowrap colspan="3" align="center">FAULT DISTANCE (miles)</td></tr>';
                        $.each(options3.series, (function(key, value) {
                            if (typeof (value.data[theX]) != 'undefined') {
                                tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options3.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                            }
                        }));
                    }
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

        if (datatype != null) {
            thedatasent = "{'EventInstanceID':'" + theeventinstance + "', 'DataType':'" + datatype + "'}";
        }

        $.ajax({
            type: "POST",
            url: './signalService.asmx/' + thedatasource,
            data: thedatasent,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            success: function (data) {
                options.yAxis[0].title.text = data.d.Yaxis0name;
                options.xAxis.tickPixelInterval = 0;
                options.xAxis.tickInterval = 1000;
                options.xAxis.pointInterval = 1000;
                options.xAxis.categories = data.d.xAxis;
                options.series = data.d.data;
                options.targetChart = new Highcharts.Chart(options, function (chart) {
                    syncronizeCrossHairs(chart);
                });
                options.targetChart.exportSVGElements[0].toFront();
                options.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                options.targetChart.xAxis[0].isDirty = true;
                unzoom();
            },
            failure: function (msg) {
                alert(msg);
            },
            async: true
        });

        return (options);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function PopulateEventWaveformDropdowns(themeterid, theDate) {
 
    var tempvalue = 0;
    if (postedLineId != "") {
        tempvalue = postedLineId;
        postedLineId = "";
    }
    populateEventMetric('EventLinesByMeterDate', themeterid, null, theDate, tempvalue);

    tempvalue = 0;
    if (postedEventDate != "") {
        tempvalue = postedEventDate;
        postedEventDate = "";
    }

    var theline = $("#EventLinesByMeterDate").val();

    populateEventMetric('EventInstancesByMeterLineDate', themeterid, theline, theDate, tempvalue);

    selectEventMeasure(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ResetWaveformDiv() {
    $('#WaveformEventsVoltage')[0].innerHTML = "";
    $('#WaveformEventsCurrent')[0].innerHTML = "";
    $('#WaveformEventsFaultCurve')[0].innerHTML = "";
    $("#EventLinesByMeterDate").empty();
    $("#EventLinesByMeterDate").multiselect("refresh");
    $("#EventInstancesByMeterLineDate").empty();
    $("#EventInstancesByMeterLineDate").multiselect("refresh");
    $('#draggable').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectEventMeasure(obj, thedate) {

    // obj is the control instance, sent only when the control itself fires selectMeasure.
    if (obj != null) {
        switch (obj.id) {
            case ("EventLinesByMeterDate"):
                var theline = $("#EventLinesByMeterDate").val();
                populateEventMetric('EventInstancesByMeterLineDate', postedMeterId, theline , postedDate);
                break;
        }
    }

    var EventLinesByMeterDate = $("#EventLinesByMeterDate").val();
    var EventInstancesByMeterLineDate = $("#EventInstancesByMeterLineDate").val();

    // If all exist, then let's act
    if (EventLinesByMeterDate && EventInstancesByMeterLineDate) {
        // Lets build a label for this chart
        var label = "";
        label += postedMeterName + " - ";
        label += $("#EventLinesByMeterDate")[0][$("#EventLinesByMeterDate")[0].selectedIndex].innerHTML + " - ";
        label += postedDate + " - ";
        label += $("#EventInstancesByMeterLineDate")[0][$("#EventInstancesByMeterLineDate")[0].selectedIndex].innerHTML;

        options1 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsVoltage', EventInstancesByMeterLineDate, label, "V");
        options2 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsCurrent', EventInstancesByMeterLineDate, "", "I");
        options3 = populateDivWithLineChartByInstanceID("getFaultCurveDataByID", 'WaveformEventsFaultCurve', EventInstancesByMeterLineDate, "", null);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateEventMetric(metric, siteID, lineID, theDate, desiredvalue) {

    var thedatasent = "";

    var theEventLine = "";
    var theEventInstance = "";

    switch (metric) {
        case "EventLinesByMeterDate":
            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
            break;

        case "EventInstancesByMeterLineDate":
            var theEventLineByMeterDate = $("#EventLinesByMeterDate").val();
            if (theEventLineByMeterDate == null) {
                $("#EventInstancesByMeterLineDate").empty();
                $("#EventInstancesByMeterLineDate").multiselect("refresh");
                return;
                }
            thedatasent = "{'siteID':'" + siteID + "','lineID':'" + lineID + "', 'targetDate':'" + theDate + "'}";
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
                    if (value.Item1 == desiredvalue) {
                        selected = "selected";
                    }
                    selectAdd(metric, value.Item1, value.Item2, selected);
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
            positionFloatingTooltipDiv();
        });

        $("#EventLinesByMeterDate").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });
        $("#EventInstancesByMeterLineDate").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });

        $('.ui-multiselect').css('font-size', 'smaller');

        // Event Mining
        $("#EventLinesByMeterDate")[0].change = function (event, ui) {
        selectEventMeasure(this);
        };
        $("#EventInstancesByMeterLineDate")[0].change = function (event, ui) {
        selectEventMeasure(this);
        };
        $('#resetZoom').click(function () {
            unzoom();
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    $(document).ready(function () {
        buildPage();

        postedEventId = $("#postedEventId")[0].innerHTML;
        postedEventName = $("#postedEventName")[0].innerHTML;
        postedMeterId = $("#postedMeterId")[0].innerHTML;
        postedDate = $("#postedDate")[0].innerHTML;
        postedLineId = $("#postedLineId")[0].innerHTML;
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

        var Child = $("#WaveformEventsVoltage");

        Child.css("height", chartheight / 3);

        var chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsCurrent");

        Child.css("height", chartheight / 3);

        chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsFaultCurve");

        Child.css("height", chartheight / 3);

        chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function syncronizeCrossHairs(chart) {
        var container = $(chart.container),
            offset = container.offset(),
            x, y, isInside, report;

        container.mousemove(function (evt) {

            x = evt.clientX - chart.plotLeft - offset.left;
            y = evt.clientY - chart.plotTop - offset.top;
            var xAxis = chart.xAxis[0];
            //remove old plot line and draw new plot line (crosshair) for this chart
            var xAxis1 = options1.targetChart.xAxis[0];
            xAxis1.removePlotLine("myPlotLineId");
            xAxis1.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',                
                id: "myPlotLineId"
            });
            //remove old crosshair and draw new crosshair on chart2
            var xAxis2 = options2.targetChart.xAxis[0];
            xAxis2.removePlotLine("myPlotLineId");
            xAxis2.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',               
                id: "myPlotLineId"
            });

            var xAxis3 = options3.targetChart.xAxis[0];
            xAxis3.removePlotLine("myPlotLineId");
            xAxis3.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',              
                id: "myPlotLineId"
            });                   
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

/// EOF