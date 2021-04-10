using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
  public class UserRepository : DataAccess
  {
    public UserRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public UserEntity GetUserByEmail(string email)
    {
      var sql = $@"
      SELECT id, first_name, last_name, email, password,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE email = '{email}'";
      UserEntity user;
      using (var conn = ConnectUi()) {
        user = conn.Query<UserEntity>(sql).SingleOrDefault();
      }
      return user;
    }
  }
}