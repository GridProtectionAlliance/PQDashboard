

var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";


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
            $('#' + thediv).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                columns: [
                    { field: 'theinceptiontime', headerText: 'Start Time', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true },
                    { field: 'SeverityCode', headerText: 'Severity', headerStyle: 'width: 20%', bodyStyle: 'width: 20%; height: 20px', sortable: true },
                    { field: 'thelinename', headerText: 'Line Name', headerStyle: 'width: 20%', bodyStyle: 'width:  20%; height: 20px', sortable: true },
                    { field: 'voltage', headerText: 'Line KV', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { headerText: '', headerStyle: 'width: 20%', content: function (row) { return makeOpenSEEButton_html(row); } }
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });
}


function makeOpenSEEButton_html(id) {
    var return_html = "";
    //return_html += '<div style="cursor: pointer;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + id.theeventid + ');" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button>';
    //return_html += '</div>';
    return (return_html);
}

function OpenWindowToOpenSEE(id) {
    var popup = window.open("openSEE.aspx?eventid=" + id + "&faultcurves=1", id + "openSEE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}
