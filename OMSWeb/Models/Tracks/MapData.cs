using Newtonsoft.Json;

namespace OMSWeb.Models.Tracks
{
  public class MapData
  {
    public Point[] Points { get; set; }
    public SegmentWithPart[] Segments { get; set; }

    // [JsonProperty(PropertyName = "segment_disabled")]
    public DisabledSegment[] SegmentDisabled { get; set; }
    public Cluster[] Clusters { get; set; }
    public Station[] Stations { get; set; }
    public Buffer[] Buffers { get; set; }
    public Mtl[] Mtls { get; set; }
    public VehiclePosition[] Vehicles { get; set; }

    // [JsonProperty(PropertyName = "vehicle_path")]
    public VehiclePath[] VehiclePaths { get; set; }
    public LocationGroup[] Groups { get; set; }
    public MapDimension Size { get; set; }
    // public string mapType { get; set; }
    // public int minimumSegmentLength { get; set; }
  }

  public class MapDimension
  {
    // [JsonProperty(PropertyName = "min_x")]
    public int MinX { get; set; }

    // [JsonProperty(PropertyName = "min_y")]
    public int MinY { get; set; }

    // [JsonProperty(PropertyName = "max_x")]
    public int MaxX { get; set; }

    // [JsonProperty(PropertyName = "max_y")]
    public int MaxY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
  }
}