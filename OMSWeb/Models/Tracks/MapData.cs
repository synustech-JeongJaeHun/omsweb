using Newtonsoft.Json;

namespace OMSWeb.Models.Tracks
{
  public class MapData
  {
    public Point[] Points { get; set; }
    public SegmentWithPart[] Segments { get; set; }
    public DisabledSegment[] SegmentDisabled { get; set; }
    public Cluster[] Clusters { get; set; }
    public Station[] Stations { get; set; }
    public Buffer[] Buffers { get; set; }
    public Mtl[] Mtls { get; set; }
    public VehiclePosition[] Vehicles { get; set; }
    public VehiclePath[] VehiclePaths { get; set; }
    public LocationGroup[] Groups { get; set; }
    public MapDimension Size { get; set; }
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
    public VehiclePosition[] Vehicles { get; set; }
    public VehiclePath[] VehiclePaths { get; set; }
  }
}