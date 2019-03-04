//******************************************************************************************************
//  MainController.cs - Gbtc
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
//  08/31/2016 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Runtime.Caching;
using System.Security;
using System.Threading;
using System.Web.Mvc;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Security;
using GSF.Web.Model;
using openXDA.Model;
using PQDashboard.Model;
using Random = GSF.Security.Cryptography.Random;

namespace PQDashboard.Controllers
{
    /// <summary>
    /// Represents a MVC controller for the site's main pages.
    /// </summary>
    //[AuthorizeControllerRole]
    public class EmailController : Controller
    {
        #region [ Members ]

        // Constants
        private const string UserAccountEmailTypeQuery = @"
            SELECT 
	            UserAccountEmailType.ID as UserAccountEmailTypeID,
	            UserAccountEmailType.UserAccountID as UserAccountID,
	            EmailType.ID as EmailTypeID,
	            EmailType.EmailCategoryID as EmailCategoryID
            FROM
	            UserAccountEmailType JOIN
	            EmailType ON UserAccountEmailType.EmailTypeID = EmailType.ID
            WHERE
                UserAccountID = {0} AND
                EmailCategoryID = {1} AND
                SMS = {2}
        ";

        // Fields
        private readonly DataContext m_dataContext;
        private readonly AppModel m_appModel;
        private bool m_disposed;

        public class UpdateSettingModel
        {
            public string phone { get; set; }
            public string carrier { get; set; }
            public IEnumerable<int> region { get; set; }
            public IEnumerable<int> job { get; set; }
            public IEnumerable<int> sms { get; set; }
            public string submit { get; set; }
            public string sid { get; set; }
            public string username { get; set; }
        }

        public class VerifyCodeModel {
            public string type { get; set; }
            public int code { get; set; }
            public string submit { get; set; }
            public Guid accountid { get; set; }
        }

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="MainController"/>.
        /// </summary>
        public EmailController()
        {
            // Establish data context for the view
            m_dataContext = new DataContext(exceptionHandler: MvcApplication.LogException);
            ViewData.Add("DataContext", m_dataContext);

            // Set default model for pages used by layout
            m_appModel = new AppModel(m_dataContext);
            ViewData.Model = m_appModel;
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="MainController"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                        m_dataContext?.Dispose();
                }
                finally
                {
                    m_disposed = true;          // Prevent duplicate dispose.
                    base.Dispose(disposing);    // Call base class Dispose().
                }
            }
        }

        #region [ View Actions ]

        public ActionResult UpdateSettings()
        {
            m_appModel.ConfigureView(Url.RequestContext, "UpdateSettings", ViewBag);

            try
            {
                UserInfo userInfo = new UserInfo(System.Web.HttpContext.Current.User.Identity.Name);
                userInfo.Initialize();
                ViewBag.email = userInfo.Email;
                ViewBag.firstName = userInfo.FirstName;
                ViewBag.lastName = userInfo.LastName;
                ViewBag.username = HttpContext.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);
                ViewBag.account = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("Name = {0}", ViewBag.usersid);
                ViewBag.isRegistered = ViewBag.account != null;
            }
            catch
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "This may be due to an error determining your user identity.");
            }

            return View();
        }

        public ActionResult Verify(string id)
        {
            m_appModel.ConfigureView(Url.RequestContext, "Verify", ViewBag);

            try
            {
                ViewBag.Type = id;
                ViewBag.username = HttpContext.User.Identity.Name;
                ViewBag.usersid = UserInfo.UserNameToSID(ViewBag.username);
                ViewBag.account = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("Name = {0}", ViewBag.usersid);
                ViewBag.ExpiredCode = TempData["ExpiredCode"];
                ViewBag.BadCode = TempData["BadCode"];
                TempData["ExpiredCode"] = null;
                TempData["BadCode"] = null;
            }
            catch
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "This may be due to an error determining your user identity.");
            }

            return View();
        }

        #endregion

        #region [ Post Actions ]

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleUpdateSettingForm(UpdateSettingModel formData)
        {
            string username = HttpContext.User.Identity.Name;
            string usersid = UserInfo.UserNameToSID(username);

            if (username != formData.username || usersid != formData.sid)
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            if (formData.submit == "Sign Up")
                HandleSignUp(formData);
            else if (formData.submit == "Update")
                HandleUpdate(formData);
            else if (formData.submit == "Unsubscribe")
                HandleUnsubscribe(formData);

            return RedirectToAction("UpdateSettings");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult VerifyCode(VerifyCodeModel formData)
        {
            string username = HttpContext.User.Identity.Name;
            string usersid = UserInfo.UserNameToSID(username);
            ConfirmableUserAccount user = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("ID = {0}", formData.accountid);

            if (username != user.Name && usersid != user.Name)
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            if (formData.submit == "Submit")
                return HandleVerifySubmit(formData, user);
            else if (formData.submit == "Resend Code")
                return HandleVerifyResendCode(formData, user);

            ViewBag.Message = "Bad Command";
            return View("Message");
        }

        #endregion

        #region [ Get Actions ]

        [HttpGet]
        public ActionResult ApproveUser(string id)
        {
            ActionResult adminValidationResult = ValidateAdminRequest();

            if (adminValidationResult != null)
                return adminValidationResult;

            ConfirmableUserAccount confirmableUserAccount = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("ID = {0}", Guid.Parse(id));

            if (confirmableUserAccount == null)
                return HttpNotFound();

            m_dataContext.Connection.ExecuteNonQuery("UPDATE UserAccount SET Approved = 1 WHERE ID = {0}", confirmableUserAccount.ID);

            string accountName = UserInfo.SIDToAccountName(confirmableUserAccount.Name);
            ViewBag.Message = accountName + " has been approved to receive notifications.";

            string emailServiceName = GetEmailServiceName();
            string message = $"{emailServiceName} subscriptions have been approved.";
            SendEmail(confirmableUserAccount.Email, message, message);
            return View("Message");
        }

        [HttpGet]
        public ActionResult DenyUser(string id)
        {
            ActionResult adminValidationResult = ValidateAdminRequest();

            if (adminValidationResult != null)
                return adminValidationResult;

            Guid userID = Guid.Parse(id);
            ConfirmableUserAccount confirmableUserAccount = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("ID = {0}", userID);

            if (confirmableUserAccount == null)
                return HttpNotFound();

            string accountName = UserInfo.SIDToAccountName(confirmableUserAccount.Name);
            CascadeDelete("UserAccount", $"ID='{userID}'");
            ViewBag.Message = accountName + " has been denied access to email notifications.";

            string emailServiceName = GetEmailServiceName();
            string message = $"{emailServiceName} subscriptions have been denied by the administrator.";
            SendEmail(confirmableUserAccount.Email, message, message);
            return View("Message");
        }

        #endregion

        #region [ Helper Functions ]

        private void HandleSignUp(UpdateSettingModel formData)
        {
            UserInfo userInfo = new UserInfo(System.Web.HttpContext.Current.User.Identity.Name);
            userInfo.Initialize();
            //// Create new user
            m_dataContext.Connection.ExecuteNonQuery("INSERT INTO UserAccount (Name, Email, EmailConfirmed, FirstName, LastName) VALUES ({0}, {1}, {2}, {3}, {4})", formData.sid, userInfo.Email, true, userInfo.FirstName, userInfo.LastName);

            HandleUpdate(formData);

            // email system admin for approval
            ConfirmableUserAccount user = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("Name = {0}", formData.sid);

            IEnumerable<int> regionData = formData.region ?? Enumerable.Empty<int>();
            IEnumerable<int> jobData = formData.job ?? Enumerable.Empty<int>();
            IEnumerable<int> smsData = formData.sms ?? Enumerable.Empty<int>();

            string assetGroupIDList = string.Join(",", regionData);
            string emailTypeIDList = string.Join(",", jobData);
            string smsEmailTypeIDList = string.Join(",", smsData);

            IEnumerable<AssetGroup> assetGroup = Enumerable.Empty<AssetGroup>();
            IEnumerable<XSLTemplate> emailTemplate = Enumerable.Empty<XSLTemplate>();
            IEnumerable<XSLTemplate> smsTemplate = Enumerable.Empty<XSLTemplate>();

            if (assetGroupIDList.Length > 0)
                assetGroup = m_dataContext.Table<AssetGroup>().QueryRecordsWhere($"ID IN ({assetGroupIDList})");

            if (emailTypeIDList.Length > 0)
                emailTemplate = m_dataContext.Table<XSLTemplate>().QueryRecordsWhere($"ID IN (SELECT XSLTemplateID FROM EmailType WHERE ID IN ({emailTypeIDList}))");

            if (smsEmailTypeIDList.Length > 0)
                smsTemplate = m_dataContext.Table<XSLTemplate>().QueryRecordsWhere($"ID IN (SELECT XSLTemplateID FROM EmailType WHERE ID IN ({smsEmailTypeIDList}))");

            string url = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.URL'");
            string admin = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.AdminAddress'");
            string emailTemplateName = (emailTemplate.Any() ? string.Join(", ", emailTemplate.Select(x => x.Name) ) : "None");
            string smsTemplateName = (smsTemplate.Any() ? string.Join(", ", smsTemplate.Select(x => x.Name)) : "None");
            string regionName = (assetGroup.Any() ? string.Join(", ", assetGroup.Select(x => x.Name)) : "None");
            string emailServiceName = GetEmailServiceName();
            string subject = $"{formData.username} requests access to the {emailServiceName}.";
            string body = @"
                <html>
                    <p>" + formData.username + @" requests access to the " + emailServiceName + @".</p>
                    <table>
                        <tr><td>Email:</td><td>" + userInfo.Email + @"</td></tr>
                        <tr><td>Name:</td><td>" + userInfo.FirstName + " " + userInfo.LastName + @"</td></tr>
                        <tr><td>Phone:</td><td>" + formData.phone + @"</td></tr>
                        <tr><td>Region:</td><td>" + regionName + @"</td></tr>
                        <tr><td>Email Template:</td><td>" + emailTemplateName + @"</td></tr>
                        <tr><td>SMS Template:</td><td>" + smsTemplateName + @"</td></tr>
                    </table>
                    <a href='" + url + @"/email/approveuser/" + user.ID + @"'>Approve</a>
                    <a href='" + url + @"/email/denyuser/" + user.ID + @"'>Deny</a>
                </html>
            ";

            if (!string.IsNullOrEmpty(admin))
                SendEmail(admin, subject, body);
        }

        private void HandleUpdate(UpdateSettingModel formData)
        {
            TableOperations<ConfirmableUserAccount> userAccountTable = m_dataContext.Table<ConfirmableUserAccount>();
            ConfirmableUserAccount userAccount = userAccountTable.QueryRecordWhere("Name = {0}", formData.sid);
            string url = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.URL'");
            string emailServiceName = GetEmailServiceName();
            string recipient, subject, body;

            // if phone changed force reconfirmation
            if (userAccount.Phone != formData.phone + "@" + formData.carrier)
            {
                userAccount.Phone = formData.phone;
                userAccount.PhoneConfirmed = false;

                if (!string.IsNullOrEmpty(formData.phone))
                {
                    userAccount.Phone += $"@{formData.carrier}";

                    // generate code for sms confirmation
                    string code = Random.Int32Between(0, 999999).ToString("D6");
                    s_memoryCache.Set("sms" + userAccount.ID.ToString(), code, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromDays(1) });

                    recipient = userAccount.Phone;
                    subject = $"{emailServiceName} requires you to confirm your SMS number.";
                    body = $"From your workstation, input {code} at {url}/email/verify/sms";
                    SendEmail(recipient, subject, body);
                }
            }

            userAccountTable.UpdateRecord(userAccount);

            UpdateUserAccountAssetGroup(userAccount, formData);
            UpdateUserAccountEmailType(userAccount, formData.job, false);
            UpdateUserAccountEmailType(userAccount, formData.sms, true);

            recipient = userAccount.Email;
            subject = $"{emailServiceName} subscriptions updated";
            body = $"Your {emailServiceName} subscriptions have been updated. Visit {url}/email/UpdateSettings to review your subscriptions.";
            SendEmail(recipient, subject, body);
        }

        private void UpdateUserAccountAssetGroup(ConfirmableUserAccount userAccount, UpdateSettingModel formData)
        {
            // update link to asset group
            TableOperations<UserAccountAssetGroup> userAccountAssetGroupTable = m_dataContext.Table<UserAccountAssetGroup>();
            IEnumerable<UserAccountAssetGroup> userAccountAssetGroups = userAccountAssetGroupTable.QueryRecordsWhere("UserAccountID = {0}", userAccount.ID);
            IEnumerable<int> assetGroups = userAccountAssetGroups.Select(x => x.AssetGroupID);

            // formData will come back as null instead of empty array ....
            if (formData.region == null)
                formData.region = new List<int>();

            // First pass. Add Link in database if the link does not exist.
            foreach (int id in formData.region) {
                if (!assetGroups.Contains(id))
                {
                    UserAccountAssetGroup userAccountAssetGroup = new UserAccountAssetGroup();

                    userAccountAssetGroup.UserAccountID = userAccount.ID;
                    userAccountAssetGroup.AssetGroupID = id;
                    userAccountAssetGroup.Dashboard = true;
                    userAccountAssetGroup.Email = true;
                    userAccountAssetGroupTable.AddNewRecord(userAccountAssetGroup);
                }
                else {
                    UserAccountAssetGroup userAccountAssetGroup = userAccountAssetGroups.Where(x => x.AssetGroupID == id).First();
                    if (!userAccountAssetGroup.Dashboard || !userAccountAssetGroup.Email) {
                        userAccountAssetGroup.Dashboard = true;
                        userAccountAssetGroup.Email = true;
                        userAccountAssetGroupTable.UpdateRecord(userAccountAssetGroup);
                    }
                }
            }

            userAccountAssetGroups = userAccountAssetGroupTable.QueryRecordsWhere("UserAccountID = {0}", userAccount.ID);

            // Second pass. Remove Link if the link does not exist in data from form.
            foreach (UserAccountAssetGroup link in userAccountAssetGroups)
            {
                if (!formData.region.Contains(link.AssetGroupID))
                    userAccountAssetGroupTable.DeleteRecord(link);
            }
        }

        private void UpdateUserAccountEmailType(ConfirmableUserAccount userAccount, IEnumerable<int> emailTypeIDs, bool sms)
        {
            // update links between user account and email type
            EmailCategory eventEmailCategory = m_dataContext.Table<EmailCategory>().QueryRecordWhere("Name = 'Event'");
            DataTable userAccountEmailTypeDataTable = m_dataContext.Connection.RetrieveData(UserAccountEmailTypeQuery, userAccount.ID, eventEmailCategory.ID, sms);
            IEnumerable<int> userAccountEmailTypeIDs = userAccountEmailTypeDataTable.Select().Select(x => (int)x["EmailTypeID"]);

            // formData will come back as null instead of empty array ....
            if (emailTypeIDs == null)
                emailTypeIDs = new List<int>();

            // First pass. Add Link in database if the link does not exist.
            foreach (int id in emailTypeIDs)
            {
                if (!userAccountEmailTypeIDs.Contains(id)) {
                    UserAccountEmailType userAccountEmailType = new UserAccountEmailType();
                    userAccountEmailType.UserAccountID = userAccount.ID;
                    userAccountEmailType.EmailTypeID = id;
                    m_dataContext.Table<UserAccountEmailType>().AddNewRecord(userAccountEmailType);
                }
            }

            userAccountEmailTypeDataTable = m_dataContext.Connection.RetrieveData(UserAccountEmailTypeQuery, userAccount.ID, eventEmailCategory.ID, sms);

            // Second pass. Remove Link if the link does not exist in data from form.
            foreach (DataRow link in userAccountEmailTypeDataTable.Rows)
            {
                if (!emailTypeIDs.Contains((int)link["EmailTypeID"]))
                    m_dataContext.Table<UserAccountEmailType>().DeleteRecordWhere("ID = {0}", (int)link["UserAccountEmailTypeID"]);
            }
        }

        private void HandleUnsubscribe(UpdateSettingModel formData)
        {
            formData.job = new List<int>();
            formData.sms = new List<int>();
            HandleUpdate(formData);
        }

        private ActionResult HandleVerifySubmit(VerifyCodeModel formData, ConfirmableUserAccount user)
        {
            if (s_memoryCache.Contains(formData.type + user.ID.ToString()))
            {
                string code = s_memoryCache.Get(formData.type + user.ID.ToString()).ToString();

                if (code != formData.code.ToString("D6"))
                {
                    TempData["BadCode"] = true;
                    return RedirectToAction("Verify", new { id = formData.type });
                }

                m_dataContext.Connection.ExecuteNonQuery($"UPDATE UserAccount Set {(formData.type == "email" ? "EmailConfirmed" : "PhoneConfirmed")} = 1 WHERE ID = '{user.ID}'");
                s_memoryCache.Remove(formData.type + user.ID.ToString());

                string emailServiceName = GetEmailServiceName();
                string recipient = formData.type == "email" ? user.Email : user.Phone;
                string subject = $"{emailServiceName} has confirmed your {(formData.type == "email" ? "email address" : "SMS number")}.";
                string body = $"Once you are approved by an administrator, you will begin receiving notifications.";
                SendEmail(recipient, subject, body);
            }
            else
            {
                TempData["ExpiredCode"] = true;
                return RedirectToAction("Verify", new { id = formData.type });
            }

            return RedirectToAction("UpdateSettings");
        }

        private ActionResult HandleVerifyResendCode(VerifyCodeModel formData, ConfirmableUserAccount user)
        {
            string url = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.URL'");

            // if email changed force reconfirmation
            if (formData.type == "email")
            {
                // generate code for email confirmation
                string code = Random.Int32Between(0, 999999).ToString("D6");
                s_memoryCache.Set("email" + user.ID.ToString(), code, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromDays(1) });

                string emailServiceName = GetEmailServiceName();
                string subject = $"{emailServiceName} requires you to confirm your email.";
                string body = $"From your workstation, input {code} at {url}/email/verify/email";
                SendEmail(user.Email, subject, body);
            }

            // if phone changed force reconfirmation
            if (formData.type == "sms")
            {
                string code = Random.Int32Between(0, 999999).ToString("D6");
                s_memoryCache.Set("sms" + user.ID.ToString(), code, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromDays(1) });

                string emailServiceName = GetEmailServiceName();
                string subject = $"{emailServiceName} requires you to confirm your SMS number.";
                string body = $"From your workstation, input {code} at {url}/email/verify/sms";
                SendEmail(user.Phone, subject, body);
            }

            return RedirectToAction("Verify", new { id = formData.type });
        }

        private ActionResult ValidateAdminRequest()
        {
            string username = HttpContext.User.Identity.Name;
            ISecurityProvider securityProvider = SecurityProviderUtility.CreateProvider(username);
            securityProvider.PassthroughPrincipal = HttpContext.User;

            if (!securityProvider.Authenticate())
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            SecurityIdentity approverIdentity = new SecurityIdentity(securityProvider);
            SecurityPrincipal approverPrincipal = new SecurityPrincipal(approverIdentity);

            if (!approverPrincipal.IsInRole("Administrator"))
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            return null;
        }

        private string GetEmailServiceName()
        {
            const string DefaultEmailServiceName = "openXDA Event Email Service";
            const string EmailServiceNameSQL = "SELECT Value FROM Setting WHERE Name = 'EventEmail.ServiceName'";
            string emailServiceName = m_dataContext.Connection.ExecuteScalar<string>(EmailServiceNameSQL);

            if (string.IsNullOrWhiteSpace(emailServiceName))
                emailServiceName = DefaultEmailServiceName;

            return emailServiceName;
        }

        #endregion

        #region [ Misc ]

        // Be careful calling this method!
        // The table name and criterion are both used in dynamic SQL
        // and are therefore SQL injectable.
        private void CascadeDelete(string tableName, string criterion)
        {
            using (IDbCommand sc = m_dataContext.Connection.Connection.CreateCommand())
            {
                sc.CommandText = "DECLARE @context VARBINARY(128)\n SELECT @context = CONVERT(VARBINARY(128), CONVERT(VARCHAR(128), @userName))\n SET CONTEXT_INFO @context";
                IDbDataParameter param = sc.CreateParameter();
                param.ParameterName = "@userName";
                param.Value = GetCurrentUserName();
                sc.Parameters.Add(param);
                sc.ExecuteNonQuery();
                sc.Parameters.Clear();

                sc.CommandText = "dbo.UniversalCascadeDelete";
                sc.CommandType = CommandType.StoredProcedure;
                IDbDataParameter param1 = sc.CreateParameter();
                param1.ParameterName = "@tableName";
                param1.Value = tableName;
                IDbDataParameter param2 = sc.CreateParameter();
                param2.ParameterName = "@baseCriteria";
                param2.Value = criterion;
                sc.Parameters.Add(param1);
                sc.Parameters.Add(param2);
                sc.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Gets UserAccount table name for current user.
        /// </summary>
        /// <returns>User name for current user.</returns>
        private string GetCurrentUserName()
        {
            return Thread.CurrentPrincipal.Identity.Name;
        }

        private void SendEmail(string recipient, string subject, string body)
        {
            const int DefaultSMTPPort = 25;

            string smtpServer = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.SMTPServer'");
            string fromAddress = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.FromAddress'");
            string username = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.Username'");
            SecureString password = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.Password'").ToSecureString();
            bool enableSSL = m_dataContext.Connection.ExecuteScalar<bool>("SELECT Value FROM Setting WHERE Name = 'Email.EnableSSL'");

            if (string.IsNullOrEmpty(smtpServer))
                return;

            string[] smtpServerParts = smtpServer.Split(':');
            string host = smtpServerParts[0];
            int port;

            if (smtpServerParts.Length <= 1 || !int.TryParse(smtpServerParts[1], out port))
                port = DefaultSMTPPort;

            using (SmtpClient smtpClient = new SmtpClient(host, port))
            using (MailMessage emailMessage = new MailMessage())
            {
                if (!string.IsNullOrEmpty(username) && (object)password != null)
                    smtpClient.Credentials = new NetworkCredential(username, password);

                smtpClient.EnableSsl = enableSSL;

                emailMessage.From = new MailAddress(fromAddress);
                emailMessage.Subject = subject;
                emailMessage.Body = body;
                emailMessage.IsBodyHtml = true;

                // Add the specified To recipients for the email message
                emailMessage.To.Add(recipient.Trim());

                // Send the email
                smtpClient.Send(emailMessage);
            }
        }

        #endregion

        #endregion

        #region [ Static ]

        private static MemoryCache s_memoryCache;

        static EmailController()
        {
            s_memoryCache = new MemoryCache("EmailController");
        }

        #endregion
    }
}