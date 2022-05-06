using System;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models;
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
      SELECT id, user_id, first_name, last_name, email, password, time_created,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE user_id = @userId";
      UserEntity user;
      using (var conn = ConnectUi())
      {
        user = conn.Query<UserEntity>(sql, new
        {
          userId = userId
        }).SingleOrDefault();
      }
      return user;
    }

    public UserEntity GetUserById(string id)
    {
      var sql = $@"
      SELECT id, user_id, first_name, last_name, email, password, time_created,
  ARRAY(SELECT DISTINCT role_id FROM user_roles WHERE user_id=id ORDER BY role_id ASC) AS roles,
  ARRAY(SELECT DISTINCT permission_id FROM role_permissions INNER JOIN user_roles ON role_permissions.role_id = user_roles.role_id AND user_roles.user_id=id ORDER BY permission_id ASC) as permissions
  FROM users WHERE id = @id ::uuid";
      UserEntity user;
      using (var conn = ConnectUi())
      {
        user = conn.Query<UserEntity>(sql, new
        {
          id = id
        }).SingleOrDefault();
      }
      return user;
    }

    public UserEntity GetUserByEmail(string email)
    {
      var sql = $@"
      SELECT id, user_id, first_name, last_name, email, password, time_created,
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
    SELECT users.id, users.user_id, first_name, last_name, email, '****' as password, time_created,
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

    public int AddUser(AccountFormDto accountFormDto)
    {
      int result = -1;

      var insertUserSql = @"
      INSERT INTO users (id, user_id, first_name, last_name, email, password, time_created)
      VALUES (@id, @user_id, @first_name, @last_name, @email, @password, now());
      ";

      var insertUserRoleSql = @"
      INSERT INTO user_roles (user_id, role_id)
      VALUES (@id, @role_id);
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(insertUserSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
            cmd.Parameters.AddWithValue("user_id", accountFormDto.UserId);
            cmd.Parameters.AddWithValue("first_name", accountFormDto.FirstName);
            cmd.Parameters.AddWithValue("last_name", accountFormDto.LastName);
            cmd.Parameters.AddWithValue("email", accountFormDto.Email);
            cmd.Parameters.AddWithValue("password", accountFormDto.Password);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        foreach (int roleId in accountFormDto.Roles)
        {
          using (var cmd = new NpgsqlCommand(insertUserRoleSql, conn))
          {
            try
            {
              cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
              cmd.Parameters.AddWithValue("role_id", roleId);

              cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
              trans.Rollback();
              throw ex;
            }
          }
        }
        trans.Commit();
      }
      return result;
    }

    public int UpdateUser(Guid id, ProfileFormDto profileFormDto)
    {
      var result = -1;
      var updateUserSql = @"
        UPDATE users 
        SET 
          first_name = @first_name, 
          last_name = @last_name, 
          email = @email, 
          password = @password 
        WHERE id = @id;
        ";
      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(updateUserSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("first_name", profileFormDto.FirstName);
            cmd.Parameters.AddWithValue("last_name", profileFormDto.LastName);
            cmd.Parameters.AddWithValue("email", profileFormDto.Email);
            cmd.Parameters.AddWithValue("password", profileFormDto.Password);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }
        trans.Commit();
      }

      return result;
    }

    public int UpdateUser(AccountFormDto accountFormDto)
    {
      int result = -1;

      var updateUserSql = @"
      UPDATE users 
      SET user_id = @user_id, first_name = @first_name, last_name = @last_name, email = @email, password = @password 
      WHERE id = @id;
      ";

      //var updateUserRoleSql = @"
      //UPDATE user_roles 
      //SET role_id = @role_id
      //WHERE user_id = @id;
      //";
      var deleteUserRoleSql = @"
      DELETE FROM user_roles where user_id = @user_id;
      ";

      var insertUserRoleSql = @"
      INSERT INTO user_roles (user_id, role_id)
      VALUES (@id, @role_id);
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(updateUserSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
            cmd.Parameters.AddWithValue("user_id", accountFormDto.UserId);
            cmd.Parameters.AddWithValue("first_name", accountFormDto.FirstName);
            cmd.Parameters.AddWithValue("last_name", accountFormDto.LastName);
            cmd.Parameters.AddWithValue("email", accountFormDto.Email);
            cmd.Parameters.AddWithValue("password", accountFormDto.Password);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(deleteUserRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("user_id", Guid.Parse(accountFormDto.Id));

            cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        foreach (int roleId in accountFormDto.Roles)
        {
          using (var cmd = new NpgsqlCommand(insertUserRoleSql, conn))
          {
            try
            {
              cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
              cmd.Parameters.AddWithValue("role_id", roleId);

              cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
              trans.Rollback();
              throw ex;
            }
          }
        }
        trans.Commit();
      }
      return result;
    }

    public int UpdateUserWithoutPassword(AccountFormDto accountFormDto)
    {
      int result = -1;

      var updateUserSql = @"
      UPDATE users 
      SET user_id = @user_id, first_name = @first_name, last_name = @last_name, email = @email
      WHERE id = @id;
      ";

      var deleteUserRoleSql = @"
      DELETE FROM user_roles where user_id = @user_id;
      ";

      var insertUserRoleSql = @"
      INSERT INTO user_roles (user_id, role_id)
      VALUES (@id, @role_id);
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(updateUserSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
            cmd.Parameters.AddWithValue("user_id", accountFormDto.UserId);
            cmd.Parameters.AddWithValue("first_name", accountFormDto.FirstName);
            cmd.Parameters.AddWithValue("last_name", accountFormDto.LastName);
            cmd.Parameters.AddWithValue("email", accountFormDto.Email);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(deleteUserRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("user_id", Guid.Parse(accountFormDto.Id));

            cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        foreach (int roleId in accountFormDto.Roles)
        {
          using (var cmd = new NpgsqlCommand(insertUserRoleSql, conn))
          {
            try
            {
              cmd.Parameters.AddWithValue("id", Guid.Parse(accountFormDto.Id));
              cmd.Parameters.AddWithValue("role_id", roleId);

              cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
              trans.Rollback();
              throw ex;
            }
          }
        }
        trans.Commit();
      }
      return result;
    }

    public int DeleteUser(string id)
    {
      int result = -1;

      var deleteUserSql = @"
      DELETE FROM users WHERE id = @id
      ";

      var deleteUserRoleSql = @"
      DELETE FROM user_roles WHERE user_id = @id;
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(deleteUserSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", Guid.Parse(id));

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(deleteUserRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", Guid.Parse(id));

            cmd.ExecuteNonQuery();
            trans.Commit();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }
      }
      return result;
    }

    public int InsertRolePermissions(RoleFormDto role)
    {
      int result = -1;

      var selectRoleMaxIdSql = @"
      SELECT MAX(id) + 1 AS ID FROM roles;
      ";

      var insertRoleSql = @"
      INSERT INTO roles (id, name)
      VALUES ((SELECT MAX(id) + 1 FROM roles), @name);
      ";

      var insertRolePermissionsSql = @"
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (@role_id, @permission_id);
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(selectRoleMaxIdSql, conn))
        {
          try
          {
            role.Id = (int)cmd.ExecuteScalar();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(insertRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", role.Id);
            cmd.Parameters.AddWithValue("name", role.Name);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        foreach (int permissionId in role.Permissions)
        {
          using (var cmd = new NpgsqlCommand(insertRolePermissionsSql, conn))
          {
            try
            {
              cmd.Parameters.AddWithValue("role_id", role.Id);
              cmd.Parameters.AddWithValue("permission_id", permissionId);

              cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
              trans.Rollback();
              throw ex;
            }
          }
        }
        trans.Commit();
      }
      return result;
    }

    public int UpdateRolePermissions(RoleFormDto role)
    {
      int result = -1;

      var updateRoleSql = @"
      UPDATE roles 
      SET name = @name 
      WHERE id = @id;
      ";

      var deleteRolePermissionsSql = @"
      DELETE FROM role_permissions where role_id = @role_id;
      ";

      var insertRolePermissionsSql = @"
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (@role_id, @permission_id);
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(updateRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", role.Id);
            cmd.Parameters.AddWithValue("name", role.Name);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(deleteRolePermissionsSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("role_id", role.Id);

            cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        foreach (int permissionId in role.Permissions)
        {
          using (var cmd = new NpgsqlCommand(insertRolePermissionsSql, conn))
          {
            try
            {
              cmd.Parameters.AddWithValue("role_id", role.Id);
              cmd.Parameters.AddWithValue("permission_id", permissionId);

              cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
              trans.Rollback();
              throw ex;
            }
          }
        }
        trans.Commit();
      }
      return result;
    }

    public int DeleteRole(int roleId)
    {
      int result = -1;

      var deleteRoleSql = @"
      DELETE FROM roles WHERE id = @id 
      ";

      var deleteRolePermissionSql = @"
      DELETE FROM role_permissions WHERE role_id = @role_id
      ";

      using (var conn = ConnectUi())
      {
        conn.Open();
        var trans = conn.BeginTransaction();

        using (var cmd = new NpgsqlCommand(deleteRoleSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("id", roleId);

            result = cmd.ExecuteNonQuery();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }

        using (var cmd = new NpgsqlCommand(deleteRolePermissionSql, conn))
        {
          try
          {
            cmd.Parameters.AddWithValue("role_id", roleId);

            cmd.ExecuteNonQuery();
            trans.Commit();
          }
          catch (Exception ex)
          {
            trans.Rollback();
            throw ex;
          }
        }
      }

      return result;
    }


    public int AddTokenHistory(UserEntity user, DateTime validTo, string callerMethodName) 
    {
        int result = -1;

        var insertLoginHistorySql = @"
            INSERT INTO token_history (user_id, token_expires, method_name)
            VALUES (@user_id, @token_expires, @method_name);
        ";

        using (var conn = ConnectUi())
        {
            conn.Open();
            var trans = conn.BeginTransaction();

            using (var cmd = new NpgsqlCommand(insertLoginHistorySql, conn))
            {
                try
                {
                    cmd.Parameters.AddWithValue("user_id", user.UserId);
                    cmd.Parameters.AddWithValue("token_expires", validTo);
                    cmd.Parameters.AddWithValue("method_name", callerMethodName);

                    result = cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    trans.Rollback();
                    throw ex;
                }
            }
            trans.Commit();
        }
        return result;
    }
    public IQueryable<TokenHistoryEntity> QueryTokenHistory()
    {
        var sql = $"SELECT * FROM token_history";
        IQueryable<TokenHistoryEntity> result;
        using (var conn = ConnectUi())
        {
            result = conn.Query<TokenHistoryEntity>(sql).AsQueryable();
        }
        return result;
    }
    }
}