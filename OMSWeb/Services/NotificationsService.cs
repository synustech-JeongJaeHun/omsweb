using System.Linq;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;

using System.Threading.Tasks;

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

        public NotificationCountModel GetAlarmCount()
        {
            return this._alarmRepo.GetCount();
        }

        public NotificationCountModel GetAlertCount()
        {
            return this._alertRepo.GetCount();
        }

        public IQueryable<AlertHistory> GetAlerts()
        {
            return this._alertRepo.GetAlerts();
        }

        public IQueryable<AlarmHistory> GetAlarms()
        {
            return this._alarmRepo.GetAlarms();
        }

        public int AddAnnotation(AnnotationDto annotation)
        {
            return this._alarmRepo.AddAnnotation(annotation);
        }

        public IQueryable<VehicleError> GetVehicleErrors()
        {
            return this._alarmRepo.GetVehicleErrors();
        }
    }
}