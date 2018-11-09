//******************************************************************************************************
//  OpenSEEComtradeDownload.ashx.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  11/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using FaultData.DataWriters;
using GSF.Data;
using GSF.Data.Model;
using GSF.Threading;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using CancellationToken = System.Threading.CancellationToken;

namespace PQDashboard
{
    /// <summary>
    /// Summary description for OpenSEECSVDownload
    /// </summary>
    public class OpenSEEComtradeDownload : IHttpHandler
    {
        #region [Members]

        // Nested Types
        private class HttpResponseCancellationToken : CompatibleCancellationToken
        {
            private readonly HttpResponse m_reponse;

            public HttpResponseCancellationToken(HttpResponse response) : base(CancellationToken.None)
            {
                m_reponse = response;
            }

            public override bool IsCancelled => !m_reponse.IsClientConnected;
        }

        const string ContentType = "application/zip";
        #endregion

        #region [Properties]

        /// <summary>
        /// Gets a value indicating whether another request can use the <see cref="IHttpHandler"/> instance.
        /// </summary>
        /// <returns>
        /// <c>true</c> if the <see cref="IHttpHandler"/> instance is reusable; otherwise, <c>false</c>.
        /// </returns>
        public bool IsReusable => false;

        /// <summary>
        /// Determines if client cache should be enabled for rendered handler content.
        /// </summary>
        /// <remarks>
        /// If rendered handler content does not change often, the server and client will use the
        /// <see cref="IHostedHttpHandler.GetContentHash"/> to determine if the client needs to refresh the content.
        /// </remarks>
        public bool UseClientCache => false;

        public string Filename { get; private set; }

        private COMTRADEWriter COMTRADEWriter { get; set; }
        #endregion

        #region [Constructor]
        public OpenSEEComtradeDownload() {
            COMTRADEWriter = new COMTRADEWriter();
        }
        #endregion

        #region [Methods]

        public void ProcessRequest(HttpContext context)
        {
            HttpResponse response = HttpContext.Current.Response;
            HttpResponseCancellationToken cancellationToken = new HttpResponseCancellationToken(response);
            NameValueCollection requestParameters = context.Request.QueryString;


            try
            {
                Filename = requestParameters["Meter"] + "_" + requestParameters["EventType"] + "_Event_" + requestParameters["eventID"] + ".zip";
                response.ClearContent();
                response.Clear();
                response.AddHeader("Content-Type", ContentType);
                response.AddHeader("Content-Disposition", "attachment;filename=" + Filename);
                response.BufferOutput = true;
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    int eventID = int.Parse(requestParameters["eventID"]);
                    Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                    DateTime startDate = requestParameters.AllKeys.ToList().IndexOf("startDate") >= 0 ? DateTime.Parse(requestParameters["startDate"]) : evt.StartTime;
                    DateTime endDate = requestParameters.AllKeys.ToList().IndexOf("endDate") >= 0 ? DateTime.Parse(requestParameters["endDate"]) : evt.EndTime;
                    COMTRADEWriter.WriteResults(evt.MeterID, evt.LineID, startDate, endDate, response.OutputStream);
                }
            }

            catch (Exception e)
            {
                LogExceptionHandler?.Invoke(e);
                throw;
            }
            finally
            {
                response.End();
            }
        }

        public Task ProcessRequestAsync(HttpRequestMessage request, HttpResponseMessage response, CancellationToken cancellationToken)
        {
            NameValueCollection requestParameters = request.RequestUri.ParseQueryString();

            response.Content = new PushStreamContent((stream, content, context) =>
            {
                try
                {
                    Filename = requestParameters["Meter"] + "_" + requestParameters["EventType"] + "_Event_" + requestParameters["eventID"] + ".sip";
                    using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                    {
                        int eventID = int.Parse(requestParameters["eventID"]);
                        Event evt = (new TableOperations<Event>(connection)).QueryRecordWhere("ID = {0}", eventID);
                        DateTime startDate = requestParameters.AllKeys.ToList().IndexOf("startDate") >= 0 ? DateTime.Parse(requestParameters["startDate"]) : evt.StartTime;
                        DateTime endDate = requestParameters.AllKeys.ToList().IndexOf("endDate") >= 0 ? DateTime.Parse(requestParameters["endDate"]) : evt.EndTime;
                        COMTRADEWriter.WriteResults(evt.MeterID, evt.LineID, startDate, endDate, stream);
                    }
                }
                catch (Exception e)
                {
                    LogExceptionHandler?.Invoke(e);
                    throw;
                }
                finally
                {
                    stream.Close();
                }
            },
            new MediaTypeHeaderValue(ContentType));

            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = Filename
            };

            return Task.CompletedTask;
        }

        #endregion

        #region [Static]
        public static Action<Exception> LogExceptionHandler;

        #endregion

    }



}