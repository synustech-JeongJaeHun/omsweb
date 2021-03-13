using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Repositories;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
      private readonly IStatusRepository _statusRepo;
    public StatusController(IStatusRepository statusRepo)
    {
      this._statusRepo = statusRepo;
    }

    [HttpGet("track")]
      public IActionResult GetTrack() {
        return Content(this._statusRepo.Test());
      }
    }
}