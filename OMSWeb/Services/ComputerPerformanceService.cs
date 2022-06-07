using System.Runtime.InteropServices;
using System.Diagnostics;
using Microsoft.Win32;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace OMSWeb.Services
{
    public class ComputerPerformanceService
    {
        private readonly string _processName;
        private readonly PerformanceCounter _cpuCounter;

        public ComputerPerformanceService()
        {
#if Windows
            var cpuCounter = new PerformanceCounter(
                    "Processor Information",
                    "% Processor Utility",
                    "_Total",
                    true
                );
            cpuCounter.NextValue();

            var key = Registry.LocalMachine.OpenSubKey(@"HARDWARE\DESCRIPTION\System\CentralProcessor\0\");
            var processorName = key.GetValue("ProcessorNameString") as string;

            this._cpuCounter = cpuCounter;
            this._processName = processorName;
#else
#endif
        }

        public object getCurrentCpuNameAndUsage()
        {
#if Windows
            return new { usage = _cpuCounter.NextValue(), model = _processName };
#else
            return new { usage = 0, model = "DUMMY" };
#endif
        }

        public object getRAMInformation()
        {
#if Windows
            var m = new MEMORYSTATUSEX();
            GlobalMemoryStatusEx(m);

            var total = m.ullTotalPhys;
            var free = m.ullAvailPhys;
            var used = total - free;
            var usedPercent = ((float)used / (float)total) * 100;

            return new
            {
                Total = total / 1024 / 1024,
                Used = used / 1024 / 1024,
                UsedPercent = usedPercent
            };
#else
            return new
            {
                Total = 100,
                Used = 50,
                UsedPercent = 50
            };
#endif
        }

#if Windows
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        private class MEMORYSTATUSEX
        {
            public uint dwLength;
            public uint dwMemoryLoad;
            public ulong ullTotalPhys;
            public ulong ullAvailPhys;
            public ulong ullTotalPageFile;
            public ulong ullAvailPageFile;
            public ulong ullTotalVirtual;
            public ulong ullAvailVirtual;
            public ulong ullAvailExtendedVirtual;
            public MEMORYSTATUSEX()
            {
                this.dwLength = (uint)Marshal.SizeOf(this);
            }
        }


        [return: MarshalAs(UnmanagedType.Bool)]
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool GlobalMemoryStatusEx([In, Out] MEMORYSTATUSEX lpBuffer);
#endif
    }
}

// code from 
// https://github.com/dotnet/orleans/blob/main/src/TelemetryConsumers/Orleans.TelemetryConsumers.Linux/LinuxEnvironmentStatistics.cs
//
// namespace OMSWeb.Services
// {
//     public class ComputerPerformanceService
//     {
//         private const float KB = 1024f;

//         public long? TotalPhysicalMemory { get; private set; }

//         public float? CpuUsage { get; private set; }

//         public long? AvailableMemory { get; private set; }

//         private long MemoryUsage => GC.GetTotalMemory(false);

//         private const string MEMINFO_FILEPATH = "/proc/meminfo";
//         private const string CPUSTAT_FILEPATH = "/proc/stat";
//         private const string CPUINFO_FILEPATH = "/proc/cpuinfo";

//         public ComputerPerformanceService(){}

//         private async Task UpdateTotalPhysicalMemory()
//         {
//             var memTotalLine = await ReadLineStartingWithAsync(MEMINFO_FILEPATH, "MemTotal");

//             if (string.IsNullOrWhiteSpace(memTotalLine))
//             {
//                 return;
//             }

//             // Format: "MemTotal:       16426476 kB"
//             if (!long.TryParse(new string(memTotalLine.Where(char.IsDigit).ToArray()), out var totalMemInKb))
//             {
//                 return;
//             }

//             TotalPhysicalMemory = totalMemInKb * 1_000;
//         }

//         private long _prevIdleTime;
//         private long _prevTotalTime;

//         private async Task UpdateCpuUsage(int i)
//         {
//             var cpuUsageLine = await ReadLineStartingWithAsync(CPUSTAT_FILEPATH, "cpu  ");

//             if (string.IsNullOrWhiteSpace(cpuUsageLine))
//             {
//                 return;
//             }

//             // Format: "cpu  20546715 4367 11631326 215282964 96602 0 584080 0 0 0"
//             var cpuNumberStrings = cpuUsageLine.Split(' ').Skip(2);

//             if (cpuNumberStrings.Any(n => !long.TryParse(n, out _)))
//             {
//                 return;
//             }

//             var cpuNumbers = cpuNumberStrings.Select(long.Parse).ToArray();
//             var idleTime = cpuNumbers[3];
//             var iowait = cpuNumbers[4]; // Iowait is not real cpu time
//             var totalTime = cpuNumbers.Sum() - iowait;

//             if (i > 0)
//             {
//                 var deltaIdleTime = idleTime - _prevIdleTime;
//                 var deltaTotalTime = totalTime - _prevTotalTime;

//                 // When running in gVisor, /proc/stat returns all zeros, so check here and leave CpuUsage unset.
//                 // see: https://github.com/google/gvisor/blob/master/pkg/sentry/fs/proc/stat.go#L88-L95
//                 if (deltaTotalTime == 0f)
//                 {
//                     return;
//                 }

//                 var currentCpuUsage = (1.0f - deltaIdleTime / ((float)deltaTotalTime)) * 100f;

//                 var previousCpuUsage = CpuUsage ?? 0f;
//                 CpuUsage = (previousCpuUsage + 2 * currentCpuUsage) / 3;
//             }

//             _prevIdleTime = idleTime;
//             _prevTotalTime = totalTime;
//         }

//         private async Task UpdateAvailableMemory()
//         {
//             var memAvailableLine = await ReadLineStartingWithAsync(MEMINFO_FILEPATH, "MemAvailable");

//             if (string.IsNullOrWhiteSpace(memAvailableLine))
//             {
//                 memAvailableLine = await ReadLineStartingWithAsync(MEMINFO_FILEPATH, "MemFree");
//                 if (string.IsNullOrWhiteSpace(memAvailableLine))
//                 {
//                     return;
//                 }
//             }

//             if (!long.TryParse(new string(memAvailableLine.Where(char.IsDigit).ToArray()), out var availableMemInKb))
//             {
//                 return;
//             }

//             AvailableMemory = availableMemInKb * 1_000;
//         }

//         private static async Task<string> ReadLineStartingWithAsync(string path, string lineStartsWith)
//         {
//             using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 512, FileOptions.SequentialScan | FileOptions.Asynchronous))
//             using (var r = new StreamReader(fs, Encoding.ASCII))
//             {
//                 string line;
//                 while ((line = await r.ReadLineAsync()) != null)
//                 {
//                     if (line.StartsWith(lineStartsWith, StringComparison.Ordinal))
//                         return line;
//                 }
//             }

//             return null;
//         }

//         public async Task<object> getCurrentCpuNameAndUsage() {
//             return new { usage = this.CpuUsage, model = "m1" };
//         };

//         public async Task<object> getRAMInformation()
//         {
//             await this.UpdateAvailableMemory()
//             await this.UpdateTotalPhysicalMemory()

//             var total = this.TotalPhysicalMemory;
//             var free = this.AvailableMemory;
//             var used =  total - free;
//             var usedPercent = ((float)used / (float)total) * 100;
//             return new
//             {
//                 Total = this.TotalPhysicalMemory,
//                 Used = this.TotalPhysicalMemory - this.AvailableMemory,
//                 UsedPercent = usedPercent
//             };
//         }
//     }
// }