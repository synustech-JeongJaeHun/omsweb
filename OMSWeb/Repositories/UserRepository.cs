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

    public UserEntity GetUserByUserId(string userId)
    {
      var sql = $@"
      SELECT id, user_id, first_name, last_name, email, password,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE user_id = @userId";
      UserEntity user;
      using (var conn = ConnectUi())
      {
        user = conn.Query<UserEntity>(sql, new {
          userId = userId
        }).SingleOrDefault();
      }
      return user;
    }

    public UserEntity GetUserById(string id)
    {
      var sql = $@"
      SELECT id, user_id, first_name, last_name, email, password,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE id = @id ::uuid";
      UserEntity user;
      using (var conn = ConnectUi())
      {
        user = conn.Query<UserEntity>(sql, new {
          id = id
        }).SingleOrDefault();
      }
      return user;
    }

    public UserEntity GetUserByEmail(string email)
    {
      var sql = $@"
      SELECT id, user_id, first_name, last_name, email, password,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE email = '{email}'";
      UserEntity user;
      using (var conn = ConnectUi())
      {
        user = conn.Query<UserEntity>(sql).SingleOrDefault();
      }
      return user;
    }

    public IQueryable<UserEntity> QueryUsers()
    {
      var sql = @"
    SELECT users.id, users.user_id, first_name, last_name, email, '****' as password, 
    array_remove(array_agg(DISTINCT role_id),NULL) AS roles, 
    array_remove(array_agg(DISTINCT permission_id),NULL) AS permissions
    FROM (
        SELECT users.user_id, users.role_id as role_id, permission_id
        FROM role_permissions
        JOIN permissions ON role_permissions.permission_id = permissions.id
        RIGHT JOIN user_roles AS users ON role_permissions.role_id = users.role_id
    ) AS permissions
    RIGHT JOIN users ON permissions.user_id = users.id
    LEFT JOIN roles ON permissions.role_id = roles.id
    --*user_condition*
    GROUP BY users.id, users.user_id, first_name, last_name, email, password
      ";
      IQueryable<UserEntity> result;
      using (var conn = ConnectUi())
      {
        result = conn.Query<UserEntity>(sql).AsQueryable();
      }
      return result;
    }

    public IQueryable<RoleEntity> QueryRoles()
    {
      var sql = "select id, name from roles";
      IQueryable<RoleEntity> result;
      using (var conn = ConnectUi())
      {
        result = conn.Query<RoleEntity>(sql).AsQueryable();
      }
      return result;
    }
    public IQueryable<RoleEntity> QueryRolesWithPermissions()
    {
      var sql = @"
      select id, name,
      array_agg(DISTINCT permission_id) as permissions
      from roles INNER JOIN role_permissions ON role_permissions.role_id = roles.id 
      GROUP BY id, name
      ";
      IQueryable<RoleEntity> result;
      using (var conn = ConnectUi())
      {
        result = conn.Query<RoleEntity>(sql).AsQueryable();
      }
      return result;
    }
    public IQueryable<PermissionEntity> QueryPermissions()
    {
      var sql = "select id, name from permissions";
      IQueryable<PermissionEntity> result;
      using (var conn = ConnectUi())
      {
        result = conn.Query<PermissionEntity>(sql).AsQueryable();
      }
      return result;
    }
  }
}