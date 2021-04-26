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
    public object QueryUsers(DataSourceLoadOptions loadOptions)
    {
      return DataSourceLoader.Load(_userSvc.QueryUsers(), loadOptions);
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
      return _userSvc.QueryPermissions().ToList();
    }
  }
}