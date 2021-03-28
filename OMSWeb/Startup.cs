using System;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using OMSWeb.Handlers;
using OMSWeb.Hubs;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;
using OMSWeb.Services;

namespace OMSWeb
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<OmsUiDbContext>(options => options.UseNpgsql("OMS-UI"));
      services.AddDbContext<OmsTrackDbContext>(options => options.UseNpgsql("OMS-Track"));

      // services.AddControllersWithViews();

      // json options
      services.AddControllers().AddNewtonsoftJson(options =>
      {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
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
      services.AddScoped<CycleRepository>();
      services.AddScoped<HistoryRepository>();
      services.AddScoped<MessageRepository>();
      services.AddScoped<MetricsRepository>();
      services.AddScoped<OrderRepository>();
      services.AddScoped<PlaybackRepository>();
      services.AddScoped<StatusRepository>();
      services.AddScoped<SystemsRepository>();
      services.AddScoped<TrackRepository>();
      services.AddScoped<UserRepository>();
      services.AddScoped<VehicleRepository>();

      services.AddScoped<StatusService>();
      services.AddScoped<OrderService>();

      services.AddSingleton<TrackRepository>();
      services.AddSingleton<TrackService>();
      services.AddSingleton<PushService>();
      services.AddSingleton<CacheService>();
      // services.AddTransient<ProblemDetailsFactory, OmsProblemDetailsFactory>();  // @TODO problem handler 작성 후 사용
      #endregion

      #region SignalR
      services.AddSignalR();
      #endregion

      services.AddHostedService<DataWatcherService>();

      services.AddTransient<ProblemDetailsFactory, OmsProblemDetailsFactory>();

      // In production, the Angular files will be served from this directory
      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/dist";
      });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      app.UseOmsExceptionHandler();

      if (env.IsDevelopment())
      {
        // app.UseDeveloperExceptionPage();
      }
      else
      {
        // app.UseExceptionHandler("/Error");
      }

      app.UseStaticFiles();
      if (!env.IsDevelopment())
      {
        app.UseSpaStaticFiles();
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

        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
        {
          spa.UseAngularCliServer(npmScript: "start");
        }
      });
    }
  }
}
