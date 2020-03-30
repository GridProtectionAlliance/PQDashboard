//******************************************************************************************************
//  LocationController.cs - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  03/27/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using GSF.Data;
using GSF.Data.Model;
using GSF.Collections;
using openXDA.Model;

namespace PQDashboard.Controllers.Disturbances
{
    public class MagDurData
    {
        public int EventID { get; set; }
        public double DurationSeconds { get; set; }
        public double PerUnitMagnitude { get; set; }
    }

    public class VoltageMagnitudeDataForm
    {
        public string meterIds { get; set; }
        public string startDate { get; set; }
        public string endDate { get; set; }
        public string context { get; set; }
    }

    [RoutePrefix("api/Disturbances/MagDur")]
    public class DisturbancesMagDurChartController : ApiController
    {
        [Route(""), HttpPost]
        public IHttpActionResult Post(VoltageMagnitudeDataForm form)
        {
            try
            {
                DateTime beginDate;
                DateTime finishDate;
                if (form.context == "day")
                {
                    beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                    finishDate = beginDate.AddDays(1).AddSeconds(-1);
                }
                else if (form.context == "hour")
                {
                    beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                    finishDate = beginDate.AddHours(1).AddSeconds(-1);
                }
                else if (form.context == "minute")
                {
                    beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                    finishDate = beginDate.AddMinutes(1).AddSeconds(-1);
                }
                else
                {
                    beginDate = DateTime.Parse(form.startDate).ToUniversalTime();
                    finishDate = DateTime.Parse(form.endDate).ToUniversalTime();
                }

                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable table = connection.RetrieveData(
                    @" SELECT Disturbance.EventID, 
                          Disturbance.DurationSeconds,
                          Disturbance.PerUnitMagnitude
                  FROM Disturbance JOIN 
                       Event ON Event.ID = Disturbance.EventID JOIN
			           DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID JOIN
			           Phase ON Phase.ID = Disturbance.PhaseID JOIN
			           VoltageEnvelope ON VoltageEnvelope.ID = DisturbanceSeverity.VoltageEnvelopeID	               
                 WHERE PhaseID IN (SELECT ID FROM Phase WHERE Name = 'Worst') AND
			           VoltageEnvelope.Name = COALESCE((SELECT TOP 1 Value FROM Setting WHERE Name = 'DefaultVoltageEnvelope'), 'ITIC') AND 
                       (Event.MeterID IN (Select * FROM String_To_Int_Table({0},','))) AND
                       Event.StartTime >= {1} AND Event.StartTime <= {2}  ", form.meterIds, beginDate, finishDate);
                    return Ok(table.Select().Select(row => new MagDurData()
                    {
                        EventID = int.Parse(row["EventID"].ToString()),
                        DurationSeconds = double.Parse(row["DurationSeconds"].ToString()),
                        PerUnitMagnitude = double.Parse(row["PerUnitMagnitude"].ToString())
                    }));

                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}