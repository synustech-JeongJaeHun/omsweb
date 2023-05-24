using System.Collections.Generic;
using Newtonsoft.Json;

namespace OMSWeb.Models.Tracks
{
    public class MapData
    {
        public IList<Point> Points { get; set; }
        public IList<SegmentWithPart> Segments { get; set; }
        public IList<DisabledSegment> SegmentDisabled { get; set; }
        public IList<Cluster> Clusters { get; set; }
        public IList<ClusterState> ClusterStates { get; set; }
        public IList<Station> Stations { get; set; }
        public IList<Buffer> Buffers { get; set; }
        public IList<Mtl> Mtls { get; set; }
        public IList<Zcu> Zcus { get; set; }
        public IList<ZcuStatus> ZcuStatus { get; set; }
        public IList<FireShutter> FireShutters { get; set; }
        public IList<FireShutterStatus> FireShutterStatus { get; set; }
        public IList<VehiclePosition> Vehicles { get; set; }
        public IList<VehiclePath> VehiclePaths { get; set; }
        public IList<VehicleDio> VehicleDio { get; set; }
        public IList<LocationGroup> Groups { get; set; }
        public MapDimension Size { get; set; }
        public IList<Backdrop> Backdrops { get; set; }
    }

    public class MapDimension
    {
        public int MinX { get; set; }
        public int MinY { get; set; }
        public int MaxX { get; set; }
        public int MaxY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }

    public class VehicleResponse
    {
        public IList<VehiclePosition> Vehicles { get; set; }
        public IList<VehiclePath> VehiclePaths { get; set; }
    }

    public class NodeInfo
    {
        public int Id { get; set; }
        public string LogicalId { get; set; }
        public string PhysicalId { get; set; }
    }
}