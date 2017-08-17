using System;
using System.Collections.Generic;
using System.Configuration;
using System.EnterpriseServices;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.MeterDataTableAdapters;
using GSF.Configuration;

public partial class OpenSTE : System.Web.UI.Page
{
    public String postedmeterid = "";
    public String postedchannelid = "";
    public String posteddate = "";
    public String postedmeasurementtype = "";
    public String postedcharacteristic = "";
    public String postedphasename = "";
    public String postedmetername = "";
    public String postedlinename = "";

    String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["channelid"] != null)
            {
                postedchannelid = Request["channelid"];
                posteddate = Request["date"];
                postedmeterid = Request["meterid"];
                postedmeasurementtype = Request["measurementtype"];
                postedcharacteristic = Request["characteristic"];
                postedphasename = Request["phasename"];

                using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionstring))
                {
                    try
                    {
                        Meter themeter = meterInfo.Meters.Single(m => m.ID == Int32.Parse(postedmeterid));

                        postedmetername = themeter.Name;

                        Int32 thelineid = meterInfo.Channels.First(row => row.ID == Int32.Parse(postedchannelid)).LineID;

                        postedlinename = meterInfo.MeterLines.Where(row => row.LineID == thelineid)
                            .Where(row => row.MeterID == Int32.Parse(postedmeterid))
                            .Select(row => row.LineName).First();

                    }

                    catch (Exception ex)
                    {
                    postedmeterid = "";
                    postedchannelid = "";
                    posteddate = "";
                    postedmeasurementtype = "";
                    postedcharacteristic = "";
                    postedphasename = "";
                    postedmetername = "";
                    postedlinename = "";
                    }
                    finally
                    {

                    }



                }




            }
        }
    }
}