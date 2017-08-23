<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ICFService.aspx.cs" Inherits="ICFDetails" %>
<%@ Import Namespace="System.Activities.Statements" %>
<%@ Import Namespace="FaultData.DataAnalysis" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
<head id="Head1" runat="server">
    <title>ICF Details</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" type="image/ico" href="~/favicon.ico" />
	<link rel="stylesheet" href="./css/FaultSpecifics.css" type="text/css" />
	
	</head>
	
	<body style="height: 100%;">
	<table border="1px" width="100%" height="100%" cellpadding="0" cellspacing="0">
        <tr><td nowrap colspan="2" align="center">ICF Result</td></tr>
        
        
        <% foreach (KeyValuePair<string, string> entry in thedata) { %>
       
	    <tr><td nowrap align="right"><%= entry.Key %>:</td><td nowrap><%= entry.Value %></td></tr>
        
        <% } %>
    </table>
	</body>
</html>