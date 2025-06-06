

var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";


$(document).ready(function () {


    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;

    populateMeterChannelDataQualityDivWithGrid('getSiteChannelDataQualityDetailsByDate', "MeterDetailsByDate", postedMeterName, postedMeterId, postedDate);

});

function makeOpenSTEButton_html(id) {
    var return_html = "";
    var url = "'Main/OpenSTE?channelid="
    + encodeURIComponent(id.channelid)
    + "&date=" + encodeURIComponent(id.date)
    + "&meterid=" + encodeURIComponent(id.meterid)
    + "&measurementtype=" + encodeURIComponent(id.measurementtype)
    + "&characteristic=" + encodeURIComponent(id.characteristic)
    + "&phasename=" + encodeURIComponent(id.phasename) + "'";

    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSTE(' +url + ',' + id.channelid + ')" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSTE Trending Viewer">';
    return_html += '<img src="images/steButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSTE(url, id) {
    var popup = window.open(url, id + "openSTE");
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

    $.ajax({
        type: "GET",
        url: './api/Correctness/DetailsByDate/' + siteID + '/' + theDate,
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
                    { field: 'measurementtype', headerText: 'Type', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; height: 20px', sortable: true },
                    { field: 'characteristic', headerText: 'Characteristic', headerStyle: 'width: 15%', bodyStyle: 'width: 15%; height: 20px', sortable: true },
                    { field: 'phasename', headerText: 'Phase', headerStyle: 'width:  10%', bodyStyle: 'width:  10%; height: 20px', sortable: true },
                    { field: 'ReceivedPoints', headerText: 'Received', headerStyle: 'width:  10%', bodyStyle: 'width:  15%; height: 20px; text-align: right', sortable: true },
                    { field: 'GoodPoints', headerText: 'Good', headerStyle: 'width:  10%', bodyStyle: 'width:  15%; height: 20px; text-align: right', sortable: true },
                    { field: 'LatchedPoints', headerText: 'Latched', headerStyle: 'width:  10%', bodyStyle: 'width:  15%; height: 20px; text-align: right', sortable: true },
                    { field: 'UnreasonablePoints', headerText: 'Unreasonable', headerStyle: 'width: 15%', bodyStyle: 'width: 15%; height: 20px; text-align: right', sortable: true },
                    { field: 'NoncongruentPoints', headerText: 'Noncongruent', headerStyle: 'width: 10%', bodyStyle: 'width: 10%; padding: 0; height: 20px; text-align: right', sortable: true },
                    { field: 'OpenSTE', headerText: '', headerStyle: 'width: 4%', bodyStyle: 'width: 4%; padding: 0; height: 20px', content: makeOpenSTEButton_html }
                ],
                datasource: data
            });
        }
    });

}


