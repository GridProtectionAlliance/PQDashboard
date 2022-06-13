using System;
using GSF.Data;
using GSF.Data.Model;
using openXDA.Model;

public partial class ChannelDataCompleteness : System.Web.UI.Page
{
    public string postedDate = "";
    public string postedMeterId = "";
    public string postedMeterName = "";
    public string postedSummaryID = "";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (IsPostBack)
            return;

        if (Request["summaryid"] == null)
            return;

        postedSummaryID = Request["summaryid"];

        using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
        {
            TableOperations<MeterDataQualitySummary> meterDataQualitySummaryTable = new TableOperations<MeterDataQualitySummary>(connection);
            MeterDataQualitySummary summary = meterDataQualitySummaryTable.QueryRecordWhere("ID = {0}", Convert.ToInt32(postedSummaryID));
            postedDate = summary.Date.ToShortDateString();
            postedMeterId = summary.MeterID.ToString();
            postedMeterName = connection.ExecuteScalar<string>("SELECT Name From Meter WHERE ID = {0}", summary.MeterID);
        }
    }
}