using Microsoft.EntityFrameworkCore;

namespace OMSWeb.Models.Entities
{
  public class OmsUiDbContext : DbContext
  {
    public OmsUiDbContext(DbContextOptions options) : base(options)
    {
    }

    protected OmsUiDbContext()
    {
    }
  }
}