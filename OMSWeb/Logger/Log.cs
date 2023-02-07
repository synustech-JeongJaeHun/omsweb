using System;
using System.IO;
using System.Diagnostics;
using Serilog;
using OMSWeb.OMSSettings;

namespace OMSWeb.Logger
{
    public enum LogType : byte
    {
        SYSTEM = 0,
        HOST = 1,
        ORDER = 2,
        VHL = 3,
    }

    public enum LogEventLevel
    {
        Verbose = Serilog.Events.LogEventLevel.Verbose,
        Debug = Serilog.Events.LogEventLevel.Debug,
        Information = Serilog.Events.LogEventLevel.Information,
        Warning = Serilog.Events.LogEventLevel.Warning,
        Error = Serilog.Events.LogEventLevel.Error,
        Fatal = Serilog.Events.LogEventLevel.Fatal,
    }

    public class Log 
    {
        public readonly static string DATE_SPLITTER = "yyyy-MM-dd";
        static Serilog.Core.Logger logger;
        static string rootPath;
        static uint seq = 0;
        static private bool initialized = false;

        public static bool Initialize() 
        {
            if (string.IsNullOrWhiteSpace(rootPath = AppConfig.GetFromOMSConfig("Log", "base_dir", "")))
            {
                string module_name = Process.GetCurrentProcess().MainModule.FileName;
                string path = Path.GetDirectoryName(module_name);

                rootPath = path;
            }

            string strMaxSize = AppConfig.GetFromOMSConfig("Log", "maximumFileSize", "20M");
            string strMaxSizeApp = AppConfig.GetFromOMSConfig("Log", "maximumFileSize_web", "20M");
            long maxSize = Convert.ToInt32(strMaxSize.ToUpper().Replace("M", "")) * 1000000;  // default 20000000
            long maxSizeApp = Convert.ToInt32(strMaxSizeApp.ToUpper().Replace("M", "")) * 1000000;

            long maximumFileSize = maxSize;
            if (maxSizeApp != 20000000)
            {
                maximumFileSize = maxSizeApp;
            }

            Console.WriteLine("LogDir (oms_setting.ini) = {0}", rootPath);

            string currentTime = DateTime.Now.ToString(DATE_SPLITTER);
            string currentPath = string.Format("{0}/{1}/WEB", rootPath, currentTime);
            Directory.CreateDirectory(currentPath);

            logger = new LoggerConfiguration()
                            .MinimumLevel.Debug()
                            .Enrich.WithProperty("mapInfo", $"0;{DateTime.Now.ToString(DATE_SPLITTER)}")
                            .WriteTo.Async(writeTo => writeTo.Map("mapInfo", $"0;{DateTime.Now.ToString(DATE_SPLITTER)}"
                                , (mapInfo, wt) => wt.File(string.Format("{0}/{1}/WEB/{2}-.log", rootPath, mapInfo.Split(";")[1], ((LogType)Convert.ToInt32(mapInfo.Split(";")[0])).ToString())
                                , outputTemplate: "[{Timestamp:yyyy-MM-dd} {Timestamp:HH:mm:ss.fff}]{Message:lj}{NewLine}{Exception}"
                                , rollingInterval: RollingInterval.Day, rollOnFileSizeLimit: true, fileSizeLimitBytes: maximumFileSize, retainedFileCountLimit: null)))
                            .CreateLogger();

            initialized = true;

            return true;
        }

        public static void Uninitialize()
        {
            Serilog.Log.CloseAndFlush();

            Log.Dispose();
        }

        public static string GetSequence()
        {
            return (seq++ & 0xFFFF).ToString("X4");
        }

        public static string GetModuleName(LogType type)
        {
            string module = string.Empty;
            switch ((int)type)
            {
                case (int)LogType.SYSTEM: module = "SYSTEM__"; break;
                case (int)LogType.HOST: module = "HOST____"; break;
                case (int)LogType.ORDER: module = "ORDER___"; break;
                case (int)LogType.VHL: module = "VHL_____"; break;
            }
            return module;
        }

        public static string GetLevel(LogEventLevel level)
        {
            switch (level)
            {
                case LogEventLevel.Debug: return "DEBG";
                case LogEventLevel.Information: return "INFO";
                case LogEventLevel.Warning: return "WARN";
                case LogEventLevel.Error: return "EROR";
                case LogEventLevel.Fatal: return "FATL";
                default: return "INFO";
            }
        }

        public static string GetOrderID(string orderId)
        {
            return orderId;
        }

        public static void FilePrint(LogType type, LogEventLevel level, string format, params object[] args)
        {
            if (!initialized) return;
            string logText = string.Format(format, args);
            string message = $"[{GetSequence()}][{GetModuleName(type)}][{GetLevel(level)}][{GetOrderID(string.Empty)}] {logText}";
            logger.ForContext("mapInfo", $"{Convert.ToInt32(type)};{DateTime.Now.ToString(DATE_SPLITTER)}").Write((Serilog.Events.LogEventLevel)level, message);
        }

        public static void Dispose() 
        {
            if (!initialized) 
                return;

            logger.Dispose();
        }
    }
}
