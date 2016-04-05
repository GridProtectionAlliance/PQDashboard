<%@ page language="C#" autoeventwireup="true" inherits="OpenSEEStack, App_Web_ys03zavf" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head id="Head1" runat="server">
    
    <title>OpenSEEView v.1</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <meta charset="utf-8">
    
    <meta http-equiv="cache-control" content="max-age=0" />

    <meta http-equiv="cache-control" content="no-cache" />

    <meta http-equiv="expires" content="0" />

    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />

    <meta http-equiv="pragma" content="no-cache" />
    
    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css">  

    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.base.css" type="text/css" />
    
    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.ui-redmond.css" type="text/css" />
    
    <link rel="stylesheet" href="./css/jquery.multiselect.css">

    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css"> 

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>

    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxcore.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxdata.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxbuttons.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxscrollbar.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxmenu.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxlistbox.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxdropdownlist.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.selection.js"></script> 

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.columnsresize.js"></script> 

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.filter.js"></script> 

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.sort.js"></script> 

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.pager.js"></script> 

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.grouping.js"></script> 
    
    <script type="text/javascript" src="./js/jqwidgets/jqxdata.export.js"></script>

    <script type="text/javascript" src="./js/jqwidgets/jqxgrid.export.js"></script>
    
    <script src="./js/highcharts.js"></script>
    <script src="./js/highcharts-more.js"></script>
    <script src="./js/modules/exporting.js"></script>
    <script src="./js/adapters/prototype-adapter.js"></script>

    <script type="text/javascript" src="js/HighchartsYAxisZeroAlign.js"></script>

    <script type="text/javascript" src="./js/modules/exporting.js"></script>

    <script type="text/javascript" src="./js/modules/data.js"></script>

    <script type="text/javascript" src="./js/modules/drilldown.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>

    <script type="text/javascript" src="./js/OpenSEEStack.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>
    
    <link rel="stylesheet" href="./css/OpenSEEStack.css" type="text/css" />

</head>
    <body>

        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventId"><%=postedEventId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventName"><%=postedEventName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterId"><%=postedMeterId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDate"><%=postedDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventDate"><%=postedEventDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterName"><%=postedMeterName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedLineName"><%=postedLineName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedStartTime"><%=postedStartTime %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDurationPeriod"><%=postedDurationPeriod %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMagnitude"><%=postedMagnitude %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedShowFaultCurves"><%=postedShowFaultCurves %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedShowBreakerDigitals"><%=postedShowBreakerDigitals %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedErrorMessage"><%=postedErrorMessage %></div>

        

        <div id="unifiedtooltip" class="ui-widget-content">
            <div id="unifiedtooltiphandle"></div>
            <div id="unifiedtooltipcontent"></div>
        </div>
        
        <div id="accumulatedpoints" class="ui-widget-content" style="width: 480px; height: 200px">
            <div id="accumulatedpointshandle"></div>
            <div id="accumulatedpointscontent"></div>
            <div style="margin: 5px; text-align: right">
                <input class="smallbutton" type="button" value="Pop" onclick="popAccumulatedPoints()" />
                <input class="smallbutton" type="button" value="Clear" onclick="clearAccumulatedPoints()" />
            </div>
        </div>

        <div id="phasor" class="ui-widget-content" style="width:300px; height:320px;">
            <div id="phasorhandle"></div>
            <div id="phasorchart" style="width:300px; height:300px; z-index: 1001;"></div>
        </div>

        <div style="width: 100%; height: 64px;">
            <table width="100%">
                <tr>
                    <td width="33%" align="left"><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td width="33%" align="center"><img src="images/openSEET.png" /></td>
                    <td width="33%" align="right" valign="top" nowrap><img src="images/GPA-Logo.png" /></td>
                </tr>
                <tr>
                    <td colspan="3" align="center">
                        <div id="TitleData"></div>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="DockWaveformHeader">
            <center>
                <table width="75%">
    <%--                <tr>
                        <td width="20%" align="center" nowrap>
                            Event Type: <select id="EventTypes"></select>
                        </td>
                        <td width="40%" align="center" nowrap>
                            Event: <select id="EventInstances"></select>
                        </td>
                        <td width="40%" align="center" nowrap>
                            <table width="300px">--%>
                                <tr>
                                    <td width="20%"><input class="smallbutton" type="button" value="Reset Zoom" id="resetZoom"/></td>
                                    <td width="20%"><input class="smallbutton" type="button" value="Show Points" onclick="showhidePoints(this);" id="showpoints"/></td>
                                    <td width="20%"><input class="smallbutton" type="button" value="Show Tooltip" onclick="showhideTooltip(this);" id="showtooltip"/></td>
                                    <td width="20%"><input class="smallbutton" type="button" value="Show Phasor"  onclick="showhidePhasor(this);" id="showphasor"/></td>
                                    <td width="20%"><input class="smallbutton" type="button" value="Fault Details"  onclick="showdetails(this);" id="showdetails"/></td>
                                </tr>
    <%--                        </table>  
                        </td>
                    </tr>--%>
                </table>  
            </center>
        </div>
        <div id="DockWaveformEvents">
            <div id="WaveformEventsVoltage">
            </div>
            <div id="WaveformEventsCurrent">
            </div>
            <div id="WaveformEventsFaultCurve">
            </div>
        </div>

        <div style="width: 100%; height: 64px;">
            <table width="100%">
                <tr>
                    <td align="center">
                        <div id="FooterData"></div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>