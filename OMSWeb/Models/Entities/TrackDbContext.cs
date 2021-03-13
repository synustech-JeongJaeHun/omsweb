using Microsoft.EntityFrameworkCore;

namespace OMSWeb.Models.Entities
{
  public class OmsTrackDbContext : DbContext
  {
    public OmsTrackDbContext(DbContextOptions options) : base(options)
    {
    }

    protected OmsTrackDbContext()
    {
    }
  }
}