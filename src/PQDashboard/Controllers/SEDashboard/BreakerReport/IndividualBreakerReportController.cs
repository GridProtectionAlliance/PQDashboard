//******************************************************************************************************
//  IndividualBreakerReportController.cs - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  07/02/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Data;
using GSF.Web;
using System;
using System.Collections.Generic;
using System.Data;
using System.Runtime.Caching;
using System.Web.Http;
using openXDA.Reports;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net;

namespace PQDashboard.Controllers.BreakerReport
{
    [RoutePrefix("api/BreakerReport/IndividualBreakerReport")]
    public class IndividualBreakerReportController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new DateTime(1970, 1, 1);

        #endregion

        #region [ Constructors ]
        public IndividualBreakerReportController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static IndividualBreakerReportController()
        {
            s_memoryCache = new MemoryCache("IndividualBreakerReportController");
        }
        #endregion

        #region [ Methods ]

        [Route, HttpGet]
        public IHttpActionResult Get()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            string breakerId = query["breakerId"];

            DateTime startTime = DateTime.Parse(query["startDate"]);
            DateTime endTime = DateTime.Parse(query["endDate"]);

            IndividualBreakerReport report = new IndividualBreakerReport(breakerId, startTime, endTime);
            byte[] pdf = report.createPDF();
            using (MemoryStream stream = new MemoryStream())
            {

                if (pdf == null) return BadRequest();

                stream.WriteAsync(pdf, 0, pdf.Length);
                HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(stream.ToArray()),
                };
                result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue($"inline")
                {
                    FileName = "IndividualBreakerReport_" +breakerId + "_" +  startTime.ToString("MM_dd_yyyy") + "_" + endTime.ToString("MM_dd_yyyy") + ".pdf"
                };

                result.Content.Headers.ContentType =
                    new MediaTypeHeaderValue("application/pdf");

                return ResponseMessage(result);


            }
        }
        #endregion

    }
}