<%@ Page Language="C#" AutoEventWireup="true" CodeFile="FaultLocation.aspx.cs" Inherits="FaultLocation" %>
<%@ Import Namespace="FaultData.DataAnalysis" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
<head id="Head1" runat="server">
    <title>Fault Location Report</title>
    
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	<link rel="stylesheet" href="./css/FaultLocation.css" type="text/css" />
	
	</head>
    
    <script type="text/javascript">
        function loadSpan()
        {
            try {

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", "<%=baseFFURL%>", false);
                xmlhttp.send();
                xmlDoc = xmlhttp.responseText;
                xmltxt = new ActiveXObject("Microsoft.XMLDOM");
                xmltxt.async = false;
                xmltxt.loadXML(xmlDoc);

                var txtLines = xmlDoc.split("<br>");
                var strNo = "";
                var strQry = "";
                var latitude = "";
                var longitude = "";
                var dwgUrl = "";
                var picUrl = "";


                if (txtLines.length > 1) {
                    for (i = 2; i < txtLines.length; i++) {
                        //handle case where multiple items are returned.
                        var structDetails = txtLines[i].split(",");
                        strNo += structDetails[1];
                        strQry += structDetails[2];
                        latitude = structDetails[4];
                        longitude = structDetails[5];
                        dwgUrl = structDetails[6];
                        picUrl = structDetails[7].substr(0, structDetails[7].indexOf(".")) + ".jpg";
                    }

                    var spn = document.getElementById('strno');
                    spn.innerHTML = strNo + " @ (" + latitude + ", " + longitude + ")";

                    spn = document.getElementById('links');
                    spn.innerHTML = "<a href='" + dwgUrl + "' target='_blank'>View P&P</a>";

                    spn = document.getElementById('picture');

                    var img = document.createElement('img');
                    img.src = picUrl;
                    img.width = 800;
                    img.height = 600;
                    spn.appendChild(img);

                } else {
                    spn = document.getElementById('picture');
                    spn.innerHTML = "No Picture Found";

                    var spn = document.getElementById('strno');
                    spn.innerHTML = "Could Not Determine";
                }
            } catch (err) {
                
            }
            return;
    }
</script>

	<body style="height: 100%;" onLoad="loadSpan()">
	    <%--<img src="images/TVAcompanylogo.jpg" />--%>
	    <h1><a href="./">Fault Location Reports</a></h1>
        <hr />
        <B>Fault Inception Time:</B> <%= FaultInceptionTime %><br />
        <B>Fault Duration: </B> <%= FaultDuration %><br />
        <B>Fault Type: </B> <%= FaultType %> <br />
        <B>Fault Current: </B> <%= FaultCurrent %> <br />
        <B>Location: </B><%= Location %><br />
        <B>Double Ended Fault Distance: </B><%= postedDoubleEndedDistance %><br />
        <B>Double Ended Fault Confidence: </B><%= postedDoubleEndedConfidence %><br />
        <B>Nearest Structure:</B><span id="strno"></span><br />
        <B>View: </B> <span id="links"></span><br />

        <hr/>
        
        <table width="100%">
            <tr>
                <td><iframe src="<%=milesurl%>" width="800" height="600"></iframe></td>
                <td><span id="picture"></span></td>
            </tr>
        </table>
        
       <table width="100%" cellspacing="0" cellpadding="0" style="text-align:center">
	        <tr>
		        <td style="border-bottom: 1px #000000 solid;border-right: 1px #000000 solid"><B>Line Parameters:</B></td>
		        <td colspan=4 style="border-top: 2px #000000 solid;border: 1px #000000 solid; text-align:center"><B>Pos-Seq Imp (LLL,LLLG,LL,LLG)</B></td>
		        <td colspan=4 style="border: 1px #000000 solid; text-align:center"><B>Zero-Seq Imp</B></td>
		        <td colspan=4 style="border: 1px #000000 solid; text-align:center"><B>Loop Imp (LG)</B></td>
	        </tr>



	        <tr>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Length (Mi)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Z1 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Ang (Deg)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>R1 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>X1 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Z0 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Ang (Deg)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>R0 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>X0 (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>ZS (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Ang (Deg)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>RS (Ohm)</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><B>XS (Ohm)</B></td>
	        </tr>
           
            <% if (row1.Count > 0)
              { %>

	        <tr>

		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[0] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[1] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[2] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[3] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[4] %></td>

		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[5] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[6] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[7] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[8] %></td>

		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[9] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[10] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[11] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row1[12] %></td>
	        </tr>
	        <tr>
		        <td style="border: 1px #000000 solid; text-align:center"><B>Per Mile</B></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[0] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center">-</td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[1] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[2] %></td>

		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[3] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center">-</td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[4] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[5] %></td>

		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[6] %> </td>
		        <td style="border: 1px #000000 solid; text-align:center">-</td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[7] %></td>
		        <td style="border: 1px #000000 solid; text-align:center"><%= row2[8] %></td>
	        </tr>
        <% } %>

       </table>


        <table width="100%">
            <tr>
                <td valign="top"><B>Fault Details:</B></td>
                <td>
                    <table width="100%">
	                    <tr>
		                    <td><B>Algorithm</B></td>
		                    <td><B>Distance</B></td>
		                    <td><B>Valid</B></td>
		                    <td><B>Selected</B></td>
	                    </tr>

	                    <% for (int i = 0; i < 5; i++)
	                       { %>

	                        <tr>
		                        <td><%= Algorithms[0, i] %></td>
		                        <td><%= Algorithms[1, i] %></td>
		                        <td><%= Algorithms[2, i] %></td>
		                        <td><%= Algorithms[3, i] %></td>
	                        </tr>

	                    <% } %>
                    </table>
                </td>
            </tr>
        </table>
   <hr/>
        <table width="100%">
            <tr>
                <td width="50%">
                    <table width="100%">
                        <tr>
                            <td colspan="3" align="center">
                                <b>History</b>
                            </td>
                        </tr>
	                    <tr>
		                    <td align="center"><B>Time</B></td>
		                    <td align="center"><B>Type</B></td>
		                    <td align="center"><B>Distance (min/max)</B></td>
	                    </tr>

	                    <%
	                        for (int i = 0 ; i <  history.Count; i++)
	                        {
	                            List<string> therow = history[i];
	                    %>

		                <tr>
			                <td>
			                    <a href='FaultLocation.aspx?eventid=<%= therow[4] %>'><%= therow[0] %></a>
			                </td>
			                <td align="center">
			                    <%=therow[1] %>
			                </td>
			                <td align="center">
			                    <%= therow[3] %> - <%= therow[2] %>
			                </td>
		                </tr>

	                    <% } %>
	                </table>
                </td>
                <td>
                    <table>
                        <tr>
                            <td align="center">
                            <b>Analysis</b>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                A fault has occurred on this line of type <%=FaultType%>:  <%=FaultCount%> times or <%=FaultCountTotalPercentage.ToString("F2") %> % of the time.<BR />
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <iframe src="<%= openSeeURL %>" width="1024" height="768"/>
                </td>
            </tr>
        </table>
	</body>
</html>

