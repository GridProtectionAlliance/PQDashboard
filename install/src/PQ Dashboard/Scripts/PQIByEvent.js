
var postedMeterId = "";
var postedDate = "";
var postedMeterName = "";
var postedEventId = "";

$(document).ready(function () {
    postedMeterId = $("#postedMeterId")[0].innerHTML;
    postedDate = $("#postedDate")[0].innerHTML;
    postedMeterName = $("#postedMeterName")[0].innerHTML;
    postedEventId = $("#postedEventId")[0].innerHTML;
    populateMeterEventsDivWithGrid('getPQIDetailsByEventID', "MeterDetailsByDate", postedEventId);
});

var floatrenderer = function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {
    return '<div style="text-align: center; margin-top: 5px;">' + parseFloat(value).toFixed(4) + "m" + '</div>';
}

var tooltiprenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
    return '<div style="text-align: center; margin-top: 5px;" title="' + value + '">' + value + '</div>';
}

var columnsrenderer = function(value) {
    return '<div style="text-align: center; margin-top: 5px;">' + value + '</div>';
};

function populateMeterEventsDivWithGrid(thedatasource, thediv, eventId) {

    var thedatasent = "{'eventID':'" + eventId + "'}";

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
                sortMode: 'multiple',
                sortMeta: [{ field: 'theinceptiontime', order: 1 }],
                columns: [
                    { field: 'Facility', headerText: 'Facility', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'Area', headerText: 'Area', headerStyle: 'width:  6%', bodyStyle: 'width: 6%; height: 20px', sortable: true },
                    { field: 'Equipment', headerText: 'Equipment', headerStyle: 'width: 30%', bodyStyle: 'width: 30%; height: 20px', sortable: true },
                    { field: 'SectionRank', headerText: 'SectionRank', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'ComponentModel', headerText: 'ComponentModel', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'ManufacturerName', headerText: 'ManufacturerName', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'SeriesName', headerText: 'SeriesName', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                    { field: 'ComponentTypeName', headerText: 'ComponentTypeName', headerStyle: 'width: 9%', bodyStyle: 'width: 9%; height: 20px', sortable: true },
                ],
                datasource: $.parseJSON(data.d)
            });
        }
    });
}
