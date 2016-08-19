<!--
//******************************************************************************************************
//  EPRIDashboard.html - Gbtc
//==================================================================
//  Copyright © 2014 Electric Power Research Institute, Inc. 
//  The embodiments of this Program and supporting materials may be ordered from:

//                Electric Power Software Center (EPSC)
//                9625 Research Drive
//                Charlotte, NC 28262 USA
//                Phone: 1-800-313-3774
//                Email: askepri@epri.com
//  THIS NOTICE MAY NOT BE REMOVED FROM THE PROGRAM BY ANY USER THEREOF.
//==================================================================
//
//  Code Modification History:
//==================================================================
//  07/15/2014 - Jeff Walker
//       Generated original version of source code.
//  02/04/2015 - Jeff Walker
//            Refactor
//
//******************************************************************************************************
-->

<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Open Dashboard v1.00 :: <%= username %></title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta charset="utf-8"/>
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    
    <link rel="stylesheet" href="./js/themes/bootstrap/theme.css"/>
    <link rel="stylesheet" type="text/css" href="./css/font-awesome.css" />
    <link rel="stylesheet" href="css/bootstrap-3.3.2.min.css"/>
    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css"/>
    <link rel="stylesheet" href="./js/PrimeUI/primeui.min.css"/>  
    <link rel="stylesheet" href="./css/jquery.multiselect.css"/>
    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css"/> 
    <link rel="stylesheet" href="./css/Default_Google.css" type="text/css" />
    <link rel="stylesheet" href="./css/bootstrap-multiselect.css"/>
    <link rel="stylesheet" type="text/css" href="js/Leaflet/leaflet1.0.css"/>

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>
    <script type="text/javascript" src="./js/jquery.sparkline.js"></script>
    <script type="text/javascript" src="js/bootstrap-3.3.2.min.js"></script>
    <script type="text/javascript" src="js/bootstrap-multiselect.js"></script>
    <script type="text/javascript" src="js/PrimeUI/primeui.js"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=<%= GoogleAPIKey %>&libraries=geometry,visualization&amp;"></script>
<%--    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAH-YHxWXoGpnJY7hyElBovROW5Pf8qegw&callback=initMap" async defer></script>--%>
    <script type="text/javascript" src="./js/arcgislink.js"></script>
    <script type="text/javascript" src="./js/CustomGoogleMapMarker.js"></script>
    <script type="text/javascript" src="./js/keydragzoom.js"></script>
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>
    <script type="text/javascript" src="./js/DefaultGoogle.js"></script>
    <script type="text/javascript" src="./js/jstorage.js"></script> 
    <script type="text/javascript" src="./js/moment.js"></script> 
    <script type="text/javascript" src="js/D3/d3.js" charset="utf-8"></script>
    <script src="https://d3js.org/d3-array.v1.min.js"></script>
    <script src="https://d3js.org/d3-collection.v1.min.js"></script>
    <script src="https://d3js.org/d3-color.v1.min.js"></script>
    <script src="https://d3js.org/d3-format.v1.min.js"></script>
    <script src="https://d3js.org/d3-interpolate.v1.min.js"></script>
    <script src="https://d3js.org/d3-time.v1.min.js"></script>
    <script src="https://d3js.org/d3-time-format.v2.min.js"></script>
    <script src="https://d3js.org/d3-scale.v1.min.js"></script>
    <script src="https://d3js.org/d3-path.v1.min.js"></script>
    <script src="https://d3js.org/d3-shape.v1.min.js"></script>
    <script src="http://d3js.org/topojson.v1.min.js"></script>
<%--    <script src="https://d3js.org/d3.v3.min.js" charset="utf-8"></script>--%>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
    <script src="./js/D3/d3.geom.contour.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script type="text/javascript" src="js/Leaflet/leaflet1.0.js"></script>
    <script src="./js/heatmap.js"></script>
    <script src="./js/D3/turf.custom.js"></script>
    <script src="./js/D3/marchingsquares-isobands.js"></script>
    <script src="./js/D3/marchingsquares-isocontours.js"></script>
    <script src="./js/leaflet-heatmap.js"></script>
  	<script type="text/javascript" src="./js/flot/jquery.flot.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.errorbars.js"></script>
	<script type="text/javascript" src="./js/flot/jquery.flot.navigate.js"></script>
  	<script type="text/javascript" src="./js/flot/jquery.flot.resize.js"></script>
  	<script type="text/javascript" src="./js/flot/jquery.flot.time.js"></script>
   	<script type="text/javascript" src="./js/flot/jquery.flot.selection.js"></script>

  
</head>
    

    <body onunload="createupdateconfig(null);" >
    
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedUserName"><%=username %></div>

        <div id="draggable" class="ui-widget-content" ></div>
        <div style="width: 100%; height: 36px;" >
            <table width="100%" >
                <tr>
                    <td width="33%"  align="left"><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td width="33%"  align="center"><img src="images/PQ-Dashboard.png" /></td>
                    <td width="34%"  align="right" valign="top" nowrap><img src="images/EPRI(c).jpg" /></td>
                </tr>
            </table>
        </div>


        <div id="ApplicationContent"  class="noselect" >
            <div id="headerStrip"  class="headerStrip ui-state-default noselect">
                <table style="width: 100%;">
                    <tr>
                        <td width="20%" align="center" style="z-index: 999;" nowrap>
                            <select class="smallbutton" id="Configurations" onchange="configurationapply(this);"></select>
                            <button class="smallbutton" id="ConfigurationsCopy" onclick="configurationscopy(this);">New</button>
                            <button class="smallbutton" id="ConfigurationsUpdate" onclick="configurationsupdate(this);">Save</button>
                            <button class="smallbutton" id="ConfigurationsDelete" onclick="configurationsdelete(this);">Delete</button>
                        </td>
                        <td width="20%" align="center" nowrap>
                            Site:
                            <select id="siteList" multiple="multiple">
                            </select>
                        </td>

                        <td width="20%" align="center" nowrap>
                            From:&nbsp;<input type="text" id="datePickerFrom" class="datepicker">&nbsp;&nbsp;To:&nbsp;<input type="text" id="datePickerTo" class="datepicker">
                            <button class="smallbutton" id="load_for_date_range" onclick="loadDataForDateClick();">Load</button>
                            
                            <select class="smallbutton" id="staticPeriod" onchange="selectStaticPeriod(this);">
                                <option value="Custom"></option>
                                <option value="Today">Today</option>
                                <option value="PastWeek">Today - 7</option>
                                <option value="PastMonth">Today - 30</option>
                                <option value="PastYear">Today - 365</option>
                            </select>
                        </td>
                        <td width="20%" align="center" style="z-index: 999;" nowrap>Mode:
                            <select class="smallbutton" id="mapGrid" onchange="selectmapgrid(this);">
                                <option value="Map">Map</option>
                                <option value="Grid">Grid</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>

            <div id="application-tabs" class="noselect" >
                <ul>
                    <li id="tabsOverviewToday"><a href="#tabs-Overview-Today">Overview-Today</a></li>
                    <li id="tabsOverviewYeserday"><a href="#tabs-Overview-Yesterday">Overview-Yesterday</a></li>
                    <li id="tabsEvents"><a href="#tabs-Events">Events</a></li>
                    <li id="tabsDisturbances"><a href="#tabs-Disturbances">Disturbances</a></li>
                    <li id="tabsTrending"><a href="#tabs-Trending">Trending</a></li>
                    <li id="tabsTrendingData"><a href="#tabs-TrendingData">TrendingData</a></li>
                    <li id="tabsFaults"><a href="#tabs-Faults">Faults</a></li>
                    <li id="tabsBreakers"><a href="#tabs-Breakers">Breakers</a></li>
                    <li id="tabsCompleteness"><a href="#tabs-Completeness">Completeness</a></li>
                    <li id="tabsCorrectness"><a href="#tabs-Correctness">Correctness</a></li>
                </ul>
                
                <div  id="tabs-Overview-Today">
                    <img class="overviewImg" src="./images/todaymockup.png"/>
<%--                    <div id="overviewContainer" class="container" style="background-color: #005ce6; width: 100%; height: 100%; text-align: center">
                        <div style="text-align: center; color: white"><h3>PQ Overview for <span id="overviewDate"></span></h3></div>
                        <div style="height: 1px; width: 80%; display: inline-block; background-color: #66ffe0"></div>
                        <div id="elementContainer" >
                            <div id="meters"></div>
                            <div id="alarms"></div>
                            <div id="offnormal"></div>
                            <div id="last30days"></div>
                            <div id="voltageDisturbances"></div>
                            <div id="faults"></div>
                        </div>
                    </div>--%>
                </div>

                <div  id="tabs-Overview-Yesterday">
                    <img class="overviewImg" src="./images/yesterdaymockup.png"/>
<%--                    <div id="overviewContainer" class="container" style="background-color: #005ce6; width: 100%; height: 100%; text-align: center">
                        <div style="text-align: center; color: white"><h3>PQ Overview for <span id="overviewDate"></span></h3></div>
                        <div style="height: 1px; width: 80%; display: inline-block; background-color: #66ffe0"></div>
                        <div id="elementContainer" >
                            <div id="meters"></div>
                            <div id="alarms"></div>
                            <div id="offnormal"></div>
                            <div id="last30days"></div>
                            <div id="voltageDisturbances"></div>
                            <div id="faults"></div>
                        </div>
                    </div>--%>
                </div>

                <div  id="tabs-Events">
                    <div  id="column_1" class="column resizeable">
                        <div  class="portlet" id="Portlet1Events">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Events Overview (For Date Range)</div></div>
                            <div  id="DockOverviewEvents" class="portlet-content">
                                <div  id="OverviewEvents" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Events">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Events Detail for&nbsp;<div style="display: inline;" id="eventsDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div  id="DockDetailEvents" class="portlet-content noselect">
                                <div id="DetailEvents" class="docklet">
                                    <div id="DetailEventsTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="column_2" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetEvents" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>

                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderEventsFrom" class="mapheader" ></div>
                                            <div id="mapHeaderEventsDivider" class="mapheader">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderEventsTo" class="mapheader"></div>
                                        </center>
                                    </div>

                                </div>

                            </div>

                            <div  id="MapMatrixEvents" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapEvents"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixEvents"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div  id="tabs-Disturbances">
                    <div  id="column_13" class="column resizeable">
                        <div  class="portlet" id="Portlet1Disturbances">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Disturbances Overview (For Date Range)</div></div>
                            <div  id="DockOverviewDisturbances" class="portlet-content">
                                <div  id="OverviewDisturbances" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Disturbances">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Disturbances Detail for&nbsp;<div style="display: inline;" id="DisturbancesDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div  id="DockDetailDisturbances" class="portlet-content noselect">
                                <div id="DetailDisturbances" class="docklet">
                                    <div id="DetailDisturbancesTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="column_14" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetDisturbances" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Disturbances">Disturbances</option>
                                            <option value="NoDisturbances">No Disturbances</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>

                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderDisturbancesFrom" class="mapheader" ></div>
                                            <div id="mapHeaderDisturbancesDivider" class="mapheader">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderDisturbancesTo" class="mapheader"></div>
                                        </center>
                                    </div>

                                </div>

                            </div>

                            <div  id="MapMatrixDisturbances" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapDisturbances"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixDisturbances"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div  id="tabs-Trending">
                    <div  id="column_3" class="column resizeable">
                        <div  class="portlet" id="Portlet1Trending">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Trending Overview (Past 30 Days)</div></div>
                            <div  id="DockOverviewTrending" class="portlet-content">
                                <div  id="OverviewTrending" class="docklet">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Trending">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Trending Detail for
                                    <div style="display: inline;" id="trendingDetailHeader">Date</div>
                                    &nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportTrending" title="Export To Excel"/></div>--%>
                                </div>
                            </div>
                            <div  id="DockDetailTrending" class="portlet-content">
                                <div  id="DetailTrending" class="docklet">
                                    <div id="DetailTrendingTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="column_4" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetTrending" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderTrendingFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderTrendingDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderTrendingTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                            <div  id="MapMatrixTrending" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapTrending"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixTrending"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div  id="tabs-TrendingData">
                    <div  id="column_5" class="column resizeable">
                        <div  class="portlet" id="Portlet1TrendingData">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Trending Data Overview (Past 30 Days)</div>
                                <select class="smallbutton" style="float:right; margin-right: 18px; height: 17px; font-size: 12px"id="trendingDataSelection" onchange="showTrendingData(this)">
                                    <option value="Voltage">Voltage</option>
                                    <option value="Current">Current</option>
                                    <option value="Power">Power</option>
                                </select>
                            </div>
                            <div  id="DockOverviewTrendingData" class="portlet-content">
                                <div  id="OverviewTrendingData" class="docklet">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2TrendingData">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Trending Data Detail for
                                    <div style="display: inline;" id="trendingDataDetailHeader">Date</div>
                                    &nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportTrending" title="Export To Excel"/></div>--%>
                                </div>
                            </div>
                            <div  id="DockDetailTrendingData" class="portlet-content">
                                <div  id="DetailTrendingData" class="docklet">
                                    <div id="DetailTrendingDataTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="column_6" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetTrendingData" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="RecievedData">Recieved Data</option>
                                            <option value="NoData">No Data</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="Swells">Swells</option>
                                            <option value="Sags">Sags</option>
                                            <option value="None">None</option>
                                        </select>
                                        <select class="smallbutton" id="trendingDataTypeSelection" onchange="showType(this);">
                                            <option value="Average">Average</option>
                                            <option value="Maximum">Maximum</option>
                                            <option value="Minimum">Minimum</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderTrendingDataFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderTrendingDataDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderTrendingDataTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                    
                                    
                                </div>
                            </div>
                            <div  id="MapMatrixTrendingData" class="portlet-content portlet-header-text">
                                <div id="ContoursControlsTrending" style="background-color: '#FFD2D2D2'; display: none">
                                        <div class="row">
                                                <div class="col-md-4">
                                                    <table>
                                                        <tr>
                                                            <td style="width: 50%">
                                                                <div class="checkbox"><label><input type="checkbox" id="weatherCheckbox"/>Include Weather</label></div>
                                                            </td>
                                                            <td>
                                                                <select class="form-control" id="contourAnimationStepSelect" onchange="stepSelectionChange(this);">
                                                                    <option value="60">60 min</option>
                                                                    <option value="30">30 min</option>
                                                                    <option value="20">20 min</option>
                                                                    <option selected="selected" value="15">15 min</option>
                                                                    <option value="10">10 min</option>
                                                                    <option value="5">5 min</option>
                                                                    <option value="1">1 min</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                             <td colspan="2">
                                                                <div id="time-range">
                                                                    <div class="sliders_step1">
                                                                        &nbsp;<div id="slider-range"></div>
                                                                    </div>
                                                                    <p>Time Range: <span class="slider-time">12:00 AM</span> - <span class="slider-time2">11:59 PM</span></p>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td colspan="2">
                                                                <button class="btn btn-default form-control" onclick="loadContourAnimationData()">Load Data</button>
                                                            </td>

                                                        </tr>
                                                    </table>
                                                </div>
                                                <div class="col-md-8">
                                                    <table style="width: 100%">
                                                        <tr>
                                                            <td>&nbsp;</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="width: 100%">
                                                                <div id="contourAnimationProgressBar"><div id="contourAnimationInnerBar"><div id="progressbarLabel"></div></div></div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="width: 100%; text-align: center">
                                                                    <div class="player text-center" style="display: none" id="contourPlayerButtons">
                                                                        <button type="button" id="button_fbw" class="btn">
                                                                            <i class="fa fa-fast-backward"></i>
                                                                        </button>
    
                                                                        <button type="button" id="button_bw" class="btn">
                                                                            <i class="fa fa-backward"></i>
                                                                        </button>
    
                                                                        <button type="button" id="button_play" class="btn">
                                                                            <i class="fa fa-play"></i>
                                                                        </button>
    
                                                                        <button type="button" id="button_stop" class="btn">
                                                                            <i class="fa fa-stop"></i>
                                                                        </button>
    
                                                                        <button type="button" id="button_fw" class="btn">
                                                                            <i class="fa fa-forward"></i>
                                                                        </button>
    
                                                                        <button type="button" id="button_ffw" class="btn">
                                                                            <i class="fa fa-fast-forward"></i>
                                                                        </button>    
                                                                    </div>
                                                                </td>
                                                        </tr>
                                                    </table>
                                            </div>
                                        </div>
                                    </div>
                                <div  class="theMapStyle" id="theMapTrendingData">
                                </div>
                                <div  class="theMatrixStyle noselect" id="theMatrixTrendingData"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div  id="tabs-Faults">
                    <div  id="Div3" class="column resizeable">
                        <div  class="portlet" id="Portlet1Faults">
                            <div  class="portlet-header portlet-header-text">Faults Overview</div>
                            <div  id="DockOverviewFaults" class="portlet-content">
                                <div  id="OverviewFaults" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Faults">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Faults Summary for&nbsp;<div style="display: inline;" id="faultsDetailHeader">Date</div>&nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportFaults" title="Export To Excel"/></div>--%>
                                </div>
                            </div>                            
                            <div  id="DockDetailFaults" class="portlet-content noselect">
                                <div  id="DetailFaults" class="docklet">
                                    <div id="DetailFaultsTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="Div4" class="column">
                        <div  class="portlet" id="Portlet3Faults">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetFaults" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderFaultsFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderFaultsDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderFaultsTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                            <div  id="MapMatrixFaults" class="portlet-content">
                                <div  class="theMapStyle" id="theMapFaults"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixFaults"></div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <div  id="tabs-Breakers">
                    <div  id="Div1" class="column resizeable">
                        <div  class="portlet" id="Portlet1Breakers">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Breaker Overview (For Date Range)</div></div>
                            <div  id="DockOverviewBreakers" class="portlet-content">
                                <div  id="OverviewBreakers" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Breakers">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Breaker Detail for&nbsp;<div style="display: inline;" id="breakersDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div  id="DockDetailBreakers" class="portlet-content noselect">
                                <div id="DetailBreakers" class="docklet">
                                    <div id="DetailBreakersTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="Div2" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetBreakers" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderBreakersFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderBreakersDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderBreakersTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                            <div  id="MapMatrixBreakers" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapBreakers"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixBreakers"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div  id="tabs-Completeness">
                    <div  id="Div5" class="column resizeable">
                        <div  class="portlet" id="Portlet1Completeness">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Completeness Overview (For Date Range)</div></div>
                            <div  id="DockOverviewCompleteness" class="portlet-content">
                                <div  id="OverviewCompleteness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Completeness">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Completeness Detail for&nbsp;<div style="display: inline;" id="CompletenessDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div  id="DockDetailCompleteness" class="portlet-content noselect">
                                <div id="DetailCompleteness" class="docklet chart-container">
                                    <div id="DetailCompletenessTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="Div6" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetCompleteness" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderCompletenessFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderCompletenessDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderCompletenessTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                            <div  id="MapMatrixCompleteness" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapCompleteness"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixCompleteness"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div  id="tabs-Correctness">
                    <div  id="Div7" class="column resizeable">
                        <div  class="portlet" id="Portlet1Correctness">
                            <div  class="portlet-header"><div class="portlet-header-text" style="display: inline">Correctness Overview (For Date Range)</div></div>
                            <div  id="DockOverviewCorrectness" class="portlet-content">
                                <div  id="OverviewCorrectness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div  class="portlet" id="Portlet2Correctness">
                            <div  class="portlet-header">
                                <div  class="portlet-header-text" style="display: inline">
                                    Correctness Detail for&nbsp;<div style="display: inline;" id="CorrectnessDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div  id="DockDetailCorrectness" class="portlet-content noselect">
                                <div id="DetailCorrectness" class="docklet">
                                    <div id="DetailCorrectnessTable"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="Div8" class="column">
                        <div  class="portlet">
                            <div  class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetCorrectness" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div class="overlaydate">
                                        <center>
                                            <div id="mapHeaderCorrectnessFrom" class="mapheader noselect" ></div>
                                            <div id="mapHeaderCorrectnessDivider" class="mapheader noselect">&nbsp;-&nbsp;</div>
                                            <div id="mapHeaderCorrectnessTo" class="mapheader noselect"></div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                            <div  id="MapMatrixCorrectness" class="portlet-content portlet-header-text">
                                <div  class="theMapStyle" id="theMapCorrectness"></div>
                                <div  class="theMatrixStyle noselect" id="theMatrixCorrectness"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div  id="modal-dialog" class="configNameModal" title="New Configuration">
                <center>
                    <table><tr><td><label for="newconfigname">Name:</label></td><td><input type="text" id="newconfigname" value="" maxLength="25"></td></tr></table>
                </center>
            </div>
                  
            <div  id="delete-dialog" class="configNameModal" title="Delete Confirmation">
                <center>
                    <table>
                        <tr>
                            <td align ="right" nowrap>
                                 Delete:
                            </td>
                            <td align="left" nowrap>
                                <div id="deleteconfigname"></div>
                            </td>
                            <td align="left" nowrap>
                                ?
                            </td>
                        </tr>
                    </table>
                </center>
            </div>
        </div>
        
        <div  id="legend" style="cursor: not-allowed;"></div>


        <div id="heatmapEvents" style="visibility: hidden;">Heatmap:
            <select class="smallbutton" id="selectHeatmapEvents" onchange="showHeatmap(this);">
                <option value="EventCounts">Event Counts</option>
                <option value="MinimumSags">Sag Minimum</option>
                <option value="MaximumSwells">Swell Maximum</option>
            </select>
        </div>
        
        <div id="heatmapDisturbances" style="visibility: hidden;">Heatmap:
            <select class="smallbutton" id="selectHeatmapDisturbances" onchange="showHeatmap(this);">
                <option value="DisturbanceCounts">Disturbance Counts</option>
<%--                <option value="AnimateDisturbanceCounts">Animate Disturbance Counts</option>--%>
            </select>
        </div>
        
        <div id="heatmapTrending" style="visibility: hidden;">Heatmap:
            <select class="smallbutton" id="selectHeatmapTrending" onchange="showHeatmap(this);">
                <option value="TrendingCounts">Event Counts</option>
                <option value="THD">Animate THD</option>
            </select>
        </div>

        <div id="eventslegend" class="eventslegend">
            <div id="interruptionlegend" class="interruptionlegend">Interruption</div>
            <div id="faultslegend" class="faultslegend">Fault</div>
            <div id="saglegend" class="saglegend">Sag</div>
            <div id="transientlegend" class="transientlegend">Transient</div>
            <div id="swelllegend" class="swelllegend">Swell</div>
            <div id="otherlegend" class="otherlegend">Other</div>
            <div id="nonelegend" class="nonelegend">None</div>
            <div id="ooslegend" class="ooslegend">Out of Service</div>
        </div>
        
        <div id="disturbanceslegend" class="eventslegend" >
            <div id="5legend" class="interruptionlegend">5</div>
            <div id="4legend" class="faultslegend">4</div>
            <div id="3legend" class="saglegend">3</div>
            <div id="2legend" class="transientlegend">2</div>
            <div id="1legend" class="swelllegend">1</div>
            <div id="0legend" class="otherlegend">0</div>
            <div id="nonelegend" class="nonelegend">None</div>
            <div id="ooslegend" class="ooslegend">Out of Service</div>
        </div>

        <div id="HeatmapControlsTrending">
            <table cellspacing="0" cellpadding="0" width="300px">
                <tr>
                    <td colspan="2" align="center">
                        Total Harmonic Distortion
                    </td>
                </tr>
                <tr>
                    <td width="40px" height="100%" valign="middle">
                        <div id="actionButton" class="button_play" title="Press To Load, Play, or Stop."></div>
                    </td>
                    <td width="90%" height="100%">
                        <table cellspacing="0" cellpadding="0" width="100%">
                            <tr>
                                <td nowrap height="50%" width="100%" align="center">
                                    <div id="position">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td nowrap height="50%" width="100%" align="center">
                                    <div id="slider" class="slider"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
        

    </body>
</html>
