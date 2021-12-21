using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class UsersController : ControllerBase
  {
    private readonly UserService _userSvc;
    public UsersController(UserService userService)
    {
      this._userSvc = userService;
    }

    [HttpPatch("profile")]
    public IActionResult UpdateProfile([FromBody] ProfileFormDto form)
    {
      return Ok();
    }

    [HttpGet("")]
    public IEnumerable<UserEntity> QueryAllUsers()
    {
      return _userSvc.QueryUsers();
    }

    [Obsolete]
    [HttpGet("data-source")]
    public object QueryUsersDataSource(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_userSvc.QueryUsers(), loadOptions);
    }

    [HttpGet("token-history")]
    public IEnumerable<TokenHistoryEntity> QueryTokenHistory([FromQuery] uint offset, [FromQuery] uint limit) 
    {
        return _userSvc.QueryTokenHistory(offset, limit);
    }

    [HttpGet("roles")]
    public IEnumerable<RoleEntity> QueryRoles()
    {
      return _userSvc.QueryRoles().ToList();
    }

    [HttpGet("permission-roles")]
    public IEnumerable<RoleEntity> QueryRolesWithPermissions()
    {
      return _userSvc.QueryRolesWithPermissions().ToList();
    }

    [HttpGet("permissions")]
    public IEnumerable<PermissionEntity> QueryPermissions()
    {
      List<PermissionEntity> ret = _userSvc.QueryPermissions().ToList();
      return ret;
      //return _userSvc.QueryPermissions().ToList();
    }

    [HttpPost("batch/save")]
    public IActionResult SaveAccounts([FromBody] AccountFormDto[] accounts)
    {
      var updateAccounts = accounts.Where(u => !u.IsNew.HasValue || !u.IsNew.Value).ToList();
      var addAccounts = accounts.Where(u => u.IsNew.HasValue && u.IsNew.Value).ToList();

      foreach (AccountFormDto accountFormDto in updateAccounts)
      {
        if (accountFormDto.Password != "NO")
          _userSvc.UpdateUser(accountFormDto);
        else
          _userSvc.UpdateUserWithoutPassword(accountFormDto);
      }

      foreach (AccountFormDto accountFormDto in addAccounts)
      {
        _userSvc.AddUser(accountFormDto);
      }

      return Ok();
    }

    [HttpPost("batch/remove")]
    public IActionResult DeleteAccounts([FromBody] string[] ids)
    {
      foreach (string id in ids)
      {
        _userSvc.DeleteUser(id);
      }
      return Ok();
    }

    [HttpPost("roles")]
    public IActionResult SaveRoles([FromBody] RoleFormDto[] roles)
    {
      var changed = roles.Where(x => x.Id > 0).ToList();
      var added = roles.Where(x => x.Id == 0).ToList();

      foreach (RoleFormDto role in changed)
      {
        _userSvc.UpdateRolePermissions(role);
      }

      foreach (RoleFormDto role in added)
      {
        _userSvc.InsertRolePermissions(role);
      }
      return Ok();
    }

    [HttpPost("roles/remove")]
    public IActionResult DeleteRoles([FromBody] int[] ids)
    {
      foreach (int id in ids)
      {
        _userSvc.DeleteRole(id);
      }

      return Ok();
    }
  }
}