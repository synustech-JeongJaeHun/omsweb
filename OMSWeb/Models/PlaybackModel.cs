using OMSWeb.Models.Entities;

#nullable enable

namespace OMSWeb.Models
{
    public class BeforeNextSnapshots
    {
        public SnapshotEntity? Before { get; set; }
        public SnapshotEntity? Next { get; set; }
    }
}

#nullable disable