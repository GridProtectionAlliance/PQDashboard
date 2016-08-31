//******************************************************************************************************
//  AppModel.cs - Gbtc
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
using System.Text;
using System.Web.Routing;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using GSF.Web.Model;
using Path = System.Web.VirtualPathUtility;

namespace PQDashboard.Model
{
    /// <summary>
    /// Defines a base application model with convenient global settings and functions.
    /// </summary>
    /// <remarks>
    /// Custom view Model should inherit from AppModel because the "Global" property is used by _Layout.cshtml.
    /// </remarks>
    public class AppModel : IDisposable
    {
        #region [ Members ]

        // Fields
        private DataContext m_securityDataContext;
        private DataContext m_dbDataContext;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new <see cref="AppModel"/>.
        /// </summary>
        public AppModel()
        {
            Global = MvcApplication.DefaultModel != null ? MvcApplication.DefaultModel.Global : new GlobalSettings();
        }

        /// <summary>
        /// Creates a new <see cref="AppModel"/> with the specified <paramref name="dataContext"/>.
        /// </summary>
        /// <param name="dataContext">Data context to provide to model.</param>
        public AppModel(DataContext dataContext) : this()
        {
            DataContext = dataContext;
        }

        #endregion

        #region [ Properties ]

        /// <summary>
        /// Gets global settings for application.
        /// </summary>
        public GlobalSettings Global
        {
            get;
        }

        /// <summary>
        /// Gets default data context for model.
        /// </summary>
        public DataContext DataContext
        {
            get;
        }

        /// <summary>
        /// Gets security data context for model.
        /// </summary>
        public DataContext SecurityDataContext
        {
            get
            {
                return m_securityDataContext ?? (m_securityDataContext = new DataContext("securityProvider", exceptionHandler: MvcApplication.LogException));
            }
        }

        /// <summary>
        /// Gets db data context for model.
        /// </summary>
        public DataContext DbDataContext
        {
            get
            {
                return m_dbDataContext ?? (m_dbDataContext = new DataContext("thirdDb", exceptionHandler: MvcApplication.LogException));
            }
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Releases all the resources used by the <see cref="AppModel"/> object.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="AppModel"/> object and optionally releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!m_disposed)
            {
                try
                {
                    if (disposing)
                    {
                        m_securityDataContext?.Dispose();
                        m_dbDataContext?.Dispose();
                    }
                }
                finally
                {
                    m_disposed = true;  // Prevent duplicate dispose.
                }
            }
        }

        /// <summary>
        /// Renders client-side Javascript function for looking up value list values based on key.
        /// </summary>
        /// <param name="groupName">Value list group name as defined in ValueListGroup table.</param>
        /// <param name="valueListName">Name of associative array, defaults to <paramref name="groupName"/> + Values.</param>
        /// <param name="lookupFunctionName">Name of lookup function, defaults to lookup + <paramref name="groupName"/>.ToTitleCase() + Value.</param>
        /// <returns>Client-side Javascript lookup function.</returns>
        public string RenderValueListClientLookupFunction(string groupName, string valueListName = null, string lookupFunctionName = null)
        {
            StringBuilder javascript = new StringBuilder();

            if (string.IsNullOrWhiteSpace(valueListName))
                valueListName = $"{groupName}Values";

            if (string.IsNullOrWhiteSpace(lookupFunctionName))
                lookupFunctionName = $"lookup{groupName.ToTitleCase()}Value";

            // Do some minimal validation on identifier names
            valueListName = valueListName.RemoveWhiteSpace().RemoveControlCharacters();
            lookupFunctionName = lookupFunctionName.RemoveWhiteSpace().RemoveControlCharacters();

            javascript.AppendLine($"var {valueListName} = [];\r\n");

            int key = DataContext.Connection.ExecuteScalar<int?>("SELECT ID FROM ValueListGroup WHERE Name={0} AND Enabled <> 0", groupName) ?? 0;

            foreach (ValueList valueList in DataContext.Table<ValueList>().QueryRecords("SortOrder", new RecordRestriction("GroupID = {0} AND Enabled <> 0 AND Hidden = 0", key)))
            {
                javascript.AppendLine($"        {valueListName}[{valueList.Key}] = \"{valueList.Text.JavaScriptEncode()}\";");
            }

            javascript.AppendLine($"\r\n        function {lookupFunctionName}(value) {{");
            javascript.AppendLine($"            return {valueListName}[value];");
            javascript.AppendLine("        }");

            return javascript.ToString();
        }

        /// <summary>
        /// Generates template based select field based on reflected modeled table field attributes with values derived from ValueList table.
        /// </summary>
        /// <typeparam name="T">Modeled table for select field.</typeparam>
        /// <param name="groupName">Value list group name as defined in ValueListGroup table.</param>
        /// <param name="fieldName">Field name for value of select field.</param>
        /// <param name="optionLabelFieldName">Field name for label of option data, defaults to "Text"</param>
        /// <param name="optionValueFieldName">Field name for ID of option data, defaults to "Key".</param>
        /// <param name="optionSortFieldName">Field name for sort order of option data, defaults to "SortOrder"</param>
        /// <param name="fieldLabel">Label name for select field, pulls from <see cref="LabelAttribute"/> if defined, otherwise defaults to <paramref name="fieldName"/>.</param>
        /// <param name="fieldID">ID to use for select field; defaults to select + <paramref name="fieldName"/>.</param>
        /// <param name="groupDataBinding">Data-bind operations to apply to outer form-group div, if any.</param>
        /// <param name="labelDataBinding">Data-bind operations to apply to label, if any.</param>
        /// <param name="customDataBinding">Extra custom data-binding operations to apply to field, if any.</param>
        /// <param name="dependencyFieldName">Defines default "enabled" subordinate data-bindings based a single boolean field, e.g., a check-box.</param>
        /// <param name="optionDataBinding">Data-bind operations to apply to each option value, if any.</param>
        /// <param name="toolTip">Tool tip text to apply to field, if any.</param>
        /// <param name="initialFocus">Use field for initial focus.</param>
        /// <returns>Generated HTML for new text field based on modeled table field attributes.</returns>
        public string AddValueListSelectField<T>(string fieldName, string groupName, string optionLabelFieldName = "Text", string optionValueFieldName = "Key", string optionSortFieldName = "SortOrder", string fieldLabel = null, string fieldID = null, string groupDataBinding = null, string labelDataBinding = null, string customDataBinding = null, string dependencyFieldName = null, string optionDataBinding = null, string toolTip = null, bool initialFocus = false) where T : class, new()
        {
            int key = DataContext.Connection.ExecuteScalar<int?>("SELECT ID FROM ValueListGroup WHERE Name={0} AND Enabled <> 0", groupName) ?? 0;

            RecordRestriction restriction = new RecordRestriction("GroupID = {0} AND Enabled <> 0 AND Hidden = 0", key);

            return DataContext.AddSelectField<T, ValueList>(fieldName, optionValueFieldName, optionLabelFieldName, optionSortFieldName, fieldLabel, fieldID, groupDataBinding, labelDataBinding, null, customDataBinding, dependencyFieldName, optionDataBinding, toolTip, initialFocus, restriction);
        }

        /// <summary>
        /// Renders client-side configuration script for paged view model.
        /// </summary>
        /// <typeparam name="TModel">Modeled database table (or view).</typeparam>
        /// <param name="viewBag">ViewBag for the view.</param>
        /// <param name="defaultSortField">Default sort field name, defaults to first primary key field. Prefix field name with a minus, i.e., '-', to default to descending sort.</param>
        /// <param name="parentKeys">Primary keys values of the parent record to load.</param>
        /// <returns>Rendered paged view model configuration script.</returns>
        public string RenderViewModelConfiguration<TModel>(object viewBag, string defaultSortField = null, params object[] parentKeys) where TModel : class, new()
        {
            return DataContext.RenderViewModelConfiguration<TModel, DataHub>(viewBag, defaultSortField, "dataHub", parentKeys);
        }

        /// <summary>
        /// Configures a simple view with common view bag parameters based on page name.
        /// </summary>
        /// <param name="requestContext">Url.RequestContext for view.</param>
        /// <param name="pageName">Page name as defined in Page table.</param>
        /// <param name="viewBag">Current view bag.</param>
        /// <remarks>
        /// This is normally called from controller before returning view action result.
        /// </remarks>
        public void ConfigureView(RequestContext requestContext, string pageName, dynamic viewBag)
        {
            DataContext.ConfigureView(requestContext, viewBag);
            ConfigureView(pageName, viewBag);
        }

        /// <summary>
        /// Configures a view establishing user roles based on page name, modeled table <typeparamref name="TModel"/> and SignalR <see cref="DataHub"/>.
        /// </summary>
        /// <param name="requestContext">Url.RequestContext for view.</param>
        /// <param name="pageName">Page name as defined in Page table.</param>
        /// <param name="viewBag">Current view bag.</param>
        /// <remarks>
        /// This is normally called from controller before returning view action result.
        /// </remarks>
        public void ConfigureView<TModel>(RequestContext requestContext, string pageName, dynamic viewBag) where TModel : class, new()
        {
            DataContext.ConfigureView<TModel, DataHub>(requestContext, viewBag);
            ConfigureView(pageName, viewBag);
        }

        // Handles querying page details from Page table
        private void ConfigureView(string pageName, dynamic viewBag)
        {
            int pageID = SecurityDataContext.Connection.ExecuteScalar<int?>("SELECT ID FROM Page WHERE Name={0} AND Enabled <> 0", pageName ?? "") ?? 0;
            Page page = SecurityDataContext.Table<Page>().LoadRecord(pageID);
            Dictionary<string, string> pageSettings = (page?.ServerConfiguration ?? "").ParseKeyValuePairs();
            string pageImagePath = Path.ToAbsolute(GetPageSetting(viewBag, "pageImagePath").Replace("{pageName}", pageName ?? ""));
            pageImagePath = pageImagePath.EnsureEnd('/');

            viewBag.Page = page;
            viewBag.PageID = pageID;
            viewBag.PageName = pageName;
            viewBag.PageImagePath = pageImagePath;
            viewBag.PageSettings = pageSettings;
            viewBag.Title = page?.Title ?? (pageName == null ? "<pageName is undefined>" : $"<Page record for \"{pageName}\" does not exist>");
        }

        /// <summary>
        /// Gets overridden value from page settings dictionary (i.e., server configuration) if it exists, otherwise gets page default.
        /// </summary>
        /// <param name="viewBag">Page view bag.</param>
        /// <param name="key">Key name.</param>
        /// <param name="defaultValue">Default value.</param>
        /// <returns>Setting from page's server configuration if found, otherwise the default setting.</returns>
        public string GetPageSetting(dynamic viewBag, string key, string defaultValue = null)
        {
            return GetPageSetting(viewBag, Global.PageDefaults, key, defaultValue);
        }

        /// <summary>
        /// Gets overridden value from page settings dictionary (i.e., server configuration) if it exists, otherwise gets page default.
        /// </summary>
        /// <param name="viewBag">Page view bag.</param>
        /// <param name="globalSettings">Global settings dictionary.</param>
        /// <param name="key">Key name.</param>
        /// <param name="defaultValue">Default value.</param>
        /// <returns>Setting from page's server configuration if found, otherwise the default setting.</returns>
        public string GetPageSetting(dynamic viewBag, Dictionary<string, string> globalSettings, string key, string defaultValue = null)
        {
            return GetPageSetting(viewBag.PageSettings as Dictionary<string, string>, globalSettings, key, defaultValue);
        }

        /// <summary>
        /// Gets overridden value from page settings dictionary (i.e., server configuration) if it exists, otherwise gets page default.
        /// </summary>
        /// <param name="pageSettings">Page settings dictionary.</param>
        /// <param name="globalSettings">Global settings dictionary.</param>
        /// <param name="key">Key name.</param>
        /// <param name="defaultValue">Default value.</param>
        /// <returns>Setting from page's server configuration if found, otherwise the default setting.</returns>
        public string GetPageSetting(Dictionary<string, string> pageSettings, Dictionary<string, string> globalSettings, string key, string defaultValue = null)
        {
            string value = defaultValue;

            if (!(pageSettings?.TryGetValue(key, out value) ?? false))
                if (!(globalSettings?.TryGetValue(key, out value) ?? false) || string.IsNullOrEmpty(value))
                    value = defaultValue;

            return value;
        }

        #endregion
    }
}
