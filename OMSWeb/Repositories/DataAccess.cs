using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

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