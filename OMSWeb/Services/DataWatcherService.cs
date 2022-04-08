using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Serialization;
// using Newtonsoft.Json;
// using Newtonsoft.Json.Serialization;
using Npgsql;
using OMSWeb.Models;
using OMSWeb.OMSSettings;
using OMSWeb.Repositories;

#pragma warning disable 0168

namespace OMSWeb.Services
{
    public class DataWatcherService : BackgroundService
    {
        private NpgsqlConnection trackConn;
        private PushService _pushSvc;
        protected string connectionStringTrack;

        public DataWatcherService(IConfiguration configuration, PushService pushSvc)
        {
            // get default AppSetting.json
            this.connectionStringTrack = configuration.GetConnectionString("OMS-Track");

            // get config from oms_settings.ini
            if (OMSConfigSettings.GetConnectStrFromOmsSettings(configuration, out string connectUiStr, out string connectTrackStr))
            {
                this.connectionStringTrack = connectTrackStr;
            }

            this.trackConn = new NpgsqlConnection(this.connectionStringTrack);
            this._pushSvc = pushSvc;
        }

        private bool GetOmsSettings(IConfiguration configuration, out string connectUiStr, out string connectTrackStr)
        {
            OMSConfigSettings omsConfigSettings = new OMSConfigSettings();
            configuration.GetSection(nameof(OMSConfigSettings)).Bind(omsConfigSettings);

            if (!String.IsNullOrWhiteSpace(omsConfigSettings.Path))
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

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            this.trackConn.Open();
            this.trackConn.Notification += this.NotificationReceivedAsync;

            using (var cmd = trackConn.CreateCommand())
            {
                cmd.CommandText = "LISTEN monitor_track";
                cmd.ExecuteNonQuery();
            }

            Console.WriteLine("### Data Watcher started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await trackConn.WaitAsync();
                }
                catch (System.Exception e)
                {
                    Console.WriteLine($"@@@ Error : {e}");
                    // throw;
                }
            }
        }

        public override void Dispose()
        {
            if (this.trackConn != null && this.trackConn.State != System.Data.ConnectionState.Closed)
            {
                this.trackConn.Close();
                this.trackConn.Dispose();
            }
            Console.WriteLine("## Watcher disposed.");
            base.Dispose();
        }

        private async void NotificationReceivedAsync(object sender, NpgsqlNotificationEventArgs e)
        {
            var now = DateTime.Now;
            var ts = now.Ticks;
            // if ((ts / (10 ^ 7)) % 10 == 0)
            // {
            //   Console.ForegroundColor = ConsoleColor.DarkGray;
            //   Console.WriteLine($"[PUSH] {0,8:N2} ~\t00 event => {now}");
            //   Console.ResetColor();
            // }
            // var payload = e.Payload;
            // if (payload.Contains("vehicles"))
            // {
            //   Console.WriteLine($"# DB Notify >> {e.Payload}");
            // }
            // return;
            try
            {
                await this._pushSvc.PushWatcherEventAsync(ts, e.Payload);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[Notification Error] {ex}");
            }
        }
    }
}