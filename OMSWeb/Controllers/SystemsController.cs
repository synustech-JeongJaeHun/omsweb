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

namespace OMSWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemsController : ControllerBase
    {
        private SystemsService _systemSvc;
        private DbService _dbSvc;
        private ModuleStatusService _moduleStatusSvc;

        public SystemsController(SystemsService systemSvc, DbService dbSvc, ModuleStatusService moduleStatusSvc)
        {
            this._systemSvc = systemSvc;
            this._dbSvc = dbSvc;
            this._moduleStatusSvc = moduleStatusSvc;
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

        /*
        [HttpGet("control/updateMap/{mapName}")]
        public object UpdateMap([FromRoute] string mapName, [FromQuery] string mapFile)
        {
            // TSCState Paused 체크
            IQueryable<ModuleStatusEntity> ms = this._moduleStatusSvc.GetModuleStatus();
            int tscState = ms.Where(tscState == 2);

            // map update start send

            // oms-config 실행
            // do map update !!
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = String.Format("{0}oms-config.exe", @"c:\oms\bin\");
            psi.Arguments = String.Format("update --name {0} --map {1}{2}",
                                command.map_db_name, @"c:\oms\map\", command.map_source_file);
            Process.Start(psi);

            try
            {
                // get config
                string targetPath = ConfigManager.ReadCfgData("Log", "base_dir", "..\\..\\Log");
                string days = ConfigManager.ReadCfgData("Log", "compress_day", "7");

                string module_name = Process.GetCurrentProcess().MainModule.FileName;
                string path = Path.GetDirectoryName(module_name);
                string exeName = "..\\..\\bin\\oms-compress-log.exe";

                string filePath = Path.GetFullPath(Path.Combine(path, exeName));
                string aruguments = string.Format("{0} {1}", targetPath, days);
                //string param = string.Format("--path {0} --days {1}", targetPath, days);

                if (File.Exists(exeName))
                {
                    Process ocl = new Process();
                    ocl.StartInfo.FileName = filePath;
                    ocl.StartInfo.Arguments = aruguments;
                    ocl.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    ocl.Start();
                }
            }
            catch (Exception ex)
            { }



            // 10초간 map update 
            DbVersionEntity dbVer = this._dbSvc.GetCurrentMap();

            // map update end send
            return dbVer;
        }
        */
    }
}