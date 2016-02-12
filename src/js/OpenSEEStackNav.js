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
    var options1 = null;
    var options2 = null;
    var options3 = null;
    var defaultTickInterval = 1000;
    var currentTickInterval = defaultTickInterval;
    var phasorchart = null;

    var colorVAN = '#A30000';
    var colorVBN = '#0029A3';
    var colorVCN = '#007A29';

    var colorIAN = '#FF0000';
    var colorIBN = '#0066CC';
    var colorICN = '#33CC33';

    var colorBrown = '#996633';
    var colorGray = '#333300';
    var colorPurple = '#9900FF';
    var colorAqua = '#66CCFF';
    var colorTan = '#CC9900';


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
                    allowPointSelect: true,
                    turboThreshold: 0,
                    animation: false,
                    marker: {
                        radius: 0
                    },

                    point: {
                        events: {
                            mouseOver: function() {
                                //var tooltiphtml = $('#unifiedtooltipcontent')[0].innerHTML;
                                //$('#unifiedtooltipcontent').html(tooltiphtml + '<hr><table><tr><td class="dot" style="background: ' + this.series.color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + this.series.name + ':</b></td><td><b>' + this.y.toFixed(3) + '</b></td></tr></table>');
                            },

                            click: function () {

                                var pointshtml = $('#accumulatedpointscontent')[0].innerHTML;
                                $('#accumulatedpointscontent').html(pointshtml + '<table><tr><td nowrap class="dot" style="background: ' + this.series.color + '">&nbsp;&nbsp;&nbsp;</td><td nowrap><b>' + this.series.name + ':</b></td><td nowrap><b>' + ' Time: ' + this.category + ', value: ' + this.y.toFixed(3) + '</b></td></tr></table>');


                                //alert(this.series.name + ' Time: ' + this.category + ', value: ' + this.ytoFixed(3));
                            },

                            mouseOut: function() {

                            }
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

                plotBands: [{
                    color: '#FFFF00',
                    from: '',
                    to: ''
                }],

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

                formatter: function () {

                    var phasorangleA = null;
                    var phasorvalueA = null;
                    var phasorangleB = null;
                    var phasorvalueB = null;
                    var phasorangleC = null;
                    var phasorvalueC = null;

                    var floatingtooltip = $('#unifiedtooltipcontent');

                    var theX = this.points[0].point.x;

                    var tooltiphtml = '<table><tr><td colspan="3" align="center"><b>+ ' + this.x + ' Seconds</b></td></tr>';

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">VOLTAGE (volts)</td></tr>';

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    $.each(options1.series, (function (key, value) {

                        if (value.name == 'RMS VAN') {
                            phasorvalueA = value.data[theX];
                        }

                        if (value.name == 'Angle VAN') {
                            phasorangleA = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (value.name == 'RMS VBN') {
                            phasorvalueB = value.data[theX];
                        }

                        if (value.name == 'Angle VBN') {
                            phasorangleB = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (value.name == 'RMS VCN') {
                            phasorvalueC = value.data[theX];
                        }

                        if (value.name == 'Angle VCN') {
                            phasorangleC = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (typeof (value.data[theX]) != 'undefined') {
                            if (value.name.indexOf("Angle") == -1) {
                                if (options1.targetChart.series[key].visible) {

                                    var thevalue = value.data[theX];
                                    if (typeof(thevalue.y) != 'undefined') {
                                        thevalue = value.data[theX].y;
                                    }

                                    tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options1.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + thevalue.toFixed(3) + '</b></td></tr>';
                                }
                            }
                        }
                    }));

                    if (phasorvalueA != null && phasorangleA != null) {
                        phasorchart.series[0].setData([[0, 0], [phasorangleA, phasorvalueA]], true);
                    }

                    if (phasorvalueB != null && phasorangleB != null) {
                        phasorchart.series[1].setData([[0, 0], [phasorangleB, phasorvalueB]], true);
                    }

                    if (phasorvalueC != null && phasorangleC != null) {
                        phasorchart.series[2].setData([[0, 0], [phasorangleC, phasorvalueC]], true);
                    }

                    tooltiphtml += '<tr><td nowrap colspan="3" align="center">CURRENT (amps)</td></tr>';

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    phasorangleA = null;
                    phasorvalueA = null;
                    phasorangleB = null;
                    phasorvalueB = null;
                    phasorangleC = null;
                    phasorvalueC = null;

                    $.each(options2.series, (function (key, value) {

                        if (value.name == 'RMS IAN') {
                            phasorvalueA = value.data[theX];
                        }

                        if (value.name == 'Angle IAN') {
                            phasorangleA = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (value.name == 'RMS IBN') {
                            phasorvalueB = value.data[theX];
                        }

                        if (value.name == 'Angle IBN') {
                            phasorangleB = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (value.name == 'RMS ICN') {
                            phasorvalueC = value.data[theX];
                        }

                        if (value.name == 'Angle ICN') {
                            phasorangleC = -(value.data[theX] * 180 / Math.PI);
                        }

                        if (typeof (value.data[theX]) != 'undefined') {
                            if (value.name.indexOf("Angle") == -1) {
                                if (options2.targetChart.series[key].visible) {

                                    var thevalue = value.data[theX];
                                    if (typeof(thevalue.y) != 'undefined') {
                                        thevalue = value.data[theX].y;
                                    }

                                    tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options2.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + thevalue.toFixed(3) + '</b></td></tr>';
                                }

                            }
                        }
                    }));

                    if (phasorvalueA != null && phasorangleA != null) {
                        phasorchart.series[3].setData([[0, 0], [phasorangleA, phasorvalueA]], true);
                    }

                    if (phasorvalueB != null && phasorangleB != null) {
                        phasorchart.series[4].setData([[0, 0], [phasorangleB, phasorvalueB]], true);
                    }

                    if (phasorvalueC != null && phasorangleC != null) {
                        phasorchart.series[5].setData([[0, 0], [phasorangleC, phasorvalueC]], true);
                    }

                    if (options3.series.length > 0) {
                        tooltiphtml += '<tr><td nowrap colspan="3" align="center">FAULT DISTANCE (miles)</td></tr>';
                        $.each(options3.series, (function(key, value) {
                            if (typeof (value.data[theX]) != 'undefined') {
                                if (options3.targetChart.series[key].visible) {

                                    var thevalue = value.data[theX];
                                    if (typeof(thevalue.y) != 'undefined') {
                                        thevalue = value.data[theX].y;
                                    }

                                    tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options3.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td><b> ' + thevalue.toFixed(3) + '</b></td></tr>';
                                }
                            }
                        }));
                    }

                    tooltiphtml += '</table>';
                    floatingtooltip.html(tooltiphtml);
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

                if (data.d.detail != null) {
                    if (data.d.detail.length > 0) {
                        options.xAxis.plotBands[0].from = data.d.detail[0].StartSample;
                        options.xAxis.plotBands[0].to = data.d.detail[0].EndSample;
                    }
                }

                $.each(data.d.data, function(key, value) {

                    switch (value.name) {
                    
                        //var colorVAN = '#CC0000';
                        //var colorVBN = '#0033CC';
                        //var colorVCN = '#009933';
                        //var colorIAN = '#FF0000';
                        //var colorIBN = '#0066CC';
                        //var colorICN = '#33CC33';
                        //var colorBrown = '#996633';
                        //var colorGray = '#333300';
                        //var colorPurple = '#9900FF';
                        //var colorAqua = '#66CCFF';
                        //var colorTan = '#CC9900';

                        case "Simple":
                            value.color = colorBrown;
                            break;
                        case "Reactance":
                            value.color = colorGray;
                            break;
                        case "Takagi":
                            value.color = colorPurple;
                            break;
                        case "ModifiedTakagi":
                            value.color = colorAqua;
                            break;
                        case "Novosel":
                            value.color = colorTan;
                            break;

                        case "VAN":
                        case "RMS VAN":
                        case "Angle VAN":
                            value.color = colorVAN;
                            break;

                        case "VBN":
                        case "RMS VBN":
                        case "Angle VVBNAN":
                            value.color = colorVBN;
                            break;

                        case "VCN":
                        case "RMS VCN":
                        case "Angle VCN":
                            value.color = colorVCN;
                            break;

                        case "IAN":
                        case "RMS IAN":
                        case "Angle IAN":

                            value.color = colorIAN;
                            break;

                        case "IBN":
                        case "RMS IBN":
                        case "Angle IBN":

                            value.color = colorIBN;
                            break;

                        case "ICN":
                        case "RMS ICN":
                        case "Angle ICN":

                            value.color = colorICN;
                            break;
                    }

                });

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
    if (postedEventName != "") {
        tempvalue = postedEventName;
        postedEventName = "";
    }
    populateEventMetric('EventTypes', themeterid, theDate, tempvalue);

    tempvalue = 0;
    if (postedEventId != "") {
        tempvalue = postedEventId;
        postedEventId = "";
    }
    populateEventMetric('EventInstances', themeterid, theDate, tempvalue);

    selectEventMeasure(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function ResetWaveformDiv() {
    $('#WaveformEventsVoltage')[0].innerHTML = "";
    $('#WaveformEventsCurrent')[0].innerHTML = "";
    $('#WaveformEventsFaultCurve')[0].innerHTML = "";
    $("#EventTypes").empty();
    $("#EventTypes").multiselect("refresh");
    $("#EventInstances").empty();
    $("#EventInstances").multiselect("refresh");
    $('#unifiedtooltip').hide();
    $('#phasor').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectEventMeasure(obj, thedate) {

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

    // If all exist, then let's act
    if (EventType && EventInstance) {
        // Lets build a label for this chart
        var label = "";
        label += postedMeterName + " - ";
        label += $("#EventTypes")[0][$("#EventTypes")[0].selectedIndex].innerHTML + " - ";
        label += postedDate + " - ";
        label += $("#EventInstances")[0][$("#EventInstances")[0].selectedIndex].innerHTML;

        options1 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsVoltage', EventInstance, label, "V");
        options2 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsCurrent', EventInstance, "", "I");
        options3 = populateDivWithLineChartByInstanceID("getFaultCurveDataByID", 'WaveformEventsFaultCurve', EventInstance, "", null);
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

    } else {
        thecontrol.value = "Show Tooltip";
        $('#unifiedtooltip').hide();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showhidePhasor(thecontrol) {
    
    if (thecontrol.value == "Show Phasor") {
        thecontrol.value = "Hide Phasor";
        $('#phasor').show();
    } else {
        thecontrol.value = "Show Phasor";
        $('#phasor').hide();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showdetails(thecontrol) {

    var EventType = ($('#EventTypes').multiselect("getChecked").map(function () {
        return this.title;
    }).get());

    if (EventType == "Fault") {
        var EventInstance = $("#EventInstances").val();
        var popup = window.open("FaultSpecifics.aspx?eventid=" + EventInstance, EventInstance + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
        //var popup = window.open("FaultLocation.aspx?eventid=" + EventInstance, EventInstance + "FaultLocation", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
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

    $("#unifiedtooltip").draggable({ scroll: false, handle: '#unifiedtooltiphandle' });

    $('#unifiedtooltip').hide();

    $("#accumulatedpoints").draggable({ scroll: false, handle: '#accumulatedpointshandle' });
    $('#accumulatedpoints').hide();

    $("#phasor").draggable({ scroll: false, handle: '#phasorhandle' });

    $('#phasor').hide();

    $(window).on('resize', function () {
        resizecontents();
        positionFloatingTooltipDiv();
    });

    $("#EventTypes").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false, minWidth: 'auto' });
    $("#EventInstances").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false, minWidth: 'auto' });

    // Event Mining
    $("#EventTypes")[0].change = function (event, ui) {

        if ($("#EventTypes")[0][$("#EventTypes")[0].selectedIndex].innerHTML == "Fault") {
            $("#showdetails").show();
        }

        selectEventMeasure(this);
    };
    $("#EventInstances")[0].change = function (event, ui) {
        selectEventMeasure(this);
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
        postedEventDate = $("#postedEventDate")[0].innerHTML;
        postedMeterName = $("#postedMeterName")[0].innerHTML;

        if (postedEventName != "Fault") {
            $("#showdetails").hide();
        }

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
                    formatter: function () {
                        return this.value + '°';
                    }
                }
            },

            yAxis: [{
                min: 0
                //,
                //tickInterval: 50000,
            },{
                min: 0
                //,
                //tickInterval: 200
            }],

            plotOptions: {
                series: {
                    animation: false,
                    stickyTracking: false,
                    pointStart: 0,
                    pointInterval: 1,
                    enableMouseTracking: false,
                    dataGrouping: {
                        enabled: false
                    },
                    marker: {
                        enabled: false
                    }

                },
                column: {
                    pointPadding: 0,
                    groupPadding: 0,
                    animation: false
                }
            },
            legend: {
                //layout: 'vertical',
                //backgroundColor: '#FFFFFF',
                //floating: true,
                //align: 'left',
                //verticalAlign: 'top',
                //x: -10,
                //y: -10,
                itemDistance: 10,
                symbolWidth: 5,
                useHTML: true,
                labelFormatter: function () {
                    return "<span style='color:" + this.color + "'>" + this.name + "</span>";
                }
            },
            series: [{
                yAxis: 0,
                dashStyle: 'dot',
                type: 'line',
                name: 'VAN',
                color: colorVAN,
                marker: { lineWidth: 3 },
                data: []
            },
            {
                yAxis: 0,
                dashStyle: 'dot',
                type: 'line',
                name: 'VBN',
                color: colorVBN,
                marker: { lineWidth: 3 },
                data: []

            },
            {
                yAxis: 0,
                dashStyle: 'dot',
                type: 'line',
                name: 'VCN',
                color: colorVCN,
                marker: { lineWidth: 3 },
                data: []

            },
            {
                yAxis: 1,
                type: 'line',
                name: 'IAN',
                color: colorIAN,
                marker: { lineWidth: 3 },
                data: []
            },
            {
                yAxis: 1,
                type: 'line',
                name: 'IBN',
                color: colorIBN,
                marker: { lineWidth: 3 },
                data: []

            },
            {
                yAxis: 1,
                type: 'line',
                name: 'ICN',
                color: colorICN,
                marker: { lineWidth: 3 },
                data: []

            }]
        });
    }

/// EOF