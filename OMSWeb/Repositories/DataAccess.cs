using System;
using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.OMSSettings;

namespace OMSWeb.Repositories
{
    public abstract class DataAccess
    {
        protected string connectionStringUi;
        protected string connectionStringTrack;

        public DataAccess(IConfiguration configuration)
        {
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
            this.connectionStringUi = configuration.GetConnectionString("OMS-UI");
            this.connectionStringTrack = configuration.GetConnectionString("OMS-Track");

                        
            OMSConfigSettings omsConfigSettings = new OMSConfigSettings();
            configuration.GetSection(nameof(OMSConfigSettings)).Bind(omsConfigSettings);

            if (!String.IsNullOrWhiteSpace(omsConfigSettings.Path))
            {
                var dic = INIFile.GetData(omsConfigSettings.Path);
                try
                {
                    string host = dic["DB-host"];
                    string port = dic["DB-port"];
                    string user = dic["DB-user"];
                    string pass = dic["DB-pass"];
                    string name = dic["DB-name"];

                    if (!String.IsNullOrWhiteSpace(host) &&
                        !String.IsNullOrWhiteSpace(port) &&
                        !String.IsNullOrWhiteSpace(user) &&
                        !String.IsNullOrWhiteSpace(pass) &&
                        !String.IsNullOrWhiteSpace(name))
                    {
                        //"OMS-UI": "Server=127.0.0.1;Port=5432;Database=oms_ui;User Id=oms;Password=oms;",
                        //"OMS-Track": "Server=127.0.0.1;Port=5432;Database=semioht;User Id=oms;Password=oms;"
                        this.connectionStringUi = string.Format("Server={0};Port={1};Database=oms_ui;User Id={2};Password={3};", host, port, user, pass);
                        this.connectionStringTrack = string.Format("Server={0};Port={1};Database={2};User Id={3};Password={4};", host, port, name, user, pass);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("DataAccess() : " + e.Message);
                }
            }
        }

        protected NpgsqlConnection ConnectUi()
        {
            return new NpgsqlConnection(this.connectionStringUi);
        }
        protected NpgsqlConnection ConnectTrack()
        {
            return new NpgsqlConnection(this.connectionStringTrack);
        }
    }
}