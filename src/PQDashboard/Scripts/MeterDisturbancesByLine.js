

var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";
var childWindows = { };


$(document).ready(function () {


    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;

    populateMeterEventsDivWithGrid('getSiteLinesDisturbanceDetailsByDate', "MeterDetailsByDate", postedMeterName, postedMeterId, postedDate);

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
            json = $.parseJSON(data.d)

            $.each(json, function (_, obj) {
                obj.voltage = Number(obj.voltage);
                obj.SeverityCode = Number(obj.SeverityCode);
                obj.magnitude = Number(obj.magnitude);
                obj.duration = Number(obj.duration);
            });

            $('#' + thediv).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                sortMode: 'multiple',
                sortMeta: [{ field: 'theinceptiontime', order: 1 }],
                columns: [
                    { field: 'thelinename', headerText: 'Line Name', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'voltage', headerText: 'Line KV', headerStyle: 'width:  6%', bodyStyle: 'width: 6%; height: 20px', sortable: true },
                    { field: 'theinceptiontime', headerText: 'Start Time', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true },
                    { field: 'SeverityCode', headerText: 'Severity', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'disturbancetype', headerText: 'Disturbance Type', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'phase', headerText: 'Phase', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'magnitude', headerText: 'Magnitude (pu)', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'duration', headerText: 'Duration (s)', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { headerText: '', headerStyle: 'width: 9%', content: function (row) { return makeOpenSEEButton_html(row); } }
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });
}


function makeOpenSEEButton_html(id) {
    var args =
        id.theeventid + ',' +
        id.startmillis + ',' +
        id.endmillis;

    var return_html = "";
    //return_html += '<div style="cursor: pointer;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + args + ');" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="~/Images/seeButton.png" /></button>';
    //return_html += '</div>';
    return (return_html);
}

function OpenWindowToOpenSEE(id, highlightStart, highlightEnd) {
    var title = id + "openSEE";

    window.Highlight = {
        Start: highlightStart,
        End: highlightEnd
    };

    if (!childWindows[title] || childWindows[title].closed)
        childWindows[title] = window.open("/Main/OpenSEE?eventid=" + id + "&faultcurves=1", id + "openSEE");
    else
        childWindows[title].UpdateMarkings();

    return false;
}
