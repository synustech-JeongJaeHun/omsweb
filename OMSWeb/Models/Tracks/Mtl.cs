namespace OMSWeb.Models.Tracks
{
  public class Mtl
  {
    public int Id { get; set; }
    public string PhysicalId { get; set; }
    public string LogicalId { get; set; }
    public int? PointId { get; set; }

    public bool? Unuse { get; set; }
    public string InDirection {get;set;}
    public string OutDirection {get;set;}
    public string InLockSegment { get; set; }
    public string OutLockSegment { get; set; }
    public int InNode { get; set; }
    public int OutNode { get; set; }
    public int InDisabledSegment { get; set; }
    public int OutDisabledSegment { get; set; }
    
  }
}