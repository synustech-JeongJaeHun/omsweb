using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace OMSWeb.OMSSettings
{
    public class INIFile
    {
        public string Path { set; get; }

        public INIFile()
        {
            
        }

        public static Dictionary<string, string> GetData(string fileName)
        {
            return ParseIniDataWithSections(File.ReadAllLines(fileName));
        }

        public static Dictionary<string, string> ParseIniDataWithSections(string[] iniData)
        {
            var dict = new Dictionary<string, string>();
            var rows = iniData.Where(t =>
                    !String.IsNullOrEmpty(t.Trim()) && !t.StartsWith(";") && (t.Contains('[') || t.Contains('=')));
            if (rows == null || rows.Count() == 0) 
                return dict;

            string section = "";
            foreach (string row in rows)
            {
                try
                {
                    string rw = row.TrimStart();
                    if (rw.StartsWith("["))
                        section = rw.TrimStart('[').TrimEnd(']');
                    else
                    {
                        int index = rw.IndexOf('=');
                        if (index > -1)
                        {
                            string key = rw.Substring(0, index).Trim();
                            string val = rw.Substring(index + 1).Trim().Trim('"');

                            if (key == null || key.Length == 0) continue;
                            if (val == null) val = "";

                            dict[section + "-" + key] = val;
                        }
                    }
                }
                catch(Exception e)
                {
                    Console.WriteLine("ParseIniDataWithSections: " + e.Message);
                }
            }
            return dict;
        }
    }
}
