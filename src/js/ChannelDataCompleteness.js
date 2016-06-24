
var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";

$(document).ready(function () {

    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;
    populateMeterChannelDataQualityDivWithGrid('getSiteChannelCompletenessDetailsByDate', "MeterDetailsByDate", postedMeterName, postedMeterId, postedDate);
});

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSTEButton_html(id) {
    var return_html = "";
    var url = "'openSTE.aspx?channelid="
        + encodeURIComponent(id.channelid)
        + "&date=" + encodeURIComponent(id.date)
        + "&meterid=" + encodeURIComponent(id.meterid)
        + "&measurementtype=" + encodeURIComponent(id.measurementtype)
        + "&characteristic=" + encodeURIComponent(id.characteristic)
        + "&phasename=" + encodeURIComponent(id.phasename) + "'";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSTE( ' + url + ',' + id.channelid + ' )" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSTE Trending Viewer">';
    return_html += '<img src="images/steButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSTE(url, id) {
    var popup = window.open(url, id + "openSTE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

var floatrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {
    return '<div style="text-align: center; margin-top: 5px;">' + parseFloat(value).toFixed(4) + "m" + '</div>';
}
//////////////////////////////////////////////////////////////////////////////////////////////

var columnsrenderer = function (value) { return '<div style="text-align: center; margin-top: 5px;">' + value + '</div>'; };
//////////////////////////////////////////////////////////////////////////////////////////////

function populateMeterChannelDataQualityDivWithGrid(thedatasource, thediv, siteName, siteID, theDate) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDate':'" + theDate + "'}";

    $.ajax({
        type: "POST",
        url: './eventService.asmx/' + thedatasource,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            $('#' + thediv).puidatatable({
                scrollable: true,
                scrollHeight: '100%',
                scrollWidth: '100%',
                columns: [
                    { field: 'channelname', headerText: 'Channel Name', headerStyle: 'width: 25%', bodyStyle: 'width: 25%; height: 20px', sortable: true },
                    { field: 'measurementtype', headerText: 'Type', headerStyle: 'width: 8%', bodyStyle: 'width: 8%; height: 20px', sortable: true },
                    { field: 'characteristic', headerText: 'Characteristic', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
                    { field: 'phasename', headerText: 'Phase', headerStyle: 'width:  6%', bodyStyle: 'width:  6%; height: 20px', sortable: true },
                    { field: 'Latched', headerText: 'Latched', headerStyle: 'width:  15%', bodyStyle: 'width:  15%; height: 20px; text-align: right', sortable: true, content: function (row) { return parseFloat(row.Latched).toFixed(0) + '%'; } },
                    { field: 'Unreasonable', headerText: 'Unreasonable', headerStyle: 'width: 15%', bodyStyle: 'width: 15%; height: 20px; text-align: right', sortable: true, content: function (row) { return parseFloat(row.Unreasonable).toFixed(0) + '%'; } },
                    { field: 'Noncongruent', headerText: 'Noncongruent', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; padding: 0; height: 20px; text-align: right', sortable: true, content: function (row) { return parseFloat(row.Noncongruent).toFixed(0) + '%'; } },
                    { field: 'completeness', headerText: 'Complete', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; padding: 0; height: 20px; text-align: right', sortable: true, content: function (row) { return parseFloat(row.completeness).toFixed(0) + '%'; } },
                    { field: 'OpenSTE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSTEButton_html }
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });

}


