using System;
using System.Collections.Generic;
using System.IO;

//using Newtonsoft.Json;

namespace OMSWeb.Models
{
  public class LogModel
  {
    public string Key { get; set; }
    public string Name { get; set; }
    public DateTime DateModified { get; set; }

    public bool IsDirectory { get; set; }

    public bool HasSubDirectories { get; set; }

    public long Size { get; set; }

    public List<LogModel> Items;

    public LogModel(FileSystemInfo fileSystemInfo)
    {
      Name = fileSystemInfo.Name;
      Items = new List<LogModel>();

      if (fileSystemInfo.Attributes == FileAttributes.Directory)
      {
        IsDirectory = true;
        foreach (FileSystemInfo f in (fileSystemInfo as DirectoryInfo).GetFileSystemInfos())
        {
          Items.Add(new LogModel(f));
        }

        if ((fileSystemInfo as DirectoryInfo).GetFileSystemInfos().Length > 0)
          HasSubDirectories = true;
        else
          HasSubDirectories = false;
      }
      else
      {
        IsDirectory = false;
        HasSubDirectories = false;
        FileInfo fileInfo = (FileInfo)fileSystemInfo;
        Size = fileInfo.Length;
      }
      Key = fileSystemInfo.FullName;
      DateModified = fileSystemInfo.LastAccessTimeUtc;
    }
    /*
    public string JsonToLogModel()
    {
      //return JsonConvert.SerializeObject(this, Formatting.Indented);
      return JsonConvert.SerializeObject(this, Formatting.None);
    }
    */
  }
}