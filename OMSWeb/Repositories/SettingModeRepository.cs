using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using OMSWeb.Models.Entities;

namespace OMSWeb.Repositories
{
    public class SettingModeRepository : DataAccess
    {
        public SettingModeRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<SettingModeEntity> QuerySettingMode()
        {
            IQueryable<SettingModeEntity> result;

            var sql = @"SELECT home_mode, ivr_mode, chain_manual_command_disabled FROM setting_mode";
            
            using (var conn = ConnectTrack())
            {
                result = conn.Query<SettingModeEntity>(sql).AsQueryable();
            }
            return result;
        }

        public SettingModeEntity GetSettingMode()
        {
            IQueryable<SettingModeEntity> settingModeEntity = this.QuerySettingMode();
            var list = settingModeEntity.Select(w => new SettingModeEntity
            {
                home_mode = w.home_mode,
                chain_manual_command_disabled = w.chain_manual_command_disabled
            }).ToList();

            if (list.Count > 0)
                return list[0];

            return null;
        }
    }
}