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
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _msgSvc;
        private readonly UserService _userSvc;

        private const String USER_ID = "userId";

        public MessagesController(MessageService messageService, UserService userService)
        {
            this._msgSvc = messageService;
            this._userSvc = userService;
        }

        [HttpPost("command")]
        public async Task SendCommand(CommandMessageDto command)
        {
            String loginId = "unknown";
            if (Request.Headers.TryGetValue("Authorization", out var jwt))
            {
                loginId = _userSvc.DecodeJwt(jwt, USER_ID);
            }
            await this._msgSvc.SendMessage(command, loginId);
            return;
        }

    }
}