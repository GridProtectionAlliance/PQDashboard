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

    var clickincheckbox = false;
    var pointdata = new Array();
    var loadingPanel = null;
    var postedEventId = "";
    var postedEventName = "";
    var postedShowFaultCurves = "";
    var postedMeterId = "";
    var postedDate = "";
    var postedEventDate = "";
    var postedMeterName = "";
    var postedLineName = "";
    var postedInceptionTime = "";
    var postedDurationPeriod = "";
    var postedFaultCurrent = "";

    var options1 = null;
    var options2 = null;
    var options3 = null;
    var defaultWindowSize = 1000;
    var defaultTickInterval = Math.floor(defaultWindowSize / 6.1);
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

    //function selectAdd(theControlID, theValue, theText, selected) {

    //    var exists = false;

    //    $('#' + theControlID + ' option').each(function () {
    //        if (this.innerHTML == theText) {
    //            exists = true;
    //            return false;
    //        }
    //    });

    //    if (!exists) {
    //        $('#' + theControlID).append("<option value='" + theValue + "' " + selected + ">" + theText + "</option>");
    //    }
    //}

//////////////////////////////////////////////////////////////////////////////////////////////

    function computeTickInterval(xMin, xMax) {
        var zoomRange = xMax - xMin;
        return Math.floor(zoomRange / 6.1);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //explicitly set the tickInterval for the 3 charts - based on
    //selected range
    function setTickInterval(event) {

        if (options1 == null) return;
        if (options2 == null) return;
        if (options3 == null) return;

        var xMin = event.xAxis[0].min;
        var xMax = event.xAxis[0].max;
        computeTickInterval(xMin, xMax);

        if (typeof (options1.targetChart.xAxis) != 'undefined') {
            options1.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
            options1.targetChart.xAxis[0].isDirty = true;
        }

        if (typeof (options2.targetChart.xAxis) != 'undefined') {
            options2.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
            options2.targetChart.xAxis[0].isDirty = true;
        }

        if (typeof (options3.targetChart.xAxis) != 'undefined') {
            options3.targetChart.xAxis[0].options.tickInterval = currentTickInterval;
            options3.targetChart.xAxis[0].isDirty = true;
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    //reset the extremes and the tickInterval to default values
    function unzoom() {
        if (options1 == null) return;
        if (options2 == null) return;
        if (options3 == null) return;

        function update(options) {
            if (typeof (options.fullres) == 'undefined')
                return;

            var window = { min: 0, max: options.fullres.length };

            downsample(options, window);

            options.targetChart.xAxis[0].setCategories(options.xAxis.categories, false);
            options.targetChart.xAxis[0].setExtremes(window.minExtreme, window.maxExtreme, false);
            options.targetChart.xAxis[0].options.tickInterval = defaultTickInterval;
            options.targetChart.xAxis[0].isDirty = true;

            $.each(options.targetChart.series, function (key, series) {
                series.setData(options.series[key].data, false, false, false);
            });

            options.targetChart.options.chart.isZoomed = true;
            options.targetChart.redraw();
            options.targetChart.options.chart.isZoomed = false;
        }

        update(options1);
        update(options2);
        update(options3);
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

    function legenditemclick(theitem) {

        clickincheckbox = true;
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function populateDivWithLineChartByInstanceID(thedatasource, thediv, theeventinstance, label, datatype) {

        var options = {
            targetChart: {},
            plotOptions: {
                series: {
                    events: {
                        legendItemClick: function () {
                            if (clickincheckbox == true) {
                                this.userOptions.showInTooltip = !this.userOptions.showInTooltip;
                                clickincheckbox = false;
                                return false;
                            } else {
                                return (true);
                            }    
                        }
                    },

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
                                var tempdataarray = new Array();
                                var tempdelta = 0.0;
                                var rows = $('#accumulatedpointscontent').jqxGrid('getrows');
                                if (rows.length > 0) {
                                    var datarow = $('#accumulatedpointscontent').jqxGrid('getrowdata', rows.length - 1);
                                    tempdelta = this.y - datarow.thevalue;
                                    }
                                tempdataarray.push({ theseries: this.series.name, thetime: this.category, thevalue: this.y.toFixed(3), thedelta: tempdelta.toFixed(3) });
                                $('#accumulatedpointscontent').jqxGrid("addrow", null, tempdataarray);
                                $('#accumulatedpointscontent').jqxGrid('selectrow', rows.length - 1);
                                $('#accumulatedpointscontent').jqxGrid('ensurerowvisible', rows.length - 1);
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
                },
                events: {
                    load: function (chart) {

                        //Debug.write("chart load\n");

                        //$.each(chart.target.series, function (key, value) {
                        //    if (value.userOptions.showInLegend && value.userOptions.showInTooltip)
                        //    {
                        //        $("#" + value.name.replace(/\s+/g, '')).prop('checked', true);
                        //    }
                        //});
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
                    label: { 
                        text: '',
                        align: 'center'
                    },
                    color: 'orange',
                    from: '',
                    to: ''
                },
                {
                    label: {
                        text: '',
                        align: 'center'
                    },
                    color: 'orange',
                    from: '',
                    to: ''
                }],

                events: {

                    afterSetExtremes: function () {
                        if (this.chart.options.chart.isZoomed)
                            return;

                        var xMin = this.chart.xAxis[0].min;
                        var xMax = this.chart.xAxis[0].max;

                        function update(options) {
                            if (typeof (options.fullres) == 'undefined')
                                return;

                            var window = {
                                min: options.window.dataStart + xMin * options.window.interval,
                                max: options.window.dataStart + xMax * options.window.interval
                            };

                            downsample(options, window);

                            options.targetChart.xAxis[0].setCategories(options.xAxis.categories, false);
                            options.targetChart.xAxis[0].setExtremes(window.minExtreme, window.maxExtreme, false);
                            options.targetChart.xAxis[0].options.tickInterval = computeTickInterval(window.minExtreme, window.maxExtreme);
                            options.targetChart.xAxis[0].isDirty = true;

                            $.each(options.targetChart.series, function (key, series) {
                                series.setData(options.series[key].data, false, false, false);
                            });

                            options.targetChart.options.chart.isZoomed = true;
                            options.targetChart.redraw();
                            options.targetChart.options.chart.isZoomed = false;
                        }

                        update(options1);
                        update(options2);
                        update(options3);
                    }
                }
            },
            yAxis: [{
                title: { text: 'Voltage' }, gridLineWidth: 0
            }],
            legend: {
                itemStyle: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '8px'
                },

                width: 120,
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',

                symbolHeight: 0,
                symbolWidth: 0,
                symbolRadius: 0,
                symbolPadding: 0,
                padding: 0,

                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderColor: '#FFF',
                borderWidth: 0,
                useHTML: true,
                shadow: false,

                labelFormatter: function () {

                    var checkedstring = "";
                    if (this.userOptions.showInLegend && this.userOptions.showInTooltip) {
                        checkedstring = "checked";
                    }

                    var channelname = this.name.replace(/\s+/g, '');
                    return "<input title='Show " + this.name + " in tooltip' " + checkedstring + " type='checkbox' id='" + channelname + "' onclick='javascript:return(legenditemclick(this));'><span style='color:" + this.color + "'>" + this.name + "</span>";
                }
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

                    var tooltiphtml = '<table width="100%"><tr><td colspan="3" align="center"><b>+ ' + this.x + ' Seconds</b></td></tr>';

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
                            //if (value.name.indexOf("Angle") == -1) {
                            if (value.showInLegend && value.showInTooltip) {
                                var thevalue = value.data[theX];
                                if (typeof (thevalue.y) != 'undefined')
                                {
                                    thevalue = value.data[theX].y;
                                }
                                tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options1.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td align="left"><b>' + value.name + ':</b></td><td align="right"><b> ' + thevalue.toFixed(2) + '</b></td></tr>';
                            }
                        }
                    }));

                    if (phasorvalueA != null && phasorangleA != null) {
                        phasorchart.series[0].setData([[0, 0], [phasorangleA, phasorvalueA]], true);
                        phasorchart.tooltip.refresh(phasorchart.series[0].points[0, 1]);
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
                            if (value.showInLegend && value.showInTooltip) {
                                var thevalue = value.data[theX];
                                if (typeof(thevalue.y) != 'undefined') 
                                {
                                    thevalue = value.data[theX].y;
                                }
                                tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options2.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td align="left"><b>' + value.name + ':</b></td><td align="right"><b> ' + thevalue.toFixed(2) + '</b></td></tr>';
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

                    if (typeof(options3.series) != 'undefined') {
                            if (options3.series.length > 0) {
                                tooltiphtml += '<tr><td nowrap colspan="3" align="center">FAULT (miles)</td></tr>';
                                $.each(options3.series, (function(key, value) {
                                    if (typeof (value.data[theX]) != 'undefined') {
                                        if (value.showInLegend && value.showInTooltip) {

                                            var thevalue = value.data[theX];
                                            if (typeof(thevalue.y) != 'undefined') {
                                                thevalue = value.data[theX].y;
                                            }

                                            tooltiphtml += '<tr><td width="12px" class="dot" style="background: ' + options3.targetChart.series[key].color + '">&nbsp;&nbsp;&nbsp;</td><td><b>' + value.name + ':</b></td><td align="right"><b> ' + thevalue.toFixed(2) + '</b></td></tr>';
                                        }
                                    }
                                }));
                            }
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
                options.series = data.d.data;

                if (typeof (data.d.xAxis) == 'undefined' || !data.d.xAxis)
                    return;

                options.fullres = {
                    length: data.d.xAxis.length,
                    categories: data.d.xAxis,
                    series: [],
                    plotBands: []
                };

                $.each(data.d.data, function(key, series) {
                    options.fullres.series.push({ data: series.data });
                });

                downsample(options, { min: 0, max: options.fullres.length });

                if (data.d.detail != null) {
                    if (data.d.detail.length > 0) {

                        var plotband0 = { type: data.d.detail[0].type, from: data.d.detail[0].StartSample, to: data.d.detail[0].EndSample };
                        options.fullres.plotBands.push(plotband0);

                        //options.xAxis.plotBands[0].label.text = data.d.detail[0].type;
                        //options.xAxis.plotBands[0].from = data.d.detail[0].StartSample / options.window.interval;
                        //options.xAxis.plotBands[0].to = data.d.detail[0].EndSample / options.window.interval;

                        if (data.d.detail.length > 1) {

                            var plotband1 = { type: data.d.detail[1].type, from: data.d.detail[1].StartSample, to: data.d.detail[1].EndSample };
                            options.fullres.plotBands.push(plotband1);

                            //options.xAxis.plotBands[1].label.text = data.d.detail[1].type;
                            //options.xAxis.plotBands[1].from = data.d.detail[1].StartSample / options.window.interval;
                            //options.xAxis.plotBands[1].to = data.d.detail[1].EndSample / options.window.interval;
                        }
                    } else {
                        // Hide Markers.
                        options.fullres.plotBands.length = 0;
                        //options.xAxis.plotBands.length = 0;
                    }
                    
                }

                downsample(options, { min: 0, max: options.fullres.length });

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
                        case "Peak VAN":
                        case "Angle VAN":
                            value.color = colorVAN;
                            break;

                        case "VBN":
                        case "RMS VBN":
                        case "Peak VBN":
                        case "Angle VBN":
                            value.color = colorVBN;
                            break;

                        case "VCN":
                        case "RMS VCN":
                        case "Peak VCN":
                        case "Angle VCN":
                            value.color = colorVCN;
                            break;

                        case "IAN":
                        case "RMS IAN":
                        case "Peak IAN":
                        case "Angle IAN":

                            value.color = colorIAN;
                            break;

                        case "IBN":
                        case "RMS IBN":
                        case "Peak IBN":
                        case "Angle IBN":

                            value.color = colorIBN;
                            break;

                        case "ICN":
                        case "RMS ICN":
                        case "Peak ICN":
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
                resizecontents();
            },
            failure: function (msg) {
                alert(msg);
            },
            async: true
        });

        return (options);
    }

    function downsample(options, window) {
        var index;

        if (typeof (options.fullres) == 'undefined')
            return;

        options.window = window;

        window.size = defaultWindowSize;
        window.interval = Math.max((window.max - window.min) / window.size, 1);

        window.scrollBuffer = 500 * window.interval;
        window.dataStart = Math.max(window.min - window.scrollBuffer, 0);
        window.dataEnd = Math.min(window.max + window.scrollBuffer, options.fullres.length);
        window.dataSize = window.dataEnd - window.dataStart;

        window.minExtreme = (window.min - window.dataStart) / window.interval;
        window.maxExtreme = (window.max - window.dataStart) / window.interval;

        options.xAxis.categories = [];

        for (index = 0; index < window.dataSize / window.interval; index++)
            options.xAxis.categories.push(options.fullres.categories[Math.floor(window.dataStart + index * window.interval)]);

        $.each(options.series, function (key, series) {
            series.data = [];

            for (index = 0; index < window.dataSize / window.interval; index++)
                series.data.push(options.fullres.series[key].data[Math.floor(window.dataStart + index * window.interval)]);
        });

        if (options.fullres.plotBands.length > 0) {

            options.xAxis.plotBands[0].label.text = options.fullres.plotBands[0].type;
            options.xAxis.plotBands[0].from = (options.fullres.plotBands[0].from - window.dataStart) / window.interval;
            options.xAxis.plotBands[0].to = (options.fullres.plotBands[0].to - window.dataStart) / window.interval;

            if (options.fullres.plotBands.length > 1) {
                options.xAxis.plotBands[1].label.text = options.fullres.plotBands[1].type;
                options.xAxis.plotBands[1].from = (options.fullres.plotBands[1].from - window.dataStart) / window.interval;
                options.xAxis.plotBands[1].to = (options.fullres.plotBands[1].to - window.dataStart) / window.interval;
            }
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////

//function PopulateEventWaveformDropdowns(themeterid, theDate) {
 
//    var tempvalue = 0;
//    if (postedEventName != "") {
//        tempvalue = postedEventName;
//        postedEventName = "";
//    }
//    populateEventMetric('EventTypes', themeterid, theDate, tempvalue);

//    tempvalue = 0;
//    if (postedEventId != "") {
//        tempvalue = postedEventId;
//        postedEventId = "";
//    }
//    populateEventMetric('EventInstances', themeterid, theDate, tempvalue);

//    selectEventMeasure(null, null);
//}

//////////////////////////////////////////////////////////////////////////////////////////////

function ResetWaveformDiv() {
    $('#WaveformEventsVoltage')[0].innerHTML = "";
    $('#WaveformEventsCurrent')[0].innerHTML = "";
    $('#WaveformEventsFaultCurve')[0].innerHTML = "";
    //$("#EventTypes").empty();
    //$("#EventTypes").multiselect("refresh");
    //$("#EventInstances").empty();
    //$("#EventInstances").multiselect("refresh");

    $('#accumulatedpoints').hide();
    $('#unifiedtooltip').hide();
    $('#phasor').hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showData() {

    //// obj is the control instance, sent only when the control itself fires selectMeasure.
    //if (obj != null) {
    //    switch (obj.id) {
    //        case ("EventTypes"):

    //            populateEventMetric('EventInstances', postedMeterId, postedDate);
    //            break;
    //    }
    //}

    //var EventType = $("#EventTypes").val();
    //var EventInstance = $("#EventInstances").val();



    // If all exist, then let's act
    if (postedEventName && postedEventId) {
        // Lets build a label for this chart
        var label = "";
        //label += postedMeterName + " - (Line) ";
        label += postedLineName + " - ";
        label += postedEventName + " - ";
        //label += "(Start) " + postedDate + " " + postedEventDate;
        label += " Inception: " + postedInceptionTime + "&nbsp;&nbsp;&nbsp;Duration: " + postedDurationPeriod + "&nbsp;&nbsp;&nbsp;Max Current: " + postedFaultCurrent;

        $("#TitleData")[0].innerHTML = label;

        options1 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsVoltage', postedEventId, "", "V");
        options2 = populateDivWithLineChartByInstanceID("getSignalDataByIDAndType", 'WaveformEventsCurrent', postedEventId, "", "I");

        if (postedShowFaultCurves == "0")
        {
        options3 = populateDivWithLineChartByInstanceID("getFaultCurveDataByID", 'WaveformEventsFaultCurve', 0, "", null);
        }
        else
        {
        options3 = populateDivWithLineChartByInstanceID("getFaultCurveDataByID", 'WaveformEventsFaultCurve', postedEventId, "", null);
        }
        
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showhidePoints(thecontrol) {
    if (thecontrol.value == "Show Points") {
        thecontrol.value = "Hide Points";
        $('#accumulatedpoints').show();

    } else {
        thecontrol.value = "Show Points";
        $('#accumulatedpointscontent').jqxGrid('clear');
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

    //var EventType = ($('#EventTypes').multiselect("getChecked").map(function () {
    //    return this.title;
    //}).get());



    if (postedEventName == "Fault") {
        //var EventInstance = $("#EventInstances").val();

        var popup = window.open("FaultSpecifics.aspx?eventid=" + postedEventId, postedEventId + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
        //var popup = window.open("FaultLocation.aspx?eventid=" + postedEventId, postedEventId + "FaultLocation", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

//function populateEventMetric(metric, siteID, theDate, desiredvalue) {

//    var thedatasent = "";

//    var theEventType = "";
//    var theEventInstance = "";

//    switch (metric) {
//        case "EventTypes":
//            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";
//            break;

//        case "EventInstances":
//            theEventType = $("#EventTypes").val();
//            if (theEventType == null) {
//                $("#EventInstances").empty();
//                $("#EventInstances").multiselect("refresh");
//                $("#EventChannel").empty();
//                $("#EventChannel").multiselect("refresh");
//                return;
//            }

//            thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "' , 'theType':'" + theEventType + "'}";
//            break;
//    }

//    $.ajax({
//        type: "POST",
//        url: './eventService.asmx/' + metric,
//        data: thedatasent,
//        desiredvalue: desiredvalue,
//        contentType: "application/json; charset=utf-8",
//        dataType: 'json',
//        cache: true,
//        success: function (data) {

//            // Disable change event on dropdown to be populated.
//            var temp = $('#' + metric)[0].change;
//            $('#' + metric)[0].change = null;
//            //

//            $('#' + metric).empty();

//            if (data.d.length > 0) {
//                $.each(data.d, (function (key, value) {
//                    var selected = "";
//                    if (value.Item2 == desiredvalue) {
//                        selected = "selected";
//                    }
//                    if (value.Item1 == desiredvalue) {
//                        selected = "selected";
//                    }

//                    selectAdd(metric, value.Item1, value.Item2, selected);
                        
                    
//                }));

//            }

//            $('#' + metric).multiselect("refresh");

//            // Restore change event on completion
//            $('#' + metric)[0].change = temp;
//            //

//        },
//        failure: function (msg) {
//            alert(msg);
//        },
//        async: false
//    });
//}

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

        $(window).on('resize', function() {
            resizecontents();
            positionFloatingTooltipDiv();
        });

    //pointdata.push({ theseries: "Test1", thetime: "Test2", thevalue: "Test3" });

    var pointsource = {
        localdata: pointdata,
        datatype: "array",
        datafields: [{
            name: 'theseries',

            type: 'string'
        }, {
            name: 'thetime',

            type: 'string'
        }, {
            name: 'thevalue',

            type: 'string'
        }, {
            name: 'thedelta',

            type: 'string'
        }]
    };

        //var pointadapter = new $.jqx.dataAdapter(pointsource);

    var pointadapter = new $.jqx.dataAdapter(pointsource, {

        downloadComplete: function (data, status, xhr) {
            //alert("done");
        },

        loadComplete: function (data) {
            //alert("done");
        },

        loadError: function (xhr, status, error) {
            //alert(error);
        }

    });

    $("#accumulatedpointscontent").jqxGrid(
    {
        width: "100%",
        height: "100%",
        source: pointadapter,
        columnsresize: true,
        sortable: true,
        theme: 'ui-redmond',
        columns: [
            { text: 'Series', width: '25%' , datafield: "theseries" },
            { text: 'Time', width: '25%', datafield: "thetime" },
            { text: 'Value', width: '25%', datafield: "thevalue", cellsalign: 'right' },
            { text: 'Delta', width: '25%', datafield: "thedelta", cellsalign: 'right' }
        ]
    });
    
    

    //$("#EventTypes").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false, minWidth: 'auto' });
    //$("#EventInstances").multiselect({ noneSelectedText: "Select", selectedList: 1, multiple: false, minWidth: 'auto' });

    // Event Mining
    //$("#EventTypes")[0].change = function (event, ui) {

    //    if ($("#EventTypes")[0][$("#EventTypes")[0].selectedIndex].innerHTML == "Fault") {
    //        $("#showdetails").show();
    //    }

    //    selectEventMeasure(this);
    //};
    //$("#EventInstances")[0].change = function (event, ui) {
    //    selectEventMeasure(this);
    //};
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
        postedShowFaultCurves = $("#postedShowFaultCurves")[0].innerHTML;
        postedMeterId = $("#postedMeterId")[0].innerHTML;
        postedDate = $("#postedDate")[0].innerHTML;
        postedEventDate = $("#postedEventDate")[0].innerHTML;
        postedMeterName = $("#postedMeterName")[0].innerHTML;
        postedLineName = $("#postedLineName")[0].innerHTML;

        postedInceptionTime = $("#postedInceptionTime")[0].innerHTML;
        postedDurationPeriod = $("#postedDurationPeriod")[0].innerHTML;
        postedFaultCurrent = $("#postedFaultCurrent")[0].innerHTML;

        $("#showdetails").hide();

        if (postedShowFaultCurves == "1") {
            if (postedEventName == "Fault") {
                $("#showdetails").show();
            }
        }

        if (postedMeterId != "") {
            ResetWaveformDiv();
            //resizecontents();
            showData();
            //PopulateEventWaveformDropdowns(postedMeterId, postedDate);
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

        if (options1 == null) return;
        if (options2 == null) return;
        if (options3 == null) return;

        if (typeof (options1.series) == 'undefined') return;
        if (typeof (options2.series) == 'undefined') return;
        if (typeof (options3.series) == 'undefined') return;

        theparent.css("height", chartheight);

        var childcount = 2;

        if (options3.series.length > 0) {
            childcount ++;
        }

        var childheight = chartheight / childcount;

        var Child = $("#WaveformEventsVoltage");

        Child.css("height", childheight);

        var chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }

        Child = $("#WaveformEventsCurrent");

        Child.css("height", childheight);

        chart = Child.highcharts();

        if (typeof chart != 'undefined') {
            chart.reflow();
        }


        Child = $("#WaveformEventsFaultCurve");

        if (childcount == 2) {
            childheight = 0;
        }

        Child.css("height", childheight);

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

            if (typeof (options1.targetChart.xAxis) != 'undefined') {
                var xAxis1 = options1.targetChart.xAxis[0];
                xAxis1.removePlotLine("myPlotLineId");
                xAxis1.addPlotLine({
                    value: chart.xAxis[0].translate(x, true),
                    width: 1,
                    color: 'red',
                    id: "myPlotLineId"
                });
            }

            if (typeof (options2.targetChart.xAxis) != 'undefined') {
                //remove old crosshair and draw new crosshair on chart2
                var xAxis2 = options2.targetChart.xAxis[0];
                xAxis2.removePlotLine("myPlotLineId");
                xAxis2.addPlotLine({
                    value: chart.xAxis[0].translate(x, true),
                    width: 1,
                    color: 'red',
                    id: "myPlotLineId"
                });
            }

            if (typeof (options3.targetChart.xAxis) != 'undefined') {
                var xAxis3 = options3.targetChart.xAxis[0];
                xAxis3.removePlotLine("myPlotLineId");
                xAxis3.addPlotLine({
                    value: chart.xAxis[0].translate(x, true),
                    width: 1,
                    color: 'red',
                    id: "myPlotLineId"
                });
            }
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function createtooltiprow (theseries)
    {
        var thehtml = "";

        if (theseries.points.length > 0)
            thehtml = "<tr><td align='right'>" + theseries.name + "</td><td align='right'>" + theseries.points[0, 1].x.toFixed(0) + "&deg</td><td align='right'>" + theseries.points[0, 1].y.toFixed(0) + "</td></tr>";

        return (thehtml);
    }


    function createphasorchart() {

        phasorchart = new Highcharts.Chart(
        {

            tooltip: {
                formatter: function () {
                    var htmltooltip;

                    htmltooltip = "<table class='phasertooltip'>";
                    htmltooltip += createtooltiprow(phasorchart.series[0]);
                    htmltooltip += createtooltiprow(phasorchart.series[1]);
                    htmltooltip += createtooltiprow(phasorchart.series[2]);
                    htmltooltip += createtooltiprow(phasorchart.series[3]);
                    htmltooltip += createtooltiprow(phasorchart.series[4]);
                    htmltooltip += createtooltiprow(phasorchart.series[5]);
                    htmltooltip += "</table>";

                    return (htmltooltip);
                },

                positioner: function () {
                    return { x: -10, y: -10};
                },
                useHTML: true,
                shadow: false,
                borderWidth: 0,
                backgroundColor: 'rgba(255,255,255,0.8)',
                crosshairs: [true, true],
                

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
                data: [],
                connectEnds: false
            },
            {
                yAxis: 0,
                dashStyle: 'dot',
                type: 'line',
                name: 'VBN',
                color: colorVBN,
                marker: { lineWidth: 3 },
                data: [],
                connectEnds: false

            },
            {
                yAxis: 0,
                dashStyle: 'dot',
                type: 'line',
                name: 'VCN',
                color: colorVCN,
                marker: { lineWidth: 3 },
                data: [],
                connectEnds: false

            },
            {
                yAxis: 1,
                type: 'line',
                name: 'IAN',
                color: colorIAN,
                marker: { lineWidth: 3 },
                data: [],
                connectEnds: false
            },
            {
                yAxis: 1,
                type: 'line',
                name: 'IBN',
                color: colorIBN,
                marker: { lineWidth: 3 },
                data: [],
                connectEnds: false

            },
            {
                yAxis: 1,
                type: 'line',
                name: 'ICN',
                color: colorICN,
                marker: { lineWidth: 3 },
                data: [],
                connectEnds: false

            }]
        });

        phasorchart.tooltip.hide = function () { };


    }

/// EOF