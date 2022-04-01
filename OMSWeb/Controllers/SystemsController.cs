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

    [HttpGet("maps")]
    public object GetMaps()
    {
      return this._systemSvc.GetMaps();
    }

    [HttpGet("logs")]
    public object GetLogs()
    {
      return this._systemSvc.GetLogs();
    }

    // ���� �Ѱ� �ٿ�ε� (���� ũ�� 10MB �̸�)
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

    // ���� ������ ���ý� ���� ���ý� ���� + ���� ���� Ȥ�� �Ѱ��� ������ ũ�Ⱑ 10MB �̻��� ���
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
          // Temp Folder�� ���� ����
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

        // Temp Folder�� ���� ���� ����
        Directory.Delete(logTempCopyDir, true);
      }
      catch
      {
        // Zip ���� ����
        System.IO.File.Delete(logZipFilePath);

        // Temp Folder�� ���� ����
        foreach (string path in folderFullPaths.Split(','))
        {
          if ((System.IO.File.GetAttributes(path) & FileAttributes.Directory) == FileAttributes.Directory)
          {
            // Temp Folder�� ���� ����
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

        // Zip ���� ����
        System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);

        // Temp Folder�� ���� ���� ����
        Directory.Delete(logTempCopyDir, true);
      }

      byte[] zipResult = System.IO.File.ReadAllBytes(logZipFilePath);
      if (System.IO.File.Exists(logZipFilePath))
        System.IO.File.Delete(logZipFilePath);

      if (zipResult == null || !zipResult.Any())
        throw new Exception(String.Format("No Files found."));

      return File(zipResult, "application/zip", fileName);
    }

    // �� ���� ���� �Ŀ� zip ���� �ٿ�ε�
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

        // Zip ���� ����
        System.IO.File.Delete(logZipFilePath);

        // Temp Folder�� ���� ����
        _systemSvc.DirectoryCopy(folderPath, logTempCopyDir, true);

        // Zip ���� ����
        System.IO.Compression.ZipFile.CreateFromDirectory(logTempCopyDir, logZipFilePath, CompressionLevel.Optimal, true);

        // Temp Folder�� ���� ���� ����
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