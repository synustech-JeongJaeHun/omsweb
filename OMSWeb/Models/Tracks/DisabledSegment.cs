namespace OMSWeb.Models.Tracks
{
  public class DisabledSegment
  {
    public int Id { get; set; }
    public int SegmentId { get; set; }
    public string DisabledBy { get; set; }
    public string DisabledReason { get; set; }
    public string User { get; set; }
    public string Note { get; set; }
  }
}