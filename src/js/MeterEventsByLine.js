

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

            $('#' + thediv).jqxGrid(
            {
                width: '100%',
                height: '100%',
                source: {
                    localdata: data.d,
                    dataType: 'json',

                    datafields: [
                        { name: 'thelineid' },
                        { name: 'theeventid' },
                        { name: 'theinceptiontime' },
                        { name: 'theeventtype' },
                        { name: 'thelinename' },
                        { name: 'voltage' },
                        { name: 'thefaulttype' },
                        { name: 'thecurrentdistance' },
                        { name: 'pqiexists' },
                        { name: 'easexists' },
                        { name: 'csaexists' }
                    ]

                },
                sortable: true,
                altrows: true,
                pageable: false,
                theme: 'ui-redmond',

                columns: [
                { text: 'LID', datafield: 'thelineid', renderer: columnsrenderer },
                { text: 'EID', datafield: 'theeventid', renderer: columnsrenderer },
                { text: 'Start Time', datafield: 'theinceptiontime', width: 200, renderer: columnsrenderer },
                { text: 'EventType', datafield: 'theeventtype', width: 100, renderer: columnsrenderer },
                { text: 'Line Name', datafield: 'thelinename', renderer: columnsrenderer },
                { text: 'Line kV', datafield: 'voltage', width: 50, renderer: columnsrenderer },
                { text: 'Phase', datafield: 'thefaulttype', width: 40, cellsalign: 'center',  renderer: columnsrenderer },
                { text: 'Distance', datafield: 'thecurrentdistance', width: 100, cellsalign: 'center', renderer: columnsrenderer },

                { text: ' ', cellsrenderer: makeOpenSeeStackButton_html, dataField: 'OpenSeeStack', width: 40, padding: 0, cellsalign: 'left' },
                { text: ' ', cellsrenderer: makeFaultSpecificsButton_html, dataField: 'FaultSpecifics', width: 40, padding: 0, cellsalign: 'left' },
                { text: ' ', cellsrenderer: makePQIButton_html, dataField: 'PQI', width: 40, padding: 0, cellsalign: 'left' },
                { text: ' ', cellsrenderer: makeEASDetailsButton_html, dataField: 'EAS', width: 40, padding: 0, cellsalign: 'left' },
                { text: ' ', cellsrenderer: makeCSADetailsButton_html, dataField: 'CSA', width: 40, padding: 0, cellsalign: 'left' }
                ]
            });

            var localizationobj = {};
            localizationobj.emptydatastring = "Please Select Single Day";
            $('#' + thediv).jqxGrid('localizestrings', localizationobj);
            $('#' + thediv).jqxGrid('hidecolumn', 'thelineid');
            $('#' + thediv).jqxGrid('hidecolumn', 'theeventid');
            $('#' + thediv).jqxGrid('hidecolumn', 'pqiexists');
            $('#' + thediv).jqxGrid('hidecolumn', 'easexists');
            $('#' + thediv).jqxGrid('hidecolumn', 'csaexists');

            //var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', 0);
            //$("#MeterDetailsByDate")[0].innerHTML = theDate;
            //if (typeof (datarow) != "undefined") {
            //    $('#DetailFaults').jqxGrid('selectrow', 0);
            //}
        }
    });
}

function makeEASDetailsButton_html(id) {
    var return_html = "";

    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    if (datarow.easexists == "1") {

        return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
        return_html += '<button onClick="OpenWindowToEAS(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch ICF Details Page">';
        return_html += '<img src="images/eas.ico" /></button></div>';
    }
    return (return_html);
}

function makeCSADetailsButton_html(id) {
    var return_html = "";

    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    if (datarow.csaexists !== "0") {

        return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
        return_html += '<button onClick="OpenWindowToCSA(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch ICF Details Page">';
        return_html += '<img src="images/csa.png" /></button></div>';
    }
    return (return_html);
}

function OpenWindowToEAS(id) {

    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    var popup = window.open("ICFDetails.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "ICFDetails", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    return false;
}

function OpenWindowToCSA(id) {

    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    var popup = window.open("CSADetails.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "CSADetails", "left=0,top=0,width=300,height=450,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    return false;
}

function makeOpenSeeStackButton_html(id) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSeeStack(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img src="images/seeButton.png" /></button></div>';
    return (return_html);
}

function makeFaultSpecificsButton_html(id) {
    var return_html = "";
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    if (datarow.theeventtype == "Fault") {
        return_html += '<div style="width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
        return_html += '<button onClick="OpenWindowToFaultSpecifics(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open Fault Detail Window">';
        return_html += '<img src="images/faultDetailButton.png" /></button></div>';
    }
    return (return_html);
}

function makePQIButton_html(id) {
    var return_html = "";
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    if (datarow.pqiexists == "1") {
        return_html += '<div style="width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
        return_html += '<button onClick="OpenWindowToPQI(' + id + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Open PQI Window">';
        return_html += '<img src="images/pqiButton.png" /></button></div>';
    }
    return (return_html);
}

function OpenWindowToOpenSeeStack(id) {
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);
    var popup = window.open("openSeeStack.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "openSeeStack", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

function OpenWindowToFaultSpecifics(id) {
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);
    if (datarow.theeventtype == "Fault") {

        var popup = window.open("FaultSpecifics.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "FaultLocation", "left=0,top=0,width=300,height=200,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");
        //var popup = window.open("FaultLocation.aspx?eventid=" + datarow.theeventid, id + "FaultLocation", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    }
    return false;
}

function OpenWindowToPQI(id) {
    var datarow = $('#MeterDetailsByDate').jqxGrid('getrowdata', id);

    var popup = window.open("PQIByEvent.aspx?eventid=" + datarow.theeventid, datarow.theeventid + "PQI", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no");

    return false;
}
