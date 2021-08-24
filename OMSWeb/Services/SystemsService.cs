using Microsoft.Extensions.Options;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;
using System.Linq;

namespace OMSWeb.Services
{
    public class SystemsService
    {
        private readonly AppSettings _appSettings;
        private readonly ModeStateRepository _modeStateRepo;

        public SystemStatusModel HostStates { get; set; }

        public SystemsService(ModeStateRepository _modeStateRepo, IOptions<AppSettings> appSettings)
        {
            this._appSettings = appSettings.Value;
            this._modeStateRepo = _modeStateRepo;

            this.HostStates = GetHostStatus();
        }

        public SystemStatusModel GetHostStatus()
        {
            ModeStateEntity modeStateEntity = this._modeStateRepo.GetModeState();

            if (modeStateEntity != null)
            {
                this.HostStates = new SystemStatusModel
                {
                    HostMode = (HostModeEnums?)modeStateEntity.control_state,
                    SessionStatus = (HostSessionStatusEnums?)modeStateEntity.comm_state,
                    TscMode = (TscModeEnums?)modeStateEntity.tsc_state,
                    AiMode = (modeStateEntity.ai_mode > 0) ? true : false,
                };
            }
            else
            {
                this.HostStates = new SystemStatusModel
                {
                    HostMode = HostModeEnums.Offline,
                    SessionStatus = HostSessionStatusEnums.Offline,
                    TscMode = TscModeEnums.Auto,
                    AiMode = true,
                };
            }

            return this.HostStates;
        }

        public ClientSettings GetClientSettings()
        {
            var client = this._appSettings.Client;
            client.Version = this._appSettings.Version;
            client.KpiEnabled = this._appSettings.KpiEnabled;
            return this._appSettings.Client;
        }
    }
}