using GSF.Configuration;
using GSF.IO;
using GSF.Web.Security;
using GSF.Reflection;
using System.IO;
using GSF;

namespace PQDashboard
{
    public static class Common
    {
        private static string s_applicationName;
        private static string s_anonymousResourceExpression;

        public static string ApplicationName => s_applicationName ??= GetApplicationName();

        public static string AnonymousResourceExpression => s_anonymousResourceExpression ??= GetAnonymousResourceExpression();

        public static bool LogEnabled => GetLogEnabled();

        public static string LogPath => GetLogPath();

        public static int MaxLogFiles => GetMaxLogFiles();

        private static string GetApplicationName() =>
            // Try database configured application name (if loaded yet)
            MvcApplication.DefaultModel.Global.ApplicationName ??
            // Fall back on setting defined in web.config
            GetSettingValue("SecurityProvider", "ApplicationName", "GSF Authentication");

        private static string GetAnonymousResourceExpression() =>
            GetSettingValue("SystemSettings", "AnonymousResourceExpression", AuthenticationOptions.DefaultAnonymousResourceExpression);

        private static bool GetLogEnabled() =>
            GetSettingValue("SystemSettings", "LogEnabled", AssemblyInfo.ExecutingAssembly.Debuggable.ToString()).ParseBoolean();

        private static string GetLogPath() =>
            GetSettingValue("SystemSettings", "LogPath", string.Format("{0}{1}Logs{1}", FilePath.GetAbsolutePath(""), Path.DirectorySeparatorChar));

        private static int GetMaxLogFiles() =>
            int.TryParse(GetSettingValue("SystemSettings", "MaxLogFiles", "300"), out int maxLogFiles) ? maxLogFiles : 300;

        private static string GetSettingValue(string section, string keyName, string defaultValue)
        {
            try
            {
                ConfigurationFile config = ConfigurationFile.Current;
                CategorizedSettingsElementCollection settings = config.Settings[section];
                return settings[keyName, true].ValueAs(defaultValue);
            }
            catch
            {
                return defaultValue;
            }
        }
    }
}