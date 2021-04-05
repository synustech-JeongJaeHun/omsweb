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

    public MessagesController(MessageService messageService)
    {
      this._msgSvc = messageService;
    }

    [HttpPost("command")]
    public async Task SendCommand(CommandMessageDto command)
    {
      await this._msgSvc.SendMessage(command);
      return;
    }
  }
}