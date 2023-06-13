using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;

using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models.Entities;
using Npgsql;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
    public class ModuleStatusRepository : DataAccess
    {
        private readonly int ID_OMS_SRV = 1;
        private readonly int ID_AI_MODULE = 2;
        private readonly int ID_OMS_UI = 3;
        private readonly int ID_VAS = 4;
        private readonly int ID_HAS = 5;

        private readonly string NAME_OMS_SRV = "OMS Server";
        private readonly string NAME_AI_MODULE = "AI Module";
        private readonly string NAME_OMS_UI = "OMS Web";
        private readonly string NAME_VAS = "VAS";
        private readonly string NAME_HAS = "HAS";

        public ModuleStatusRepository(IConfiguration configuration) : base(configuration)
        {
            GetModuleInfo(ID_OMS_UI, out string strName, out string strFileVersion, out string strBuildDate, out int pid);
            UpdateModuleStatus(ID_OMS_UI, strName, strFileVersion, strBuildDate, pid);
        }

        public int UpdateModuleStatus(int id, string name, string version, string release_time, int pid)
        {
            int result = -1;
            string sqlSelect = @"SELECT COUNT(*) as count FROM module_status WHERE id = @ref_id";

            var sqlUpdate = @"UPDATE module_status 
                          SET name = @ref_name, version = @ref_version, release_time = @ref_release_time, 
                              pid = @ref_pid, start_time = CURRENT_TIMESTAMP
                          WHERE id = @ref_id";

            var sqlInsert = @"INSERT INTO module_status (id, name, version, release_time, pid, start_time)
                          VALUES (@ref_id, @ref_name, @ref_version, @ref_release_time, @ref_pid, CURRENT_TIMESTAMP)";

            string sql;
            using (var conn = ConnectTrack())
            {
                try
                {
                    conn.Open();
                    var trans = conn.BeginTransaction();

                    int resultCount = conn.QuerySingle<int>(sqlSelect, new
                    {
                        ref_id = id
                    });

                    if (resultCount > 0)
                        sql = sqlUpdate;
                    else
                        sql = sqlInsert;

                    using (var cmd = new NpgsqlCommand(sql, conn))
                    {
                        try
                        {
                            cmd.Parameters.AddWithValue("ref_id", id);
                            cmd.Parameters.AddWithValue("ref_name", name);
                            cmd.Parameters.AddWithValue("ref_version", version);
                            if (!string.IsNullOrEmpty(release_time))
                                cmd.Parameters.AddWithValue("ref_release_time", Convert.ToDateTime(release_time));
                            cmd.Parameters.AddWithValue("ref_pid", pid);
                            result = cmd.ExecuteNonQuery();
                            trans.Commit();
                        }
                        catch (Exception ex)
                        {
                            trans.Rollback();
                            //throw ex;
                        }
                    }
                }
                catch (Exception e)
                {

                }
            }
            return result;
        }

        private void GetModuleInfo(int id, out string strName, out string strFileVersion, out string strBuildDate, out int pid)
        {
            string programPath = "";
            if (id == ID_AI_MODULE)
                programPath = Directory.GetCurrentDirectory() + "\\OMS_AI_Module.dll";
            else
                programPath = System.Reflection.Assembly.GetExecutingAssembly().Location;

            if (id == ID_OMS_SRV) strName = NAME_OMS_SRV;
            else if (id == ID_AI_MODULE) strName = NAME_AI_MODULE;
            else if (id == ID_OMS_UI) strName = NAME_OMS_UI;
            else if (id == ID_VAS) strName = NAME_VAS;
            else if (id == ID_HAS) strName = NAME_HAS;
            else strName = "";

            FileInfo fileInfo = new FileInfo(programPath);
            DateTime buildDate = fileInfo.LastWriteTime;

            System.Diagnostics.FileVersionInfo fv = System.Diagnostics.FileVersionInfo.GetVersionInfo(programPath);
            string strProductVersion = fv.ProductVersion;
            strFileVersion = fv.FileVersion;
            strBuildDate = buildDate.ToString("yyyy-MM-ddT HH:mm:ss.ffffff");

            pid = Process.GetCurrentProcess().Id;
        }

        public IQueryable<ModuleStatusEntity> GetModuleStatus()
        {
            IQueryable<ModuleStatusEntity> result;

            var sql = @"SELECT id, name, version, release_time, pid, start_time 
                FROM module_status ORDER BY id";

            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<ModuleStatusEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }
        
        public IQueryable<VhlStatusEntity> GetVhlStatus()
        {
            IQueryable<VhlStatusEntity> result;

            var sql = @"
                        SELECT vv.id, vv.vehicle_id, v.logical_id, vv.ver_change_time, vv.vcp_sw_ver, vv.motion_fw_ver, vv.motion_lib_ver 
                        FROM vehicle_version AS vv
                        LEFT JOIN vehicles v ON vv.id = v.id
                        GROUP BY vv.id, v.logical_id
                        ORDER BY v.logical_id 
                ";

            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<VhlStatusEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }
        
        public IQueryable<CdmStatusEntity> GetCdmStatus()
        {
            IQueryable<CdmStatusEntity> result;

            var sql = @"
                        SELECT id, zcu_id, ver_change_time, cdm_module_sw_ver, cdm_nf_module_sw_ver 
                        FROM zcu_version
                        GROUP BY id, zcu_id
                        ORDER BY zcu_id";

            using (var conn = ConnectTrack())
            {
                try
                {
                    result = conn.Query<CdmStatusEntity>(sql).AsQueryable();
                }
                catch (Exception e)
                {
                    result = null;
                }
            }
            return result;
        }
        
        public int UpdateModuleStatus(ModuleStatusDto dto)
        {
            int result = -1;
            var sql = @"UPDATE module_status 
                        SET pid=@pid, start_time = null
                        WHERE id = @id;";

            using (var conn = ConnectTrack())
            {
                conn.Open();
                var trans = conn.BeginTransaction();

                using (var cmd = new NpgsqlCommand(sql, conn))
                {
                    try
                    {
                        cmd.Parameters.AddWithValue("id", dto.ID);
                        cmd.Parameters.AddWithValue("pid", dto.PID);

                        result = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        //throw ex;
                    }
                }
                trans.Commit();
            }
            return result;
        }

        public string GetOmsServerVersion()
        {
            string version = "";
            string sql = string.Format(@"SELECT version FROM module_status WHERE id={0}", ID_OMS_SRV);
            using (var conn = ConnectTrack())
            {
                try
                {
                    List<string> data = conn.Query<string>(sql).AsList();
                    if (data != null)
                    {
                        version = (data.Count > 0) ? version = data[0] : "";
                    }
                }
                catch (Exception e)
                {
                    version = null;
                }
        }
            return version;
        }
    }
}
