<%@ page language="C#" autoeventwireup="true" inherits="ModbusData, App_Web_lsnpvlg0" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link rel="stylesheet" href="./css/ModbusData.css"/>

    <script src="./js/flot/jquery.flot.js"></script>
    <script src="./js/flot/jquery.flot.crosshair.js"></script>
    <script src="./js/flot/jquery.flot.navigate.js"></script>
    <script src="./js/flot/jquery.flot.resize.js"></script>
    <script src="./js/flot/jquery.flot.selection.js"></script>
    <script src="./js/flot/jquery.flot.time.js"></script>
    <script src="./js/flot/jquery.flot.axislabels.js"></script>
    
    <script src="js/ModbusData.js"></script>
    <title></title>
</head>

<body>
    <form id="form1" runat="server">
    <div>
<div class="container-fluid">
    <div class="row row-offcanvas row-offcanvas-left">

        <div class="col-md-3 sidebar-offcanvas toggled" style="overflow-y: auto" id="sidebar" role="navigation">
            <div class="panel-group">
                <div class="panel panel-default">
                    <div class="panel-heading" style="padding: 5px">
                        <h4 class="panel-title">
                            <a data-toggle="collapse" href="#collapse1">Settings</a>
                        </h4>
                    </div>
                    <div id="collapse1" class="panel-collapse collapse" style="margin: 5px">
                        <label for="filterstring">Selected Measurements:</label>
                        <textarea id="filterstring" class="form-control" readonly></textarea>
                        <label for="datapoints">Number of Data Points to Plot:</label>
                        <input type="number" id="datapoints" class="form-control"/>
                        <label for="refreshinterval">Data Refresh Interval(ms):</label>
                        <input type="number" id="refreshinterval" class="form-control"/>
                        <label for="statrefreshinterval">Stat Refresh Interval(ms):</label>
                        <input type="number" id="statrefreshinterval" class="form-control"/>
                        <hr class="half-break" />
                        <button type="button" class="btn btn-primary btn-xs" onclick="updateSettings()">Update Settings</button>
                    </div>
                </div>
            </div>

            <div class="panel-group">
                <div class="panel panel-default">
                    <div class="panel-heading" style="padding: 5px">
                        <h4 class="panel-title">
                            <a data-toggle="collapse" href="#collapse2">Legend</a>
                        </h4>
                    </div>
                    <div id="collapse2" class="panel-collapse collapse" style="margin: 5px">
                        <div id="legend" style="overflow-y: scroll"></div>
                    </div>
                </div>
            </div>
            <div id="devicelist" class="panel-group">
                <div id="devicelistinner" class="panel panel-default">
                    
                </div>
            </div>

        </div><!--/span-->
        <div class="col-md-9 content">
            <div class="pull-left">
                <button type="button" class="btn btn-primary btn-xs" data-toggle="offcanvas" id="toggleCanvasButton" title="Toggle Menu"><span class="glyphicon glyphicon-expand" id="toggleCanvasIcon"></span></button>
                <button type="button" class="btn btn-primary btn-xs" onclick="resetFilter()">Clear Signals</button>
            </div>
            <br/>
            <br/>
            <div class="text-center" id="graphwrapper">
                <div id="placeholder" style="width: 100%;"></div>
            </div>
            <div id="modals">

            </div>

        </div><!--/span-->

    </div><!--/row-->

    </div><!-- /.container -->
    </div>
    </form>
</body>
</html>
