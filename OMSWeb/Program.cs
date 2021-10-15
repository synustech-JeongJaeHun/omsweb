using System;
using System.Collections.Generic;
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
            //Console.WriteLine("### Version 1.0.0.2 - dependant dotnetcoreapp 3.1");
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                //.ConfigureWebHost(x => x.UseUrls("http://0.0.0.0:5001"))
                .ConfigureWebHost(x => x.UseUrls("http://0.0.0.0:5000"))
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
