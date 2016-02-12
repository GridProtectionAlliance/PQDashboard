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

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <meta charset="utf-8">
    
    <meta http-equiv="cache-control" content="max-age=0" />

    <meta http-equiv="cache-control" content="no-cache" />

    <meta http-equiv="expires" content="0" />

    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />

    <meta http-equiv="pragma" content="no-cache" />

    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css">  

    <link rel="stylesheet" href="./css/jquery.multiselect.css">

    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css"> 
    
    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.base.css" type="text/css" />
    
    <link rel="stylesheet" href="./js/jqwidgets/styles/jqx.ui-redmond.css" type="text/css" />
    
    <link rel="stylesheet" href="./css/Default_Google.css" type="text/css" />

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>

    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>

    <script type="text/javascript" src="./js/jquery.sparkline.js"></script>

    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/adapters/prototype-adapter.js"></script>

    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=visualization&amp;v=3.3"></script>
    
    <script type="text/javascript" src="./js/arcgislink.js"></script>

    <script type="text/javascript" src="./js/CustomGoogleMapMarker.js"></script>

    <script type="text/javascript" src="./js/keydragzoom.js"></script>

    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>
    
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
    
    <script type="text/javascript" src="./js/DefaultGoogle.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>

    <script type="text/javascript" src="./js/jstorage.js"></script> 
    
    <script type="text/javascript" src="./js/moment.js"></script> 

</head>
    <body onunload="createupdateconfig(null);" unselectable="on">
    
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedUserName"><%=username %></div>

        <div id="draggable" class="ui-widget-content" unselectable="on"></div>
        <div style="width: 100%; height: 36px;" unselectable="on">
            <table width="100%" unselectable="on">
                <tr>
                    <td width="33%" unselectable="on" align="left"><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td width="33%" unselectable="on" align="center"><img src="images/PQ-Dashboard.png" /></td>
                    <td width="34%" unselectable="on" align="right" valign="top" nowrap><img src="images/EPRI(c).jpg" /></td>
                    <%--<td><%=username %></td>--%>
                    <%--<td><div style="height: 32px; vertical-align: middle; display: inline-block;"><button id="logout_button" style="visibility: hidden; vertical-align: middle;" onclick="javascript:history.go(0);">Logout</button></div></td>--%>
                </tr>
            </table>
        </div>

<%--        <form method="POST" autocomplete="on">
            <div id="loginContent">
                <table width="100%" height="100%">
                    <tr>
                        <td width="30%" align="right">User Name :</td>
                        <td width="70%" align="left"><input autocomplete="on" style="width: 80%" id="userid" type="text" name="username" value=""/></td>
                    </tr>
                    <tr>
                        <td width="30%" align="right">Password  :</td>
                        <td width="70%" align="left"><input autocomplete="on" style="width: 80%" id="password" type="password" name="password" value=""/></td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <center><button id="loginbutton" onclick="showcontent();return(false);" >Login</button></center>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            &nbsp;
                            <center><div id="incorrect" style="visibility:hidden;">Incorrect Login</div></center>
                        </td>
                    </tr>
                </table>
            </div>
        </form>--%>

        <div id="ApplicationContent" unselectable="on" class="noselect" >
            <div id="headerStrip" unselectable="on" class="headerStrip ui-state-default noselect">
                <table style="width: 100%;">
                    <tr>
                        <td width="25%" align="center" style="z-index: 999;" nowrap>
                            <select class="smallbutton" id="Configurations" onchange="configurationapply(this);"></select>
                            <button class="smallbutton" id="ConfigurationsCopy" onclick="configurationscopy(this);">New</button>
                            <button class="smallbutton" id="ConfigurationsUpdate" onclick="configurationsupdate(this);">Save</button>
                            <button class="smallbutton" id="ConfigurationsDelete" onclick="configurationsdelete(this);">Delete</button>
                        </td>
                        <td width="25%" align="center" nowrap>
                            Site:
                            <select id="siteList" multiple="multiple">

                            </select>
                        </td>
                        <td width="25%" align="center" nowrap>
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
                        <td width="25%" align="center" style="z-index: 999;" nowrap>Mode:
                            <select class="smallbutton" id="mapGrid" onchange="selectmapgrid(this);">
                                <option value="Map">Map</option>
                                <option value="Grid">Grid</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>

            <div id="application-tabs" class="noselect" unselectable="on">
                <ul>
                    <li id="tabsEvents"><a href="#tabs-Events">Events</a></li>
                    <li id="tabsTrending"><a href="#tabs-Trending">Trending</a></li>
                    <li id="tabsFaults"><a href="#tabs-Faults">Faults</a></li>
                    <li id="tabsBreakers"><a href="#tabs-Breakers">Breakers</a></li>
                    <li id="tabsCompleteness"><a href="#tabs-Completeness">Completeness</a></li>
                    <li id="tabsCorrectness"><a href="#tabs-Correctness">Correctness</a></li>
                </ul>
                <div unselectable="on" id="tabs-Events">
                    <div unselectable="on" id="column_1" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Events">
                            <div unselectable="on" class="portlet-header"><div class="portlet-header-text" style="display: inline">Events Overview (For Date Range)</div></div>
                            <div unselectable="on" id="DockOverviewEvents" class="portlet-content">
                                <div unselectable="on" id="OverviewEvents" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Events">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Events Detail for&nbsp;<div style="display: inline;" id="eventsDetailHeader">Date</div>&nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportEvents" title="Export To Excel"/></div>--%>
                                </div>
                            </div>
                            <div unselectable="on" id="DockDetailEvents" class="portlet-content noselect">
                                <div id="DetailEvents" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="column_2" class="column">
                        <div unselectable="on" class="portlet">

                            <div unselectable="on" class="portlet-header portlet-header-text">

                                <div class="header-container">

                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetEvents" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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

                            <div unselectable="on" id="MapMatrixEvents" class="portlet-content portlet-header-text">
                                <div unselectable="on" class="theMapStyle" id="theMapEvents"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixEvents"></div>
                            </div>
                        </div>
                    </div>
                </div>


                <div unselectable="on" id="tabs-Trending">
                    <div unselectable="on" id="column_3" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Trending">
                            <div unselectable="on" class="portlet-header"><div class="portlet-header-text" style="display: inline">Trending Overview (Past 30 Days)</div></div>
                            <div unselectable="on" id="DockOverviewTrending" class="portlet-content">
                                <div unselectable="on" id="OverviewTrending" class="docklet">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Trending">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Trending Detail for
                                    <div style="display: inline;" id="trendingDetailHeader">Date</div>
                                    &nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportTrending" title="Export To Excel"/></div>--%>
                                </div>
                            </div>
                            <div unselectable="on" id="DockDetailTrending" class="portlet-content">
                                <div unselectable="on" id="DetailTrending" class="docklet">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="column_4" class="column">
                        <div unselectable="on" class="portlet">
                            <div unselectable="on" class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetTrending" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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
                            <div unselectable="on" id="MapMatrixTrending" class="portlet-content portlet-header-text">
                                <div unselectable="on" class="theMapStyle" id="theMapTrending"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixTrending"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div unselectable="on" id="tabs-Faults">
                    <div unselectable="on" id="Div3" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Faults">
                            <div unselectable="on" class="portlet-header portlet-header-text">Faults Overview</div>
                            <div unselectable="on" id="DockOverviewFaults" class="portlet-content">
                                <div unselectable="on" id="OverviewFaults" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Faults">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Faults Summary for&nbsp;<div style="display: inline;" id="faultsDetailHeader">Date</div>&nbsp;(24 Hours)
                                    <%--<div style="height: 18px; display: block; float: right; margin-right: 30px; margin-top: 5px;"><input type="image" src="./images/fileexport.png" id="excelExportFaults" title="Export To Excel"/></div>--%>
                                </div>
                            </div>                            
                            <div unselectable="on" id="DockDetailFaults" class="portlet-content noselect">
                                <div unselectable="on" id="DetailFaults" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="Div4" class="column">
                        <div unselectable="on" class="portlet" id="Portlet3Faults">
                            <div unselectable="on" class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetFaults" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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
                            <div unselectable="on" id="MapMatrixFaults" class="portlet-content">
                                <div unselectable="on" class="theMapStyle" id="theMapFaults"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixFaults"></div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <div unselectable="on" id="tabs-Breakers">
                    <div unselectable="on" id="Div1" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Breakers">
                            <div unselectable="on" class="portlet-header"><div class="portlet-header-text" style="display: inline">Breaker Overview (For Date Range)</div></div>
                            <div unselectable="on" id="DockOverviewBreakers" class="portlet-content">
                                <div unselectable="on" id="OverviewBreakers" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Breakers">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Breaker Detail for&nbsp;<div style="display: inline;" id="breakersDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div unselectable="on" id="DockDetailBreakers" class="portlet-content noselect">
                                <div id="DetailBreakers" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="Div2" class="column">
                        <div unselectable="on" class="portlet">
                            <div unselectable="on" class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetBreakers" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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
                            <div unselectable="on" id="MapMatrixBreakers" class="portlet-content portlet-header-text">
                                <div unselectable="on" class="theMapStyle" id="theMapBreakers"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixBreakers"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div unselectable="on" id="tabs-Completeness">
                    <div unselectable="on" id="Div5" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Completeness">
                            <div unselectable="on" class="portlet-header"><div class="portlet-header-text" style="display: inline">Completeness Overview (For Date Range)</div></div>
                            <div unselectable="on" id="DockOverviewCompleteness" class="portlet-content">
                                <div unselectable="on" id="OverviewCompleteness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Completeness">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Completeness Detail for&nbsp;<div style="display: inline;" id="CompletenessDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div unselectable="on" id="DockDetailCompleteness" class="portlet-content noselect">
                                <div id="DetailCompleteness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="Div6" class="column">
                        <div unselectable="on" class="portlet">
                            <div unselectable="on" class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetCompleteness" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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
                            <div unselectable="on" id="MapMatrixCompleteness" class="portlet-content portlet-header-text">
                                <div unselectable="on" class="theMapStyle" id="theMapCompleteness"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixCompleteness"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div unselectable="on" id="tabs-Correctness">
                    <div unselectable="on" id="Div7" class="column resizeable">
                        <div unselectable="on" class="portlet" id="Portlet1Correctness">
                            <div unselectable="on" class="portlet-header"><div class="portlet-header-text" style="display: inline">Correctness Overview (For Date Range)</div></div>
                            <div unselectable="on" id="DockOverviewCorrectness" class="portlet-content">
                                <div unselectable="on" id="OverviewCorrectness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                        <div unselectable="on" class="portlet" id="Portlet2Correctness">
                            <div unselectable="on" class="portlet-header">
                                <div unselectable="on" class="portlet-header-text" style="display: inline">
                                    Correctness Detail for&nbsp;<div style="display: inline;" id="CorrectnessDetailHeader">Date</div>&nbsp;(24 Hours)
                                </div>
                            </div>
                            <div unselectable="on" id="DockDetailCorrectness" class="portlet-content noselect">
                                <div id="DetailCorrectness" class="docklet chart-container">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div unselectable="on" id="Div8" class="column">
                        <div unselectable="on" class="portlet">
                            <div unselectable="on" class="portlet-header portlet-header-text">
                                <div class="header-container">
                                    <div class="siteselectdropdown" style="position: absolute;">
                                        <select class="smallbutton" id="selectSiteSetCorrectness" onchange="showSiteSet(this);">
                                            <option value="All">All Sites</option>
                                            <option value="Events">Events</option>
                                            <option value="NoEvents">No Events</option>
                                            <option value="SelectedSites">Selected Sites</option>
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
                            <div unselectable="on" id="MapMatrixCorrectness" class="portlet-content portlet-header-text">
                                <div unselectable="on" class="theMapStyle" id="theMapCorrectness"></div>
                                <div unselectable="on" class="theMatrixStyle noselect" id="theMatrixCorrectness"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div unselectable="on" id="modal-dialog" class="configNameModal" title="New Configuration">
                <center>
                    <table><tr><td><label for="newconfigname">Name:</label></td><td><input type="text" id="newconfigname" value="" maxLength="25"></td></tr></table>
                </center>
            </div>
                  
            <div unselectable="on" id="delete-dialog" class="configNameModal" title="Delete Confirmation">
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
        
        <div unselectable="on" id="legend" style="cursor: not-allowed;"></div>


        <div id="heatmapEvents" style="visibility: hidden;">Heatmap:
            <select class="smallbutton" id="selectHeatmapEvents" onchange="showHeatmap(this);">
                <option value="EventCounts">Event Counts</option>
                <option value="MinimumSags">Sag Minimum</option>
                <option value="MaximumSwells">Swell Maximum</option>
            </select>
        </div>
        
        <div id="heatmapTrending" style="visibility: hidden;">Heatmap:
            <select class="smallbutton" id="selectHeatmapTrending" onchange="showHeatmap(this);">
                <option value="TrendingCounts">Event Counts</option>
                <option value="THD">Animate THD</option>
            </select>
        </div>
		
<%--    <div id="heatmapFaults" style="visibility: hidden;">
            <select class="smallbutton" id="selectHeatmapFaults" onchange="showHeatmap(this);">
                <option value="EventCounts">Counts</option>
            </select>
        </div>
		
		 <div id="heatmapBreakers" style="visibility: hidden;">
            <select class="smallbutton" id="selectHeatmapBreakers" onchange="showHeatmap(this);">
                <option value="EventCounts">Counts</option>
            </select>
        </div>	
				
		 <div id="heatmapCompleteness" style="visibility: hidden;">
            <select class="smallbutton" id="selectHeatmapCompleteness" onchange="showHeatmap(this);">
                <option value="EventCounts">Counts</option>
            </select>
        </div>	

		 <div id="heatmapCorrectness" style="visibility: hidden;">
            <select class="smallbutton" id="selectHeatmapCorrectness" onchange="showHeatmap(this);">
                <option value="EventCounts">Counts</option>
            </select>
        </div>	--%>	
        

<%--         <div id="siteSetEvents" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetEvents" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Events</option>
                <option value="NoEvents">No Events</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div> --%>      

<%--        <div id="siteSetFaults" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetFaults" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Faults</option>
                <option value="NoEvents">No Faults</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div>
        
        <div id="siteSetTrending" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetTrending" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Events</option>
                <option value="NoEvents">No Events</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div>
        
        <div id="siteSetBreakers" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetBreakers" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Events</option>
                <option value="NoEvents">No Events</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div>
        
        <div id="siteSetCompleteness" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetCompleteness" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Events</option>
                <option value="NoEvents">No Events</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div>
        
        <div id="siteSetCorrectness" style="visibility: hidden;">
            <select class="smallbutton" id="selectSiteSetCorrectness" onchange="showSiteSet(this);">
                <option value="All">All Sites</option>
                <option value="Events">Events</option>
                <option value="NoEvents">No Events</option>
                <option value="SelectedSites">Selected Sites</option>
            </select>
        </div>--%>

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
