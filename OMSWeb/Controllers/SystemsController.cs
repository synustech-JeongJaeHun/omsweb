using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.IO.Compression;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.OMSSettings;
using OMSWeb.Models.Entities;
using OMSWeb.Services;
using Newtonsoft.Json;
using OMSWeb.Services.MqttClient;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemsController : ControllerBase
    {
        private SystemsService _systemSvc;
        private DbService _dbSvc;
        private ModuleStatusService _moduleStatusSvc;
        private readonly MessageService _msgSvc;

        public SystemsController(SystemsService systemSvc, DbService dbSvc, ModuleStatusService moduleStatusSvc, MessageService messageService)
        {
            this._systemSvc = systemSvc;
            this._dbSvc = dbSvc;
            this._moduleStatusSvc = moduleStatusSvc;
            this._msgSvc = messageService;
        }

        [HttpGet("states")]
        public ActionResult<SystemStatusModel> GetStates()
        {
            return this._systemSvc.GetHostStatus();
        }


        [HttpGet("settings/mode")]
        public ActionResult<SettingModeModel> GetSettingMode()
        {
            return this._systemSvc.GetSettingMode();
        }

        [HttpGet("settings/client")]
        public ActionResult<ClientSettings> GetClientSettings()
        {
            return this._systemSvc.GetClientSettings();
        }
        [HttpGet("settings/default-colors")]
        public ActionResult<DefaultColorSettings> GetDefaultColors()
        {
            return this._systemSvc.GetDefaultColorSettings();
        }
        [HttpGet("settings/vehicle-orderid-contents")]
        public ActionResult<VehicleOrderIdContents> GetVehicleOrderIdContents()
        {
            return this._systemSvc.GetVehicleOrderIdContents();
        }
        [HttpGet("settings/manual-transfer-filters")]
        public ActionResult<ManualTransferFilters> GetManualTransferFilters()
        {
            return this._systemSvc.GetManualTransferFilters();
        }
        [HttpGet("settings/node-margins")]
        public ActionResult<NodeMargins> GetNodeMargins()
        {
            return this._systemSvc.GetNodeMargins();
        }

        [HttpGet("module-status")]
        public IQueryable<ModuleStatusEntity> GetModuleStatus()
        {
            return this._moduleStatusSvc.GetModuleStatus();
        }
        
        [HttpGet("vhl-status")]
        public IQueryable<VhlStatusEntity> GetVhlStatus()
        {
            return this._moduleStatusSvc.GetVhlStatus();
        }
        
        [HttpGet("cdm-status")]
        public IQueryable<CdmStatusEntity> GetCdmStatus()
        {
            return this._moduleStatusSvc.GetCdmStatus();
        }

        [HttpGet("maps")]
        public object GetMaps()
        {
            return this._systemSvc.GetMaps();
        }
        [HttpGet("current-map")]
        public object GetCurrentMap()
        {
            return this._dbSvc.GetCurrentMap();
        }

        [HttpGet("logs")]
        public object GetLogs()
        {
            return this._systemSvc.GetLogs();
        }
        
        [HttpGet("customSettings")]
        public ActionResult<string> GetAppSettings()
        {
            try
            {
                return System.IO.File.ReadAllText("./customSettings.json");
            }
            catch (Exception e)
            {
                return null;
            }
        }
        
        [HttpGet("reference")]
        public ActionResult<string> GetRef()
        {
            try
            {
                return System.IO.File.ReadAllText("./reference.json");
            }
            catch (Exception e)
            {
                return null;
            }
            
        }
        
        [HttpGet("vehicleRef")]
        public ActionResult<string> GetVehicleRef()
        {
            try
            {
                return System.IO.File.ReadAllText("./vehicleRef.json");
            }
            catch (Exception e)
            {
                return null;
            }
            
        }

        [HttpGet(template: "zcus-with-fireshutter")]
        public int[] GetZcusWithFireshutter()
        {
            var zcusWithFireshutterString = AppConfig.GetFromOMSConfig("Map", "zcu_with_fireshutter", "") ?? "";
            return zcusWithFireshutterString
                .Split(',')
                .Where(s => int.TryParse(s, out var i))
                .Select(s => int.Parse(s))
                .ToArray();
        }

        [HttpGet("logs/downloadFile/{fileName}")]
        public FileContentResult DownloadFile([FromRoute] string fileName, [FromQuery] string fileFullPath)
        {
            string filePath = fileFullPath;
            byte[] bytes = null;

            try
            {
                using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    using (var ms = new MemoryStream())
                    {
                        fs.CopyTo(ms);
                        bytes = ms.ToArray();
                    }
                }
            }
            catch
            {
                //var tempFolderPath = "C:\\OMS\\app\\omsweb\\Temp\\CopyFolder\\";
                var logTempCopyDir = this._systemSvc.LogTempCopyDir;

                if (!Directory.Exists(logTempCopyDir))
                    Directory.CreateDirectory(logTempCopyDir);

                System.IO.File.Copy(filePath, logTempCopyDir + "\\" + fileName);
                using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    using (var ms = new MemoryStream())
                    {
                        fs.CopyTo(ms);
                        bytes = ms.ToArray();
                    }
                }

                if (System.IO.File.Exists(logTempCopyDir + "\\" + fileName))
                    System.IO.File.Delete(logTempCopyDir + "\\" + fileName);
            }

            return File(bytes, "application/octect-stream", fileName);
        }

        [HttpGet("logs/downloadFoldersNFiles/{folderName}")]
        public object DownloadFoldersNFiles([FromRoute] string folderName, [FromQuery] string folderFullPaths)
        {
            var fileName = string.Format("{0}.zip", folderName);

            //var tempOutPutPath = "C:\\OMS\\app\\omsweb\\Temp\\Zip\\";
            //var tempZipFilePath = "C:\\OMS\\app\\omsweb\\Temp\\Zip\\" + fileName;
            //var tempFolderPath = "C:\\OMS\\app\\omsweb\\Temp\\CopyFolder\\" + folderName;
            var logTempZipDir = this._systemSvc.LogTempZipDir;
            var logZipFilePath = this._systemSvc.LogTempZipDir + "\\" + fileName;
            var logTempCopyDir = this._systemSvc.LogTempCopyDir + "\\" + folderName;

            var folderPath = logTempCopyDir;

            if (!Directory.Exists(logTempZipDir))
                Directory.CreateDirectory(logTempZipDir);

            if (!Directory.Exists(logTempCopyDir))
                Directory.CreateDirectory(logTempCopyDir);
            
            long zipSize = 0;
            foreach (string path in folderFullPaths.Split(','))
            {
                if ((System.IO.File.GetAttributes(path) & FileAttributes.Directory) == FileAttributes.Directory)
                {
                    DirectoryInfo directoryInfo = new DirectoryInfo(path);
                    zipSize += CalculateDirectorySize(path);
                    if (!Directory.Exists(logTempCopyDir + "\\" + directoryInfo.Name))
                        Directory.CreateDirectory(logTempCopyDir + "\\" + directoryInfo.Name);

                    _systemSvc.DirectoryCopy(path, logTempCopyDir + "\\" + directoryInfo.Name, true);
                }
                else
                {
                    FileInfo fileInfo = new FileInfo(path);
                    System.IO.File.Copy(path, logTempCopyDir + "\\" + fileInfo.Name);
                    zipSize += fileInfo.Length;
                }
            }
            
            if (zipSize > Math.Pow(1024,3))  // 1GB = 1024^3
            {
                Directory.Delete(logTempCopyDir, true);

                Response.StatusCode = 400;
                return new Exception(String.Format("The size of the selected folder is large."));
            }

            try
            {
                System.IO.Compression.ZipFile.CreateFromDirectory(folderPath, logZipFilePath, CompressionLevel.Optimal, true);
                Directory.Delete(logTempCopyDir, true);
            }
            catch
            {
                System.IO.File.Delete(logZipFilePath);

                foreach (string path in folderFullPaths.Split(','))
                {
                    if ((System.IO.File.GetAttributes(path) & FileAttributes.Directory) == FileAttributes.Directory)
                    {
                        DirectoryInfo directoryInfo = new DirectoryInfo(path);
                        if (!Directory.Exists(logTempCopyDir + "\\" + directoryInfo.Name))
                            Directory.CreateDirectory(logTempCopyDir + "\\" + directoryInfo.Name);

                        _systemSvc.DirectoryCopy(path, logTempCopyDir, true);
                    }
                    else
                    {
                        FileInfo fileInfo = new FileInfo(path);
                        System.IO.File.Copy(path, logTempCopyDir + "\\" + fileInfo.Name);
                    }
                }

                System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);
                Directory.Delete(logTempCopyDir, true);
            }

            byte[] zipResult;
            using (var fs = new FileStream(logZipFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (var ms = new MemoryStream())
                {
                    fs.CopyTo(ms);
                    zipResult = ms.ToArray();
                }
            }
            if (System.IO.File.Exists(logZipFilePath))
                System.IO.File.Delete(logZipFilePath);

            if (zipResult == null || !zipResult.Any())
                throw new Exception(String.Format("No Files found."));

            return File(zipResult, "application/octect-stream", fileName);
        }

        [HttpGet("logs/downloadFolder/{folderName}")]
        public FileContentResult DownloadFolder([FromRoute] string folderName, [FromQuery] string folderFullPath)
        {
            var fileName = string.Format("{0}.zip", folderName);
            var logBaseDir = this._systemSvc.LogBaseDir;
            var folderPath = string.Empty;
            if (folderFullPath == "Logs" || folderFullPath == string.Empty)
            {
                folderPath = logBaseDir;
            }
            else
            {
                folderFullPath = folderFullPath.Replace("/", "\\");
                string[] vs = folderFullPath.Split('\\');

                folderFullPath = ".\\";
                for (int i = 1; i < vs.Length; i++)
                {
                    folderFullPath += vs[i];
                    if (i < vs.Length - 1)
                        folderFullPath += "\\";
                }

                folderPath = Path.GetFullPath(Path.Combine(logBaseDir, folderFullPath));
            }

            //var tempOutPutPath = "C:\\OMS\\app\\omsweb\\Temp\\Zip\\";
            //var tempZipFilePath = "C:\\OMS\\app\\omsweb\\Temp\\Zip\\" + fileName;
            //var tempFolderPath = "C:\\OMS\\app\\omsweb\\Temp\\CopyFolder\\" + folderName;
            var logTempZipDir = this._systemSvc.LogTempZipDir;
            var logZipFilePath = this._systemSvc.LogTempZipDir + "\\" + fileName;
            var logTempCopyDir = this._systemSvc.LogTempCopyDir + "\\" + folderName;

            if (!Directory.Exists(logTempZipDir))
                Directory.CreateDirectory(logTempZipDir);

            try
            {
                System.IO.Compression.ZipFile.CreateFromDirectory(folderPath, logZipFilePath, CompressionLevel.Optimal, true);
            }
            catch
            {
                if (!Directory.Exists(logTempCopyDir))
                    Directory.CreateDirectory(logTempCopyDir);

                System.IO.File.Delete(logZipFilePath);

                _systemSvc.DirectoryCopy(folderPath, logTempCopyDir, true);

                System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);

                Directory.Delete(logTempCopyDir, true);
            }

            byte[] zipResult;
            using (var fs = new FileStream(logZipFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (var ms = new MemoryStream())
                {
                    fs.CopyTo(ms);
                    zipResult = ms.ToArray();
                }
            }
            if (System.IO.File.Exists(logZipFilePath))
                System.IO.File.Delete(logZipFilePath);

            if (zipResult == null || !zipResult.Any())
                throw new Exception(String.Format("No Files found."));

            return File(zipResult, "application/octect-stream", fileName);
        }

        public class MapFileDto
        {
            public string MapFile { get; set; }
            public bool Overwrite { get; set; }
        }

        [HttpPost("control/updateMap/{mapName}")]
        public ActionResult<MapUpdateResultModel> UpdateMap([FromRoute] string mapName, [FromBody] MapFileDto mapFileDto)
        {
            bool bResult = false;
            string mapFile = mapFileDto.MapFile;
            bool bOverwrite = mapFileDto.Overwrite;

            string module_name = Process.GetCurrentProcess().MainModule.FileName;
            string currenPath = Path.GetDirectoryName(module_name);
            string exeName = "..\\..\\bin\\oms-config.exe";
            string exePath = Path.GetFullPath(Path.Combine(currenPath, exeName));

            // 1. check if oms-config.exe exits
            if (!System.IO.File.Exists(exePath))
            {
                bResult = false;
                return new MapUpdateResultModel
                {
                    Message = string.Format("Manp Updater Module is not found"),
                    bResult = bResult
                };
            }

            // 2. check if map file exists
            string mapDir = AppConfig.GetFromOMSConfig("Map", "map_dir", "..\\..\\map");
            string mapPath = Path.GetFullPath(Path.Combine(mapDir, mapFile));
            if (!System.IO.File.Exists(mapPath))
            {
                bResult = false;
                return new MapUpdateResultModel
                {
                    Message = string.Format("The map file {0} is not found", mapFile),
                    bResult = bResult
                };
            }

            // 3. TSCState Paused check
            SystemStatusModel sm = this._systemSvc.GetHostStatus();
            if (sm.TscMode != TscModeEnums.PAUSED)
            {
                bResult = false;
                return new MapUpdateResultModel
                {
                    Message = string.Format("TSCState is not paused, set paused and try again!"),
                    bResult = bResult
                };
            }

            // 4. get current ver
            DbVersionEntity dbVer = this._dbSvc.GetCurrentMap();
            int current_ver = Convert.ToInt32(dbVer.DbVersion);

            // 5. send start status of map update
            Dictionary<string, object> data_begin = new Dictionary<string, object>();
            data_begin.Add("request", "map-update");
            data_begin.Add("action", "status");
            data_begin.Add("status", "start");
            data_begin.Add("worker", "omsweb");
            this._msgSvc.SendMessage(MqttMessage.TOPIC_MAP_UPDATE, JsonConvert.SerializeObject(data_begin));

            // 6. wait for each module stand by
            Thread.Sleep(2000);

            // 7. execute oms-config - do map update
            try
            {
                string arguments = (bOverwrite) ? $"update --name {mapName} --map \"{mapPath}\" --overwrite" :
                                                  $"update --name {mapName} --map \"{mapPath}\"";

                string dsbv = AppConfig.GetFromOMSConfig("VehicleProcessor", "is_disabled_seg_by_veh", "true");
                arguments += Convert.ToBoolean(dsbv) ? String.Empty : " --dsbv";


                if (!System.IO.File.Exists(exePath))
                {
                    bResult = false;
                    return new MapUpdateResultModel
                    {
                        Message = string.Format("Map update {0}", bResult ? "complete" : "failed"),
                        bResult = bResult
                    };
                }

                // execute oms-conig.exe
                Process ocl = new Process();
                ocl.StartInfo.FileName = exePath;
                ocl.StartInfo.Arguments = arguments;
                ocl.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                ocl.Start();

            }
            catch (Exception)
            {
                bResult = false;
                return new MapUpdateResultModel
                {
                    Message = string.Format("Map Update Module invoke error"),
                    bResult = bResult
                };
            }

            // 8. check if map update is completed for 10sec
            DateTime startTime = DateTime.Now;
            int timeSecondSpan = 0;
            while (timeSecondSpan < 10) // wait for max 10 sec
            {
                DbVersionEntity DbVerNew = this._dbSvc.GetCurrentMap();
                if (current_ver < DbVerNew.DbVersion)
                {
                    bResult = true;
                    break;
                }

                TimeSpan diff = DateTime.Now - startTime;
                timeSecondSpan = diff.Seconds;

                Thread.Sleep(150);
            }

            // 9. send end status of map update
            Dictionary<string, object> data_end = new Dictionary<string, object>();
            data_end.Add("request", "map-update");
            data_end.Add("action", "status");
            data_end.Add("status", bResult ? "complete" : "failed");
            data_end.Add("worker", "omsweb");
            this._msgSvc.SendMessage(MqttMessage.TOPIC_MAP_UPDATE, JsonConvert.SerializeObject(data_end));

            // 10. return result to front
            return new MapUpdateResultModel
            {
                Message = string.Format("Map update {0}", bResult ? "complete" : "failed"),
                bResult = bResult
            };
        }
        
        [HttpGet("db-history")]
        public object GetDBHistory(DataSourceLoadOptions loadOptions)
        {
            try
            {
                return DataSourceLoader.Load(_dbSvc.QueryDbVersionHistory(), loadOptions);
            }
            catch (Exception e)
            { }

            return null;
        }
        
        
        public static long CalculateDirectorySize(string directoryPath)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(directoryPath);
            return CalculateDirectorySize(directoryInfo);
        }
        
        private static long CalculateDirectorySize(DirectoryInfo directoryInfo)
        {
            long size = 0;

            // 파일 크기 계산
            FileInfo[] files = directoryInfo.GetFiles();
            foreach (FileInfo file in files)
            {
                size += file.Length;
            }

            // 서브 디렉토리 크기 계산
            DirectoryInfo[] subDirectories = directoryInfo.GetDirectories();
            foreach (DirectoryInfo subDirectory in subDirectories)
            {
                size += CalculateDirectorySize(subDirectory);
            }

            return size;
        }
        
        [HttpGet("KpiEnabled")]
        public ActionResult<bool> GetKpiEnabled()
        {
            return this._systemSvc.GetClientSettings().KpiEnabled;
        }
        
        [HttpPost("KpiEnabled/{enable}")]
        public IActionResult setKpiEnabled(bool enable)
        {
            this._systemSvc.setEnableKpi(enable);
            return Ok();
        }
    }
}