using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;
using OMSWeb.OMSSettings;

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
            /*
            // appsettings.json
            //"ConnectionStrings": {
            //    "OMS-UI": "Server=localhost;Port=5432;Database=oms_ui;User Id=oms;Password=oms;",
            //    "OMS-Track": "Server=localhost;Port=5432;Database=semioht;User Id=oms;Password=oms;"
            //},
            */
            // get default AppSetting.json
            //this.connectionStringTrack = configuration.GetConnectionString("OMS-Track");

            // get config from oms_settings.ini
            AppConfig.GetConnectStrFromOmsSettings(out string connectUiStr, out string connectTrackStr);
            this.connectionStringTrack = connectTrackStr;

            this.trackConn = new NpgsqlConnection(this.connectionStringTrack);
            this._pushSvc = pushSvc;
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
                    if (trackConn.State == System.Data.ConnectionState.Closed)
                    {
                        trackConn.Open();
                    }

                    await trackConn.WaitAsync();
                }
                catch (System.Exception e)
                {
                    Console.WriteLine($"@@@ Error : {e}");
                    Thread.Sleep(10);
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