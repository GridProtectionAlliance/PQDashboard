

var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";


$(document).ready(function () {


    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;

    populateMeterEventsDivWithGrid('getSiteLinesDetailsByDate', "MeterDetailsByDate", postedMeterName, postedMeterId, postedDate);

});

var floatrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {

    return '<div style="text-align: center; margin-top: 5px;">' + parseFloat(value).toFixed(4) + "m" + '</div>';

}

var columnsrenderer = function (value) { return '<div style="text-align: center; margin-top: 5px;">' + value + '</div>'; };

function populateMeterEventsDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            json = $.parseJSON(data.d);

            $.each(json, function (_, obj) {
                obj.thelinename = Number(obj.thelinename);
                obj.voltage = Number(obj.voltage);
                obj.thecurrentdistance = Number(obj.thecurrentdistance);
            });

            $('#' + thediv).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                columns: [
                    { field: 'theinceptiontime', headerText: 'Start Time', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true },
                    { field: 'theeventtype', headerText: 'Event Type', headerStyle: 'width: 20%', bodyStyle: 'width: 20%; height: 20px', sortable: true },
                    { field: 'thelinename', headerText: 'Line Name', headerStyle: 'width: 20%', bodyStyle: 'width:  20%; height: 20px', sortable: true },
                    { field: 'voltage', headerText: 'Line KV', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'thefaulttype', headerText: 'Phase', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'thecurrentdistance', headerText: 'Distance', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
                    {
                        headerText: '', headerStyle: 'width: 20%', content: function (row) {
                            console.log(row);
                            var key = Object.keys(row).filter(function(a){
                                return  a !== 'thecurrentdistance' &&
                                        a !== 'theeventid' &&
                                        a !== 'theeventtype' &&
                                        a !== 'thefaulttype' &&
                                        a !== 'theinceptiontime' &&
                                        a !== 'thelineid' &&
                                        a !== 'thelinename' &&
                                        a !== 'pqiexists' &&
                                        a !== 'voltage';
                                });
                            var html = "";

                            html += makeOpenSEEButton_html(row);

                            if (row.theeventtype == "Fault")
                                html += makeFaultSpecificsButton_html(row);
                            if (row.pqiexists !== '0')
                                html += makePQIButton_html(row);

                            $.each(key, function (i, k) {
                                if (row[k] !== '0')
                                    html += makeEASDetailsButton_html(row, row[k], k + '.aspx', 'images/' + k + '.png', 'Launch '+ k + ' Page' ,300, 450);
                            });

                            return html;
                        }
                    }
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });
}

function makeEASDetailsButton_html(row, value, url, imagepath, title, width, height) {
    var return_html = "";

    url += "?eventid=" + row.theeventid;

    if (value != "" && value != "0" && value != null) {

        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToEAS(' + "'" + url + "'"+"," + width + "," + height  + ');"  title="' + title + '">';
        return_html += '<img src="'+ imagepath + '" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}


function OpenWindowToEAS(url, width, height) {
    var popup = window.open(url, url, "left=0,top=0,width="+width+",height="+height+",status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}


function makeOpenSEEButton_html(id) {
    var return_html = "";
    //return_html += '<div style="cursor: pointer;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + id.theeventid + ');" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button>';
    //return_html += '</div>';
    return (return_html);
}

function makeFaultSpecificsButton_html(id) {
    var return_html = "";

    if (id.theeventtype == "Fault") {
        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id.theeventid +');" title="Open Fault Detail Window">';
        return_html += '<img src="images/faultDetailButton.png" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}

function makePQIButton_html(id) {
    var return_html = "";

    if (id.pqiexists == "1") {
        //return_html += '<div style="cursor: pointer;">';
        return_html += '<button onClick="OpenWindowToPQI(' + id.theeventid + ');"title="Open PQI Window">';
        return_html += '<img src="images/pqiButton.png" /></button>';
        //return_html += '</div>';
    }
    return (return_html);
}

function OpenWindowToOpenSEE(id) {
    var popup = window.open("/Main/OpenSEE?eventid=" + id + "&faultcurves=1", id + "openSEE");
    return false;
}

function OpenWindowToFaultSpecifics(id) {
    var popup = window.open("FaultSpecifics.aspx?eventid=" + id, id + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}

function OpenWindowToPQI(id) {
    var popup = window.open("PQIByEvent.aspx?eventid=" + id, id + "PQI", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
    return false;
}
