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
        static IConfiguration configuration;
        static int WebUIPort;
        const int DefaultWebUIPort = 5000; // 추후 80 번으로 변경 필요
        public static void Main(string[] args)
        {
            configuration = AppConfig.Init();
            try
            {
                int value = configuration.GetValue<int>("AppSettings:WebUIPort");
                if (value > 0)
                    WebUIPort = value;
                else
                    WebUIPort = DefaultWebUIPort;
            }
            catch { WebUIPort = DefaultWebUIPort; }
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
                    hostContext.Configuration = configuration;
                })
                .ConfigureWebHost(x => x.UseUrls($"http://0.0.0.0:{WebUIPort}"))
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .UseWindowsService();
    }
}
