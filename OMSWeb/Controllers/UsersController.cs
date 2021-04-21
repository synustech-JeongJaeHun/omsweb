using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;

namespace OMSWeb.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class UsersController : ControllerBase
  {

    [HttpPatch("profile")]
    public IActionResult UpdateProfile([FromBody] ProfileFormDto form)
    {
      return Ok();
    }
  }
}