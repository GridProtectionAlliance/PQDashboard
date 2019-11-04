using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using GSF.Configuration;

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