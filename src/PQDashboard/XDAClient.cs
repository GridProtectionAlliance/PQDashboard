//******************************************************************************************************
//  XDAClient.cs - Gbtc
//
//  Copyright © 2022, Grid Protection Alliance.  All Rights Reserved.
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
//  06/09/2022 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using GSF.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace PQDashboard
{
    public class HIDSPoint
    {
        public string Tag { get; set; }
        public double Minimum { get; set; }
        public double Maximum { get; set; }
        public double Average { get; set; }
        public uint QualityFlags { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class XDAClient
    {
        #region [ Members ]

        // Constants
        private const string SystemSettingQueryFormat =
            "SELECT AltText1 " +
            "FROM ValueList " +
            "WHERE " +
            "    Text = {0} AND " +
            "    GroupID = (SELECT ID FROM ValueListGroup WHERE Name = 'System')";

        private const string RequestVerificationHeader = "X-GSF-Verify";

        #endregion

        #region [ Constructors ]

        public XDAClient(Func<AdoDataConnection> connectionFactory)
        {
            using (AdoDataConnection connection = connectionFactory())
            {
                BaseURL = Query(connection, "XDAInstance");

                string user = Query(connection, "XDAUser");
                string password = Query(connection, "XDAPassword");
                Credential = $"{user}:{password}";
            }
        }

        public XDAClient(AdoDataConnection connection)
        {
            BaseURL = Query(connection, "XDAInstance");

            string user = Query(connection, "XDAUser");
            string password = Query(connection, "XDAPassword");
            Credential = $"{user}:{password}";
        }

        #endregion

        #region [ Properties ]

        public string BaseURL { get; }
        private string Credential { get; }

        #endregion

        #region [ Methods ]

        public async Task QueryHIDSPointsAsync(object query, Action<HIDSPoint> process, CancellationToken cancellationToken = default(CancellationToken))
        {
            Func<HIDSPoint, Task> processAsync = point =>
            {
                process(point);
                return Task.CompletedTask;
            };

            await QueryHIDSPointsAsync(query, processAsync, cancellationToken);
        }

        public Task QueryHIDSPointsAsync(object query, Func<HIDSPoint, Task> processAsync, CancellationToken cancellationToken = default(CancellationToken)) =>
            QueryHIDSPointsAsync(query, (point, token) => processAsync(point), cancellationToken);

        public async Task QueryHIDSPointsAsync(object query, Func<HIDSPoint, CancellationToken, Task> processAsync, CancellationToken cancellationToken = default(CancellationToken))
        {
            string url = $"{BaseURL}/api/hids/QueryPoints";
            string requestVerificationHeaderToken = await GenerateRequestVerificationHeaderTokenAsync(cancellationToken);

            using (HttpRequestMessage request = ConfigureRequest(HttpMethod.Post, url, requestVerificationHeaderToken, query))
            using (HttpResponseMessage response = await HttpClient.SendAsync(request, cancellationToken))
            using (Stream stream = await response.Content.ReadAsStreamAsync())
            using (TextReader reader = new StreamReader(stream))
            {
                while (true)
                {
                    string line = await reader.ReadLineAsync();

                    if (line == null)
                        break;

                    if (line == string.Empty)
                        continue;

                    HIDSPoint point = JObject
                        .Parse(line)
                        .ToObject<HIDSPoint>();

                    await processAsync(point, cancellationToken);
                }
            }
        }

        private async Task<string> GenerateRequestVerificationHeaderTokenAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            using (HttpRequestMessage request = ConfigureRequest(HttpMethod.Get, $"{BaseURL}/api/rvht"))
            using (HttpResponseMessage response = await HttpClient.SendAsync(request, cancellationToken))
            {
                if (response.StatusCode != HttpStatusCode.OK)
                    throw new Exception(); // TODO

                return await response.Content.ReadAsStringAsync();
            }
        }

        private HttpRequestMessage ConfigureRequest(HttpMethod method, string url)
        {
            Encoding utf8 = new UTF8Encoding(false);
            byte[] bytes = utf8.GetBytes(Credential);
            string authToken = Convert.ToBase64String(bytes);

            HttpRequestMessage request = new HttpRequestMessage(method, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authToken);
            return request;
        }

        private HttpRequestMessage ConfigureRequest(HttpMethod method, string url, string requestVerificationHeaderToken, object contentObj)
        {
            if (method == HttpMethod.Get)
                throw new ArgumentException("GET method does not require verification and does not contain a body", nameof(method));

            string json = JObject
                .FromObject(contentObj)
                .ToString(Formatting.None);

            MediaTypeHeaderValue contentType = new MediaTypeHeaderValue("application/json");
            contentType.CharSet = "utf-8";

            StringContent content = new StringContent(json);
            content.Headers.ContentType = contentType;

            HttpRequestMessage request = ConfigureRequest(method, url);
            request.Headers.Add(RequestVerificationHeader, requestVerificationHeaderToken);
            request.Content = content;
            return request;
        }

        #endregion

        #region [ Static ]

        // Static Properties
        private static HttpClient HttpClient { get; }
            = new HttpClient();

        // Static Methods
        private static string Query(AdoDataConnection connection, string field) =>
            connection.ExecuteScalar<string>(SystemSettingQueryFormat, (object)field);

        #endregion
    }
}