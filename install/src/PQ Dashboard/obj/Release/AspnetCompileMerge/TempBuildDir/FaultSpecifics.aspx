<%@ page language="C#" autoeventwireup="true" inherits="FaultSpecifics, App_Web_sbyqy3xm" %>
<%@ Import Namespace="FaultData.DataAnalysis" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
<head id="Head1" runat="server">
    <title>Fault Specifics</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" type="image/ico" href="~/favicon.ico" />
	<link rel="stylesheet" href="./css/FaultSpecifics.css" type="text/css" />
	
	</head>
	
	<body style="height: 100%;">
	<table border="1px" width="100%" height="100%" cellpadding="0" cellspacing="0">
        <tr><td nowrap colspan="2" align="center"><%=postedMeterName %></td></tr>
	    <tr><td nowrap align="right">Fault Type:</td><td nowrap><%=postedFaultType %></td></tr>
        <tr><td nowrap align="right">Start Time:</td><td nowrap><%=postedStartTime %></td></tr>
	    <tr><td nowrap align="right">Inception Time:</td><td nowrap><%=postedInceptionTime %></td></tr>
	    <tr><td nowrap align="right">Delta Time:</td><td nowrap><%=postedDeltaTime %></td></tr>
	    <tr><td nowrap align="right">Fault Duration:</td><td nowrap><%=postedDurationPeriod %></td></tr>
	    <tr><td nowrap align="right">Fault Current:</td><td nowrap><%=postedFaultCurrent %></td></tr>
	    <tr><td nowrap align="right">Distance Method:</td><td nowrap><%=postedDistanceMethod %></td></tr>
	    <tr><td nowrap align="right">Single-ended Distance:</td><td nowrap><%=postedSingleEndedDistance %></td></tr>
	    <tr><td nowrap align="right">Double-ended Distance:</td><td nowrap><%=postedDoubleEndedDistance %></td></tr>
        <tr><td nowrap align="right">Double-ended Angle:</td><td nowrap><%=postedDoubleEndedConfidence %></td></tr>
	    <tr><td nowrap align="right">OpenXDA EventID:</td><td nowrap><%=postedEventId %></td></tr>
    </table>
	</body>
</html>