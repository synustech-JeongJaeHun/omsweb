using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AuthController : ControllerBase
  {
    private readonly UserService _userSvc;

    public AuthController(UserService userService)
    {
      this._userSvc = userService;
    }

    [HttpPost("")]
    public ActionResult<TokenResponse> Login(LoginFormDto form)
    {
      if (!ModelState.IsValid) throw new OmsException(ErrorCodes.BadRequestModel);
      return _userSvc.Authenticate(form.UserId, form.Password);
    }
  }
}