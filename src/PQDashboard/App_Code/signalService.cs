//******************************************************************************************************
//  signalService.cs - Gbtc
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
//  03/24/2016 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Data;
using System.Web.Services;
using FaultData.DataAnalysis;
using FaultData.Database;
using FaultData.Database.FaultLocationDataTableAdapters;
using FaultData.Database.MeterDataTableAdapters;
using EventDataTableAdapter = FaultData.Database.MeterDataTableAdapters.EventDataTableAdapter;
using System.Data.Linq;
using GSF.Data;
using System.Data.SqlClient;
using GSF.Configuration;
using PQDashboard;



/// <summary>
/// Summary description for WebService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]

// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]

public class signalService : System.Web.Services.WebService {

    [WebMethod]
    public List<SignalCode.FlotSeries> GetFlotData(int eventID, List<int> seriesIndexes)
    {
        SignalCode sc = new SignalCode();
        return sc.GetFlotData(eventID, seriesIndexes);
    }


    [WebMethod]
    public SignalCode.eventSet getSignalDataByID(string EventInstanceID)
    {
        SignalCode sc = new SignalCode();
        return sc.getSignalDataByID(EventInstanceID);
    }


    [WebMethod]
    public SignalCode.eventSet getFaultCurveDataByID(string EventInstanceID)
    {
        SignalCode sc = new SignalCode();
        return sc.getFaultCurveDataByID(EventInstanceID);

    }

/// <summary>
/// Webmethod that returns EventSet for Event
/// </summary>
/// <param name="EventInstanceID"></param>
/// <param name="DataType"></param>
/// <returns></returns>
/// 
/// 
[WebMethod]
public SignalCode.eventSet getSignalDataByIDAndType(string EventInstanceID, String DataType)    
    {
        SignalCode sc = new SignalCode();
        return sc.getSignalDataByIDAndType(EventInstanceID, DataType);

    }

}
