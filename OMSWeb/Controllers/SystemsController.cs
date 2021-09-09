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
    private ModuleStatusService _moduleStatusSvc;

    public SystemsController(SystemsService systemSvc, ModuleStatusService moduleStatusSvc)
    {
      this._systemSvc = systemSvc;
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

    [HttpGet("logs")]
    public object GetLogs()
    {
      return this._systemSvc.GetLogs();
    }

    // 파일 한개 다운로드 (파일 크기 10MB 미만)
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

    // 파일 여러개 선택시 폴더 선택시 폴더 + 파일 선택 혹은 한개의 파일이 크기가 10MB 이상인 경우
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
          // Temp Folder에 파일 복사
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

        // Temp Folder의 폴더 파일 삭제
        Directory.Delete(logTempCopyDir, true);
      }
      catch
      {
        // Zip 파일 삭제
        System.IO.File.Delete(logZipFilePath);

        // Temp Folder에 파일 복사
        foreach (string path in folderFullPaths.Split(','))
        {
          if ((System.IO.File.GetAttributes(path) & FileAttributes.Directory) == FileAttributes.Directory)
          {
            // Temp Folder에 파일 복사
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

        // Zip 파일 압축
        System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);

        // Temp Folder의 폴더 파일 삭제
        Directory.Delete(logTempCopyDir, true);
      }

      byte[] zipResult = System.IO.File.ReadAllBytes(logZipFilePath);
      if (System.IO.File.Exists(logZipFilePath))
        System.IO.File.Delete(logZipFilePath);

      if (zipResult == null || !zipResult.Any())
        throw new Exception(String.Format("No Files found."));

      return File(zipResult, "application/zip", fileName);
    }

    // 한 폴더 선택 후에 zip 파일 다운로드
    [HttpGet("logs/downloadFolder/{folderName}")]
    public FileContentResult DownloadFolder([FromRoute] string folderName, [FromQuery] string folderFullPath)
    {
      var fileName = string.Format("{0}.zip", folderName);

      //var defaultFolderPath = "C:\\OMS\\app\\oms-srv\\Logs";
      var logBaseDir = this._systemSvc.LogBaseDir;
      //var defaultPath = "C:\\OMS\\app\\oms-srv\\";

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

        // Zip 파일 삭제
        System.IO.File.Delete(logZipFilePath);

        // Temp Folder에 파일 복사
        _systemSvc.DirectoryCopy(folderPath, logTempCopyDir, true);

        // Zip 파일 압축
        System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);

        // Temp Folder의 폴더 파일 삭제
        Directory.Delete(logTempCopyDir, true);
      }

      byte[] zipResult = System.IO.File.ReadAllBytes(logZipFilePath);
      if (System.IO.File.Exists(logZipFilePath))
        System.IO.File.Delete(logZipFilePath);

      if (zipResult == null || !zipResult.Any())
        throw new Exception(String.Format("No Files found."));

      return File(zipResult, "application/zip", fileName);
    }
  }
}