using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using OMSWeb.Handlers;
using OMSWeb.Hubs;
using OMSWeb.Models;
using OMSWeb.Repositories;
using OMSWeb.Services;
using OMSWeb.MqttSettings;
using OMSWeb.Extensions;
using OMSWeb.OMSSettings;
using System.IO;
using System.Diagnostics;

namespace OMSWeb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

            OmsConfiguration();
        }

        public IConfiguration Configuration { get; }

        private void OmsConfiguration()
        {
            // from default Appsettings.json
            MqttConfiguration();

            // set MqttAppSettingsProvider
            MqttAppSettingsProvider.BrokerHostSettings = new BrokerHostSettings(
                    AppConfig.GetFromOMSConfig("MessageManager", "host", "localhost"),
                    Convert.ToInt32(AppConfig.GetFromOMSConfig("MessageManager", "port", "1883")),
                    AppConfig.GetFromOMSConfig("MessageManager", "topic_root", "oms")
                );
            //MqttAppSettingsProvider.ClientSettings은 추후 보완시, 추가 예정
        }

        private void MqttConfiguration()
        {
            MqttBrokerSettings();
            MqttClientSettings();
        }

        private void MqttBrokerSettings()
        {
            BrokerHostSettings brokerHostSettings = new BrokerHostSettings();
            Configuration.GetSection(nameof(BrokerHostSettings)).Bind(brokerHostSettings);
            MqttAppSettingsProvider.BrokerHostSettings = brokerHostSettings;
        }

        private void MqttClientSettings()
        {
            MqttClientSettings clientSettings = new MqttClientSettings();
            Configuration.GetSection(nameof(ClientSettings)).Bind(clientSettings);
            MqttAppSettingsProvider.ClientSettings = clientSettings;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // services.AddControllersWithViews();

            // json options
            services.AddControllers().AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                options.SerializerSettings.DateFormatHandling = DateFormatHandling.MicrosoftDateFormat;
                options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                // options.SerializerSettings.ContractResolver = new DefaultContractResolver { NamingStrategy = new SnakeCaseNamingStrategy() };
            });

            // load appSettings
            var appSettingsSection = Configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettingsSection);
            var appSettings = appSettingsSection.Get<AppSettings>();

            #region configure jwt authentication
            var jwtKey = Encoding.ASCII.GetBytes(appSettings.JwtSecret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
              .AddJwtBearer(x =>
              {
                  x.RequireHttpsMetadata = false;
                  x.SaveToken = true;
                  x.TokenValidationParameters = new TokenValidationParameters
                  {
                      ValidateIssuerSigningKey = true,
                      IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
                      ValidateIssuer = false,
                      ValidateAudience = false,
                      ClockSkew = TimeSpan.Zero,
                  };
              });
            #endregion

            services.AddHttpContextAccessor();
            services.AddMemoryCache();

            #region DI
            services.AddScoped<UserRepository>();
            services.AddScoped<AlarmRepository>();
            services.AddScoped<AlertRepository>();
            services.AddScoped<HistoryRepository>();
            services.AddScoped<MessageRepository>();
            services.AddScoped<OrderRepository>();
            services.AddScoped<PlaybackRepository>();
            services.AddScoped<StatusRepository>();
            services.AddScoped<TrackRepository>();
            services.AddScoped<UserRepository>();
            services.AddScoped<ModeStateRepository>();
            services.AddScoped<ModuleStatusRepository>();
            services.AddScoped<SettingsRepository>();
            services.AddScoped<VehicleRepository>();
            services.AddScoped<ReportRepository>();
            services.AddScoped<ReportNormaltrRepository>();
            services.AddScoped<ReportAbnormaltrRepository>();
            services.AddScoped<ReportAlarmRepository>();
            services.AddScoped<ReportTrendReposity>();

            services.AddScoped<ModuleStatusService>();
            services.AddScoped<StatusService>();
            services.AddScoped<OrderService>();
            services.AddScoped<NotificationsService>();
            services.AddScoped<MessageService>();
            services.AddScoped<HistoryService>();
            services.AddScoped<UserService>();
            services.AddScoped<PlaybackService>();
            services.AddScoped<SettingsService>();
            services.AddScoped<VehicleService>();
            services.AddScoped<ReportService>();

            services.AddSingleton<SystemsService>();
            services.AddSingleton<ModuleStatusRepository>();
            services.AddSingleton<ModeStateRepository>();
            services.AddSingleton<TrackRepository>();
            services.AddSingleton<TrackService>();
            services.AddSingleton<PushService>();
            services.AddSingleton<CacheService>();

            // services.AddTransient<ProblemDetailsFactory, OmsProblemDetailsFactory>();  // @TODO problem handler 작성 후 사용
            #endregion

            #region mqtt
            services.AddMqttClientHostedService();
            services.AddSingleton<ExtarnalService>();
            #endregion

            #region SignalR
            services.AddSignalR();
            #endregion

            services.AddHostedService<DataWatcherService>();

            services.AddTransient<ProblemDetailsFactory, OmsProblemDetailsFactory>();

            services.AddMvcCore(o =>
            {
                o.Filters.Add(new ResponseCacheAttribute { NoStore = true, Location = ResponseCacheLocation.None });
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
#if DEBUG
                configuration.RootPath = "frontend/packages/app/dist";
#else
                string module_name = Process.GetCurrentProcess().MainModule.FileName;
                string currentDirectory = Path.GetDirectoryName(module_name);
                string RootPath = Path.GetFullPath(Path.Combine(currentDirectory, "./frontend/packages/app/dist"));
                configuration.RootPath = RootPath;
#endif
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseOmsExceptionHandler();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = context =>
                {
                    context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
                    context.Context.Response.Headers.Add("Expires", "-1");
                }
            });

            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles(new StaticFileOptions
                {
                    OnPrepareResponse = context =>
                    {
                        context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                        context.Context.Response.Headers.Add("Expires", "0");
                        context.Context.Response.Headers.Add("Pragma", "no-cache");
                    }
                });
            }

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            // @NOTE guard 정의 (optional)

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<OMSHub>("/hubs/oms");
                endpoints.MapControllerRoute(
                          name: "default",
                          pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "frontend/";

                if (env.IsDevelopment())
                {
                    var isProxy = Configuration.GetSection("Proxy").Get<Boolean>();
                    if (isProxy)
                    {
                        spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                    }
                    else
                    {
                        spa.UseAngularCliServer(npmScript: "start");
                    }

                }
            });
        }
    }
}
