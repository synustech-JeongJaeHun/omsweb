using Microsoft.Extensions.Options;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Security.Cryptography;
using System;
using OMSWeb.OMSSettings;
using System.Diagnostics;

namespace OMSWeb.Services
{
    public class SystemsService
    {
        private readonly AppSettings _appSettings;
        private readonly ModeStateRepository _modeStateRepo;
        private readonly SettingModeRepository _settingModeRepo;

        public SystemStatusModel HostStates { get; set; }
        public SettingModeModel SettingModeModel { get; set; }

        public string LogBaseDir
        {
            get 
            {
                return AppConfig.GetFromOMSConfig("Log", "base_dir", "..\\..\\Log");
            }
        }
        public string LogTempZipDir
        {
            get 
            {
                string module_name = Process.GetCurrentProcess().MainModule.FileName;
                return Path.GetDirectoryName(module_name) + "\\Temp\\Zip";
            }
        }
        public string LogTempCopyDir
        {
            get 
            {
                string module_name = Process.GetCurrentProcess().MainModule.FileName;
                return Path.GetDirectoryName(module_name) + "\\Temp\\CopyFolder";
            }
        }

        public SystemsService(SettingModeRepository _settingModeRepo, ModeStateRepository _modeStateRepo, ModuleStatusRepository _modeStatusRepo, IOptions<AppSettings> appSettings)
        {
            this._appSettings = appSettings.Value;
            this._appSettings.SID = GenerateSID(8);

            string version = _modeStatusRepo.GetOmsServerVersion();
            if (!string.IsNullOrEmpty(version))
                this._appSettings.Version = version;

            this._modeStateRepo = _modeStateRepo;
            this._settingModeRepo = _settingModeRepo;

            this.HostStates = GetHostStatus();
        }

        private string GenerateSID(int length)
        {
            using (var crypto = new RNGCryptoServiceProvider())
            {
                var bits = (length * 6);
                var byte_size = ((bits + 7) / 8);
                var bytesarray = new byte[byte_size];
                crypto.GetBytes(bytesarray);
                return Convert.ToBase64String(bytesarray);
            }
        }

        public SystemStatusModel GetHostStatus()
        {
            ModeStateEntity modeStateEntity = this._modeStateRepo.GetModeState();

            if (modeStateEntity != null)
            {
                this.HostStates = new SystemStatusModel
                {
                    SessionStatus = (HostSessionStatusEnums?)modeStateEntity.comm_state,
                    HostMode = (HostModeEnums?)modeStateEntity.control_state,
                    TscMode = (TscModeEnums?)modeStateEntity.tsc_state,
                    AiMode = (modeStateEntity.ai_mode > 0) ? true : false,
                };
            }
            else
            {
                this.HostStates = new SystemStatusModel
                {
                    SessionStatus = HostSessionStatusEnums.Offline,
                    HostMode = HostModeEnums.LOCAL,
                    TscMode = TscModeEnums.PAUSED,
                    AiMode = true,
                };
            }

            return this.HostStates;
        }

        public SettingModeModel GetSettingMode()
        {
            SettingModeEntity settingModeEntity = this._settingModeRepo.GetSettingMode();

            if (settingModeEntity != null)
            {
                this.SettingModeModel = new SettingModeModel
                {
                    HomeMode = (settingModeEntity.home_mode > 0) ? true : false,
                    ChainManualCommandDisabled = (settingModeEntity.chain_manual_command_disabled > 0) ? true : false,
                };
            }
            else
            {
                this.SettingModeModel = new SettingModeModel
                {
                    HomeMode = true,
                    ChainManualCommandDisabled = false,
                };
            }

            return this.SettingModeModel;
        }

        public ClientSettings GetClientSettings()
        {
            var client = this._appSettings.Client;
            client.SID = this._appSettings.SID;
            client.Version = this._appSettings.Version;
            client.KpiEnabled = this._appSettings.KpiEnabled;
            client.BufferEnabled = this._appSettings.BufferEnabled;
            client.i18nEnabled = this._appSettings.i18nEnabled;
            client.ZCUDetail = this._appSettings.ZCUDetail;
            
            client.OnOffLine = this._appSettings.OnOffLine;
            return this._appSettings.Client;
        }
        
        public DefaultColorSettings GetDefaultColorSettings()
        {
            return this._appSettings.DefaultColor;
        }
        public VehicleOrderIdContents GetVehicleOrderIdContents()
        {
            return this._appSettings.VehicleOrderIdContents;
        }
        public ManualTransferFilters GetManualTransferFilters()
        {
            return this._appSettings.ManualTransferFilters;
        }
        public NodeMargins GetNodeMargins()
        {
            return this._appSettings.NodeMargins;
        }

        public List<LogModel> GetLogs()
        {
            //LogModel logModel = new LogModel(Directory.CreateDirectory(@"C:\inetpub\logs"));
            string LogBaseDir = AppConfig.GetFromOMSConfig("Log", "base_dir", "..\\..\\Log");
            LogModel logModel = new LogModel(Directory.CreateDirectory(LogBaseDir));
            List<LogModel> result = new List<LogModel>() { logModel };
            return result;
        }
        public IEnumerable<string> GetMaps()
        {

            string MapDir = AppConfig.GetFromOMSConfig("Map", "map_dir", "..\\..\\map");
            var maps = Directory.GetFiles(MapDir)
                .Where((file) => file.EndsWith(".json"))
                .Select(map => Path.GetFileName(map));
            return maps;
        }

        public void DirectoryCopy(string sourceDirectoryFullPath, string destDirectoryFullPath, bool isCopySubDirectory)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(sourceDirectoryFullPath);

            if (!directoryInfo.Exists)
            {
                throw new DirectoryNotFoundException("Source Directory does not exist or could not be found:" + sourceDirectoryFullPath);
            }

            DirectoryInfo[] directoryInfos = directoryInfo.GetDirectories();

            Directory.CreateDirectory(destDirectoryFullPath);

            FileInfo[] fileInfos = directoryInfo.GetFiles();
            foreach (FileInfo fileInfo in fileInfos)
            {
                string tempPath = Path.Combine(destDirectoryFullPath, fileInfo.Name);
                fileInfo.CopyTo(tempPath, false);
            }

            if (isCopySubDirectory)
            {
                foreach (DirectoryInfo subDirectoryInfo in directoryInfos)
                {
                    string tempPath = Path.Combine(destDirectoryFullPath, subDirectoryInfo.Name);
                    DirectoryCopy(subDirectoryInfo.FullName, tempPath, isCopySubDirectory);
                }
            }
        }
    }
}