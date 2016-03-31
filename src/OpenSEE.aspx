<!--
//******************************************************************************************************
//  OpenSEE.aspx - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  12/18/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************
-->

<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OpenSEE.aspx.cs" Inherits="OpenSEE" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head id="Head1" runat="server">
    <title>OpenSEE - <%=postedMeterName %> <%=postedEventDate %></title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />

    <link rel="shortcut icon" type="image/ico" href="./images/openSEE.ico" />
    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css" />
    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.base.css" type="text/css" />
    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.ui-redmond.css" type="text/css" />
    <link rel="stylesheet" href="./css/jquery.multiselect.css" />
    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css" />
    <link rel="stylesheet" href="./css/OpenSEE.css" type="text/css" />

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
    
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>

    <script type="text/javascript" src="./js/flot/jquery.flot.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.crosshair.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.navigate.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.resize.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.selection.js"></script>
    <script type="text/javascript" src="./js/flot/jquery.flot.time.js"></script>

    <script type="text/javascript">var SeriesList = <%=postedSeriesList %>;</script>
    <script type="text/javascript" src="./js/OpenSEE.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>

</head>
    <body>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventId"><%=postedEventId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventName"><%=postedEventName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterId"><%=postedMeterId %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDate"><%=postedDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventDate"><%=postedEventDate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedEventMilliseconds"><%=postedEventMilliseconds %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterName"><%=postedMeterName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedLineName"><%=postedLineName %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedLineLength"><%=postedLineLength %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedStartTime"><%=postedStartTime %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDurationPeriod"><%=postedDurationPeriod %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMagnitude"><%=postedMagnitude %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedShowFaultCurves"><%=postedShowFaultCurves %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedShowBreakerDigitals"><%=postedShowBreakerDigitals %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedErrorMessage"><%=postedErrorMessage %></div>

        <div id="unifiedtooltip" class="ui-widget-content">
            <div id="unifiedtooltiphandle"></div>
            <div id="unifiedtooltipcontent"></div>
            <button class="CloseButton" onclick="showhideTooltip($('#showtooltip')[0]);">X</button>
        </div>
        
        <div id="accumulatedpoints" class="ui-widget-content" style="width: 480px; height: 200px">
            <div id="accumulatedpointshandle"></div>
            <div id="accumulatedpointscontent"></div>
            <div style="margin: 5px; text-align: right">
                <input class="smallbutton" type="button" value="Pop" onclick="popAccumulatedPoints()" />
                <input class="smallbutton" type="button" value="Clear" onclick="clearAccumulatedPoints()" />
            </div>
            <button class="CloseButton" onclick="showhidePoints($('#showpoints')[0]);">X</button>
        </div>

        <div id="phasor" class="ui-widget-content" style="width:300px; height:320px;">
            <div id="phasorhandle"></div>
            <div id="phasorchart" style="width: 300px; height: 300px; z-index: 1001;">
                <canvas id="phasorCanvas" width="300" height="300" style="display: block;"></canvas>
            </div>
            <button class="CloseButton" onclick="showhidePhasor($('#showphasor')[0]);">X</button>
        </div>

        <div style="width: 100%">
            <table style="width: 100%">
                <tr>
                    <td style="width: 33%; text-align: left"><img alt="" src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td style="width: 33%; text-align: center"><img alt="" src="images/openSEET.png" /></td>
                    <td style="width: 33%; text-align: right; vertical-align: top; white-space: nowrap"><img alt="" src="images/GPA-Logo.png" /></td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: center">
                        <div id="TitleData"></div>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="DockWaveformHeader">
            <table style="width: 75%; margin: 0 auto">
                <tr>
                    <td style="width: 20%"><input class="smallbutton" type="button" value="Reset Zoom" id="resetZoom"/></td>
                    <td style="width: 20%"><input class="smallbutton" type="button" value="Show Points" onclick="showhidePoints(this);" id="showpoints"/></td>
                    <td style="width: 20%"><input class="smallbutton" type="button" value="Show Tooltip" onclick="showhideTooltip(this);" id="showtooltip"/></td>
                    <td style="width: 20%"><input class="smallbutton" type="button" value="Show Phasor" onclick="showhidePhasor(this);" id="showphasor"/></td>
                    <td style="width: 20%"><input class="smallbutton" type="button" value="Fault Details" onclick="showdetails(this);" id="showdetails"/></td>
                </tr>
            </table>
        </div>

        <div id="DockCharts"></div>
    </body>
</html>