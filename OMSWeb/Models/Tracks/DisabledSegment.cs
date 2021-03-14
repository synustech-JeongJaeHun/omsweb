namespace OMSWeb.Models.Tracks
{
  public class DisabledSegment
  {
    public int Id { get; set; }
    public int SegmentId { get; set; }
    public string DisabledBy { get; set; }
    public string Reason { get; set; }
  }
}