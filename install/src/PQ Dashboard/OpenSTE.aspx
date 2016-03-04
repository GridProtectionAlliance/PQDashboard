<%@ page language="C#" autoeventwireup="true" inherits="OpenSTE, App_Web_h1be5wpk" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head id="Head1" runat="server">
    
    <title>OpenSTE System Trending Explorer</title>
    
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

    <script type="text/javascript" src="./js/highcharts.js"></script>
    
    <script type="text/javascript" src="./js/highcharts-more.js"></script>

    <!--<script type="text/javascript" src="./js/modules/no-data-to-display.js"></script>-->

    <script type="text/javascript" src="js/HighchartsYAxisZeroAlign.js"></script>

    <script type="text/javascript" src="./js/modules/exporting.js"></script>

    <script type="text/javascript" src="./js/modules/data.js"></script>

    <script type="text/javascript" src="./js/modules/drilldown.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>

    <script type="text/javascript" src="./js/OpenSTE.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>
    
    <link rel="stylesheet" href="./css/OpenSTE.css" type="text/css" />

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
        
            <div unselectable="on" class="DockWaveformHeader"><center>

                <table unselectable="on" width="80%">
                    <tr>
                        <td>
                            <select id="MeasurementType"></select>
                        </td>
                        <td>
                            <select id="MeasurementCharacteristic"></select>
                        </td>
                        <td>
                            <select id="Phase"></select>
                        </td>
                        <td width="0" style="visibility: hidden">
                            <select id="Period" style="visibility: hidden">
                                <option value="Day">Day</option>
                                <option value="Week">Week</option>
                                <option value="Month">Month</option>
                            </select>
                        </td>
                    </tr>
                </table>  
                </center>
            </div>

        <div id="DockWaveformTrending">
            <div id="WaveformTrending">
            </div>
        </div>
    </body>
</html>