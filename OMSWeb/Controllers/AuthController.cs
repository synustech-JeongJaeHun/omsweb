using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Services;
using OMSWeb.Logger;

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
            try
            {
                if (!ModelState.IsValid) throw new OmsException(ErrorCodes.BadRequestModel);
                return _userSvc.Authenticate(form.UserId, form.Password);
            }
            catch (Exception e)
            {
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception Auth", e.Message);
                return null;
            }
        }

        [Authorize]
        [HttpGet("renew")]
        public ActionResult<TokenResponse> Renew()
        {
            return _userSvc.RenewToken();
        }


        [Authorize]
        [HttpDelete("logout")]
        public ActionResult LogOut()
        {
            _userSvc.Logout();
            return Ok();
        }
    }
}