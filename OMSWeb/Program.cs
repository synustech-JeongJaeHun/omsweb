using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using OMSWeb.OMSSettings;
using System.Diagnostics;
using System.IO;

namespace OMSWeb
{
    public class Program
    {
        public static void Main(string[] args)
        {

#if DEBUG
            string module_name = Process.GetCurrentProcess().MainModule.FileName;
            string path = Path.GetDirectoryName(module_name);
#else
            string module_name = Process.GetCurrentProcess().MainModule.FileName;
            string path = Path.GetDirectoryName(module_name);
            Directory.SetCurrentDirectory(path);
#endif

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    hostContext.Configuration = AppConfig.Init();
                })
                .ConfigureWebHost(x => x.UseUrls("http://0.0.0.0:5000"))
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .UseWindowsService();
    }
}
