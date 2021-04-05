using OMSWeb.Models;
using OMSWeb.Repositories;

namespace OMSWeb.Services
{
  public class NotificationsService
  {
    private readonly AlarmRepository _alarmRepo;
    private readonly AlertRepository _alertRepo;

    public NotificationsService(AlarmRepository alarm, AlertRepository alert)
    {
      this._alarmRepo = alarm;
      this._alertRepo = alert;
    }

    public NotificationCountModel GetAlarmCount() {
      return this._alarmRepo.GetCount();
    }

    public NotificationCountModel GetAlertCount() {
      return this._alertRepo.GetCount();
    }
  }
}