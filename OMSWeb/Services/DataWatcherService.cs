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
      // var cmd = trackConn.CreateCommand();
      // cmd.CommandText = "LISTEN monitor_track";
      // cmd.ExecuteNonQuery();
      using (var cmd = trackConn.CreateCommand())
      {
        cmd.CommandText = "LISTEN monitor_track";
        cmd.ExecuteNonQuery();
      }
      this.trackConn.Notification += this.NotificationReceivedAsync;

      Console.WriteLine("### Data Watcher started");
      while (!stoppingToken.IsCancellationRequested)
      {
        await trackConn.WaitAsync();
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
      await this._pushSvc.PushWatcherEventAsync(e.Payload);
    }
  }
}