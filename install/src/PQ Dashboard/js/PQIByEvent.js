
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

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                        { name: 'Facility' },
                        { name: 'Area' },
                        { name: 'SectionTitle' },
                        { name: 'SectionRank' },
                        { name: 'ComponentModel' },
                        { name: 'ManufacturerName' },
                        { name: 'SeriesName' },
                        { name: 'ComponentTypeName' }
                    ]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                { text: 'Facility', datafield: 'Facility', cellsrenderer: tooltiprenderer, renderer: columnsrenderer },
                { text: 'Area', datafield: 'Area', cellsrenderer: tooltiprenderer, width: 100, renderer: columnsrenderer },
                { text: 'Equipment', datafield: 'SectionTitle', cellsrenderer: tooltiprenderer, width: 150, renderer: columnsrenderer },
                { text: 'SectionRank', datafield: 'SectionRank', cellsrenderer: tooltiprenderer, width: 100, renderer: columnsrenderer },
                { text: 'ComponentModel', datafield: 'ComponentModel', cellsrenderer: tooltiprenderer, width: 150, renderer: columnsrenderer },
                { text: 'ManufacturerName', datafield: 'ManufacturerName', cellsrenderer: tooltiprenderer, width: 150, renderer: columnsrenderer },
                { text: 'SeriesName', datafield: 'SeriesName', cellsrenderer: tooltiprenderer, width: 150, renderer: columnsrenderer },
                { text: 'ComponentTypeName', datafield: 'ComponentTypeName', cellsrenderer: tooltiprenderer, renderer: columnsrenderer }


                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);
        }
    });
}
