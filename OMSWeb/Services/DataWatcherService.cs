using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;
using OMSWeb.OMSSettings;

namespace OMSWeb.Services
{
    public class DataWatcherService : BackgroundService
    {
        private bool NeedReConnect = false;
        private NpgsqlConnection trackConn;
        private PushService _pushSvc;
        protected string connectionStringTrack;

        public DataWatcherService(IConfiguration _, PushService pushSvc)
        {
            AppConfig.GetConnectStrFromOmsSettings(out string _, out string connectTrackStr);
            connectionStringTrack = connectTrackStr;

            CreateDBConnect();
            _pushSvc = pushSvc;
        }

        protected bool IsNotConnectedDB()
        {
            return
                trackConn == null ||
                trackConn.State == System.Data.ConnectionState.Closed ||
                trackConn.State == System.Data.ConnectionState.Broken;
        }

        protected bool CreateDBConnect()
        {
            try
            {
                if (IsNotConnectedDB() || NeedReConnect)
                {
                    trackConn = new NpgsqlConnection(connectionStringTrack);
                }
            }
            catch
            {
                return false;
            }

            return true;
        }

        protected bool DBOpen()
        {
            try
            {
                trackConn.Open();
            }
            catch
            {
                return false;
            }

            return true;
        }

        protected bool RegisterDBNotification()
        {
            try
            {
                trackConn.Notification += NotificationReceivedAsync;

                using var cmd = trackConn.CreateCommand();
                cmd.CommandText = "LISTEN monitor_track";
                cmd.ExecuteNonQuery();
            }
            catch
            {
                return false;
            }

            return true;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            DBOpen();
            RegisterDBNotification();

            Console.WriteLine("### Data Watcher started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await trackConn.WaitAsync();
                }
                catch (Exception e)
                {
                    Console.WriteLine($"@@@ Error : {e}");
                    Thread.Sleep(1000);

                    NeedReConnect = true;
                    if (CreateDBConnect())
                    {
                        if (DBOpen())
                        {
                            if (RegisterDBNotification())
                            {
                                NeedReConnect = false;
                                Console.WriteLine($"@@@ Reconnect Success.");
                            }
                            else
                            {
                                Console.WriteLine($"@@@ Reconnect Register Notification Fail.");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"@@@ Reconnect Open Fail.");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"@@@ Reconnect Create Fail.");
                    }
                }
            }
        }

        public override void Dispose()
        {
            if (trackConn != null && trackConn.State != System.Data.ConnectionState.Closed)
            {
                trackConn.Close();
                trackConn.Dispose();
            }
            Console.WriteLine("## Watcher disposed.");
            base.Dispose();
        }

        private async void NotificationReceivedAsync(object sender, NpgsqlNotificationEventArgs e)
        {
            var now = DateTime.Now;
            var ts = now.Ticks;

            try
            {
                await _pushSvc.PushWatcherEventAsync(ts, e.Payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Notification Error] {ex}");
            }
        }
    }
}