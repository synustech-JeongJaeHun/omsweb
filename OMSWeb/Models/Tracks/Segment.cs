namespace OMSWeb.Models.Tracks
{
  public interface ISegment
  {
    int Id { get; set; }
    string PhysicalId { get; set; }
    string LogicalId { get; set; }
    int StartPoint { get; set; }
    int EndPoint { get; set; }
    float Speed { get; set; }
    float Length { get; set; }
  }
  public interface ISegmentPart
  {
    int Id { get; set; }
    string Type { get; set; }
    string Direction { get; set; }
    string Location { get; set; }

    // int? segmentId { get; set; }
  }
  public class Segment : ISegment
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public int StartPoint { get; set; }
    public int EndPoint { get; set; }
    public float Speed { get; set; }
    public float Length { get; set; }
    
    public int SteerDir { get; set; }
    public int SpeedRatio { get; set; }
    public int Oblow { get; set; }
    public int Obhigh { get; set; }
  }
  public class SegmentWithPart : Segment, ISegmentPart
  {
    public string Type { get; set; }
    public string Direction { get; set; }
    public string Location { get; set; }

    public int SegpartId { get; set; }

  }
}