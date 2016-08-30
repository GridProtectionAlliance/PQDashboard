﻿//******************************************************************************************************
//  ModbusData.js - Gbtc
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
//  08/30/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************



var plot;
var updateInterval = 250;
var plotData = [];
var plotDataTemplate = [];
var deviceData = [];
var measurementDetails = [];
var statFilter = "";
var stats = [];
var lightFilter = "";
var parentDevice = [];
var statRefreshInterval;
var dataRefreshInterval;
var dataPointNumber;

$(window).on("messageVisibiltyChanged", function (event) {
    setTimeout(function () {
        setHeights();
    }, 200);
});

$(function () {
    setHeights();

    $(window).resize(function () { setHeights() });

    $('[data-toggle=offcanvas]').click(function () {
        if ($('.sidebar-offcanvas').css('background-color') == 'rgb(255, 255, 255)') {
            $('.list-group-item').attr('tabindex', '-1');
        } else {
            $('.list-group-item').attr('tabindex', '');
        }
        $('.row-offcanvas').toggleClass('active');
    });

    $(window).on("hubConnected", function (event) {
        dataHub.initializeSubscriptions();
    });

    $(window).unload(function () {
        if (!hubIsConnected)
            return;

        dataHub.terminateSubscriptions();
    });

    // Client function called from the dataHub when meta data gets recieved
    dataHubClient.metaDataReceived = function () {
        getStats();
        buildModal("Subscription");
        buildDeviceList();
        buildPlotArray();
    }


});

// Helper functions

// used to create array of objects that will be used to maintain plot data
function buildPlotArray() {
    dataHub.getMeasurementDetails().done(function (data) {
        measurementDetails = data;
        //console.log(data)
        measurementDetails.sort(function (a, b) {
            if (a.ID > b.ID) return 1;
            if (a.ID < b.ID) return -1;

            return 0;
        });

        $.each(measurementDetails, function (i, md) {
            var acronym = null;
            if (md.DeviceAcronym != null)
                acronym = md.DeviceAcronym.replace(/!/g, "-").replace(md.DeviceAcronym.split('!')[0] + '-', "");
            if (md.ID.indexOf("STAT") < 0 && md.SignalAcronym != "DIGI" && md.SignalAcronym != "FLAG" && md.SignalAcronym != "QUAL" && md.SignalAcronym != "STAT" && md.SignalAcronym != "ALOG") {
                var sigref = md.SignalReference.replace(/!/g, "-");
                sigref = sigref.replace(md.DeviceAcronym.replace(/!/g, "-") + "-", "");
                var id = md.ID.split(":")[1];
                lightFilter += md.ID + ';';
                $('#tb' + acronym).append('<tr title="' + md.Description + '"><td nowrap><label class="checkbox-inline"><input type="checkbox" id="cb' + md.ID + '" value="' + md.ID + '#' + md.SignalID + '" hub-dependent>' + id + '</td><td>' + sigref + '</td><td>' + md.SignalAcronym + '</td></tr>');

                //$('<label />', { 'for': 'cb' + md.ID, text: md.SignalReference +  ' - ' + md.SignalAcronym }).appendTo(checklist);
                //$('<br/>').appendTo(checklist);
                var yaxisNum = 1;
                if (md.SignalAcronym == "VPHM") yaxisNum = 2;
                else if (md.SignalAcronym == "IPHM") yaxisNum = 3;
                else if (md.SignalAcronym.indexOf("A") >= 0) yaxisNum = 4;


                plotDataTemplate.push({ label: md.SignalID, yaxis: yaxisNum, data: [] });
            }
            else if (md.SignalAcronym == "STAT") {
                if (md.Enabled == true) {
                    statFilter += md.ID + ';';
                    stats.push({ deviceAcronym: md.DeviceAcronym, id: md.SignalID, value: null, timestamp: null, description: md.Description });
                    var index = stats.length - 1;
                    if (parentDevice.indexOf(md.DeviceAcronym) != -1)
                        $('#stat' + md.DeviceAcronym).append('<tr><td>' + md.ID.split(":")[1] + '</td><td id="des' + md.SignalID + '">' + md.Description + '</td><td><span id="val' + md.SignalID + '" >' + stats[index].value + '</span></td><td><span id="time' + md.SignalID + '" >' + stats[index].timestamp + '</span></td></tr>');
                    else if (md.DeviceAcronym != null) {
                        $('#stat' + acronym).append('<tr><td>' + md.ID.split(":")[1] + '</td><td id="des' + md.SignalID + '">' + md.Description + '</td><td><span id="val' + md.SignalID + '" >' + stats[index].value + '</span></td><td><span id="time' + md.SignalID + '" >' + stats[index].timestamp + '</span></td></tr>');
                    }
                }
            }

        });
        $('input[type=checkbox]').each(function () {
            $(this).change(function () { updateFilter() });

        });
        checkCookie();

        //console.log(stats);
        dataHub.statSubscribe(statFilter);

        $('#devicelist').tooltip();

        dataHub.getMeasurements().done(function (data) {
            buildPlot(data);
            update();
        });
    }).fail(function (error) {
        showErrorMessage(error);
    });;

}

// used to build the device/stream list
function buildDeviceList() {
    dataHub.getDeviceDetails().done(function (data) {
        //console.log(data);
        deviceData = data;
        deviceData.sort(function (a, b) {
            if (a.Acronym > b.Acronym) return 1;
            if (a.Acronym < b.Acronym) return -1;

            return 0;
        });
        $.each(deviceData, function (key, dd) {
            if (parentDevice.indexOf(dd.ParentAcronym) == -1) {
                parentDevice.push(dd.ParentAcronym);
                $('#devicelistinner').append('<div class="panel-heading"><img id="img' + dd.ParentAcronym + '" src="Images/StatusLights/Small/greylight.png" style="padding-left: 6px" /><button class="btn btn-link btn-sm" style="font-size: x-small;" data-toggle="collapse" data-parent="#devicelist" data-target="#dd' + dd.ParentAcronym + '">' + dd.ParentAcronym + '</button><button id="btn' + dd.ParentAcronym + '" class="btn btn-xs badge pull-right" style="font-size: xx-small; margin: 5px 15px 0 0">Stats</button><div id="dd' + dd.ParentAcronym + '" class="panel-collapse collapse in"><div class="panel-body"><ul class="list-group nowrap" id="parent' + dd.ParentAcronym + '"></ul></div></div></div>');
                buildModal(dd.ParentAcronym);
                $('#btn' + dd.ParentAcronym).on("click", function () {
                    $('#mod' + dd.ParentAcronym).modal('show');
                });

            }

            var acronym = dd.Acronym.replace(/!/g, "-").replace(dd.Acronym.split('!')[0] + '-', "");
            if (dd.Enabled == true) {
                $('#parent' + dd.ParentAcronym).append('<li class="list-group-item nowrap" ><img id="img' + acronym + '" src="Images/StatusLights/Small/greylight.png" style="padding-left: 5px" /><button class="btn btn-link btn-sm" style="font-size: x-small;" title="' + dd.Name + '" data-toggle="collapse" data-target="#dd' + acronym + '">' + acronym + '</button><button id="btn' + acronym + '" class="btn btn-xs badge" style="font-size: xx-small;">Stats</button><div id="dd' + acronym + '" class="collapse"><table class="table" style="width:15%; font-size: x-small;" id="tb' + acronym + '"  ><th>ID</th><th>Stream</th><th>Signal</th></table></div></li>');
                buildModal(acronym);
                $('#btn' + acronym).on("click", function () {
                    $('#mod' + acronym).modal('show');
                });
                $('#showSubscriptionStats').on("click", function () {
                    $('#modSubscription').modal('show');
                });

            }
        });

    }).fail(function (error) {
        showErrorMessage(error);
    });

}

// this will get the first set of data and build the plot
function buildPlot(data) {
    $.each(data, function (i, d) {
        for (var j in plotData) {
            if (plotData[j].label == d.ID) {
                plotData[j].data.push([d.Timestamp, d.Value]);
            }
        }
    });


    plot = $.plot("#placeholder", plotData, {
        series: {
            shadowSize: 0
        },
        yaxes: [{
            show: true,
            position: "left",
            axisLabel: "Frequency"
        }, {
            show: true,
            position: "left",
            axisLabel: "Voltage"
        }, {
            show: true,
            position: "right",
            axisLabel: "Current"
        }, {
            show: true,
            position: "right",
            axisLabel: "Angle"
        }

        ],
        xaxis: {
            mode: "time",
            timeformat: "%H:%M:%S",
            timezone: "browser"
        },
        legend: {
            show: true,
            container: $('#legend'),
            labelFormatter: function (label, series) {
                for (var i in measurementDetails) {
                    if (measurementDetails[i].SignalID == label)
                        return measurementDetails[i].SignalReference.split("!")[measurementDetails[i].SignalReference.split("!").length - 1] + " - " + measurementDetails[i].SignalAcronym;
                }

            },
            noColumns: 1,
            margin: 5
        }
    });

}

// used to populate statistic modals
function getStats() {
    if (!hubIsConnected)
        return;

    dataHub.getStats().done(function (data) {
        $.each(data, function (iter, d) {
            for (var i in stats) {
                if (stats[i].id == d.ID) {
                    stats[i].value = d.Value;
                    stats[i].timestamp = d.Timestamp;

                    if (stats[i].deviceAcronym != null) {
                        if ($('#des' + d.ID).text().indexOf("Boolean") >= 0) $('#val' + d.ID).text(Boolean(d.Value));
                        else $('#val' + d.ID).text(d.Value);
                        $('#time' + d.ID).text(new Date(d.Timestamp).formatDate(DateTimeFormat));
                        if (stats[i].description == "Device statistic for Number of measurements received from device during last reporting interval.") {
                            if (stats[i].value != null && stats[i].value > 0) {
                                $('#img' + stats[i].deviceAcronym.replace(/!/g, "-").replace(stats[i].deviceAcronym.split('!')[0] + '-', "")).attr("src", "Images/StatusLights/Small/greenlight.png");
                            } else {
                                $('#img' + stats[i].deviceAcronym.replace(/!/g, "-").replace(stats[i].deviceAcronym.split('!')[0] + '-', "")).attr("src", "Images/StatusLights/Small/redlight.png");
                            }
                        }
                        if (stats[i].description == "Subscriber statistic for Number of processed measurements reported by the subscriber during last reporting interval.") {
                            if (stats[i].value != null && stats[i].value > 0) {
                                $('#img' + stats[i].deviceAcronym.replace(/!/g, "-").replace(stats[i].deviceAcronym.split('!')[0] + '-', "")).attr("src", "Images/StatusLights/Small/greenlight.png");
                            } else {
                                $('#img' + stats[i].deviceAcronym.replace(/!/g, "-").replace(stats[i].deviceAcronym.split('!')[0] + '-', "")).attr("src", "Images/StatusLights/Small/redlight.png");
                            }
                        }


                    }

                    break;
                }
            }



        });

        //console.log(stats);
    }).fail(function (error) {
        showErrorMessage(error);
    });

    setTimeout(getStats, statRefreshInterval);
}

// used to get data and update the plot
function update() {
    if (!hubIsConnected)
        return;

    dataHub.getMeasurements().done(function (data) {

        $.each(data, function (i, d) {
            for (var j in plotData) {
                if (plotData[j].label == d.ID) {
                    plotData[j].data.push([d.Timestamp, d.Value]);
                }
            }
        });

        for (var i = 0; i < plotData.length; ++i) {
            var num = (plotData[i].data.length - dataPointNumber)
            for (var j = 0; j < num; ++j)
                plotData[i].data.shift()

        }

        plot.setData(plotData);
        plot.setupGrid()
        plot.draw();
        setTimeout(update, dataRefreshInterval);
    }).fail(function (error) {
        showErrorMessage(error);
    });
}

// used to update the data subscriper filter string with a new filter string 
function updateFilter() {
    if (!hubIsConnected)
        return;

    var filterStr = "";


    plotData = [];



    $('input[type=checkbox]').each(function () {
        var arr = this.value.split('#');
        if (this.checked == true) {
            filterStr += arr[0] + ";";
            for (var i in plotDataTemplate) {
                if (plotDataTemplate[i].label == arr[1])
                    plotData.push(plotDataTemplate[i]);
            }
        }
    });

    setCookie("filterStr", filterStr, 365);
    dataHub.updateFilters(filterStr);
    plot.setData(plotData);
    plot.setupGrid();
    plot.draw();
}

// used to reset the data subscriper filter string to an empty filter string
function resetFilter() {
    if (!hubIsConnected)
        return;

    var filterStr = "";

    setCookie("filterStr", filterStr, 365);

    for (var i = 0; i < plotData.length; ++i) {
        plotData[i].data = [];
    }

    $('input[type=checkbox]').each(function () {
        if (this.checked == true)
            this.checked = false;
    });

    dataHub.updateFilters(filterStr);
    plot.setData(plotData);
    plot.setupGrid()
    plot.draw();
}

// used to build statistic modals
function buildModal(acronym) {
    $("#modals").append('<div id="' + acronym + '"></div>');
    html = '<div id="mod' + acronym + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>' + acronym + ' Statistics</h4>'
    html += '</div>';
    html += '<div  class="modal-body" style="height: 300px; overflow-y: scroll" >';
    html += '<table id="stat' + acronym + '" class="table" style="font-size: x-small">';
    html += '<thead>Run-time Statistics:<thead />';
    html += '<tr><th>ID</th><th>Statistic</th><th>Value</th><th>TimeTag</th></tr>';
    html += '</table>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn" data-dismiss="modal">Close</span>'; // close button
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('#' + acronym).html(html);
    $("#mod" + acronym).modal({ 'show': false });
}

// used to set cookies
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    //console.log(cname + "=" + cvalue.replace(/;/g, '#') + "; " + expires);
    document.cookie = cname + "=" + cvalue.replace(/;/g, '#') + "; " + expires;
}

// used to get cookies
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// used to check cookie
function checkCookie() {
    if (!hubIsConnected)
        return;

    filterStr = getCookie("filterStr").replace(/#/g, ';');
    $('#filterstring').val(filterStr);
    //console.log(filterStr);

    dataRefreshInterval = getCookie("dataRefreshInterval");
    if (dataRefreshInterval == "") dataRefreshInterval = 250;
    $('#refreshinterval').val(dataRefreshInterval);

    statRefreshInterval = getCookie("statRefreshInterval");
    if (statRefreshInterval == "") statRefreshInterval = 10000;
    $('#statrefreshinterval').val(statRefreshInterval);

    dataPointNumber = getCookie("dataPointNumber");
    if (dataPointNumber == "") dataPointNumber = 300;
    $('#datapoints').val(dataPointNumber);

    var arr = filterStr.split(';');

    for (var i in arr) {
        $('input[type=checkbox]').each(function () {
            if (this.id == 'cb' + arr[i]) {
                this.checked = true;
                var arr2 = this.value.split('#')
                for (var j in plotDataTemplate) {
                    if (plotDataTemplate[j].label == arr2[1])
                        plotData.push(plotDataTemplate[j]);

                }

            }
        });
    }

    dataHub.updateFilters(filterStr);
}

// used to update settings
function updateSettings() {
    dataRefreshInterval = $('#refreshinterval').val();
    statRefreshInterval = $('#statrefreshinterval').val();
    dataPointNumber = $('#datapoints').val();
    filterStr = $('#filterstring').val();

    setCookie("dataRefreshInterval", dataRefreshInterval, 365);
    setCookie("statRefreshInterval", statRefreshInterval, 365);
    setCookie("dataPointNumber", dataPointNumber, 365);
    setCookie("filterStr", filterStr, 365);

}

// sets heights of various objects
function setHeights() {
    const height = calculateRemainingBodyHeight();
    $('#sidebar').css('height', height);
    $('#graphwrapper').css('height', height);
    $('#placeholder').css('height', height * 0.8);
}
