using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OMSWeb
{
  public enum ErrorCodes : uint
  {
    AuthenticationFailed = 1,
    UserNotExists,
    BadRequestModel = 10,
    TrackSnapshotNotExists = 20,
    DaySnapshotNotExists,
    EventNotExists,
    ServerError = 999,
  }
}
