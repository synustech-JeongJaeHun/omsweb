using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace OMSWeb
{
    public class Program
    {
        public static void Main(string[] args)
        {
            /*
            string module_name = Process.GetCurrentProcess().MainModule.FileName;
            string path = Path.GetDirectoryName(module_name);
            Directory.SetCurrentDirectory(path);
            */

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                //.ConfigureWebHost(x => x.UseUrls("http://0.0.0.0:5001"))
                .ConfigureWebHost(x => x.UseUrls("http://0.0.0.0:5000"))
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .UseWindowsService();
    }
}
