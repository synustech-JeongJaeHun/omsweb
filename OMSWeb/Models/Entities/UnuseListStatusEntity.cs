using System;

namespace OMSWeb.Models.Entities
{
  public class UnuseListStatusEntity
  {
    public int Id { get; set; }
    public string Type { get; set; }
    public string OnlineName { get; set; }
    public string User { get; set; }
    public string Comments { get; set; }
    public DateTime UnuseTime { get; set; }
    public string Location { get; set; }
    public int ObjectId { get; set; }
  }
}