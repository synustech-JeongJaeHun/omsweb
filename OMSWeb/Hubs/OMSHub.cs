using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace OMSWeb.Hubs
{
  public partial class OMSHub : Hub
  {
    public static readonly string ObserverGroupName = "Observers";

    public OMSHub()
    {
    }

    public Task JoinObservers() {
      return Groups.AddToGroupAsync(Context.ConnectionId, ObserverGroupName);
    }

    public Task LeaveObservers() {
      return Groups.RemoveFromGroupAsync(Context.ConnectionId, ObserverGroupName);
    }
  }
}