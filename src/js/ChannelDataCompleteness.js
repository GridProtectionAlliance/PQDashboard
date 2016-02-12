
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
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSTE(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSTE Trending Viewer">';
    return_html += '<img src="images/steButton.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSTE(id) {
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);
    var popup = window.open("openSTE.aspx?channelid="
        + encodeURIComponent(datarow.channelid)
        + "&date=" + encodeURIComponent(datarow.date)
        + "&meterid=" + encodeURIComponent(datarow.meterid)
        + "&measurementtype=" + encodeURIComponent(datarow.measurementtype)
        + "&characteristic=" + encodeURIComponent(datarow.characteristic)
        + "&phasename=" + encodeURIComponent(datarow.phasename)
       , id + "openSTE", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
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

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                        
                        { name: 'channelid' },
                        { name: 'channelname' },
                        { name: 'meterid' },
                        { name: 'measurementtype' },
                        { name: 'characteristic' },
                        { name: 'phasename' },
                        { name: 'Latched', type: 'float' },
                        { name: 'Unreasonable', type: 'float' },
                        { name: 'Noncongruent', type: 'float' },
                        { name: 'completeness', type: 'float' },
                        { name: 'date'}
                    ]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                { text: 'Channel ID', datafield: 'channelid', renderer: columnsrenderer },
                { text: 'Channel Name', datafield: 'channelname', renderer: columnsrenderer },
                { text: 'meterid', datafield: 'meterid', renderer: columnsrenderer },
                { text: 'Type', datafield: 'measurementtype', width: 100, renderer: columnsrenderer },
                { text: 'Characteristic', datafield: 'characteristic', renderer: columnsrenderer },
                { text: 'Phase', datafield: 'phasename', width: 100, renderer: columnsrenderer },
                { text: 'Latched', datafield: 'Latched', type: 'float', cellsformat: 'p0', width: 110, cellsalign: 'right' },
                { text: 'Unreasonable', datafield: 'Unreasonable', type: 'float', cellsformat: 'p0', width: 110, cellsalign: 'right' },
                { text: 'Noncongruent', datafield: 'Noncongruent', type: 'float', cellsformat: 'p0', width: 110, cellsalign: 'right' },
                { text: 'Complete', datafield: 'completeness', cellsformat: 'p0', type: 'float', width: 140, renderer: columnsrenderer, cellsalign: 'right' },
                { text: '  ', cellsrenderer: makeOpenSTEButton_html, dataField: 'OpenSTE', width: 40, padding: 0, cellsalign: 'left' },
                { text: '  ', datafield: 'date' }
                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);
            $('#' + thediv).jqxGrid('hidecolumn', 'channelid');
            $('#' + thediv).jqxGrid('hidecolumn', 'date');
            $('#' + thediv).jqxGrid('hidecolumn', 'meterid');
        }
    });
}


