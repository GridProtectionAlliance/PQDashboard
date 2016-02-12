<!--
//******************************************************************************************************
//  OpenNav.html
//==================================================================
//
//  Code Modification History:
//==================================================================
//  01/06/2016 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************
-->

<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OpenNav.aspx.cs" Inherits="_OpenNav" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>OpenSeeNav v.1</title>
    
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
    
    <link rel="stylesheet" href="./css/OpenNav.css" type="text/css" />

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>

    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>

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
    
    <script type="text/javascript" src="./js/OpenNav.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>

    <script type="text/javascript" src="./js/jstorage.js"></script> 
    
    <script type="text/javascript" src="./js/moment.js"></script> 

</head>
    <body onunload="createupdateconfig(null);" unselectable="on">
    
        <div style="visibility:hidden; width: 0px; height: 0px;" id="postedUserName"><%=username %></div>

        <div style="width: 100%; height: 36px;" unselectable="on">
            <table width="100%" unselectable="on">
                <tr>
                    <td width="33%" unselectable="on" align="left"><img src="images/openSEELogo.png" /></td>
                    <td width="33%" unselectable="on" align="center"><img src="" /></td>
                    <td width="34%" unselectable="on" align="right" valign="top" nowrap><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                </tr>
            </table>
        </div>

        <div id="ApplicationContent" unselectable="on" class="noselect" >
            <div id="headerStrip" unselectable="on" class="headerStrip ui-state-default noselect">
                <table style="width: 100%;">
                    <tr>
                        <td width="25%" align="center" nowrap>
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
                            <button class="smallbutton" id="load_for_date_range" style="vertical-align: middle;" onclick="loadDataForDateClick();">Load</button>
                            
                            <select class="smallbutton" id="staticPeriod" onchange="selectStaticPeriod(this);">
                                <option value="Custom"></option>
                                <option value="Today">Today</option>
                                <option value="PastWeek">Today - 7</option>
                                <option value="PastMonth">Today - 30</option>
                                <option value="PastYear">Today - 365</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>

            <div unselectable="on" id="DockDetailContainer" class="dockletcontainer noselect" style="z-index: 999;">
                <div id="DetailEvents" class="docklet" style="z-index: 999;">
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
    </body>
</html>
