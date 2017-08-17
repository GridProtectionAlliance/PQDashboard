<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OpenSTE.aspx.cs" Inherits="OpenSTE" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head id="Head1" runat="server">
    
    <title>OpenSTE System Trending Explorer</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta charset="utf-8"/>    
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    
    <link rel="stylesheet" href="./Content/bootstrap-3.3.2.min.css"/> 
    <link rel="stylesheet" href="./Content/themes/redmond/jquery-ui.css"/>  
    <link rel="stylesheet" href="./Content/jquery.multiselect.css"/>
    <link rel="stylesheet" href="./Content/jquery.multiselect.filter.css"/> 


    <script type="text/javascript" src="./Scripts/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="./Scripts/jquery-ui.js"></script>    
    <script type="text/javascript" src="./Scripts/jquery.blockUI.js"></script>
    <script type="text/javascript" src="./Scripts/jquery.multiselect.js"></script>    
    <script type="text/javascript" src="./Scripts/jquery.multiselect.filter.js"></script>
   	<script type="text/javascript" src="./Scripts/flot/jquery.flot.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.errorbars.js"></script>
	<script type="text/javascript" src="./Scripts/flot/jquery.flot.navigate.js"></script>
  	<script type="text/javascript" src="./Scripts/flot/jquery.flot.resize.js"></script>
  	<script type="text/javascript" src="./Scripts/flot/jquery.flot.time.js"></script>
   	<script type="text/javascript" src="./Scripts/flot/jquery.flot.selection.js"></script>
    <script type="text/javascript" src="./Scripts/OpenSTE.js"></script>
    
    <link rel="stylesheet" href="./Content/OpenSTE.css" type="text/css" />
</head>
    <body>

        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedchannelid"><%=postedchannelid %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="posteddate"><%=posteddate %></div>
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedmeterid"><%=postedmeterid %></div>     
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedmeasurementtype"><%=postedmeasurementtype %></div>     
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedcharacteristic"><%=postedcharacteristic %></div>     
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedphasename"><%=postedphasename %></div>     
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedmetername"><%=postedmetername %></div>   
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedlinename"><%=postedlinename %></div>         
          

        <div style="width: 100%; height: 32px;">
            <table width="100%">
                <tr>
                    <td width="33%" align="left"><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td width="33%" align="center"><img src="images/openSTE.png" /></td>
                    <td width="33%" align="right" valign="top" nowrap><img src="images/GPA-Logo.png" /></td>
                </tr>
            </table>
        </div>
        
            <div class="DockWaveformHeader">
                <h4 style="text-align: center" id="chartTitle"></h4>
            </div>
        
        <div class="row" id="DockWaveformTrending">
            <div class="row" style="height: 100%">
                <div class="col-md-1" style="height: 100%">
                    <div id="ChartYAxis"><span>Trend Magnitude</span></div>
                </div>
                <div class="col-md-9" style="height: 95%">
                    <div id="WaveformTrending"></div>
                </div>
                <div class="col-md-2" style="height: 100%">
                    <div id="legend"></div>
                </div>
            </div>
        </div>
    </body>
</html>