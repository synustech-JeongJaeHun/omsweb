using System;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Services;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransfersController : ControllerBase
    {
        private readonly TransferService _svc;

        public TransfersController(TransferService transferService)
        {
            this._svc = transferService;
        }

        [HttpGet("transfercheck/{category}&{vehicleId}&{source}&{srctype}&{dest}&{dsttype}&{carrierId}")]
        public ActionResult<TransferHCACK> CheckTransfer(
            string category, 
            string vehicleId,
            string source, 
            string srctype, 
            string dest, 
            string dsttype, 
            string carrierId)
        {
            var result = this._svc.CheckTransfer(category, vehicleId, source, srctype, dest, dsttype, carrierId);
            if (result == null)
                return Ok(new TransferHCACK()
                {
                    HCACK = (int)MCS_HCACK.NotAbleToExcute,
                    CPNAME = String.Empty,
                    CPACK = (int)MCS_HCACK.AlreadyConfirmed,
                });
            else
                return Ok(result);
        }


        [HttpGet("carriercheck/{rcmd}&{carrierloc}&{loctype}&{carrierId}&{newCarrierId}")]
        public ActionResult<TransferHCACK> CheckCarrierChange(
            string rcmd, 
            string carrierLoc, 
            string loctype, 
            string carrierId, 
            string newCarrierId)
        {
            var result = this._svc.CheckCarrierChange(rcmd, carrierLoc, loctype, carrierId, newCarrierId);
            if (result == null)
                return Ok(new TransferHCACK()
                {
                    HCACK = (int)MCS_HCACK.NotAbleToExcute,
                    CPNAME = String.Empty,
                    CPACK = (int)MCS_HCACK.AlreadyConfirmed,
                });
            else
                return Ok(result);
        }
    }
}