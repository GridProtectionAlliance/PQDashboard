//******************************************************************************************************
//  OpenSEE.js - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  12/18/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////
// Global

var pointdata = new Array();
var loadingPanel = null;

var postedSystemFrequency = "";
var postedStationName = "";
var postedMeterId = "";
var postedMeterName = "";
var postedLineName = "";
var postedLineLength = "";
var postedEventId = "";
var postedEventName = "";
var postedEventDate = "";
var postedDate = "";
var postedEventMilliseconds = "";
var postedStartTime = "";
var postedPhase = "";
var postedDurationPeriod = "";
var postedMagnitude = "";
var postedCalculationCycle = "";
var postedBreakerNumber = "";
var postedBreakerPhase = "";
var postedBreakerTiming = "";
var postedBreakerSpeed = "";
var postedBreakerOperation = "";
var postedShowFaultCurves = "";
var postedShowBreakerDigitals = "";

var systemFrequency = 60;
var calculationCycle;

var pointsTable = [];
var selectedPoint;

var plots = [];
var plotDataList = [];
var markingBuilders = [];

var zeroMarker = false;
var zoom = false;
var xaxisHover = 0;
var phasorData = [];

var colorVAN = '#A30000';
var colorVBN = '#0029A3';
var colorVCN = '#007A29';
var colorVAB = '#A3007A';
var colorVBC = '#007AA3';
var colorVCA = '#7AA300';

var colorIAN = '#FF0000';
var colorIBN = '#0066CC';
var colorICN = '#33CC33';
var colorIR = '#A3A3A3';

var colorBrown = '#996633';
var colorGray = '#333300';
var colorPurple = '#9900FF';
var colorAqua = '#66CCFF';
var colorTan = '#CC9900';
//////////////////////////////////////////////////////////////////////////////////////////////

(function ($) {
    function init(plot) {
        plot.hooks.processOptions.push(function (plot, options) {
            $.each(plot.getAxes(), function (axisName, axis) {
                var opts = axis.options;

                if (opts.mode == "time") {
                    var timeTickGenerator = axis.tickGenerator;
                    var timeTickFormatter = axis.tickFormatter;

                    var defaultTickGenerator = function (axis) {

                        var ticks = [],
                            start = floorInBase(axis.min, axis.tickSize),
                            i = 0,
                            v = Number.NaN,
                            prev;

                        do {
                            prev = v;
                            v = start + i * axis.tickSize;
                            ticks.push(v);
                            ++i;
                        } while (v < axis.max && v != prev);
                        return ticks;
                    };

                    var defaultTickFormatter = function (value, axis) {

                        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
                        var formatted = "" + Math.round(value * factor) / factor;

                        // If tickDecimals was specified, ensure that we have exactly that
                        // much precision; otherwise default to the value's own precision.

                        if (axis.tickDecimals != null) {
                            var decimal = formatted.indexOf(".");
                            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
                            if (precision < axis.tickDecimals) {
                                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
                            }
                        }

                        return formatted;
                    };

                    axis.tickGenerator = function (axis) {
                        // If delta is less than one second,
                        // use the default tick generator
                        if (axis.delta < 1000)
                            return defaultTickGenerator(axis);

                        return timeTickGenerator(axis);
                    };

                    axis.tickFormatter = function (value, axis) {
                        if (axis.delta < 1) {
                            var trunc = value - floorInBase(value, 1000);
                            return defaultTickFormatter(trunc, axis) + " ms";
                        }

                        if (axis.delta < 1000) {
                            var format = $.plot.formatDate(new Date(value), "%M:%S");
                            var ticks = Math.floor(value * 10000);
                            var subsecond = (ticks % 10000000).toString();

                            while (subsecond.length < 7)
                                subsecond = "0" + subsecond;
                            
                            while (subsecond.length > 1 && subsecond.slice(-1) == "0")
                                subsecond = subsecond.slice(0, -1);

                            if (subsecond != 0)
                                return format + "." + subsecond;

                            return format;
                        }

                        // If delta is less than one second, use the default
                        // tick formatter and display only milliseconds
                        if (axis.delta < 1000) {
                            var trunc = value - floorInBase(value, 1000);
                            return defaultTickFormatter(trunc, axis) + " ms";
                        }

                        return timeTickFormatter(value, axis);
                    };
                }
            });
        });
    }

    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    $.plot.plugins.push({
        init: init,
        options: { },
        name: "openSEEFlot",
        version: "1.0"
    });
})(jQuery);

//////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    buildPage();

    postedSystemFrequency = $("#postedSystemFrequency")[0].innerHTML;
    postedStationName = $("#postedStationName")[0].innerHTML;
    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;
    postedLineName = $("#postedLineName")[0].innerHTML;
    postedLineLength = $("#postedLineLength")[0].innerHTML;
    postedEventId = $("#postedEventId")[0].innerHTML;
    postedEventName = $("#postedEventName")[0].innerHTML;
    postedEventDate = $("#postedEventDate")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedEventMilliseconds = $("#postedEventMilliseconds")[0].innerHTML;
    postedStartTime = $("#postedStartTime")[0].innerHTML;
    postedPhase = $("#postedPhase")[0].innerHTML;
    postedDurationPeriod = $("#postedDurationPeriod")[0].innerHTML;
    postedMagnitude = $("#postedMagnitude")[0].innerHTML;
    postedCalculationCycle = $("#postedCalculationCycle")[0].innerHTML;
    postedBreakerNumber = $("#postedBreakerNumber")[0].innerHTML;
    postedBreakerPhase = $("#postedBreakerPhase")[0].innerHTML;
    postedBreakerTiming = $("#postedBreakerTiming")[0].innerHTML;
    postedBreakerSpeed = $("#postedBreakerSpeed")[0].innerHTML;
    postedBreakerOperation = $("#postedBreakerOperation")[0].innerHTML;
    postedShowFaultCurves = $("#postedShowFaultCurves")[0].innerHTML;
    postedShowBreakerDigitals = $("#postedShowBreakerDigitals")[0].innerHTML;

    systemFrequency = Number(postedSystemFrequency) || 60;
    calculationCycle = Number(postedCalculationCycle) || NaN;
    xaxisHover = Number(postedEventMilliseconds);

    if (postedMeterId != "") {
        resetWaveformDiv();
        showData();

        //$(window).one('hubConnected', function () {
        //});
    } else {
        $.unblockUI();
    }

    nextBackSelect($('#next-back-selection option:selected').val());

    $('#next-back-selection').change(function () {
        nextBackSelect($('#next-back-selection option:selected').val());
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////
// Functions

function buildPage() {
    var timeout = null;

    $.blockUI({ css: { border: '0px' } });

    $(document).ajaxStart(function () {
        $.blockUI({
            message: '<div class="wait_container"><img alt="" src="/Images/ajax-loader.gif" /><br><div class="wait">Please Wait. Loading...</div></div>'
        });
    });

    $(document).ajaxStop(function () {
        $.unblockUI();
    });

    $('#accumulatedpointscontent').puidatatable({
        stickyHeader: true,
        selectionMode: 'single',
        rowSelect: function (event, data) { selectedPoint= data.arrayIndex; },
        columns: [
            { field: 'theseries', headerText: 'Series' },
            { field: 'thetime', headerText: 'Time', content: ShowTime },
            { field: 'thevalue', headerText: 'Value' },
            { field: 'deltatime', headerText: 'Delta Time', content: ShowDeltaTime },
            { field: 'deltavalue', headerText: 'Delta Value' }
        ],
        datasource: pointsTable
    });

    $("#unifiedtooltip").draggable({ scroll: false, handle: '#unifiedtooltiphandle' });
    $('#unifiedtooltip').hide();

    $("#accumulatedpoints").draggable({ scroll: false, handle: '#accumulatedpointshandle' });
    $('#accumulatedpoints').hide();

    $("#phasor").draggable({ scroll: false, handle: '#phasorhandle' });
    $('#phasor').hide();

    $(window).on('resize', function () {
        clearTimeout(timeout);

        timeout = setTimeout(function () {
            resizecontents();
            positionFloatingTooltipDiv();
            resizing = false;
        }, 100);
    });

   

    $('#resetZoom').click(function () {
        unzoom();
    });
}


function ShowTime(rowdata) {
    var html = rowdata.thetime.toFixed(7) + " sec<br>" + (rowdata.thetime * systemFrequency).toFixed(2) + " cycles";
    return html;
}

function ShowDeltaTime(rowdata) {
    var html = rowdata.deltatime.toFixed(7) + " sec<br>" + (rowdata.deltatime * systemFrequency).toFixed(2) + " cycles";
    return html;
}
//////////////////////////////////////////////////////////////////////////////////////////////

function resetWaveformDiv() {
    $('#accumulatedpoints').hide();
    $('#unifiedtooltip').hide();
    $('#phasor').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function addPlotDiv(id) {
    var div = $('<div>');

    if (id != undefined)
        div.prop("id", id);

    div.append(
        $('<table style="width: 100%">').append(
            $('<tr>').append(
                $('<td>').append($('<div class="ChartPlot">')),
                $('<td style="width: 140px">').append($('<div class="ChartLegend">')))));

    $("#DockCharts").append(div);

    plotDataList.push([]);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showData() {
    // If all exist, then let's act
    if (postedEventName && postedEventId) {
        // Lets build a label for this chart
        var label = "";
        var details = "";
        var separator = "&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;";
        var faultLink = '<a href="#" title="Click for fault details" onClick="showdetails(this);">Fault</a>';

        label += "Station: " + postedStationName;
        label += separator + "Line: " + postedLineName;
        label += "<br />";

        if (postedEventName != "Fault")
            label += "Event Type: " + postedEventName;
        else
            label += "Event Type: " + faultLink;

        label += separator + "Event Time: " + postedEventDate;

        if (postedStartTime != "")
            details += "Start: " + postedStartTime;

        if (postedPhase != "") {
            if (details != "")
                details += separator;

            details += "Phase: " + postedPhase;
        }

        if (postedDurationPeriod != "") {
            if (details != "")
                details += separator;

            details += "Duration: " + postedDurationPeriod;
        }

        if (postedMagnitude != "") {
            if (details != "")
                details += separator;

            details += "Magnitude: " + postedMagnitude;
        }

        if (details != "")
            label += "<br />" + details;

        details = "";

        if (postedBreakerNumber != "")
            details += "Breaker: " + postedBreakerNumber;

        if (postedBreakerPhase != "") {
            if (details != "")
                details += separator;

            details += "Phase: " + postedBreakerPhase;
        }

        if (postedBreakerTiming != "") {
            if (details != "")
                details += separator;

            details += "Timing: " + postedBreakerTiming;
        }

        if (postedBreakerSpeed != "") {
            if (details != "")
                details += separator;

            details += "Speed: " + postedBreakerSpeed;
        }

        if (postedBreakerOperation != "") {
            if (details != "")
                details += separator;

            details += "Operation: " + postedBreakerOperation;
        }

        if (details != "")
            label += "<br />" + details;

        $("#TitleData")[0].innerHTML = label;

        populateDivWithLineChartByInstanceID(postedEventId);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateDivWithLineChartByInstanceID(theeventinstance) {
    var seriesIndexes = [];

    $.each(SeriesList, function (key, series) {
        var include = series.MeasurementType == "Voltage" ||
                      series.MeasurementType == "Current" ||
                      (postedShowFaultCurves != 0 &&
                       series.MeasurementCharacteristic == "FaultDistance") ||
                      (postedShowBreakerDigitals != 0 &&
                       series.MeasurementType == "Digital" &&
                       series.MeasurementCharacteristic != "None");

        if (include)
            seriesIndexes.push(key);
    });

    seriesIndexes.sort(function (index1, index2) {
        var getOrder = function (series) {
            var order = 0;

            if (series.MeasurementCharacteristic == "RMS")
                order += 10;
            else if (series.MeasurementCharacteristic == "WaveAmplitude")
                order += 20;
            else if (series.MeasurementCharacteristic == "FaultDistance")
                order += 30;

            if (series.Phase == "AN")
                order += 0;
            else if (series.Phase == "BN")
                order += 1;
            else if (series.Phase == "CN")
                order += 2;
            else if (series.Phase == "AB")
                order += 3;
            else if (series.Phase == "BC")
                order += 4;
            else if (series.Phase == "CA")
                order += 5;
            else if (series.Phase == "NG")
                order += 6;
            else if (series.Phase == "Net")
                order += 7;
            else if (series.Phase == "RES")
                order += 8;
            else
                order += 9;

            return order;
        };

        var series1 = SeriesList[index1];
        var series2 = SeriesList[index2];
        var order1 = getOrder(series1);
        var order2 = getOrder(series2);

        if (order1 < order2)
            return -1;
        else if (order1 > order2)
            return 1;
        else if (series1.MeasurementCharacteristic == "FaultDistance" && index1 < index2)
            return -1;
        else if (series1.MeasurementCharacteristic == "FaultDistance" && index1 > index2)
            return 1;
        else if (series1.ChannelName < series2.ChannelName)
            return -1;
        else if (series1.ChannelName > series2.ChannelName)
            return 1;
        else
            return 0;
    });

    var thedatasent = "{'eventID':'" + theeventinstance + "','seriesIndexes':['" + seriesIndexes.join("','") + "']}";

    $.ajax({
        type: "POST",
        url: homePath + 'signalService.asmx/getFlotData',
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            function highlightCycle(plotIndex, series) {
                if (isNaN(calculationCycle) || calculationCycle >= series.DataPoints.length)
                    return;

                var dataPointCount = Math.min(128, series.DataPoints.length - 1);
                var timeStart = series.DataPoints[0][0] / 1000.0;
                var timeEnd = series.DataPoints[dataPointCount][0] / 1000.0;
                var samplesPerCycle = Math.round(dataPointCount / (systemFrequency * (timeEnd - timeStart)));

                var endIndex = Math.min(calculationCycle + samplesPerCycle, series.DataPoints.length - 1);
                var from = series.DataPoints[calculationCycle][0];
                var to = series.DataPoints[endIndex][0];

                return {
                    color: "#FFA",
                    xaxis: {
                        from: from,
                        to: to
                    }
                };
            }

            function highlightSample(plotIndex, series) {
                if (isNaN(calculationCycle) || calculationCycle >= series.DataPoints.length)
                    return;

                var from = series.DataPoints[calculationCycle][0];

                return {
                    color: "#EB0",
                    xaxis: {
                        from: from,
                        to: from
                    }
                };
            }

            var options = {
                canvas: true,
                legend: { show: false },
                crosshair: { mode: "x" },
                selection: { mode: "x" },
                grid: {
                    autoHighlight: false,
                    clickable: true,
                    hoverable: true
                },
                xaxis: {
                    mode: "time",
                    tickLength: 10
                },
                yaxis: {
                    labelWidth: 50,
                    panRange: false,
                    tickLength: 10,
                    tickFormatter: function (val, axis) {
                        if (axis.delta > 1000000 && (val > 1000000 || val < -1000000))
                            return ((val / 1000000) | 0) + "M";
                        else if (axis.delta > 1000 && (val > 1000 || val < -1000))
                            return ((val / 1000) | 0) + "K";
                        else
                            return val.toFixed(axis.tickDecimals);
                    }
                }
            }

            // Assign voltage data series received from
            // the server to the appropriate plot
            $.each(data.d, function (_, series) {
                var include = series.MeasurementType == "Voltage" &&
                              series.MeasurementCharacteristic != "AngleFund" &&
                              series.MeasurementCharacteristic != "WaveError";

                var plotIndex;

                if (!include)
                    return;

                plotIndex = $("#DockCharts").children().index($("#VoltageChart"));

                if (plotIndex < 0) {
                    addPlotDiv("VoltageChart");
                    plotIndex = $("#DockCharts").children().index($("#VoltageChart"));
                }

                series.flotSeries = {
                    data: [],
                    label: "V" + series.Phase
                };

                series.visible = false;

                if (series.MeasurementCharacteristic == "RMS")
                    series.flotSeries.label += " RMS";
                else if (series.MeasurementCharacteristic == "AngleFund")
                    series.flotSeries.label += " Phase";
                else if (series.MeasurementCharacteristic == "WaveAmplitude")
                    series.flotSeries.label += " Amplitude";
                else if (series.MeasurementCharacteristic == "WaveError")
                    series.flotSeries.label += " Error";
                else
                    series.visible = true;

                if (series.Phase == "AN")
                    series.flotSeries.color = colorVAN;
                else if (series.Phase == "BN")
                    series.flotSeries.color = colorVBN;
                else if (series.Phase == "CN")
                    series.flotSeries.color = colorVCN;
                else
                    series.visible = false;

                if (series.Phase == "AB")
                    series.flotSeries.color = colorVAB;
                else if (series.Phase == "BC")
                    series.flotSeries.color = colorVBC;
                else if (series.Phase == "CA")
                    series.flotSeries.color = colorVCA;

                series.checked = series.visible;

                if (parseBoolean(postedShowFaultCurves) && !isNaN(calculationCycle)) {
                    if (series.MeasurementCharacteristic == "Instantaneous") {
                        series.highlightCycle = function () { return highlightCycle(plotIndex, series); };
                    } else {
                        series.highlightSample = function () { return highlightSample(plotIndex, series); };
                    }
                }

                plotDataList[plotIndex].push(series);
            });

            // Assign current data series received from
            // the server to the appropriate plot
            $.each(data.d, function (_, series) {
                var include = series.MeasurementType == "Current" &&
                              series.MeasurementCharacteristic != "AngleFund" &&
                              series.MeasurementCharacteristic != "WaveError";

                var plotIndex;

                if (!include)
                    return;

                plotIndex = $("#DockCharts").children().index($("#CurrentChart"));

                if (plotIndex < 0) {
                    addPlotDiv("CurrentChart");
                    plotIndex = $("#DockCharts").children().index($("#CurrentChart"));
                }

                series.flotSeries = {
                    data: [],
                    label: "I" + series.Phase
                };

                series.visible = false;

                if (series.MeasurementCharacteristic == "RMS")
                    series.flotSeries.label += " RMS";
                else if (series.MeasurementCharacteristic == "AngleFund")
                    series.flotSeries.label += " Phase";
                else if (series.MeasurementCharacteristic == "WaveAmplitude")
                    series.flotSeries.label += " Amplitude";
                else if (series.MeasurementCharacteristic == "WaveError")
                    series.flotSeries.label += " Error";
                else
                    series.visible = true;

                if (series.Phase == "AN")
                    series.flotSeries.color = colorIAN;
                else if (series.Phase == "BN")
                    series.flotSeries.color = colorIBN;
                else if (series.Phase == "CN")
                    series.flotSeries.color = colorICN;
                else
                    series.visible = false;

                if (series.Phase == "AB")
                    series.flotSeries.color = colorIAB;
                else if (series.Phase == "BC")
                    series.flotSeries.color = colorIBC;
                else if (series.Phase == "CA")
                    series.flotSeries.color = colorICA;
                else if (series.Phase == "RES")
                    series.flotSeries.color = colorIR;

                series.checked = series.visible;

                if (parseBoolean(postedShowFaultCurves) && !isNaN(calculationCycle)) {
                    if (series.MeasurementCharacteristic == "Instantaneous") {
                        series.highlightCycle = function () { return highlightCycle(plotIndex, series); };
                    } else {
                        series.highlightSample = function () { return highlightSample(plotIndex, series); };
                    }
                }

                plotDataList[plotIndex].push(series);
            });

            // Assign fault data series received from
            // the server to the fault curve plot
            $.each(data.d, function (_, series) {
                var plotIndex;

                if (!parseBoolean(postedShowFaultCurves))
                    return false;

                if (series.MeasurementCharacteristic != "FaultDistance")
                    return;

                plotIndex = $("#DockCharts").children().index($("#FaultChart"));

                if (plotIndex < 0) {
                    addPlotDiv("FaultChart");
                    plotIndex = $("#DockCharts").children().index($("#FaultChart"));
                }

                series.flotSeries = {
                    data: [],
                    label: series.ChannelName
                };

                series.visible = true;

                if (series.MeasurementCharacteristic == "Simple")
                    series.flotSeries.color = colorBrown;
                else if (series.MeasurementCharacteristic == "Reactance")
                    series.flotSeries.color = colorGray;
                else if (series.MeasurementCharacteristic == "Takagi")
                    series.flotSeries.color = colorPurple;
                else if (series.MeasurementCharacteristic == "ModifiedTakagi")
                    series.flotSeries.color = colorAqua;
                else if (series.MeasurementCharacteristic == "Novosel")
                    series.flotSeries.color = colorTan;

                series.checked = series.visible;

                series.highlightSample = function () {
                    var waveform;

                    $.each(data.d, function (_, series) {
                        if (series.MeasurementCharacteristic == "Instantaneous") {
                            waveform = series;
                            return false;
                        }

                        if (series.MeasurementCharacteristic != "FaultDistance")
                            waveform = waveform || series;
                    });

                    series.highlightSample = function () { return highlightSample(plotIndex, waveform); };
                    series.highlightSample();
                };

                plotDataList[plotIndex].push(series);
            });

            // Assign breaker data series received
            // from the server to the breaker plot
            $.each(data.d, function (_, series) {
                var plotIndex;

                if (!parseBoolean(postedShowBreakerDigitals))
                    return false;

                if (series.MeasurementType != "Digital")
                    return;

                if (series.MeasurementCharacteristic == "None")
                    return;

                plotIndex = $("#DockCharts").children().index($("#BreakerChart"));

                if (plotIndex < 0) {
                    addPlotDiv("BreakerChart");
                    plotIndex = $("#DockCharts").children().index($("#BreakerChart"));
                }

                series.flotSeries = {
                    data: [],
                    label: series.ChannelDescription
                };

                series.visible = true;
                series.checked = series.visible;

                plotDataList[plotIndex].push(series);
            });

            $.each(plotDataList, function (_, plotData) {
                var anyVisible = false;

                $.each(plotData, function (_, series) {
                    anyVisible = series.visible;

                    if (anyVisible)
                        return false;
                });

                if (!anyVisible) {
                    $.each(plotData, function (_, series) {
                        if (series.MeasurementCharacteristic != "Instantaneous")
                            return;

                        series.visible =
                            series.Phase == "AB" ||
                            series.Phase == "BC" ||
                            series.Phase == "CA";

                        series.checked = series.visible;
                        anyVisible = anyVisible || series.visible;
                    });
                }

                if (!anyVisible) {
                    $.each(plotData, function (_, series) {
                        series.visible = true;
                        series.checked = true;
                    });
                }
            });

            $.each(data.d, function (_, series) {
                if (series.MeasurementCharacteristic != "RMS")
                    return;

                if (series.MeasurementType == "Voltage" && series.Phase == "AN")
                    phasorData[0] = series.DataPoints;
                else if (series.MeasurementType == "Voltage" && series.Phase == "BN")
                    phasorData[1] = series.DataPoints;
                else if (series.MeasurementType == "Voltage" && series.Phase == "CN")
                    phasorData[2] = series.DataPoints;
                else if (series.MeasurementType == "Current" && series.Phase == "AN")
                    phasorData[3] = series.DataPoints;
                else if (series.MeasurementType == "Current" && series.Phase == "BN")
                    phasorData[4] = series.DataPoints;
                else if (series.MeasurementType == "Current" && series.Phase == "CN")
                    phasorData[5] = series.DataPoints;
            });

            $.each(data.d, function (_, series) {
                var merge = function (rms, phase) {
                    var data = [];
                    var i = 0;
                    var j = 0;

                    while (i < rms.length && j < phase.length) {
                        if (rms[i][0] == phase[j][0]) {
                            data.push([rms[i][0], rms[i][1], phase[j][1]]);
                            i++;
                            j++;
                        }
                        else if (rms[i][0] < phase[j][0]) {
                            i++;
                        }
                        else {
                            j++;
                        }
                    }

                    return data;
                };

                if (series.MeasurementCharacteristic != "AngleFund")
                    return;

                if (series.MeasurementType == "Voltage" && series.Phase == "AN")
                    phasorData[0] = { color: colorVAN, data: merge(phasorData[0], series.DataPoints) };
                else if (series.MeasurementType == "Voltage" && series.Phase == "BN")
                    phasorData[1] = { color: colorVBN, data: merge(phasorData[1], series.DataPoints) };
                else if (series.MeasurementType == "Voltage" && series.Phase == "CN")
                    phasorData[2] = { color: colorVCN, data: merge(phasorData[2], series.DataPoints) };
                else if (series.MeasurementType == "Current" && series.Phase == "AN")
                    phasorData[3] = { color: colorIAN, data: merge(phasorData[3], series.DataPoints) };
                else if (series.MeasurementType == "Current" && series.Phase == "BN")
                    phasorData[4] = { color: colorIBN, data: merge(phasorData[4], series.DataPoints) };
                else if (series.MeasurementType == "Current" && series.Phase == "CN")
                    phasorData[5] = { color: colorICN, data: merge(phasorData[5], series.DataPoints) };
            });

            // Resize plot divs
            resizecontents();

            // Initialize the plots
            $.each($(".ChartPlot"), function (key, div) {
                var flotSeries = [];

                if ($($("#DockCharts").children()[key]).attr("id") == "FaultChart") {
                    options.yaxis.min = -0.05 * Number(postedLineLength);
                    options.yaxis.max = 1.05 * Number(postedLineLength);
                } else {
                    options.yaxis.min = null;
                    options.yaxis.max = null;
                }

                // series.flotSeries.data has not been populated yet;
                // we do this so we can get the colors for
                // each series as assigned by Flot without
                // having to render all the data
                $.each(plotDataList[key], function (_, series) {
                    flotSeries.push(series.flotSeries);
                });

                plots.push($.plot(div, flotSeries, options));

                // Assign each series' color as assigned by Flot
                $.each(plots[key].getData(), function (index, data) {
                    plotDataList[key][index].flotSeries.color = data.color;
                });

                // Lock the crosshair as we will be updating
                // it manually in the plotHover event
                plots[key].lockCrosshair();

                // Attach to events and
                // intialize the legend
                attachEvents(key);
                initLegend(key);
            });

            // Update the data in the plot to
            // display data for the first time
            updatePlotData();

            // Add marking builder to highlight window.opener region
            markingBuilders.push(function (plotKey, markings) {
                try {
                    if (!window.opener || !window.opener.Highlight)
                        return;
                } catch (err) {
                    return;
                }

                markings.push({
                    color: "#FFA",
                    xaxis: {
                        from: window.opener.Highlight.Start,
                        to: window.opener.Highlight.End
                    }
                });
            });

            // Add marking builder to highlight fault calculation cycle
            markingBuilders.push(function (plotKey, markings) {
                var highlightCycle;
                var highlightSample;
                var highlightFunction;

                $.each(plotDataList[plotKey], function (_, series) {
                    if (series.visible) {
                        highlightCycle = highlightCycle || series.highlightCycle;
                        highlightSample = highlightSample || series.highlightSample;
                    }
                });

                highlightFunction = highlightCycle || highlightSample;

                if (highlightFunction && !(highlightCycle && highlightSample)) {
                    var marking = highlightFunction();

                    if (marking)
                        markings.push(marking);
                }
            });

            if (zeroMarker) {
                markingBuilders.push(function (plotKey, markings) {
                    var voltagePlotKey = $("#DockCharts").children().index($("#VoltageChart"));
                    var currentPlotKey = $("#DockCharts").children().index($("#CurrentChart"));

                    if (plotKey != voltagePlotKey && plotKey != currentPlotKey)
                        return;

                    markings.push({
                        color: "#BBB",
                        yaxis: {
                            from: 0,
                            to: 0
                        }
                    });
                });
            }

            // Assign function to window to
            // update the markings on the plots
            window.UpdateMarkings = function (plotKey) {
                function updateMarkings(plotKey) {
                    var markings = [];
                    var plot = plots[plotKey];

                    $.each(markingBuilders, function (_, markingBuilder) {
                        markingBuilder(plotKey, markings);
                    });

                    plot.getOptions().grid.markings = markings;
                    plot.draw();
                }

                if (plotKey) {
                    updateMarkings(plotKey);
                    return;
                }

                $.each(plots, function (plotKey, _) {
                    updateMarkings(plotKey);
                });
            };

            // Update markings on plots
            window.UpdateMarkings();

            // Align all plot axes
            alignAxes();

            // Update the tooltip with initial values
            updatePhasorChart();
            updateTooltip();
            $.unblockUI();

        },
        failure: function (msg) {
            alert(msg);
        },
        async: true
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function attachEvents(key) {
    var div = $(".ChartPlot")[key];
    var overlay = $(div).find(".flot-overlay");
    var clickHandled = false;

    $(div).bind("plothover", function (event, pos, item) {
        xaxisHover = pos.x;

        $.each(plots, function (_, plot) {
            plot.setCrosshair(pos);
        });

        updatePhasorChart();
        updateTooltip();
    });

    $(div).bind("plotclick", function (event, pos, item) {
        var time;
        var deltatime;
        var deltavalue;

        if (clickHandled || !item)
            return;
 
        time = (item.datapoint[0] - Number(postedEventMilliseconds)) / 1000.0;
        deltatime = 0.0;
        deltavalue = 0.0;
        
        if (pointsTable.length > 0) {
            deltatime = time - pointsTable[pointsTable.length-1].thetime;
            deltavalue = item.datapoint[1] - pointsTable[pointsTable.length-1].thevalue;
        }

        pointsTable.push({
            theseries: item.series.label,
            thetime: time,
            thevalue: item.datapoint[1].toFixed(3),
            deltatime: deltatime,
            deltavalue: deltavalue.toFixed(3),
            arrayIndex: pointsTable.length
        });

        $('#accumulatedpointscontent').puidatatable('reload');

        var scrollDiv = $('#accumulatedpointscontent').parent()[0];
        scrollDiv.scrollTop = scrollDiv.scrollHeight;
    });

    $(div).bind("plotselected", function (event, ranges) {
        $.each(plots, function (key, plot) {
            var xaxis = plot.getAxes().xaxis;
            xaxis.options.min = ranges.xaxis.from;
            xaxis.options.max = ranges.xaxis.to;
            plot.clearSelection();
        });

        updatePlotData();
        clickHandled = true;
        zoom = true;
    });

    (function mouseDrag() {
        var panCenter = null;

        overlay.mousedown(function (e) {
            if (e.which != 1) {
                clickHandled = true;
                return;
            }

            if (e.shiftKey) {
                panCenter = { x: e.pageX, y: e.pageY };
                plots[key].suspendSelection();

                $(document).one("mouseup", function (e) {
                    if (e.which == 1 && panCenter != null) {
                        panCenter = null;
                        plots[key].resumeSelection();
                    }
                });
            }

            clickHandled = false;
        });

        overlay.mousemove(function (e) {
            if (panCenter != null) {
                var xaxis = plots[0].getAxes().xaxis;
                var panDistance = { left: panCenter.x - e.pageX, top: 0 };
                var xaxisDistance = panDistance.left / xaxis.scale;

                var datamin = null;
                var datamax = null;

                $.each(plots, function (_, plot) {
                    var xaxis = plot.getAxes().xaxis;

                    if (datamin == null || xaxis.datamin < datamin)
                        datamin = xaxis.datamin;

                    if (datamax == null || xaxis.datamax > datamax)
                        datamax = xaxis.datamax;
                });

                if (xaxisDistance + xaxis.min < datamin) {
                    xaxisDistance = datamin - xaxis.min;
                    panDistance.left = xaxisDistance * xaxis.scale;
                } else if (xaxisDistance + xaxis.max > datamax) {
                    xaxisDistance = datamax - xaxis.max;
                    panDistance.left = xaxisDistance * xaxis.scale;
                }

                $.each(plots, function (key, plot) {
                    plot.pan(panDistance);
                    fixYAxis(key);
                });

                panCenter.x -= panDistance.left;

                clickHandled = true;
            }
        });
    })();

    (function mouseScroll() {
        var minDelta = null;
        var maxDelta = 5;

        overlay.mousewheel(function (e) {
            var xaxis = plots[key].getAxes().xaxis;
            var xcenter = xaxisHover;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;
            var datamin = null;
            var datamax = null;

            var deltaMagnitude;
            var delta;
            var factor;

            $.each(plots, function (_, plot) {
                var xaxis = plot.getAxes().xaxis;

                if (datamin == null || xaxis.datamin < datamin)
                    datamin = xaxis.datamin;

                if (datamax == null || xaxis.datamax > datamax)
                    datamax = xaxis.datamax;
            });

            if (xmin == null)
                xmin = datamin;

            if (xmax == null)
                xmax = datamax;

            if (xmin == null || xmax == null)
                return;

            xcenter = Math.max(xcenter, xmin);
            xcenter = Math.min(xcenter, xmax);

            if (e.originalEvent.wheelDelta != undefined)
                delta = e.originalEvent.wheelDelta;
            else
                delta = -e.originalEvent.detail;

            deltaMagnitude = Math.abs(delta);

            if (minDelta == null || deltaMagnitude < minDelta)
                minDelta = deltaMagnitude;
            
            deltaMagnitude /= minDelta;
            deltaMagnitude = Math.min(deltaMagnitude, maxDelta);
            factor = deltaMagnitude / 10;

            if (delta > 0) {
                xmin = xmin * (1 - factor) + xcenter * factor;
                xmax = xmax * (1 - factor) + xcenter * factor;
            } else {
                xmin = (xmin - xcenter * factor) / (1 - factor);
                xmax = (xmax - xcenter * factor) / (1 - factor);
            }

            if (xmin < datamin)
                xmin = datamin;

            if (xmax > datamax)
                xmax = datamax;

            if (xmin == xaxis.options.xmin && xmax == xaxis.options.xmax)
                return;

            $.each(plots, function (_, plot) {
                var xaxis = plot.getAxes().xaxis;
                xaxis.options.min = xmin;
                xaxis.options.max = xmax;
            });

            zoom = true;
            updatePlotData();
            alignAxes();
        });
    })();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initLegend(key) {
    var table = $('<table>');

    $($(".ChartLegend")[key]).append(table);

    table.css({
        "width": "100%",
        "font-size": "smaller",
        "font-weight": "bold"
    });

    $.each(plotDataList[key], function (_, series) {
        var row = $('<tr>');
        var checkbox = $('<input type="checkbox">');
        var borderDiv = $('<div>');
        var colorDiv = $('<div>');
        var labelSpan = $('<span>');
        var color;

        if (series.visible)
            color = series.flotSeries.color;
        else
            color = "#CCC";

        table.append(
            row.append(
                $('<td class="legendCheckbox" title="Show/hide in tooltip">').append(
                    checkbox),
                $('<td class="legendColorBox" title="Show/hide in chart">').append(
                    borderDiv.append(colorDiv)),
                $('<td class="legendLabel">').append(
                    labelSpan.append(series.flotSeries.label))));

        checkbox.prop("checked", series.checked);

        borderDiv.css({
            "border": "1px solid #CCC",
            "padding": "1px"
        });

        colorDiv.css({
            "width": "4px",
            "height": "0",
            "border": "5px solid " + color,
            "overflow": "hidden"
        });

        labelSpan.prop("title", series.flotSeries.label);
        labelSpan.css("color", series.flotSeries.color);

        checkbox.click(function () {
            series.checked = !series.checked;
            updatePhasorChart();
            updateTooltip();
        });

        row.children().slice(1).click(function () {
            series.visible = !series.visible;

            updatePlotData(key);
            alignAxes();

            if (series.visible)
                colorDiv.css("border", "5px solid " + series.flotSeries.color);
            else
                colorDiv.css("border", "5px solid #CCC");
        });
    });

    $(".legendCheckbox").hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function updatePlotData(key) {

    function updatePlot(plotKey) {
        var plotData = [];

        $.each(plotDataList[plotKey], function (_, series) {
            if (series.visible)
                plotData.push(series.flotSeries);

            plots[plotKey].setData(plotData);
        });

        if (window.UpdateMarkings)
            window.UpdateMarkings(plotKey);

        // Fix y-axis after updating data
        fixYAxis(plotKey);
    }

    function downsample(series, sampleCount) {
        var data = [];
        var start = 0;
        var end = series.DataPoints.length;
        var step = end / sampleCount;

        if (step < 1)
            step = 1;

        var prev = 0;

        for (var n = 0; n < series.DataPoints.length; n += step * 2) {
            var start = Math.floor(n);
            var next = Math.floor(n + step * 2);
            var end = Math.min(next, series.DataPoints.length);

            var min = null;
            var max = null;

            for (var i = start; i < end; i++) {
                var val = series.DataPoints[i];

                if (min == null || min[1] > val[1])
                    min = val;

                if (max == null || max[1] <= val[1])
                    max = val;
            }

            if (min != null) {
                if (min[0] < max[0]) {
                    data.push(min);
                    data.push(max);
                } else if (min[0] > max[0]) {
                    data.push(max);
                    data.push(min);
                } else {
                    data.push(min);
                }
            }
        }

        return data;
    };

    function getSamplingWindow(series) {
        var minSamplingWindow = 200;
        var maxSamplingWindow = series.DataPoints.length;
        var chartWidth = $(".ChartPlot").width();

        var idealSamplingWindow;
        var windowKey;

        if (plots.length > 0) {
            var start = 0;
            var end = series.DataPoints.length;

            var xaxis = plots[0].getAxes().xaxis;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;

            if (xmin != null)
                start = null;

            if (xmax != null)
                end = null;

            $.each(series.DataPoints, function (key, dataPoint) {
                if (start != null && end != null)
                    return false;

                if (start == null && dataPoint[0] >= xmin)
                    start = key;

                if (end == null && dataPoint[0] >= xmax)
                    end = key;
            });

            idealSamplingWindow = maxSamplingWindow * chartWidth / (end - start);
        }

        for (var i = 0; i < 10; i++) {
            windowKey = Math.floor((maxSamplingWindow - minSamplingWindow) * i / 9) + minSamplingWindow;

            if (windowKey >= idealSamplingWindow)
                break;
        }

        if (series.samplingWindows == undefined)
            series.samplingWindows = {};

        if (series.samplingWindows[windowKey] == undefined)
            series.samplingWindows[windowKey] = downsample(series, windowKey);

        return series.samplingWindows[windowKey];
    }

    if (key != undefined) {
        updatePlot(key);
        plots[key].setupGrid();
        plots[key].draw();
    } else {
        $.each(plots, function (key, plot) {
            var xaxis = plot.getAxes().xaxis;
            var plotChanged = false;

            $.each(plotDataList[key], function (_, series) {
                var samplingWindow = getSamplingWindow(series);

                if (series.flotSeries.data != samplingWindow) {
                    series.flotSeries.data = samplingWindow;
                    plotChanged = true;
                }
            });

            if (plotChanged) {
                updatePlot(key);
                plot.setupGrid();
                plot.draw();
            } else {
                fixYAxis(key);
                plot.setupGrid();
                plot.draw();
            }
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function alignAxes() {
    var xmin = null;
    var xmax = null;

    $.each(plots, function (_, plot) {
        var xaxis = plot.getAxes().xaxis;
        var min = xaxis.options.min;
        var max = xaxis.options.max;

        if (!zoom || min == null || xaxis.datamin > min)
            min = xaxis.datamin;

        if (!zoom || max == null || xaxis.datamax < max)
            max = xaxis.datamax;

        if (xmin == null || min < xmin)
            xmin = min;

        if (xmax == null || max > xmax)
            xmax = max;
    });

    $.each(plots, function (_, plot) {
        var xaxis = plot.getAxes().xaxis;
        var redraw = false;

        if (xmin != null && xaxis.min != xmin) {
            xaxis.options.min = xmin;
            redraw = true;
        }

        if (xmax != null && xaxis.max != xmax) {
            xaxis.options.max = xmax;
            redraw = true;
        }

        if (redraw) {
            plot.setupGrid();
            plot.draw();
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function fixYAxis(plotKey) {
    var axes = plots[plotKey].getAxes();
    var xmin = axes.xaxis.options.min;
    var xmax = axes.xaxis.options.max;
    var ymin = null;
    var ymax = null;
    if ($("#DockCharts").children()[plotKey].id == "FaultChart")
        return;

    if (xmin == null)
        xmin = axes.xaxis.datamin;

    if (xmax == null)
        xmax = axes.xaxis.datamax;

    $.each(plotDataList[plotKey], function (_, series) {
        if (series.visible) {
            $.each(series.flotSeries.data, function (_, dataPoint) {
                if (dataPoint[0] < xmin || dataPoint[0] > xmax)
                    return;

                if (ymin == null || dataPoint[1] < ymin)
                    ymin = dataPoint[1];

                if (ymax == null || dataPoint[1] > ymax)
                    ymax = dataPoint[1];
            });
        }
    });

    // Fix y-axis after updating data
    if (ymin != null)
        axes.yaxis.options.min = ymin - Math.abs((ymax - ymin)*0.1);

    if (ymax != null)
        axes.yaxis.options.max = ymax + Math.abs((ymax - ymin)*0.1);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resizecontents() {
    var dockOffset = $("#DockCharts").offset().top;
    var plotAreaHeight = $(window).height() - dockOffset;
    var chartHeight = Math.floor(plotAreaHeight / $(".ChartPlot").length);

    $.each($("#DockCharts").children(), function (_, div) {
        var divHeight = $(div).height();

        if (divHeight == chartHeight)
            return;

        var plot = $(div).find(".ChartPlot");
        var plotHeight = plot.height();
        var plotSpacing = divHeight - plotHeight;

        var legend = $(div).find(".ChartLegend");
        var legendHeight = legend.height();
        var legendSpacing = divHeight - legendHeight;

        plot.css("height", chartHeight - plotSpacing);
        legend.css("height", chartHeight - legendSpacing);
    });

    updatePlotData();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function positionFloatingTooltipDiv() {
    var floatingDiv = $('#unifiedtooltip');

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

    var floatingDiv = $('#accumulatedpoints');

    if (!floatingDiv.is(':hidden')) {
        var w = $(window);
        floatingDiv.css({
            'top': Math.abs(((w.height() - floatingDiv.outerHeight()) / 2) + w.scrollTop()),
            'left': Math.abs(((w.width() - floatingDiv.outerWidth()) / 2) + w.scrollLeft())
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showhidePoints(thecontrol) {
    if (thecontrol.value == "Show Points") {
        thecontrol.value = "Hide Points";
        $('#accumulatedpoints').show();

    } else {
        thecontrol.value = "Show Points";
        $('#accumulatedpoints').hide();

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showhideTooltip(thecontrol) {
    if (thecontrol.value == "Show Tooltip") {
        thecontrol.value = "Hide Tooltip";
        $('#unifiedtooltip').show();
        $('.legendCheckbox').show();

    } else {
        thecontrol.value = "Show Tooltip";
        $('#unifiedtooltip').hide();
        $('.legendCheckbox').hide();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showhidePhasor(thecontrol) {
    if (thecontrol.value == "Show Phasor") {
        thecontrol.value = "Hide Phasor";
        $('#phasor').show();
        updatePhasorChart();
    } else {
        thecontrol.value = "Show Phasor";
        $('#phasor').hide();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showdetails(thecontrol) {
    if (postedEventName == "Fault")
        var popup = window.open(homePath + "FaultSpecifics.aspx?eventid=" + postedEventId, postedEventId + "FaultLocation", "left=0,top=0,width=350,height=300,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function unzoom() {
    $.each(plots, function (key, plot) {
        var xaxis = plot.getAxes().xaxis;
        xaxis.options.min = null;
        xaxis.options.max = null;
    });

    zoom = false;
    updatePlotData();
    alignAxes();
}

///////////////////////////////////////////////////////////////////////////////////////////////
function RemovePoint() {
    if (selectedPoint === pointsTable.length - 1) {
        pointsTable.pop();
    }
    else if (selectedPoint === 0) {
        pointsTable[1].deltatime = 0;
        pointsTable[1].deltavalue = (0.0).toFixed(3);
        for(var i = selectedPoint + 1; i < pointsTable.length; ++i)
            pointsTable[i].arrayIndex--;
        pointsTable.splice(selectedPoint, 1);
    }
    else if (selectedPoint === -1) {
 
    }
    else {
        pointsTable[selectedPoint + 1].deltatime = pointsTable[selectedPoint + 1].thetime - pointsTable[selectedPoint - 1].thetime;
        pointsTable[selectedPoint + 1].deltavalue = (pointsTable[selectedPoint + 1].thevalue - pointsTable[selectedPoint - 1].thevalue).toFixed(3);
        for (var i = selectedPoint + 1; i < pointsTable.length; ++i)
            pointsTable[i].arrayIndex--;
        pointsTable.splice(selectedPoint, 1);
    }
    selectedPoint = -1;
    $('#accumulatedpointscontent').puidatatable('reload');
}

//////////////////////////////////////////////////////////////////////////////////////////////

function popAccumulatedPoints() {

    if(pointsTable.length > 0)
        pointsTable.pop();
    $('#accumulatedpointscontent').puidatatable('reload');

}

//////////////////////////////////////////////////////////////////////////////////////////////

function clearAccumulatedPoints() {
    while (pointsTable.length > 0) pointsTable.pop();
    $('#accumulatedpointscontent').puidatatable('reload');
}

//////////////////////////////////////////////////////////////////////////////////////////////

function updatePhasorChart() {
    var canvas = $("#phasorCanvas");
    var context = canvas[0].getContext("2d");
    
    var padding = 10;
    var center = { x: canvas.width() / 2, y: canvas.height() / 2 };
    var chartRadius = Math.min(center.x, center.y) - padding;

    if (canvas.is(":hidden"))
        return;

    function drawGrid() {
        context.lineWidth = 1;
        context.strokeStyle = "#BBB";

        for (var i = 0; i < 4; i++)
            drawVector(chartRadius, i * Math.PI / 2);

        context.strokeStyle = "#DDD";
        drawCircle(0.9 * chartRadius / 2);
        drawCircle(0.9 * chartRadius);
    }

    function drawPhasors() {
        var vMax = 0;
        var iMax = 0;

        context.lineWidth = 3;

        $.each(phasorData, function (key, series) {
            if (series == undefined)
                return;

            if (series.color == undefined)
                return;

            $.each(series.data, function (_, dataPoint) {
                series.vector = dataPoint;

                if (dataPoint[0] >= xaxisHover)
                    return false;
            });

            if (key < 3 && series.vector[1] > vMax)
                vMax = series.vector[1];
            if (key >= 3 && series.vector[1] > iMax)
                iMax = series.vector[1];
        });

        $.each(phasorData, function (key, series) {
            var scale;

            if (series == undefined)
                return;

            if (series.vector == undefined)
                return;

            if (key < 3) {
                scale = 0.9 * chartRadius / vMax;
            }
            else {
                scale = 0.9 * chartRadius / iMax;
                context.setLineDash([10, 5]);
            }

            context.strokeStyle = series.color;
            drawVector(series.vector[1] * scale, series.vector[2]);
            context.setLineDash([]);
        });
    }

    function drawVector(r, t) {
        var x = r * Math.cos(t);
        var y = r * Math.sin(t);

        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(center.x + x, center.y - y);
        context.stroke();
    }

    function drawCircle(r) {
        context.beginPath();
        context.arc(center.x, center.y, r, 0, 2 * Math.PI);
        context.stroke();
    }

    context.clearRect(0, 0, canvas.width(), canvas.height());
    drawGrid();
    drawPhasors();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function updateTooltip() {
    var phasorangleA = null;
    var phasorvalueA = null;
    var phasorangleB = null;
    var phasorvalueB = null;
    var phasorangleC = null;
    var phasorvalueC = null;

    var floatingtooltip = $('#unifiedtooltipcontent');
    var subsecond = ("0000000" + (xaxisHover * 10000 % 10000000)).slice(-7);
    var format = $.plot.formatDate($.plot.dateGenerator(xaxisHover, { timezone: "utc" }), "%Y-%m-%d %H:%M:%S") + "." + subsecond;
    var tooltiphtml = '<div align="center"><b>' + format + '</b><br /><table align="center">';

    $.each(plotDataList, function (key, plotData) {
        $.each(plotData, function (_, series) {
            if (series.checked) {
                var point = null;

                $.each(series.DataPoints, function (key, dataPoint) {
                    point = dataPoint;
                    
                    if (dataPoint[0] > xaxisHover)
                        return false;
                });

                if (point == null)
                    return;

                tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + series.flotSeries.color + '">&nbsp;&nbsp;&nbsp;</td><td align="left"><b>' + series.flotSeries.label + ':</b></td><td align="right"><b> ' + point[1].toFixed(2) + '</b></td></tr>';
            }
        });
    });

    tooltiphtml += '</table>';
    floatingtooltip.html(tooltiphtml);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function parseBoolean(postedText) {
    return postedText != "" &&
           postedText != "0";
}

//////////////////////////////////////////////////////////////////////////////////////////////

function nextBackSelect(nextBackType) {
    $('.nextbackbutton').hide();
    $('#' + nextBackType + '-back').show();
    $('#' + nextBackType + '-next').show();
}
