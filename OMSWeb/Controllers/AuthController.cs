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

        /// <summary>
        /// 로그인
        /// </summary>
        /// <param name="form"></param>
        /// <returns></returns>
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
                Log.FilePrint(LogType.SYSTEM, LogEventLevel.Debug, $"Exception Auth={_userSvc._step}: {e.StackTrace}, {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// 사용자 정보에 따른 JWT 반환
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("renew")]
        public ActionResult<TokenResponse> Renew()
        {
            return _userSvc.RenewToken();
        }

        /// <summary>
        /// 로그아웃
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("logout")]
        public ActionResult LogOut()
        {
            _userSvc.Logout();
            return Ok();
        }
    }
}