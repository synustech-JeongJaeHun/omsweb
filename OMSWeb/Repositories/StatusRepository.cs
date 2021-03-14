using Microsoft.Extensions.Configuration;
using Npgsql;

namespace OMSWeb.Repositories
{
  public class StatusRepository : DataAccess
  {
    public StatusRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public string Test() {
      string value;
      using (var conn = ConnectUi()) {
        string sql = "SELECT NAME FROM roles LIMIT 1";
        using (var cmd = new NpgsqlCommand(sql, conn)) {
          conn.Open();
          value = cmd.ExecuteScalar().ToString();
        }
      }
      return value;
    }
  }
}