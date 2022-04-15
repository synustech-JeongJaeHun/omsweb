using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;
using OMSWeb.Models.Entities;
using OMSWeb.Services;
using Newtonsoft.Json;
using OMSWeb.Services.MqttClient;
using System.Diagnostics;
using OMSWeb.OMSSettings;
using System.Threading;

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

        [HttpGet("settings/client")]
        public ActionResult<ClientSettings> GetClientSettings()
        {
            return this._systemSvc.GetClientSettings();
        }

        [HttpGet("module-status")]
        public IQueryable<ModuleStatusEntity> GetModuleStatus()
        {
            return this._moduleStatusSvc.GetModuleStatus();
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

        [HttpGet("logs/downloadFile/{fileName}")]
        public FileContentResult DownloadFile([FromRoute] string fileName, [FromQuery] string fileFullPath)
        {
            string path = fileFullPath;
            byte[] bytes = null;

            //var tempFolderPath = "C:\\OMS\\app\\omsweb\\Temp\\CopyFolder\\";
            var logTempCopyDir = this._systemSvc.LogTempCopyDir;

            try
            {
                bytes = System.IO.File.ReadAllBytes(path);
            }
            catch
            {
                if (!Directory.Exists(logTempCopyDir))
                    Directory.CreateDirectory(logTempCopyDir);

                System.IO.File.Copy(path, logTempCopyDir + "\\" + fileName);
                bytes = System.IO.File.ReadAllBytes(logTempCopyDir + "\\" + fileName);

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

            foreach (string path in folderFullPaths.Split(','))
            {
                if ((System.IO.File.GetAttributes(path) & FileAttributes.Directory) == FileAttributes.Directory)
                {
                    DirectoryInfo directoryInfo = new DirectoryInfo(path);
                    if (!Directory.Exists(logTempCopyDir + "\\" + directoryInfo.Name))
                        Directory.CreateDirectory(logTempCopyDir + "\\" + directoryInfo.Name);
                    _systemSvc.DirectoryCopy(path, logTempCopyDir + "\\" + directoryInfo.Name, true);
                }
                else
                {
                    FileInfo fileInfo = new FileInfo(path);
                    System.IO.File.Copy(path, logTempCopyDir + "\\" + fileInfo.Name);
                }
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

            byte[] zipResult = System.IO.File.ReadAllBytes(logZipFilePath);
            if (System.IO.File.Exists(logZipFilePath))
                System.IO.File.Delete(logZipFilePath);

            if (zipResult == null || !zipResult.Any())
                throw new Exception(String.Format("No Files found."));

            return File(zipResult, "application/zip", fileName);
        }

        [HttpGet("logs/downloadFolder/{folderName}")]
        public FileContentResult DownloadFolder([FromRoute] string folderName, [FromQuery] string folderFullPath)
        {
            var fileName = string.Format("{0}.zip", folderName);
            var logBaseDir = this._systemSvc.LogBaseDir;
            var folderPath = (folderFullPath == "Logs" || folderFullPath == string.Empty) ? logBaseDir : logBaseDir.Replace("Logs", "") + folderFullPath.Replace("/", "\\");

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

            byte[] zipResult = System.IO.File.ReadAllBytes(logZipFilePath);
            if (System.IO.File.Exists(logZipFilePath))
                System.IO.File.Delete(logZipFilePath);

            if (zipResult == null || !zipResult.Any())
                throw new Exception(String.Format("No Files found."));

            return File(zipResult, "application/zip", fileName);
        }

        public class MapFileDto 
        { 
            public string MapFile { get; set; }
            public bool Overwrite { get; set; }
        }

        [HttpPost("control/updateMap/{mapName}")]
        public ActionResult<MapUpdateResultModel> UpdateMap([FromRoute] string mapName, [FromBody] MapFileDto mapFileDto )
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
                    Message = string.Format("TSCState is Not PAUSED, set PAUSED and Retry Again!"),
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
            catch (Exception ex)
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
    }
}