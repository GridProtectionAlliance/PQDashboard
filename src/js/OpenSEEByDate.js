//******************************************************************************************************
//  OpenSEEByDate.js - Gbtc
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
//  01/19/2015 - Jeff Walker
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
    var options4 = null;
    var defaultTickInterval = 1000;
    var currentTickInterval = defaultTickInterval;


    var phasorchart = null;

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
        options4.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
        options4.targetChart.xAxis[0].isDirty = true;
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //reset the extremes and the tickInterval to default values
    function unzoom() {

        if (options1 == null) return;
        if (options2 == null) return;
        if (options3 == null) return;
        if (options4 == null) return;

        if (typeof (options1.targetChart.xAxis) != 'undefined'){
            if (typeof (options2.targetChart.xAxis) != 'undefined') {
                if (typeof (options3.targetChart.xAxis) != 'undefined') {
                    if (typeof (options4.targetChart.xAxis) != 'undefined') {
                        options1.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                        options1.targetChart.xAxis[0].isDirty = true;
                        options2.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                        options2.targetChart.xAxis[0].isDirty = true;
                        options3.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                        options3.targetChart.xAxis[0].isDirty = true;
                        options4.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
                        options4.targetChart.xAxis[0].isDirty = true;
                        options1.targetChart.xAxis[0].setExtremes(null, null);
                        options2.targetChart.xAxis[0].setExtremes(null, null);
                        options3.targetChart.xAxis[0].setExtremes(null, null);
                        options4.targetChart.xAxis[0].setExtremes(null, null);
                    }
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

        var floatingDiv = $('#phasor');

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
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    allowPointSelect: false,
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
                            options4.targetChart.xAxis[0].options.tickInterval = zmRange;
                            options4.targetChart.xAxis[0].isDirty = true;


                            options1.targetChart.options.chart.isZoomed = true;
                            options1.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options1.targetChart.options.chart.isZoomed = false;

                            options2.targetChart.options.chart.isZoomed = true;
                            options2.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options2.targetChart.options.chart.isZoomed = false;

                            options3.targetChart.options.chart.isZoomed = true;
                            options3.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options3.targetChart.options.chart.isZoomed = false;

                            options4.targetChart.options.chart.isZoomed = true;
                            options4.targetChart.xAxis[0].setExtremes(xMin, xMax, true);
                            options4.targetChart.options.chart.isZoomed = false;
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

                formatter: function () {

                    var phasorangleA = null;
                    var phasorvalueA = null;
                    var phasorangleB = null;
                    var phasorvalueB = null;
                    var phasorangleC = null;
                    var phasorvalueC = null;

                    var floatingDiv = $('#phasor');
                    
                    if (floatingDiv.is(':hidden')) {
                        floatingDiv.show();
                        positionFloatingTooltipDiv();
                    }

                    var floatingDiv = $('#draggable');

                    if (floatingDiv.is(':hidden')) {
                        floatingDiv.show();
                        positionFloatingTooltipDiv();
                    }

                    var theX = this.points[0].point.x;

                    var tooltiphtml = '<table><tr><td colspan="3" align="center"><b>+ ' + this.x + ' Seconds</b></td></tr>';

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">VOLTAGE (volts)</td></tr>';

                    $.each(options1.series, (function (key, value) {

                        if (value.name == 'RMS VAN') {
                            phasorvalueA = value.data[theX];
                        }

                        if (value.name == 'Phase VAN') {
                            phasorangleA = -(value.data[theX] * 180 / Math.PI);
                        }
                        
                        if (value.name == 'RMS VBN') {
                            phasorvalueB = value.data[theX];
                        }

                        if (value.name == 'Phase VBN') {
                            phasorangleB = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (value.name == 'RMS VCN') {
                            phasorvalueC = value.data[theX];
                        }

                        if (value.name == 'Phase VCN') {
                            phasorangleC = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (typeof (value.data[theX]) != 'undefined') {
                            if (value.name.indexOf("Phase") == -1) {
                            tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options1.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                            }
                        }
                    }));

                    if (phasorvalueA != null && phasorangleA != null) {
                        phasorchart.series[0].setData([[0,0],[phasorangleA, phasorvalueA]], true);
                    }

                    if (phasorvalueB != null && phasorangleB != null) {
                        phasorchart.series[1].setData([[0, 0], [phasorangleB, phasorvalueB]], true);
                    }

                    if (phasorvalueC != null && phasorangleC != null) {
                        phasorchart.series[2].setData([[0, 0], [phasorangleC, phasorvalueC]], true);
                    }

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">CURRENT (amps)</td></tr>';

                    $.each(options2.series, (function(key, value) {
                        if (typeof (value.data[theX]) != 'undefined') {
                            tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options2.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                        }
                    }));

                    if (options3.series.length > 0) {
                        tooltiphtml += '<tr><td nowrap colspan="3" align="center">VOLTAGE (volts)</td></tr>';
                        $.each(options3.series, (function(key, value) {
                            if (typeof (value.data[theX]) != 'undefined') {
                                if (value.name.indexOf("Phase") == -1) {
                                    tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options3.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
                                }
                            }
                        }));
                    }

                    if (options4.series.length > 0) {
                        tooltiphtml += '<tr><td nowrap colspan="3" align="center">CURRENT (amps)</td></tr>';
                        $.each(options4.series, (function (key, value) {
                            if (typeof (value.data[theX]) != 'undefined') {
                                tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options4.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + value.data[theX].toFixed(3) + '</b></td></tr>';
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

function PopulateEventWaveformDropdowns1(themeterid, theDate) {
 
    var tempvalue = 0;
    if (postedLineId != "") {
        tempvalue = postedLineId;
        postedLineId = "";
    }
    populateEventMetric('EventLinesByMeterDate1', 'EventLinesByMeterDate', themeterid, null, theDate, tempvalue);

    tempvalue = 0;
    if (postedEventDate != "") {
        tempvalue = postedEventDate;
        postedEventDate = "";
    }

    var theline = $("#EventLinesByMeterDate1").val();

    populateEventMetric('EventInstancesByMeterLineDate1', 'EventInstancesByMeterLineDate', themeterid, theline, theDate, tempvalue);

    selectEventMeasure1(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function PopulateEventWaveformDropdowns2(themeterid, theDate) {

    var tempvalue = 0;
    if (postedLineId != "") {
        tempvalue = postedLineId;
        postedLineId = "";
    }
    populateEventMetric('EventLinesByMeterDate2', 'EventLinesByMeterDate', themeterid, null, theDate, tempvalue);

    tempvalue = 0;
    if (postedEventDate != "") {
        tempvalue = postedEventDate;
        postedEventDate = "";
    }

    var theline = $("#EventLinesByMeterDate2").val();

    populateEventMetric('EventInstancesByMeterLineDate2', 'EventInstancesByMeterLineDate', themeterid, theline, theDate, tempvalue);

    selectEventMeasure2(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ResetWaveformDiv() {

    $('#WaveformEventsVoltage1')[0].innerHTML = "";
    $('#WaveformEventsCurrent1')[0].innerHTML = "";
    $('#WaveformEventsVoltage2')[0].innerHTML = "";
    $('#WaveformEventsCurrent2')[0].innerHTML = "";

    $("#EventLinesByMeterDate1").empty();
    $("#EventLinesByMeterDate1").multiselect("refresh");

    $("#EventInstancesByMeterLineDate1").empty();
    $("#EventInstancesByMeterLineDate1").multiselect("refresh");

    $("#EventLinesByMeterDate2").empty();
    $("#EventLinesByMeterDate2").multiselect("refresh");

    $("#EventInstancesByMeterLineDate2").empty();
    $("#EventInstancesByMeterLineDate2").multiselect("refresh");

    $('#draggable').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectEventMeasure1(obj, thedate) {

    // obj is the control instance, sent only when the control itself fires selectMeasure.
    if (obj != null) {
        switch (obj.id) {
            case ("EventLinesByMeterDate1"):
                var theline = $("#EventLinesByMeterDate1").val();
                populateEventMetric('EventInstancesByMeterLineDate1','EventInstancesByMeterLineDate', postedMeterId, theline , postedDate);
                break;
        }
    }

    var EventLinesByMeterDate = $("#EventLinesByMeterDate1").val();
    var EventInstancesByMeterLineDate = $("#EventInstancesByMeterLineDate1").val();

    // If all exist, then let's act
    if (EventLinesByMeterDate && EventInstancesByMeterLineDate) {
        // Lets build a label for this chart
        var label = "";
        label += postedMeterName + " - ";
        label += $("#EventLinesByMeterDate1")[0][$("#EventLinesByMeterDate1")[0].selectedIndex].innerHTML + " - ";
        label += postedDate + " - ";
        label += $("#EventInstancesByMeterLineDate1")[0][$("#EventInstancesByMeterLineDate1")[0].selectedIndex].innerHTML;

        options1 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsVoltage1', EventInstancesByMeterLineDate, label, "V");
        options2 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsCurrent1', EventInstancesByMeterLineDate, "", "I");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectEventMeasure2(obj, thedate) {

    // obj is the control instance, sent only when the control itself fires selectMeasure.
    if (obj != null) {
        switch (obj.id) {
            case ("EventLinesByMeterDate2"):
                var theline = $("#EventLinesByMeterDate2").val();
                populateEventMetric('EventInstancesByMeterLineDate2','EventInstancesByMeterLineDate', postedMeterId, theline, postedDate);
                break;
        }
    }

    var EventLinesByMeterDate = $("#EventLinesByMeterDate2").val();
    var EventInstancesByMeterLineDate = $("#EventInstancesByMeterLineDate2").val();

    // If all exist, then let's act
    if (EventLinesByMeterDate && EventInstancesByMeterLineDate) {
        // Lets build a label for this chart
        var label = "";
        label += postedMeterName + " - ";
        label += $("#EventLinesByMeterDate2")[0][$("#EventLinesByMeterDate2")[0].selectedIndex].innerHTML + " - ";
        label += postedDate + " - ";
        label += $("#EventInstancesByMeterLineDate2")[0][$("#EventInstancesByMeterLineDate2")[0].selectedIndex].innerHTML;

        options3 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsVoltage2', EventInstancesByMeterLineDate, label, "V");
        options4 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsCurrent2', EventInstancesByMeterLineDate, "", "I");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateEventMetric(controlname, metric, siteID, lineID, theDate, desiredvalue) {

    var thedatasent = "";

    var theEventLine = "";
    var theEventInstance = "";

    switch (metric) {
        case "EventLinesByMeterDate":
            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
            break;

        case "EventInstancesByMeterLineDate":
            //var theEventLineByMeterDate = $("#" + controlname).val();
            //if (theEventLineByMeterDate == null) {
            //    $("#" + controlname).empty();
            //    $("#" + controlname).multiselect("refresh");
            //    return;
            //    }
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
            var temp = $('#' + controlname)[0].change;
            $('#' + controlname)[0].change = null;
            //

            $('#' + controlname).empty();

            if (data.d.length > 0) {
                $.each(data.d, (function (key, value) {
                    var selected = "";
                    if (value.Item1 == desiredvalue) {
                        selected = "selected";
                    }
                    selectAdd(controlname, value.Item1, value.Item2, selected);
                }));

            }

            $('#' + controlname).multiselect("refresh");

            // Restore change event on completion
            $('#' + controlname)[0].change = temp;
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

        $("#phasor").draggable({ scroll: false, handle: '#phasorhandle' });

        $('#phasor').hide();

        $(window).on('resize', function () {
            resizecontents();
            positionFloatingTooltipDiv();
        });

        $("#EventLinesByMeterDate1").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });
        $("#EventInstancesByMeterLineDate1").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });

        $("#EventLinesByMeterDate2").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });
        $("#EventInstancesByMeterLineDate2").multiselect({ noneSelectedText: "Select", minWidth: "400", selectedList: 1, multiple: false });

        $('.ui-multiselect').css('font-size', 'smaller');

        // Event Mining Top
        $("#EventLinesByMeterDate1")[0].change = function (event, ui) {
        selectEventMeasure1(this);
        };
        $("#EventInstancesByMeterLineDate1")[0].change = function (event, ui) {
        selectEventMeasure1(this);
        };

        // Event Mining Bottom
        $("#EventLinesByMeterDate2")[0].change = function (event, ui) {
            selectEventMeasure2(this);
        };
        $("#EventInstancesByMeterLineDate2")[0].change = function (event, ui) {
            selectEventMeasure2(this);
        };

        $('#resetZoom').click(function () {
            unzoom();
        });

        createphasorchart();
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
            PopulateEventWaveformDropdowns1(postedMeterId, postedDate);
            PopulateEventWaveformDropdowns2(postedMeterId, postedDate);
        } else {
            $.unblockUI();
        }
    });

//////////////////////////////////////////////////////////////////////////////////////////////

    function resizecontents() {
        var columnheight = $(window).height() - 90;
        resizeDocklet($("#DockWaveformEvents"), columnheight);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function resizeDocklet(theparent, chartheight) {

        var theheight = chartheight / 4;

        theparent.css("height", chartheight);

        var Child = $("#WaveformEventsVoltage1");

        Child.css("height", theheight);

        var chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsCurrent1");

        Child.css("height", theheight);

        chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsVoltage2");

        Child.css("height", theheight);

        chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsCurrent2");

        Child.css("height", theheight);

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

            var xAxis4 = options4.targetChart.xAxis[0];
            xAxis4.removePlotLine("myPlotLineId");
            xAxis4.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',
                id: "myPlotLineId"
            });
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function createphasorchart() {

        phasorchart = new Highcharts.Chart(
        {
            tooltip: {
                enabled: true
            },

            credits: {
                enabled: false
            },

            exporting: {
                enabled: false
            },

            chart: {
                renderTo: 'phasorchart',
                polar: true,
                animation: false
            },

            title: {
                text: '',
                style: {
                    display: 'none'
                }
            },
            subtitle: {
                text: '',
                style: {
                    display: 'none'
                }
            },

            pane: {
                startAngle: -90,
                endAngle: 270
            },

            xAxis: {
                tickInterval: 30,
                min: -180,
                max: 180,
                labels: {
                    enabled: true,
                    formatter: function() {
                        return this.value + '°';
                    }
                }
            },

            yAxis: {
                min: 0,
                tickInterval: 50000
                },

            plotOptions: {
                series: {
                    animation: false,
                    stickyTracking: false,
                    pointStart: 0,
                    pointInterval: 1,
                    enableMouseTracking: false,
                    dataGrouping: {
                        enabled: false
                    }
                },
                column: {
                    pointPadding: 0,
                    groupPadding: 0,
                    animation: false
                }
            },

            series: [{
                type: 'line',
                name: 'VAN',
                color: '#FF0000',
                marker: {lineWidth: 5, symbol: 'circle' },
                data: [] 
            },
            {
                type: 'line',
                name: 'VBN',
                color: '#00FF00',
                marker: {lineWidth: 5, symbol: 'circle' },
                data: []

            },
            {
                type: 'line',
                name: 'VCN',
                color: '#0000FF',
                marker: {lineWidth: 5, symbol: 'circle' },
                data: []

            }] 
        });
    }

/// EOF
//////////////////////////////////////////////////////////////////////////////////////////////