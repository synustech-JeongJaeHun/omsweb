using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.IO;

namespace OMSWeb.OMSSettings
{
    sealed class AppConfig
    {
        public static IConfiguration Configuration;
        public static string AppSettingsPath = string.Empty;
        public static string IniPath = string.Empty;

        public AppConfig()
        {
        }

        public static IConfiguration Init()
        {
            string module_name = Process.GetCurrentProcess().MainModule.FileName;
            string currentDirectory = Path.GetDirectoryName(module_name);
            AppSettingsPath = Path.GetFullPath(Path.Combine(currentDirectory, "appsettings.json"));

            Configuration = new ConfigurationBuilder()
                                .AddJsonFile(AppSettingsPath, optional: false, reloadOnChange: false).Build();

            OMSConfigSettings omsConfigSettings = new OMSConfigSettings();
            Configuration.GetSection(nameof(OMSConfigSettings)).Bind(omsConfigSettings);

            if (!string.IsNullOrWhiteSpace(omsConfigSettings.Path))
                IniPath = Path.GetFullPath(Path.Combine(currentDirectory, omsConfigSettings.Path));

            return Configuration;
        }

        public static string GetFromOMSConfig(string section, string key, string defaultVal)
        {
            string value = defaultVal;
            if (File.Exists(IniPath))
            {
                try
                {
                    var dic = INIFile.GetData(IniPath);
                    string mulkey = string.Format("{0}-{1}", section, key);
                    value = dic.ContainsKey(mulkey) ? dic[mulkey] : defaultVal;

                    return value;
                }
                catch (Exception)
                {
                    //Console.WriteLine("DataAccess() : " + e.Message);
                }
            }

            return value;
        }

        public static void GetConnectStrFromOmsSettings(out string connectUiStr, out string connectTrackStr)
        {
            string host = AppConfig.GetFromOMSConfig("DB", "host", "localhost");
            string port = AppConfig.GetFromOMSConfig("DB", "port", "5432");
            string user = AppConfig.GetFromOMSConfig("DB", "user", "oms");
            string pass = AppConfig.GetFromOMSConfig("DB", "pass", "oms");
            string name = AppConfig.GetFromOMSConfig("DB", "name", "semi_test");

            //"OMS-UI": "Server=127.0.0.1;Port=5432;Database=oms_ui;User Id=oms;Password=oms;",
            //"OMS-Track": "Server=127.0.0.1;Port=5432;Database=semioht;User Id=oms;Password=oms;"
            connectUiStr = string.Format("Server={0};Port={1};Database=oms_ui;User Id={2};Password={3};", host, port, user, pass);
            connectTrackStr = string.Format("Server={0};Port={1};Database={2};User Id={3};Password={4};", host, port, name, user, pass);
        }
    }
}
