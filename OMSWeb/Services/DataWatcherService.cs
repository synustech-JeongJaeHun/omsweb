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
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class DataWatcherService : BackgroundService
  {
    private NpgsqlConnection trackConn;
    private PushService _pushSvc;

    public DataWatcherService(IConfiguration configuration, PushService pushSvc)
    {
      this.trackConn = new NpgsqlConnection(configuration.GetConnectionString("OMS-Track"));
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