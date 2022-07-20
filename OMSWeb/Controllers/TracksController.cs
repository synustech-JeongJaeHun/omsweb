using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Services;
using Buffer = OMSWeb.Models.Tracks.Buffer;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TracksController : ControllerBase
    {
        private readonly TrackService _svc;

        public TracksController(TrackService trackService)
        {
            this._svc = trackService;
        }

        [HttpGet("carriers/{carrierLocation}")]
        public string GetCarrierId([FromRoute] string carrierLocation)
        {
            return this._svc.GetCarrierId(carrierLocation);
        }

        [HttpGet("carrierinfo/{carrierLocation}")]
        public ActionResult<CarrierInfo> GetCarrierInfo(string carrierLocation)
        {
            var result = this._svc.GetCarrierInfo(carrierLocation);

            if (result == null)
                return Ok(new CarrierInfo()
                {
                    CarrierId = String.Empty,
                });
            else
                return Ok(result);
        }

        [HttpGet("carrierloc/{carrierId}")]
        public ActionResult<CarrierLocation> GetCarrierLoc(string carrierId)
        {
            var result = this._svc.GetCarrierLoc(carrierId);

            if (result == null)
                return Ok(new CarrierLocation()
                {
                    CarrierLoc = string.Empty,
                }); 
            else
                return Ok(result);
        }

        [HttpGet("carrierquery/{carrierLoc}&{carrierId}")]
        public ActionResult<CarrierQuery> GetCarrierQuery(string carrierLoc, string carrierId)
        {
            var result = this._svc.GetCarrierQuery(carrierLoc, carrierId);

            if (result == null)
                return Ok(new CarrierQuery()
                {
                    CarrierLoc = string.Empty,
                    CarrierId = String.Empty,
                });
            else
                return Ok(result);
        }


        [HttpGet("transfercheck/{category}&{vehicleId}&{source}&{srctype}&{dest}&{dsttype}&{carrierId}")]
        public ActionResult<TransferHCACK> CheckTransfer(
            string category, 
            string vehicleId, 
            string source, 
            string srctype, 
            string dest, 
            string dsttype, 
            string carrierId
            )
        {
            var result = this._svc.GetTransferHCACK(
                category, 
                vehicleId, 
                source,
                srctype,
                dest, 
                dsttype,
                carrierId);

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



        [HttpGet("groups")]
        public IEnumerable<LocationGroup> GetGroups()
        {
            return this._svc.GetGroups();
        }

        [HttpPut("groups/{id}")]
        public ActionResult UpdateGroup([FromRoute] int id, [FromBody] LocationGroup group)
        {
            Console.WriteLine($"# Update Group : {id}");
            return Ok();
        }

        [HttpGet("clusters")]
        public IEnumerable<Cluster> GetClusters()
        {
            return this._svc.GetClusters();
        }

        [HttpPut("clusters/{id}")]
        public ActionResult UpdateCluster([FromRoute] int id, [FromBody] Cluster cluster)
        {
            return Ok();
        }

        [HttpGet("segments")]
        public IEnumerable<SegmentWithPart> GetSegments()
        {
            return this._svc.GetSegments();
        }

        [HttpGet("points")]
        public IEnumerable<Point> GetPoints()
        {
            return this._svc.GetPoints();
        }

        [HttpGet("stations")]
        public IEnumerable<Station> GetStations()
        {
            return this._svc.GetStations();
        }

        [HttpGet("buffers/{id}")]
        public Buffer GetBufferById([FromRoute] int id)
        {
            return this._svc.GetBufferById(id);
        }
    }
}