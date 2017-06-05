using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.EnterpriseServices;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using GSF.Configuration;

public partial class ICFDetails: System.Web.UI.Page
{

    public Dictionary<string, string> thedata = new Dictionary<string,string>();

    String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (!IsPostBack)
        {
            if (Request["eventid"] != null)
            {
                String postedEventId = Request["eventid"];

                    try
                    {

                    conn = new SqlConnection(connectionstring);
                    conn.Open();
                    SqlCommand cmd = new SqlCommand("dbo.GetICFResult", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@EventID", postedEventId));

                    cmd.CommandTimeout = 300;

                    rdr = cmd.ExecuteReader();
                        if (rdr.HasRows)
                        {
                        while (rdr.Read())
                            {
                                thedata.Add(rdr["Name"].ToString(), rdr["Value"].ToString());
                            }
                        }
                    }

                    catch (Exception ex)
                    {

                    }
                    finally
                    {
                        if (conn != null)
                        {
                            conn.Close();
                        }
                        if (rdr != null)
                        {
                            rdr.Close();
                        }
                    }
                }
            
        }
    }
}