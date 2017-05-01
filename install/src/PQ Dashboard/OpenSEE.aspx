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

    <link rel="shortcut icon" type="image/ico" href="./Images/openSEELogo.png" />
    <link rel="stylesheet" href="./Content/themes/redmond/jquery-ui.css" />
    <link rel="stylesheet" href="./Content/jquery.multiselect.css" />
    <link rel="stylesheet" href="./Content/jquery.multiselect.filter.css" />
    <link rel="stylesheet" href="./Content/OpenSEE.css" type="text/css" />
    <link rel="stylesheet" href="./Scripts/PrimeUI/Font-Awesome/css/font-awesome.min.css"/>
    <link rel="stylesheet" href="./Scripts/PrimeUI/primeui.min.css" />

    <script type="text/javascript" src="./Scripts/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="./Scripts/jquery-ui.js"></script>
    <script type="text/javascript" src="./Scripts/PrimeUI/primeui.js"></script>
    <script type="text/javascript" src="./Scripts/jquery.blockUI.js"></script>
    <script type="text/javascript" src="./Scripts/jquery.multiselect.js"></script>
    <script type="text/javascript" src="./Scripts/jquery.multiselect.filter.js"></script>
    <script type="text/javascript" src="./Scripts/flot/jquery.flot.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.crosshair.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.navigate.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.resize.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.selection.js"></script>
    <script type="text/javascript" src="./Scripts/flot/jquery.flot.time.js"></script>
    <script type="text/javascript">var SeriesList = <%=postedSeriesList %>;</script>
    <script type="text/javascript" src="./Scripts/OpenSEE.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>

</head>
    <body>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedEventId"><%=postedEventId %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedEventName"><%=postedEventName %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedMeterId"><%=postedMeterId %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedDate"><%=postedDate %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedEventDate"><%=postedEventDate %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedEventMilliseconds"><%=postedEventMilliseconds %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedMeterName"><%=postedMeterName %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedLineName"><%=postedLineName %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedLineLength"><%=postedLineLength %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedStartTime"><%=postedStartTime %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedDurationPeriod"><%=postedDurationPeriod %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedMagnitude"><%=postedMagnitude %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedShowFaultCurves"><%=postedShowFaultCurves %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedShowBreakerDigitals"><%=postedShowBreakerDigitals %></div>
        <div style="visibility:hidden; width: 0; height: 0;" id="postedErrorMessage"><%=postedErrorMessage %></div>

        <div id="unifiedtooltip" class="ui-widget-content">
            <div id="unifiedtooltiphandle"></div>
            <div id="unifiedtooltipcontent"></div>
            <button class="CloseButton" onclick="showhideTooltip($('#showtooltip')[0]);">X</button>
        </div>
        
        <div id="accumulatedpoints" class="ui-widget-content">
            <div style="border: black solid 2px;">
                <div id="accumulatedpointshandle"></div>
                <div style="overflow-y: scroll; height: 200px" ><div id="accumulatedpointscontent"></div></div>
                <div style="margin: 5px; text-align: right">
                    <input class="smallbutton" type="button" value="Remove" onclick="RemovePoint()" />
                    <input class="smallbutton" type="button" value="Pop" onclick="popAccumulatedPoints()" />
                    <input class="smallbutton" type="button" value="Clear" onclick="clearAccumulatedPoints()" />
                </div>
                <button class="CloseButton" style="top: 2px; right: 2px" onclick="showhidePoints($('#showpoints')[0]);">X</button>
            </div>
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
                    <td style="text-align: left"><img alt="" src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td style="text-align: center"><img alt="" src="images/openSEET.png" /></td>
                    <td style="text-align: right; vertical-align: top; white-space: nowrap"><img alt="" src="images/GPA-Logo.png" style="display: none" /></td>
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
                    <% if (postedAdjacentEventIds[0] != -1)
                       { %>
                    <td><a href="?eventid=<%= postedAdjacentEventIds[0] + postedURLQueryString %>" class="smallbutton" type="button" id="previousevent">Previous Event</a></td>
                    <% } %>
                    <td><input class="smallbutton" type="button" value="Reset Zoom" id="resetZoom"/></td>
                    <td><input class="smallbutton" type="button" value="Show Points" onclick="showhidePoints(this);" id="showpoints"/></td>
                    <td><input class="smallbutton" type="button" value="Show Tooltip" onclick="showhideTooltip(this);" id="showtooltip"/></td>
                    <td><input class="smallbutton" type="button" value="Show Phasor" onclick="showhidePhasor(this);" id="showphasor"/></td>
                    <td><input class="smallbutton" type="button" value="Fault Details" onclick="showdetails(this);" id="showdetails"/></td>
                    <% if (postedAdjacentEventIds[1] != -1)
                       { %>
                    <td><a href="?eventid=<%=postedAdjacentEventIds[1] + postedURLQueryString %>" class="smallbutton" type="button" id="nextevent">Next Event</a></td>
                     <% } %>
                </tr>
            </table>
        </div>

        <div id="DockCharts"></div>
    </body>
</html>