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
            /*
            // appsettings.json
            //"ConnectionStrings": {
		    //    "OMS-UI": "Server=localhost;Port=5432;Database=oms_ui;User Id=oms;Password=oms;",
		    //    "OMS-Track": "Server=localhost;Port=5432;Database=semioht;User Id=oms;Password=oms;"
	        //},
            */
            // get default AppSetting.json
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
            //this.connectionStringUi = configuration.GetConnectionString("OMS-UI");
            //this.connectionStringTrack = configuration.GetConnectionString("OMS-Track");
            

            // get config from oms_settings.ini
            AppConfig.GetConnectStrFromOmsSettings(out string connectUiStr, out string connectTrackStr);
            this.connectionStringUi = connectUiStr;
            this.connectionStringTrack = connectTrackStr;
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