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
            // get default AppSetting.json
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
            this.connectionStringUi = configuration.GetConnectionString("OMS-UI");
            this.connectionStringTrack = configuration.GetConnectionString("OMS-Track");

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