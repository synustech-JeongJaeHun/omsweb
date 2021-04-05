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
  public class NotificationsController : ControllerBase
  {
    private readonly NotificationsService _notificationSvc;

    public NotificationsController(NotificationsService notificationsService)
    {
      this._notificationSvc = notificationsService;
    }

    [HttpGet("alert-count")]
    public ActionResult<NotificationCountModel> AlertCount()
    {
      return this._notificationSvc.GetAlertCount();
    }

    [HttpGet("alarm-count")]
    public ActionResult<NotificationCountModel> AlarmCount() {
      return this._notificationSvc.GetAlarmCount();
    }
  }
}