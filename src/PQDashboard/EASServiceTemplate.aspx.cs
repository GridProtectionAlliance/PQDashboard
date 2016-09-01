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
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using GSF.Configuration;
using GSF.Data.Model;

public partial class EASDetails: System.Web.UI.Page
{
 

    public List<Tuple<string, string>> thedata = new List<Tuple<string, string>>();
    public string TableName = "";
    public string ServiceName = "";
    String connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    protected void Page_Load(object sender, EventArgs e)
    {
    }

    public  void DoStuff()
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;

        if (!IsPostBack)
        {
            if (Request["eventId"] != null)
            {
                String postedEventId = Request["eventId"];

                try
                {

                    conn = new SqlConnection(connectionstring);
                    conn.Open();
                    SqlCommand cmd = new SqlCommand("SELECT * FROM "+  TableName + " WHERE EventID = @EventID", conn);
                    cmd.Parameters.Add(new SqlParameter("@EventID", postedEventId));

                    cmd.CommandTimeout = 300;

                    rdr = cmd.ExecuteReader();
                    if (rdr.HasRows)
                    {
                        while (rdr.Read())
                        {
                            for (int i = 0; i < rdr.FieldCount; ++i)
                            {
                                thedata.Add(Tuple.Create(rdr.GetName(i), rdr[i].ToString()));
                            }
                            //thedata.Add(rdr["Name"].ToString(), rdr["Value"].ToString());
                        }
                    }
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