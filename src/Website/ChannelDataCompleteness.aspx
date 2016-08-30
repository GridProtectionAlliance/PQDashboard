<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ChannelDataCompleteness.aspx.cs" Inherits="ChannelDataCompleteness" %>
<%@ Import Namespace="FaultData.DataAnalysis" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
<head id="Head1" runat="server">
    <title>ChannelDataCompleteness</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">    
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
    <link rel="stylesheet" href="./css/MeterEventsByLine.css" type="text/css" />

    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>
    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>
    <script type="text/javascript" src="js/bootstrap-3.3.2.min.js"></script>
    <script type="text/javascript" src="js/PrimeUI/primeui.js"></script>
    <script type="text/javascript" src="./js/ChannelDataCompleteness.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>

	</head>
	
	<body style="height: 100%; width: 100%">
	
    <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterId"><%=postedMeterId %></div>
    <div style="visibility:hidden; width: 0px; height: 0px;" id="postedDate"><%=postedDate %></div>
    <div style="visibility:hidden; width: 0px; height: 0px;" id="postedMeterName"><%=postedMeterName %></div>
    <div class="gridheader"><center>Data Completeness Detail for <%=postedMeterName%> for <%=postedDate%></center></div>

	<div style="height: 100%;" id="MeterDetailsByDate"></div>


	</body>
</html>