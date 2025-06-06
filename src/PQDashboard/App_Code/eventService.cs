﻿//******************************************************************************************************
//  eventService.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  05/02/2014 - Jeff Walker
//       Generated original version of source code.
//  12/03/2014 - Jeff Walker
//      Optimizations
//
//******************************************************************************************************

using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Web.Services;
using GSF.Configuration;

/// <summary>
/// Summary description for MapService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 

[System.Web.Script.Services.ScriptService]
public class eventService : WebService {

    private string connectionstring = ConfigurationFile.Current.Settings["systemSettings"]["ConnectionString"].Value;

    /// <summary>
    /// getPQIDetailsByEventID
    /// </summary>
    /// <param name="eventID"></param>
    /// <returns></returns>
    [WebMethod]
    public string getPQIDetailsByEventID(string eventID)
    {
        string thedata = "";
        SqlConnection conn = null;
        SqlDataReader rdr = null;

        try
        {
            conn = new SqlConnection(connectionstring);
            conn.Open();
            SqlCommand cmd = new SqlCommand("dbo.GetAllImpactedComponents", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@eventID", eventID));
            cmd.CommandTimeout = 300;

            rdr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(rdr);
            thedata = DataTable2JSON(dt);
            dt.Dispose();
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

        return thedata;
    }

    /// <summary>
    /// DataTable2JSON
    /// </summary>
    /// <param name="dt"></param>
    /// <returns></returns>
    public string DataTable2JSON(DataTable dt)
    {
        List<object> RowList = new List<object>();
        foreach (DataRow dr in dt.Rows)
        {
            Dictionary<object, object> ColList = new Dictionary<object, object>();
            foreach (DataColumn dc in dt.Columns)
            {
                string t = (string.Empty == dr[dc].ToString()) ? null : dr[dc].ToString();

                ColList.Add(dc.ColumnName, t);
            }
            RowList.Add(ColList);
        }
        JavaScriptSerializer js = new JavaScriptSerializer();
        string JSON = js.Serialize(RowList);
        return JSON;
    }
}
