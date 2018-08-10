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

        // Fields
        private readonly DataContext m_dataContext;
        private readonly AppModel m_appModel;
        private bool m_disposed;

        public class UpdateSettingModel
        {
            public string email { get; set; }
            public string phone { get; set; }
            public string carrier { get; set; }
            public int region { get; set; }
            public int job { get; set; }
            public int sms { get; set; }
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
            m_dataContext.Connection.ExecuteNonQuery("UPDATE UserAccount SET Approved = 1 WHERE ID = {0}", confirmableUserAccount.ID);

            string accountName = UserInfo.SIDToAccountName(confirmableUserAccount.Name);
            ViewBag.Message = accountName + " has been approved.";

            SendEmail(confirmableUserAccount.Email, "openXDA Email Service has been approved.", "openXDA Email Service has been approved.");
            return View("Message");
        }

        [HttpGet]
        public ActionResult DenyUser(string id)
        {
            ActionResult adminValidationResult = ValidateAdminRequest();

            if (adminValidationResult != null)
                return adminValidationResult;

            ConfirmableUserAccount confirmableUserAccount = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("ID = {0}", Guid.Parse(id));
            string accountName = UserInfo.SIDToAccountName(confirmableUserAccount.Name);
            CascadeDelete("UserAccount", $"ID='{id.Replace("'", "''")}'");
            ViewBag.Message = accountName + " has been denied.";
            SendEmail(confirmableUserAccount.Email, "openXDA Email Service has been denied.", "openXDA Email Service has been denied.");
            return View("Message");
        }

        #endregion

        #region [ Helper Functions ]

        private void HandleSignUp(UpdateSettingModel formData)
        {
            //UserInfo userInfo = new UserInfo(System.Web.HttpContext.Current.User.Identity.Name);
            //userInfo.Initialize();
            //// Create new user
            //m_dataContext.Connection.ExecuteNonQuery("INSERT INTO UserAccount (Name, Email, Phone, FirstName, LastName) VALUES ({0}, {1}, {2}, {3}, {4})", formData.sid, formData.email, formData.phone + "@" + formData.carrier, userInfo.FirstName, userInfo.LastName);

            m_dataContext.Connection.ExecuteNonQuery("INSERT INTO UserAccount (Name) VALUES ({0})", formData.sid);

            HandleUpdate(formData);

            // email system admin for approval
            ConfirmableUserAccount user = m_dataContext.Table<ConfirmableUserAccount>().QueryRecordWhere("Name = {0}", formData.sid);
            AssetGroup assetGroup = m_dataContext.Table<AssetGroup>().QueryRecordWhere("ID = {0}", formData.region);
            EmailType emailType = m_dataContext.Table<EmailType>().QueryRecordWhere("ID = {0}", formData.job);
            XSLTemplate xslTemplate = m_dataContext.Table<XSLTemplate>().QueryRecordWhere("ID = {0}", emailType?.XSLTemplateID ?? 0);
            string url = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.URL'");
            string admin = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'Email.ApprovalAddress'");
            string templateName = xslTemplate?.Name ?? "None";

            if (formData.job == -1)
                templateName = "All emails";

            string body = @"
                <html>
                    <p>" + formData.username + @" requests access to the openXDA Event Email Service.</p>
                    <table>
                        <tr><td>Email:</td><td>" + formData.email + @"</td></tr>
                        <tr><td>Phone:</td><td>" + formData.phone + @"</td></tr>
                        <tr><td>Region:</td><td>" + assetGroup.Name + @"</td></tr>
                        <tr><td>Job:</td><td>" + templateName + @"</td></tr>
                    </table>
                    <a href='" + url + @"/email/approveuser/" + user.ID + @"'>Approve</a>
                    <a href='" + url + @"/email/denyuser/" + user.ID + @"'>Deny</a>
                </html>
            ";

            if (!string.IsNullOrEmpty(admin))
                SendEmail(admin, formData.username + " requests access to the openXDA Event Email Service.", body);
        }

        private void HandleUpdate(UpdateSettingModel formData)
        {
            TableOperations<ConfirmableUserAccount> userAccountTable = m_dataContext.Table<ConfirmableUserAccount>();
            ConfirmableUserAccount userAccount = userAccountTable.QueryRecordWhere("Name = {0}", formData.sid);
            string url = m_dataContext.Connection.ExecuteScalar<string>("SELECT Value FROM DashSettings WHERE Name = 'System.URL'");

            // if email changed force reconfirmation
            if (userAccount.Email != formData.email)
            {
                userAccount.Email = formData.email;
                userAccount.EmailConfirmed = false;

                if (!string.IsNullOrEmpty(formData.email))
                {
                    // generate code for email confirmation
                    string code = Random.Int32Between(0, 999999).ToString("D6");
                    s_memoryCache.Set("email" + userAccount.ID.ToString(), code, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromDays(1) });
                    SendEmail(userAccount.Email, "openXDA Event Email Service requries you to confirm your email.", $"From your workstation, input {code} at {url}/email/verify/email");
                }
            }

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
                    SendEmail(userAccount.Phone, "openXDA Event Email Service requries you to confirm your sms number.", $"From your workstation, input {code} at {url}/email/verify/sms");
                }
            }

            userAccountTable.UpdateRecord(userAccount);

            if (formData.region != -1)
            {
                // update link to asset group
                TableOperations<UserAccountAssetGroup> userAccountAssetGroupTable = m_dataContext.Table<UserAccountAssetGroup>();
                UserAccountAssetGroup userAccountAssetGroup = userAccountAssetGroupTable.QueryRecordWhere("UserAccountID = {0} AND AssetGroupID = {1}", userAccount.ID, formData.region);

                if (userAccountAssetGroup == null)
                    userAccountAssetGroup = userAccountAssetGroupTable.QueryRecordWhere("UserAccountID = {0} AND Email <> 0", userAccount.ID);

                if (userAccountAssetGroup == null)
                    userAccountAssetGroup = new UserAccountAssetGroup();

                if (userAccountAssetGroup.ID == 0)
                {
                    userAccountAssetGroup.UserAccountID = userAccount.ID;
                    userAccountAssetGroup.AssetGroupID = formData.region;
                    userAccountAssetGroup.Dashboard = false;
                    userAccountAssetGroup.Email = true;
                    userAccountAssetGroupTable.AddNewRecord(userAccountAssetGroup);
                }
                else if (userAccountAssetGroup.AssetGroupID != formData.region || !userAccountAssetGroup.Email)
                {
                    userAccountAssetGroup.AssetGroupID = formData.region;
                    userAccountAssetGroup.Email = true;
                    userAccountAssetGroupTable.UpdateRecord(userAccountAssetGroup);
                }
            }

            // update links between user account and email type
            TableOperations<EmailType> emailTypeTable = m_dataContext.Table<EmailType>();
            TableOperations<UserAccountEmailType> userAccountEmailTypeTable = m_dataContext.Table<UserAccountEmailType>();
            List<UserAccountEmailType> existingUserAccountEmailTypes = userAccountEmailTypeTable.QueryRecordsWhere("UserAccountID = {0}", userAccount.ID).ToList();
            List<UserAccountEmailType> newUserAccountEmailTypes = new List<UserAccountEmailType>();
            EmailCategory eventEmailCategory = m_dataContext.Table<EmailCategory>().QueryRecordWhere("Name = 'Event'");

            if (formData.job != 0)
            {
                RecordRestriction emailTypeRestriction = new RecordRestriction("SMS = 0 AND EmailCategoryID = {0}", eventEmailCategory.ID);

                if (formData.job > 0)
                    emailTypeRestriction &= new RecordRestriction("ID = {0}", formData.job);

                IEnumerable<EmailType> emailTypes = emailTypeTable.QueryRecords(emailTypeRestriction);

                if (formData.job == -2)
                {
                    // No change to existing email subscriptions
                    List<int> existingEmailTypes = existingUserAccountEmailTypes
                        .Select(userAccountEmailType => userAccountEmailType.EmailTypeID)
                        .ToList();

                    emailTypes = emailTypes.Where(emailType => existingEmailTypes.Contains(emailType.ID));
                }

                foreach (EmailType emailType in emailTypes)
                {
                    UserAccountEmailType userAccountEmailType = new UserAccountEmailType();
                    userAccountEmailType.UserAccountID = userAccount.ID;
                    userAccountEmailType.EmailTypeID = emailType.ID;
                    newUserAccountEmailTypes.Add(userAccountEmailType);
                }
            }

            if (formData.sms != 0)
            {
                RecordRestriction smsTypeRestriction = new RecordRestriction("SMS <> 0 AND EmailCategoryID = {0}", eventEmailCategory.ID);

                if (formData.sms != -1)
                    smsTypeRestriction &= new RecordRestriction("ID = {0}", formData.sms);

                IEnumerable<EmailType> smsTypes = emailTypeTable.QueryRecords(smsTypeRestriction);

                if (formData.sms == -2)
                {
                    // No change to existing SMS subscriptions
                    List<int> existingEmailTypes = existingUserAccountEmailTypes
                        .Select(userAccountEmailType => userAccountEmailType.EmailTypeID)
                        .ToList();

                    smsTypes = smsTypes.Where(smsType => existingEmailTypes.Contains(smsType.ID));
                }

                foreach (EmailType smsType in smsTypes)
                {
                    UserAccountEmailType userAccountEmailType = new UserAccountEmailType();
                    userAccountEmailType.UserAccountID = userAccount.ID;
                    userAccountEmailType.EmailTypeID = smsType.ID;
                    newUserAccountEmailTypes.Add(userAccountEmailType);
                }
            }

            for (int i = 0; i < existingUserAccountEmailTypes.Count; i++)
            {
                if (i < newUserAccountEmailTypes.Count)
                    newUserAccountEmailTypes[i].ID = existingUserAccountEmailTypes[i].ID;
                else
                    userAccountEmailTypeTable.DeleteRecord(existingUserAccountEmailTypes[i]);
            }

            foreach (UserAccountEmailType userAccountEmailType in newUserAccountEmailTypes)
                userAccountEmailTypeTable.AddNewOrUpdateRecord(userAccountEmailType);
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
                SendEmail(user.Email, "openXDA Event Email Service requries you to confirm your email.", $"From your workstation, input {code} at {url}/email/verify/email");
            }

            // if phone changed force reconfirmation
            if (formData.type == "sms")
            {
                string code = Random.Int32Between(0, 999999).ToString("D6");
                s_memoryCache.Set("sms" + user.ID.ToString(), code, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromDays(1) });
                SendEmail(user.Phone, "openXDA Event Email Service requries you to confirm your sms number.", $"From your workstation, input {code} at {url}/email/verify/sms");
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

        #endregion

        #region [ Misc ]

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
            SecureString password = m_dataContext.Connection.ExecuteScalar<SecureString>("SELECT Value FROM Setting WHERE Name = 'Email.Password'");
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