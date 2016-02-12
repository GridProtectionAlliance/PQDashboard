<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OpenSEEByDate.aspx.cs" Inherits="OpenSEEByDate" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>OpenSEE By Date v0.89.01</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <meta charset="utf-8">

    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css">  

    <link rel="stylesheet" href="./css/OpenSEEByDate.css" type="text/css" />
    
    <link rel="stylesheet" href="./css/jquery.multiselect.css">

    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css"> 

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>

    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>

    <script type="text/javascript" src="./js/highcharts.js"></script>
    
    <script type="text/javascript" src="./js/highcharts-more.js"></script>

    <!--<script type="text/javascript" src="./js/modules/no-data-to-display.js"></script>-->

    <script type="text/javascript" src="js/HighchartsYAxisZeroAlign.js"></script>

    <script type="text/javascript" src="./js/modules/exporting.js"></script>

    <script type="text/javascript" src="./js/modules/data.js"></script>

    <script type="text/javascript" src="./js/modules/drilldown.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>

    <script type="text/javascript" src="./js/OpenSEEByDate.js"></script>
    
    <script type="text/javascript" src="./js/jstorage.js"></script> 
    
</head>
    <body>

        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventId"><%=postedEventId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventName"><%=postedEventName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterId"><%=postedMeterId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedLineId"><%=postedLineId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDate"><%=postedDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventDate"><%=postedEventDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterName"><%=postedMeterName %></div>

        <div id="draggable" class="ui-widget-content"></div>

        <div id="phasor" class="ui-widget-content" style="width:300px; height:320px;">
            <div id="phasorhandle"></div>
            <div id="phasorchart" style="width:300px; height:300px; z-index: 1001;"></div>
        </div>
        
        <div style="width: 100%; height: 32px;">
            <table width="100%">
                <tr>
                    <td width="33%" align="left"><img src="images/companylogo.jpg" /></td>
                    <td width="33%" align="center"><img src="images/openSEEDate.png" /></td>
                    <td width="33%" align="right" valign="top" nowrap><img src="images/GPA-Logo.png" /></td>
                </tr>
            </table>
        </div>
        <div>
            <div id="DockWaveformEvents">
                <div class="DockWaveformHeader">
                    <table width="100%">
                        <tr>
                            <td width="45%" align="center" nowrap>
                                Event Lines: <select id="EventLinesByMeterDate1"></select>
                            </td>
                            <td width="45%" align="center" nowrap>
                                Event Time: <select id="EventInstancesByMeterLineDate1"></select>
                            </td>
                            <td width="10%" align="center" nowrap>
                                <input type="button" value="reset zoom" id="resetZoom"/>
                            </td>
                        </tr>
                    </table>  
                </div>

                <div id="WaveformEventsVoltage1"></div>
                <div id="WaveformEventsCurrent1"></div>

                <div class="DockWaveformHeader">
                    <table width="100%">
                        <tr>
                            <td width="45%" align="center" nowrap>
                                Event Lines: <select id="EventLinesByMeterDate2"></select>
                            </td>
                            <td width="45%" align="center" nowrap>
                                Event Time: <select id="EventInstancesByMeterLineDate2"></select>
                            </td>
                            <td width="10%" align="center" nowrap>
                                &nbsp;
                            </td>
                        </tr>
                    </table>  
                </div>

                <div id="WaveformEventsVoltage2"></div>
                <div id="WaveformEventsCurrent2"></div>

            </div>
        </div>

    </body>
</html>