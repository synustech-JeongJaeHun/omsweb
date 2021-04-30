namespace OMSWeb.Models.Tracks
{
  public class LocationGroup
  {
    public int Id { get; set; }
    public string LogicalId { get; set; }
    public string Color { get; set; }

    // public object Objects { get; set; }
    public LocationGroupObjectItem[] Objects { get; set; }

  }

  public class LocationGroupObjectItem {
    public int Id { get; set; }
    public string Type { get; set; }
  }
}