using Microsoft.Extensions.Configuration;
using System;

namespace OMSWeb.OMSSettings
{
    public class OMSConfigSettings
    {
        public string Path { set; get; }

        public OMSConfigSettings()
        {
        }

        public static bool GetConnectStrFromOmsSettings(IConfiguration configuration, out string connectUiStr, out string connectTrackStr)
        {
            OMSConfigSettings omsConfigSettings = new OMSConfigSettings();
            configuration.GetSection(nameof(OMSConfigSettings)).Bind(omsConfigSettings);

            if (!string.IsNullOrWhiteSpace(omsConfigSettings.Path))
            {
                try
                {
                    var dic = INIFile.GetData(omsConfigSettings.Path);
                    string host = dic.ContainsKey("DB-host") ? dic["DB-host"] : string.Empty;
                    string port = dic.ContainsKey("DB-port") ? dic["DB-port"] : string.Empty;
                    string user = dic.ContainsKey("DB-user") ? dic["DB-user"] : string.Empty;
                    string pass = dic.ContainsKey("DB-pass") ? dic["DB-pass"] : string.Empty;
                    string name = dic.ContainsKey("DB-name") ? dic["DB-name"] : string.Empty;

                    if (!String.IsNullOrWhiteSpace(host) && !String.IsNullOrWhiteSpace(port) &&
                        !String.IsNullOrWhiteSpace(user) && !String.IsNullOrWhiteSpace(pass) &&
                        !String.IsNullOrWhiteSpace(name))
                    {
                        //"OMS-UI": "Server=127.0.0.1;Port=5432;Database=oms_ui;User Id=oms;Password=oms;",
                        //"OMS-Track": "Server=127.0.0.1;Port=5432;Database=semioht;User Id=oms;Password=oms;"
                        connectUiStr = string.Format("Server={0};Port={1};Database=oms_ui;User Id={2};Password={3};", host, port, user, pass);
                        connectTrackStr = string.Format("Server={0};Port={1};Database={2};User Id={3};Password={4};", host, port, name, user, pass);

                        return true;
                    }
                }
                catch (Exception e)
                {
                    //Console.WriteLine("DataAccess() : " + e.Message);
                }
            }
            connectUiStr = string.Empty;
            connectTrackStr = string.Empty;

            return false;
        }
    }
}
